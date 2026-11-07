import { mountSwitcher } from './switcher.js'
import { buildSparkles } from './starlight.js'
import { buildLiquidLens } from './liquid-lens.js'
import { buildFogDefinitions } from './fog.js'

/** React comes from the host loader; no second React copy is bundled. */
export interface HostReact {
  createElement(type: string | (() => unknown), props: Record<string, unknown>): unknown
  useRef<T>(initial: T): { current: T }
  useEffect(setup: () => void | (() => void), deps: unknown[]): void
}

/** Both containers belong to Bloom's Slots. The menu escapes clipped host headers. */
export function createBloomComponents(React: HostReact, installUpdateCheck: (host: HTMLElement) => () => void) {
  let overlay: HTMLElement | null = null
  const onOverlayChange = new Set<() => void>()

  function Switcher() {
    const anchor = React.useRef<HTMLDivElement | null>(null)
    React.useEffect(() => {
      let dispose: (() => void) | undefined
      const sync = () => {
        dispose?.()
        dispose = overlay && anchor.current ? mountSwitcher(overlay, anchor.current) : undefined
      }
      onOverlayChange.add(sync)
      sync()
      return () => { onOverlayChange.delete(sync); dispose?.() }
    }, [])
    return React.createElement('div', {
      ref: anchor, className: 'dsh-bloom-slot', 'data-bloom-slot': 'switcher', 'aria-hidden': true,
    })
  }

  function Decorations() {
    const host = React.useRef<HTMLDivElement | null>(null)
    React.useEffect(() => {
      const container = host.current
      if (!container) return
      const sparkles = buildSparkles(container.ownerDocument)
      const lens = buildLiquidLens(container.ownerDocument)
      const fog = buildFogDefinitions(container.ownerDocument)
      container.append(lens, fog, sparkles)
      const stopUpdates = installUpdateCheck(container)
      overlay = container
      onOverlayChange.forEach((sync) => sync())
      return () => {
        overlay = null
        onOverlayChange.forEach((sync) => sync())
        stopUpdates()
        sparkles.remove()
        lens.remove()
        fog.remove()
      }
    }, [])
    return React.createElement('div', { ref: host, className: 'dsh-bloom-overlay', 'data-bloom-slot': 'decorations' })
  }

  return { Switcher, Decorations }
}
