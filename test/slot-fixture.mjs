// Browser-only host substitute: render the registered components with real React.
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'

const occupants = new Map()
// Registration options per Slot kind, as reported by live Inspect (relayed by the lead; Inspect timed out here):
//   single (conversation.header.leading): exactly one occupant, no registration fields beyond name.
//   list   (shell.overlay): id required, order optional.
const SLOT_KIND = { 'conversation.header.leading': 'single', 'shell.overlay': 'list' }
const ALLOWED_KEYS = { single: ['name'], list: ['name', 'id', 'order'] }
let injecting = null
window.slotRegistrations = []
window.slotDisposers = []
window.slotViolations = []
window.fixtureSlots = {
  inject(name, setup) {
    if (!SLOT_KIND[name]) throw new Error(`Unexpected Slot: ${name}`)
    if (typeof setup !== 'function') throw new Error(`inject(${name}) needs a lazy setup function`)
    injecting = name
    let dispose
    try { dispose = setup() } finally { injecting = null }
    if (typeof dispose !== 'function') throw new Error(`inject(${name}) setup must return the register disposer`)
    window.slotDisposers.push(dispose)
    return dispose
  },
  register(options, Component) {
    const name = options?.name
    if (injecting === null) throw new Error(`register(${name}) called outside slots.inject`)
    if (name !== injecting) throw new Error(`register name ${name} differs from injected Slot ${injecting}`)
    const kind = SLOT_KIND[name]
    // Metadata gaps are recorded, not thrown, so one dedicated assertion reports them without masking other suites.
    const extra = Object.keys(options).filter(k => !ALLOWED_KEYS[kind].includes(k))
    if (extra.length) window.slotViolations.push(`${name} (${kind}): unsupported register options ${extra.join(', ')}`)
    if (kind === 'list') {
      if (typeof options.id !== 'string' || !options.id.startsWith('dsh-bloom-theme.')) window.slotViolations.push(`${name} (list): id must be a namespaced string, got ${options.id}`)
      if (options.order !== undefined && !Number.isFinite(options.order)) window.slotViolations.push(`${name} (list): order must be a number`)
    }
    if (typeof Component !== 'function') throw new Error(`register(${name}) needs a React component`)
    if (occupants.has(name)) throw new Error(`Duplicate Slot registration: ${name}`)
    const host = document.createElement('div')
    host.dataset.fixtureSlot = name
    // The leading Slot lives inside the page header (a fixture may mark it with [data-fixture-leading]);
    // shell.overlay is a viewport-sized layer above the shell that passes pointer events through, like the host's.
    if (name === 'shell.overlay') {
      host.style.cssText = 'position:fixed;inset:0;z-index:1000;pointer-events:none'
      document.body.append(host)
    } else {
      (document.querySelector('[data-fixture-leading]') ?? document.querySelector('header')).append(host)
    }
    const root = createRoot(host)
    flushSync(() => root.render(React.createElement(Component)))
    occupants.set(name, { root, host, Component })
    window.slotRegistrations.push({ ...options })
    return () => {
      const current = occupants.get(name)
      if (!current) return
      flushSync(() => current.root.unmount())
      current.host.remove()
      occupants.delete(name)
    }
  },
}
window.unmountFixtureSlot = name => {
  const entry = occupants.get(name)
  flushSync(() => entry.root.unmount())
  entry.root = null
}
window.remountFixtureSlot = name => {
  const entry = occupants.get(name)
  entry.root = createRoot(entry.host)
  flushSync(() => entry.root.render(React.createElement(entry.Component)))
}
window.disposeFixtureSlots = () => {
  while (window.slotDisposers.length) window.slotDisposers.pop()()
}
window.__ModuleLoader__ = {
  _module: null,
  load(def) {
    this._module = def.factory(name => {
      if (name !== 'react') throw new Error(`Unexpected host module: ${name}`)
      return React
    })
  },
}
