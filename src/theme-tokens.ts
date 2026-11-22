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
 * 侧栏底色直接换成**主题色淡化版**，并让 tint 保持派生关系不变。
 *
 * 顶栏与主区用 `--dsw-alias-bg-base` / `--dsw-alias-bg-layer-1` / `-layer-2`，
 * 这些是所有面板的通用底色 —— 覆盖它们，顶栏、输入卡、菜单、弹窗一起带色，
 * 整体面板才是同一个调子，而不是「一块彩色会话区 + 一堆中性白面板」。
 *
 * ## 混入比按彩度归一（2026-11-21 owner 复审）
 *
 * owner 第二轮实拍发难：「这个侧边栏就是这么处理的吗？你觉得这是好看的？」
 * —— 上一版固定 26% 混入对高彩度配色过敏：mist（C0.08）混出 C0.028 的
 * 淡青蓝尚可，petal（C0.22）混出 C0.065、cinnabar C0.050 —— 侧栏成了一块
 * 又深又彩的「平涂色板」，和近白的主区（C≈0.012）割裂。
 *
 * 修法：**不再用固定比例，按「目标彩度」反推每个变体的混入比**。
 * 目标：浅色侧栏 C≈0.022（mist 实拍认可的淡青蓝 rgb(188,206,221) ≈ C0.030
 * 收敛到略淡一档），暗色侧栏 C≈0.030。低彩度配色（stone C0.06）会自动拿到
 * 更高的混入比（≈30%），高彩度配色（petal C0.22）自动压到 ≈6%——
 * 15 套配色的侧栏彩度全部对齐到同一感知强度，换配色时只有色相在变。
 *
 * 公式（oklch 线性近似，与浏览器 color-mix(in oklch) 一致到小数点后三位）：
 *   mixC = p·accentC + (1−p)·bgC  →  p = (target − bgC) / (accentC − bgC)
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
 * 解析 `oklch(L% C H)` 字符串 —— PALETTE 全表都是这个格式（tsc 类型上约束过）。
 * 解析失败返回 null（未知格式走固定比例兜底）。
 */
function parseOklch(color: string): { l: number; c: number; h: number } | null {
  const m = /^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)$/.exec(color.trim())
  if (!m) return null
  return { l: parseFloat(m[1]), c: parseFloat(m[2]), h: parseFloat(m[3]) }
}

/**
 * 按「目标彩度」反推混入比（oklch 线性近似）。
 *
 *   mixC = p·accentC + (1−p)·bgC   →   p = (target − bgC) / (accentC − bgC)
 *
 * 夹在 [min, max]：低彩度配色（stone）也至少给 min% 保证看得出色相，
 * 高彩度配色（petal）最多给 max% 防止色块过重。解析失败（未来出现
 * 非标准格式的配色）回落 fallback%。
 */
function mixPercentForTargetChroma(
  accent: string, base: string, target: number, fallback: number, min: number, max: number,
): number {
  const a = parseOklch(accent)
  const b = parseOklch(base)
  if (!a || !b) return fallback
  const denom = a.c - b.c
  if (denom <= 0.005) return fallback
  const p = ((target - b.c) / denom) * 100
  return Math.min(max, Math.max(min, p))
}

/** 侧栏目标彩度：浅色档。宿主原生侧栏 C≈0.004~0.010，这里给「看得见但成不了板」的一档。 */
const SIDEBAR_TARGET_CHROMA_LIGHT = 0.022
/** 侧栏目标彩度：暗色档（暗底上同样彩度看起来更弱，略抬高）。 */
const SIDEBAR_TARGET_CHROMA_DARK = 0.030
/** 通用面板（bg-base / layer-1 / layer-2）目标彩度：比侧栏再淡一半，只留调子。 */
const SURFACE_TARGET_CHROMA_LIGHT = 0.012
const SURFACE_TARGET_CHROMA_DARK = 0.018

/** 混入比上下限（%）。 */
const MIX_MIN = 5
const MIX_MAX_LIGHT = 30
const MIX_MAX_DARK = 34

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

  /* 混入比按彩度归一：每套配色混出的侧栏彩度一致（详见文件头）。
   * 侧栏是「面」，要压住；通用面板只要调子。 */
  const sidebarL = mixPercentForTargetChroma(accentL, bgL, SIDEBAR_TARGET_CHROMA_LIGHT, 12, MIX_MIN, MIX_MAX_LIGHT)
  const sidebarD = mixPercentForTargetChroma(accentD, bgD, SIDEBAR_TARGET_CHROMA_DARK, 12, MIX_MIN, MIX_MAX_DARK)
  const baseL = mixPercentForTargetChroma(accentL, bgL, SURFACE_TARGET_CHROMA_LIGHT, 6, MIX_MIN, 18)
  const baseD = mixPercentForTargetChroma(accentD, bgD, SURFACE_TARGET_CHROMA_DARK, 8, MIX_MIN, 22)
  const layerL = mixPercentForTargetChroma(accentL, sfL, SURFACE_TARGET_CHROMA_LIGHT, 6, MIX_MIN, 18)
  const layerD = mixPercentForTargetChroma(accentD, sfD, SURFACE_TARGET_CHROMA_DARK, 8, MIX_MIN, 22)
  const layer2L = mixPercentForTargetChroma(accentL, sf2L, SURFACE_TARGET_CHROMA_LIGHT, 6, MIX_MIN, 18)
  const layer2D = mixPercentForTargetChroma(accentD, sf2D, SURFACE_TARGET_CHROMA_DARK, 8, MIX_MIN, 22)

  return {
    /* 侧栏：宿主 darwin 平台最终背景是 tint（由 fill 派生），
     * 非 darwin 直接用 fill。两个都覆盖，行为一致。 */
    '--dsw-specific-sidebar-fill': {
      light: tint(bgL, accentL, sidebarL),
      dark: tint(bgD, accentD, sidebarD),
    },

    /* 通用面板底色：顶栏、主区、输入卡、菜单、弹窗都吃这几个。 */
    '--dsw-alias-bg-base': {
      light: tint(bgL, accentL, baseL),
      dark: tint(bgD, accentD, baseD),
    },
    '--dsw-alias-bg-layer-1': {
      light: tint(sfL, accentL, layerL),
      dark: tint(sfD, accentD, layerD),
    },
    '--dsw-alias-bg-layer-2': {
      light: tint(sf2L, accentL, layer2L),
      dark: tint(sf2D, accentD, layer2D),
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
