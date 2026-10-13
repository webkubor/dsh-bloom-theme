/**
 * 界面语言：中文 / English / Русский。
 *
 * 三条设计约束，和主题其余部分一脉相承：
 *
 *  1. 语言只管「显示」。配色 key、色值、诗句出处一律不动 —— 切语言不会把用户选好的
 *     主题弄丢，也不会改变任何对比度结论（contrast-guard 数的是色值，不是文字）。
 *  2. 默认行为零变化。没在「语言」行里选过的时候，仍然是原来的自动判断
 *     （navigator.language 以 zh 开头 → 中文，其余 → English），俄语是显式选择。
 *  3. 查不到词条就原样显示中文。宁可露一个没译的词，也不要在界面上留空白，
 *     更不能抛异常 —— 顶栏那颗按钮没了比一个中文词严重得多。
 *
 * 为什么不直接把文案写死在各文件里：那样每加一种语言就要改一遍全部源码。
 * 现在源码里只有一处「原文」，译文集中在 lang-dicts.ts，加语言 = 加一张表。
 */
import { VARIANT_LABELS } from './palette.js'
import { DICT_RU, DICT_EN } from './lang-dicts.js'

export type BloomLang = 'zh' | 'en' | 'ru'

/** 顺序就是段控件里从左到右的顺序 */
export const LANGS: BloomLang[] = ['zh', 'en', 'ru']
/** 段控件上一格只放两个字母：三格塞进 312px 的面板，全名会把按钮挤到换行 */
export const LANG_SHORT: Record<BloomLang, string> = { zh: 'Zh', en: 'En', ru: 'Ru' }
/** 全名进 title，鼠标停上去能看到自己点的是哪种语言 */
export const LANG_FULL: Record<BloomLang, string> = { zh: '中文', en: 'English', ru: 'Русский' }

/** 与 dsh-bloom-variant 同一命名口径；单独一个 key，换语言不动主题 */
export const LANG_KEY = 'dsh-bloom-lang'

/** 原来的自动判断，一个字没改：中文环境 → 中文，其余 → English */
function autoLang(): BloomLang {
  return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

/** 读不到（无痕模式 / 配额满了）就退回自动判断，绝不抛 */
export function getLang(): BloomLang {
  try {
    const v = localStorage.getItem(LANG_KEY)
    if (v === 'zh' || v === 'en' || v === 'ru') return v
  } catch {}
  return autoLang()
}

export function setLang(lang: BloomLang) {
  try { localStorage.setItem(LANG_KEY, lang) } catch {}
  return lang
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
 * 译文里少了某个 {n} 也不会把变量弄丢：补在句尾，宁可句子别扭，不能少信息
 * （少个版本号用户就不知道该装哪个）。
 */
export function tr(input: string | TemplateStringsArray, ...vals: (string | number)[]): string {
  const plain = typeof input === 'string'
  const key = plain ? (input as string) : skeleton(input as unknown as readonly string[])
  const lang = getLang()
  let out = key
  if (lang !== 'zh') {
    const dict = lang === 'ru' ? DICT_RU : DICT_EN
    out = dict[key] || key
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

/**
 * 「语言」那一行。样式直接复用模式行（.dsh-bloom-appearance），所以 CSS 一行没加：
 * 两个三选一的分段控件长得一样是应该的，不是巧合。区分靠 data-lang / data-mode。
 */
export function langRowHTML(current: BloomLang): string {
  const btns = LANGS.map((l) =>
    `<button type="button" class="dsh-bloom-appearance__btn" data-lang="${l}"` +
    ` data-active="${l === current}" aria-pressed="${l === current}" title="${LANG_FULL[l]}">${LANG_SHORT[l]}</button>`
  ).join('')
  return `<div class="dsh-bloom-section">${tr('语言')}</div>` +
    `<div class="dsh-bloom-appearance dsh-bloom-lang" role="group" aria-label="${tr('界面语言')}">` +
    `<div class="dsh-bloom-appearance__seg">${btns}</div></div>`
}

/** 选中态与存储对齐；每次打开菜单都重读，理由同 syncAppearanceRow（缓存必然对不上） */
export function syncLangRow(el: HTMLElement) {
  const row = el.querySelector<HTMLElement>('.dsh-bloom-lang')
  if (!row) return
  const cur = getLang()
  for (const btn of Array.from(row.querySelectorAll<HTMLElement>('[data-lang]'))) {
    const on = btn.dataset.lang === cur
    btn.dataset.active = String(on)
    btn.setAttribute('aria-pressed', String(on))
  }
}
