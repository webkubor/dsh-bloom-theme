/**
 * 插件停用/卸载时的收尾：把 Bloom 往页面里放的东西全部收回。
 *
 * 为什么需要（2026-11-06 规范对照）：皮肤为了首屏不闪在脚本顶层就注入了样式、
 * 切换器、星光层和两个 MutationObserver，但从来没有对应的移除逻辑 ——
 * 在插件管理里停用 Bloom 后，主题、按钮、observer 都还留在页面上，必须刷新。
 * cordis 的约定是副作用挂在 ctx.effect 上、由 disposer 回收；client.ts 的 apply
 * 把本函数作为那个 disposer。
 *
 * 只动 Bloom 自己的东西：data-ds-dark-theme 这类宿主属性不碰。
 */
import { PLUGIN_ID } from './meta.js'
import { stopRotation } from './rotation.js'
import { cleanupSwitcher } from './switcher.js'
import { setVersionUpdatesActive } from './version.js'
import { clearAppearanceSync } from './appearance.js'

/** Bloom 写在 body / 消息节点上的 data-* 属性。 */
const BODY_ATTRS = ['data-bloom-variant', 'data-bloom-glass', 'data-bloom-typing', 'data-bloom-update']
const NODE_ATTRS = ['data-bloom-think', 'data-bloom-think-body', 'data-bloom-live-turn']

export function teardownBloom(): void {
  if (typeof document === 'undefined') return
  setVersionUpdatesActive(false)
  cleanupSwitcher()
  clearAppearanceSync()

  window.__dshBloomThinkOff__?.()
  window.__dshBloomThinkObserver__?.disconnect()
  window.__dshBloomThinkObserver__ = undefined
  window.__dshBloomCursorOff__?.()
  window.__dshBloomGlassOff__?.()
  window.__dshBloomGlassOff__ = undefined
  stopRotation()

  document.querySelectorAll(`style[data-plugin="${PLUGIN_ID}"]`).forEach((n) => n.remove())
  document.querySelectorAll('.dsh-bloom-switcher, #dsh-bloom-sparkles, #dsh-bloom-starlight, #dsh-bloom-update-banner')
    .forEach((n) => n.remove())

  const body = document.body
  if (body) for (const a of BODY_ATTRS) body.removeAttribute(a)
  for (const a of NODE_ATTRS) document.querySelectorAll(`[${a}]`).forEach((n) => n.removeAttribute(a))
  const root = document.documentElement
  root.style.removeProperty('--bloom-cursor-x')
  root.style.removeProperty('--bloom-cursor-y')
}
