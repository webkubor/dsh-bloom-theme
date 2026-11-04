/**
 * 玻璃质感档位 —— 用户自己说了算。
 *
 * ## 为什么要有这个开关（2026-11-04，v0.24.0）
 *
 * 毛玻璃是 Bloom 的招牌，但它同时是**最挑设备、最挑人**的一层：
 *   · 性能：`backdrop-filter` 每帧都要重新采样背后的像素。10 组模糊叠在一起，
 *     在集显或低分屏上会让拖动发涩。
 *   · 可读性：背景是模糊的，文字对比度没法静态测量 —— 背后恰好是亮色时，
 *     浅色文字可能掉到 4.5:1 以下。
 *   · 无障碍：视力不佳、阅读障碍的用户，系统里有「降低透明度」开关。
 *
 * 宿主（DSH）在 `prefers-reduced-transparency: reduce` 下把侧栏换成实底，
 * Bloom 的 10 组毛玻璃原来一组都不响应 —— 用户明确提了要求，界面却只做了一半。
 *
 * ## 三档的含义
 *
 *   glass   完整毛玻璃（默认）。系统开了「降低透明度」时自动降级为柔和档。
 *   soft    柔和：保留半透明与氛围色，但把模糊半径调小、饱和度调低 ——
 *            看着还是玻璃，但采样成本低、背后的干扰小。
 *   solid   实底：完全去掉模糊与透明。跟宿主在「降低透明度」下的观感一致。
 *
 * ## 与系统开关的关系
 *
 * 用户显式选择 > 系统开关：
 *   · 用户选了 glass/solid → 尊重用户，不再被系统强制降级
 *     （但 forced-colors 与 prefers-contrast:more 仍然强制生效 ——
 *      那两个不是「偏好」，是系统强制色与对比度底线）。
 *   · 用户没动过（auto）→ 跟随系统：系统说降透明就降级为 soft。
 *
 * 「没动过」这个状态存在 localStorage 里的值就是 `auto`。
 */

import { STORAGE_KEY } from './meta.js'

/** 玻璃档位。auto = 跟随系统（默认）。 */
export type GlassMode = 'auto' | 'glass' | 'soft' | 'solid'

const KEY = `${STORAGE_KEY}-glass-mode`

/** 面板里露出来的三档（auto 不露出来，它就是「默认/跟随系统」）。 */
export const GLASS_MODES: GlassMode[] = ['glass', 'soft', 'solid']

let cached: GlassMode | undefined

/** 读当前档位；无存档回退 auto（跟随系统）。 */
export function readGlassMode(): GlassMode {
  if (cached !== undefined) return cached
  try {
    const value = localStorage.getItem(KEY)
    cached = value === 'glass' || value === 'soft' || value === 'solid' ? value : 'auto'
  } catch { cached = 'auto' }
  return cached
}

/** 写档位并落到 body 的 data 属性上（CSS 靠它分流）。 */
export function writeGlassMode(mode: GlassMode): void {
  cached = mode
  try { localStorage.setItem(KEY, mode) } catch {}
  applyGlassMode()
}

/**
 * 把档位应用到 body。
 *
 * body 上的 `data-bloom-glass` 取值：
 *   unset / auto  → 不写（或写 auto）：CSS 交给媒体查询按系统偏好降级
 *   glass         → 强制完整毛玻璃
 *   soft          → 强制柔和
 *   solid         → 强制实底
 */
export function applyGlassMode(): void {
  const mode = readGlassMode()
  if (mode === 'auto') {
    document.body.removeAttribute('data-bloom-glass')
  } else {
    document.body.setAttribute('data-bloom-glass', mode)
  }
}

/**
 * 最终生效的档位 —— 「系统降级」与「用户显式选择」合并之后的结果。
 *
 * 面板用它显示当前实际状态（而不是用户上次点的那一档），
 * 这样用户在系统里打开「降低透明度」时能看见 Bloom 真的降级了。
 */
export function effectiveGlassMode(): 'glass' | 'soft' | 'solid' {
  const mode = readGlassMode()
  if (mode !== 'auto') return mode
  if (systemPrefersReducedTransparency()) return 'soft'
  return 'glass'
}

/** 系统是否要求降低透明度。 */
export function systemPrefersReducedTransparency(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-transparency: reduce)').matches
  } catch { return false }
}

/**
 * 启动时对齐一次。
 *
 * 档位写在 body 属性上即可；系统偏好变化时（用户中途改了系统设置），
 * 监听 matchMedia，把降级结果反映到面板显示上。
 *
 * @returns 一个解绑函数。
 */
export function initGlassMode(): () => void {
  applyGlassMode()
  let mq: MediaQueryList | null = null
  try {
    mq = window.matchMedia('(prefers-reduced-transparency: reduce)')
  } catch {}
  if (!mq) return () => {}
  const onChange = () => {
    // 只有 auto 档会跟随系统；用户显式选过就不动。
    if (readGlassMode() === 'auto') applyGlassMode()
  }
  mq.addEventListener('change', onChange)
  return () => mq?.removeEventListener('change', onChange)
}
