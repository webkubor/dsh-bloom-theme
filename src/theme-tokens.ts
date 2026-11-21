/**
 * 主题色注入宿主 token 层 —— 让整块界面跟着 Bloom 的配色走。
 *
 * ## 为什么走 `ctx.theme.overrideTokens`（2026-11-21）
 *
 * owner 实拍反馈：「侧边栏不参与浅色模式的变化，不管怎么调都很违和，
 * 整体面板跟主题色无关了。」——会话区是 Mist 的青蓝渐变，侧栏却是宿主
 * 的纯白灰，两者脱节。
 *
 * 先试过在 CSS 层给侧栏/顶栏/输入卡叠 `::before` 底色与 accent 染色
 * （surfaces.ts / adaptive.ts / liquid.ts / component.ts 四处），**这条路是错的**：
 *
 *   1. 宿主的面材质有多层同优先级规则（glass / adaptive / surfaces / liquid），
 *      「后注入者赢」会静默吞掉主题色 —— 改了变量，computed background 不动；
 *   2. 即便改对了，那也是**补丁层**：在宿主样式之上盖 CSS，宿主升级就可能漂移；
 *   3. 想让所有面统一变色，就得逐个面去猜选择器和特异性 —— 正是 owner
 *      说的「另辟蹊径做 hooks / 补丁层面上的东西」。
 *
 * DSH 有正规接口：`dsh-client-ui-theme` 的 `ThemeRuntime.overrideTokens(source, tokens)`。
 * 它把 token 覆盖层叠在当前主题上，宿主的 `ThemePresenter` 会把结果以
 * **行内 CSS 变量**写到 `body` 上（`body.style.setProperty(name, value)`），
 * 于是所有消费该 token 的宿主元素（侧栏、顶栏、主区、输入区）**一起变色**，
 * 不需要插件碰任何一个宿主选择器。
 *
 * ## 覆盖哪些 token
 *
 * 宿主 `design-platform.css` 里，侧栏底色由这两个 token 决定：
 *
 *   --dsw-specific-sidebar-fill   侧栏底色（浅色 neutral-bluish-50 / 深色 -900）
 *   --dsw-specific-sidebar-tint    侧栏最终背景（由 fill 派生，darwin 平台用）
 *
 * 宿主的做法是「底色 97% + 一抹品牌蓝 3%」再乘 40% 透明度 —— 即**一点点**染色。
 * Bloom 的 12 套配色主题色更明确，需要的是「看得见的色相」，所以这里把
 * 侧栏底色直接换成**主题色淡化版**（accent 混入底色 12%~16%），并让 tint
 * 保持派生关系不变。
 *
 * 顶栏与主区用 `--dsw-alias-bg-base` / `--dsw-alias-bg-layer-1` / `-layer-2`，
 * 这些是所有面板的通用底色 —— 覆盖它们，顶栏、输入卡、菜单、弹窗一起带色，
 * 整体面板才是同一个调子，而不是「一块彩色会话区 + 一堆中性白面板」。
 *
 * ## 契约
 *
 *   · `overrideTokens(source, tokens)` 的每个 token 必须给 `{light, dark}` 两个值
 *     （宿主要求两个模式都必填，否则切到另一模式时会不可读）。
 *   · source 是覆盖层身份，同名再调会整体替换该层并重新叠到最上层。
 *   · 返回 disposer，插件 dispose 时必须调用，否则 token 留在宿主上。
 */
import { PALETTE } from './palette.js'

/** 配色变体名 —— PALETTE 的 key。 */
export type VariantName = string

/** 覆盖层身份 —— 宿主按 source 记录层，动态包传自己的包 id。 */
export const THEME_TOKEN_SOURCE = 'dsh-bloom-theme'

/** 宿主 theme 服务里我们用到的两个方法（只声明真用到的，兼容老宿主）。 */
export interface HostThemeTokenService {
  overrideTokens?: (
    source: string,
    tokens: Record<string, { light: string; dark: string }>,
  ) => () => void
}

/** 把 oklch 底色按比例染上主题色。 */
function tint(base: string, accent: string, percent: number): string {
  return `color-mix(in oklch, ${accent} ${percent}%, ${base})`
}

/**
 * 主题色覆盖层 —— 一次生成 light/dark 两套。
 *
 * @param variant 当前配色变体（PALETTE 的 key）。
 * @returns 传给 `ctx.theme.overrideTokens` 的 token 字典。
 */
export function buildThemeTokenOverrides(variant: VariantName): Record<string, { light: string; dark: string }> {
  const p = PALETTE[variant]
  if (!p) return {}
  const accentL = p.accentL
  const accentD = p.accentD
  const bgL = p.bgL
  const bgD = p.bgD
  const sfL = p.sfL
  const sfD = p.sfD
  const sf2L = p.sf2L
  const sf2D = p.sf2D

  return {
    /* 侧栏：宿主 darwin 平台最终背景是 tint（由 fill 派生），
     * 非 darwin 直接用 fill。两个都覆盖，行为一致。
     * 比例说明（owner 2026-11-21 实拍「侧栏不跟主题色走」）：
     *   14% → 26% 浅色 / 12% → 24% 暗色。宿主自己是 3%（底色 97% + 一抹
     *   品牌蓝 3%），肉眼几乎看不出；而 Bloom 的 12 套配色色相跨度大，
     *   必须给到 1/4 左右才看得出「这块面有自己的色」又不抢内容。 */
    '--dsw-specific-sidebar-fill': {
      light: tint(bgL, accentL, 26),
      dark: tint(bgD, accentD, 24),
    },

    /* 通用面板底色：顶栏、主区、输入卡、菜单、弹窗都吃这几个。
     * 只染一点点（6%~9%），保证「整屏同一个调子」但不压内容。 */
    '--dsw-alias-bg-base': {
      light: tint(bgL, accentL, 10),
      dark: tint(bgD, accentD, 14),
    },
    '--dsw-alias-bg-layer-1': {
      light: tint(sfL, accentL, 14),
      dark: tint(sfD, accentD, 17),
    },
    '--dsw-alias-bg-layer-2': {
      light: tint(sf2L, accentL, 14),
      dark: tint(sf2D, accentD, 17),
    },
  }
}

/**
 * 把当前配色的 token 覆盖层压到宿主 theme 服务上。
 *
 * @param service 宿主 theme 服务（可能没有 overrideTokens —— 老宿主）。
 * @param variant 当前配色变体。
 * @returns disposer（无覆盖能力时返回一个空操作 disposer）。
 */
export function applyThemeTokens(service: HostThemeTokenService | null, variant: VariantName): () => void {
  if (!service || typeof service.overrideTokens !== 'function') return () => {}
  const overrides = buildThemeTokenOverrides(variant)
  if (!Object.keys(overrides).length) return () => {}
  try {
    const dispose = service.overrideTokens(THEME_TOKEN_SOURCE, overrides)
    return typeof dispose === 'function' ? dispose : () => {}
  } catch {
    // 宿主拒收（token 名不认识等）：不阻断皮肤其余部分。
    return () => {}
  }
}
