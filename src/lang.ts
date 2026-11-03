/**
 * 界面语言：中文 / English / Русский。
 *
 * ## 语言归属（2026-10-30 改）
 *
 * 语言是「体系配置」，真源是 **DSH 的 locale 服务**，不是本插件自己存的 localStorage。
 * 早先这里用 `navigator.language` 自动判断 + `dsh-bloom-lang` 自己记一份，结果是
 * 两套语言系统并存：DSH 设置里选中文，Electron 的 `navigator.language` 报 en，
 * 面板就渲染成英文，用户看到的是「我明明设了中文，插件却是英文」。
 *
 * 现在的口径：
 *
 *  - 语言源只有一个：`ctx.locale`（`getSnapshot().active`），**只读**。
 *  - 2026-11-03（owner）：「dsh 用什么语言，我就什么语言」。面板里的「语言」行、
 *    `setLang`、以及往 DSH 语言表里补俄语的 `addLanguage` 全部删除 —— 插件不再
 *    拥有任何语言开关，也不扩展 DSH 的语言目录。换语言只在 DSH 设置里换。
 *  - 词条的注册、查找、回落全部交给 DSH：本插件只提供 `{zh, en, ru}` 词表。
 *    ru 表保留：DSH 自己将来带上俄语时直接生效，现在不会被选中。
 *
 * 三条设计约束不变：
 *
 *  1. 语言只管「显示」。配色 key、色值、诗句出处一律不动 —— 切语言不会把用户选好的
 *     主题弄丢，也不会改变任何对比度结论（contrast-guard 数的是色值，不是文字）。
 *  2. 查不到词条就原样显示中文。宁可露一个没译的词，也不要在界面上留空白，
 *     更不能抛异常 —— 顶栏那颗按钮没了比一个中文词严重得多。
 *  3. 没接上 DSH（独立运行、单测）时退回系统语言判断，行为与旧版一致。
 *
 * 为什么不直接把文案写死在各文件里：那样每加一种语言就要改一遍全部源码。
 * 现在源码里只有一处「原文」，译文集中在 lang-dicts.ts，加语言 = 加一张表。
 */
import { VARIANT_LABELS } from './palette.js'
import { DICT_RU, DICT_EN } from './lang-dicts.js'

export type BloomLang = 'zh' | 'en' | 'ru'

/** 本插件在 DSH locale 服务里的命名空间（词条按它注册/查找）。 */
export const LOCALE_NS = 'dsh-bloom-theme'

export const LANG_CHANGE_EVENT = 'dsh-bloom-lang-change'

/** 旧版自己存语言的 key。只在 bindLocale 时清一次，避免留下互相打架的死状态。 */
const LEGACY_LANG_KEY = 'dsh-bloom-lang'

/**
 * DSH locale 运行时里本插件用到的那几个方法。
 * 结构化子集，不引 DSH 的类型包 —— 本插件零运行时依赖是承诺。
 */
export interface LocaleLike {
  register(ns: string, dicts: Record<string, Record<string, string>>): void | (() => void)
  bind(ns: string): (key: string) => string
  getSnapshot(): { active: string }
  subscribe(fn: () => void): () => void
}

let runtime: LocaleLike | null = null
let translate: ((key: string) => string) | null = null

/**
 * 中文表：key 就是中文原文，值也返回它自己。
 *
 * 必须给全量恒等表，不能省 —— DSH 的回落链是「当前语言 → 声明的 fallback → en」，
 * zh 表缺一条就会漏到英文译文上（中文界面里蹦出英文）。键集取 en/ru 两张表的并集。
 */
const DICT_ZH: Record<string, string> = Object.fromEntries(
  [...new Set([...Object.keys(DICT_EN), ...Object.keys(DICT_RU)])].map((k) => [k, k]),
)

/** 交给 DSH 注册的三张表。zh 恒等、en/ru 是译文。 */
export const DICTS: Record<BloomLang, Record<string, string>> = {
  zh: DICT_ZH,
  en: DICT_EN,
  ru: DICT_RU,
}

/**
 * 把语言源接到 DSH 上。由 `apply(ctx)` 调用一次。
 *
 * 绑定后立刻广播一次 LANG_CHANGE_EVENT：面板是模块顶层 IIFE 注入的，早于 apply，
 * 那一轮用的是回退判断（可能刚好是英文），不广播就会停在英文上。
 *
 * @param locale - DSH 的 locale 运行时。
 */
export function bindLocale(locale: LocaleLike): void {
  runtime = locale
  translate = locale.bind(LOCALE_NS)
  try {
    // 旧版自己记的那份语言从此没有意义，留着只会在下次判断时误导
    window.localStorage?.removeItem(LEGACY_LANG_KEY)
  } catch {}
  try {
    window.dispatchEvent(new Event(LANG_CHANGE_EVENT))
  } catch {}
}

/** 当前界面语言。唯一真源是 DSH；没接上时才退回系统语言（旧行为）。 */
export function getLang(): BloomLang {
  const active = runtime?.getSnapshot?.().active
  if (typeof active === 'string' && active !== '') {
    const l = active.toLowerCase()
    if (l.startsWith('zh')) return 'zh'
    if (l.startsWith('ru')) return 'ru'
    return 'en'
  }
  return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

/** 模板的 key：静态片段用 {0} {1} 串起来 —— 「超时 {0}s」 */
const skeleton = (parts: readonly string[]) =>
  parts.map((s, i) => (i ? '{' + (i - 1) + '}' + s : s)).join('')

/**
 * 中文原文 → 当前界面语言。两种用法：
 *
 *   tr('深色')                      普通字符串
 *   tr`超时 ${secs}s`               带变量的模板（key 是骨架「超时 {0}s」）
 *
 * 接上 DSH 后走 `locale.bind(LOCALE_NS)`，回落链由 DSH 负责；没接上时用本地的
 * en/ru 表兜底，行为与旧版一致。
 *
 * 译文里少了某个 {n} 也不会把变量弄丢：补在句尾，宁可句子别扭，不能少信息
 * （少个版本号用户就不知道该装哪个）。
 */
export function tr(input: string | TemplateStringsArray, ...vals: (string | number)[]): string {
  const plain = typeof input === 'string'
  const key = plain ? (input as string) : skeleton(input as unknown as readonly string[])
  let out = key
  if (translate) {
    out = translate(key)
  } else {
    const lang = getLang()
    if (lang !== 'zh') {
      const dict = lang === 'ru' ? DICT_RU : DICT_EN
      out = dict[key] || key
    }
  }
  if (!vals.length) return out
  let dropped = ''
  vals.forEach((v, i) => {
    const hole = '{' + i + '}'
    if (out.includes(hole)) out = out.split(hole).join(String(v))
    else dropped += (dropped ? ' ' : '') + String(v)
  })
  return dropped ? out + ' ' + dropped : out
}

/** 变体名：ru 缺回退 en，en 缺回退 zh —— 加配色时忘了写译文也不会显示空白 */
export const variantName = (v) => {
  const l = VARIANT_LABELS[v]
  if (!l) return v
  const lang = getLang()
  if (lang === 'ru') return l.ru || l.en || l.zh
  if (lang === 'en') return l.en || l.zh
  return l.zh
}

/** 右侧那一列诗句：zh 用原句，en / ru 用各自译文（poemEn / poemRu），漏写才退回原句 */
export const variantPoem = (v) => {
  const l = VARIANT_LABELS[v]
  if (!l) return ''
  const lang = getLang()
  if (lang === 'ru') return l.poemRu || l.poem
  if (lang === 'en') return l.poemEn || l.poem
  return l.poem
}
