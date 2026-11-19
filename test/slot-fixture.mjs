// Browser-only host substitute: render the registered components with real React.
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'

const occupants = new Map()
// Registration options per Slot kind, as reported by live Inspect (relayed by the lead; Inspect timed out here):
//   single (conversation.header.leading / conversation.session.header.corner): exactly one occupant, no registration fields beyond name.
//   list   (shell.overlay): id required, order optional.
//
// ⚠️ 这张表必须跟 DSH 的 Slot 契约一起长。2026-11-14 实测：切换器挂
// `conversation.session.header.corner` 而本表没登记它，inject 就直接 throw
// `Unexpected Slot` —— 三个测试套件全红。2026-11-17 #113 定案：切换器正式挂
// corner 座（DSH 0.2.2-rc.1 契约：'conversation.session.header.corner':
//   { kind: 'single', scope: 'session' }），leading 座保留在表里镜像契约全貌。
//
// 判据来源必须写清「哪个文件哪一行」，否则下次还是靠人肉发现：
//   node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/types/client/contract/slots.d.ts
//   node_modules/@deepseek-ai/dsh-client-ui-settings/lib/types/client/contract/slots.d.ts
//     ('settings.section.icon': { kind: 'list'; scope: 'root'; inline: true } —— 导航图标，
//      id 必须等于对应 settings.section 的 id；2026-11-19 settings 迁移加图标时补登。)
const SLOT_KIND = {
  'conversation.header.leading': 'single',
  'conversation.session.header.corner': 'single',
  'shell.overlay': 'list',
  'settings.section': 'list',
  'settings.section.icon': 'list',
}
const ALLOWED_KEYS = { single: ['name'], list: ['name', 'id', 'order', 'label', 'locale'] }
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
    // 模拟 shell 渲染导航：label 是惰性函数，注册时求值一次 ——
    // 闭包里读没在 inject 声明的服务会直接抛（strict ctx），这里必须炸出来，
    // 而不是让菜单项静默消失（2026-11-19 settings.section 实测踩过）。
    const labelText = typeof options.label === 'function' ? options.label() : (options.label ?? null)
    if (occupants.has(name)) throw new Error(`Duplicate Slot registration: ${name}`)
    const host = document.createElement('div')
    host.dataset.fixtureSlot = name
    // The header-area Slot (conversation.session.header.corner) lives inside the
    // page header (a fixture may mark its seat with [data-fixture-header]);
    // shell.overlay is a viewport-sized layer above the shell that passes pointer events through, like the host's.
    if (name === 'shell.overlay') {
      host.style.cssText = 'position:fixed;inset:0;z-index:1000;pointer-events:none'
      document.body.append(host)
    } else if (name === 'settings.section' || name === 'settings.section.icon') {
      // 设置节内容与它的导航图标只在设置对话框里渲染 —— 夹具只登记不渲染，
      // 避免第二份 .dsh-bloom-detail / 图标 span 污染几何断言与选择器（谁要测谁自挂 buildDetailEl）
      window.slotRegistrations.push({ ...options, labelText })
      return () => { const i = window.slotRegistrations.findIndex(r => r.id === options.id); if (i >= 0) window.slotRegistrations.splice(i, 1) }
    } else {
      (document.querySelector('[data-fixture-header]') ?? document.querySelector('header')).append(host)
    }
    const root = createRoot(host)
    flushSync(() => root.render(React.createElement(Component)))
    occupants.set(name, { root, host, Component })
    window.slotRegistrations.push({ ...options, labelText })
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
