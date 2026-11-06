/**
 * 界面语言只跟随 DSH 的 locale 服务，支持中文 / English。
 *
 * 本插件通过 ctx.locale 注册自己的 zh/en 词条，不注册额外语言，也不提供语言开关。
 * 换语言只在 DSH 设置里换；未知语言按英文回落。
 * 没接上 DSH（独立运行、单测）时以英文显示，避免另设一个语言来源。
 *
 * 语言只管显示，配色 key、色值、诗句出处不变；查不到词条就返回中文原文。
 */
import { VARIANT_LABELS } from './palette.js'
import { DICT_EN } from './lang-dicts.js'

export type BloomLang = 'zh' | 'en'

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

/** 中文恒等表覆盖英文键集，防止中文界面缺词时回落到英文。 */
const DICT_ZH: Record<string, string> = Object.fromEntries(
  Object.keys(DICT_EN).map((k) => [k, k]),
)

/** 交给 DSH 注册的两张表。zh 恒等、en 是译文。 */
export const DICTS: Record<BloomLang, Record<string, string>> = {
  zh: DICT_ZH,
  en: DICT_EN,
}

/**
 * 把语言源接到 DSH 上。由 apply(ctx) 调用一次。
 * 绑定后广播变化，让早于 apply 注入的面板立即使用 DSH 当前语言。
 */
export function bindLocale(locale: LocaleLike): () => void {
  runtime = locale
  translate = locale.bind(LOCALE_NS)
  try {
    // 旧版自己记的那份语言从此没有意义，留着只会在下次判断时误导
    window.localStorage?.removeItem(LEGACY_LANG_KEY)
  } catch {}
  try {
    window.dispatchEvent(new Event(LANG_CHANGE_EVENT))
  } catch {}
  return () => {
    if (runtime === locale) {
      runtime = null
      translate = null
    }
  }
}

/** 当前界面语言。唯一真源是 DSH；未知或未绑定时回落英文。 */
export function getLang(): BloomLang {
  const active = runtime?.getSnapshot?.().active
  return active === 'zh' ? 'zh' : 'en'
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
 * 接上 DSH 后走 locale.bind(LOCALE_NS)，回落链由 DSH 负责；没接上时用英文表。
 * 译文里少了某个 {n} 也不会把变量弄丢：补在句尾，不能少信息。
 */
export function tr(input: string | TemplateStringsArray, ...vals: (string | number)[]): string {
  const plain = typeof input === 'string'
  const key = plain ? (input as string) : skeleton(input as unknown as readonly string[])
  let out = key
  if (translate) {
    out = translate(key)
  } else if (getLang() === 'en') {
    out = DICT_EN[key] || key
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

/** 变体名：英文缺词时回退中文，加配色时忘了写译文也不会显示空白。 */
export const variantName = (v) => {
  const l = VARIANT_LABELS[v]
  if (!l) return v
  return getLang() === 'en' ? l.en || l.zh : l.zh
}

/** 右侧诗句：中文用原句，英文用 poemEn，漏写才退回原句。 */
export const variantPoem = (v) => {
  const l = VARIANT_LABELS[v]
  if (!l) return ''
  return getLang() === 'en' ? l.poemEn || l.poem : l.poem
}
