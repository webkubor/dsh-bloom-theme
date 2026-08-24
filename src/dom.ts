/**
 * DOM 工具层：样式注入、变体读写、宿主查找、<think> 标签收拾。
 *
 * injectCSS 用 data-plugin-css 属性做幂等标记 —— DSH 的 cordis materialize
 * 可能多次调用 apply，重复注入会让同一份 CSS 叠好几份。
 */
import { PLUGIN_ID, STORAGE_KEY } from './meta.js'
import { VARIANTS } from './palette.js'


/**
 * 收拾裸露的 <think> 标签。
 *
 * ⚠️ 这是 workaround，不是根治。根因在 LLM 适配层：某些模型（如 MiniMax-M3）把思考
 * 内容内联在 content 里输出 <think>…</think>，而 DSH 的推理解析没识别它，于是整段
 * 当普通 markdown 渲染，标签就露在正文里。正解是在 provider 适配层解析成 reasoning
 * 字段，交给 DSH 原生的 ReasoningRow 渲染。
 *
 * 之所以敢在主题层做：实测这些标签**各自独占一个段落元素**（56/56，无一混在正文中），
 * 所以只标记、不改任何文本内容 —— 隐藏它们不会丢字。
 * 只加 data-* 属性，不动 DOM 结构，React 重渲染最多是属性丢失，observer 会补回来。
 */
export const THINK_OPEN = '<think>'

export const THINK_CLOSE = '</think>'

export function markThinkTags() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const tags = []
  let n
  while ((n = walker.nextNode())) {
    const t = (n.nodeValue || '').trim()
    if (t !== THINK_OPEN && t !== THINK_CLOSE) continue
    const el = n.parentElement
    if (!el || el.dataset.bloomThink) continue
    el.dataset.bloomThink = t === THINK_OPEN ? 'open' : 'close'
    tags.push(el)
  }
  if (!tags.length) return
  // 配对：把开闭标签之间的兄弟节点标成思考内容（降权显示，不隐藏 —— 信息不丢）
  for (const el of tags) {
    if (el.dataset.bloomThink !== 'open') continue
    for (let sib = el.nextElementSibling; sib; sib = sib.nextElementSibling) {
      if (sib.dataset.bloomThink === 'close') break
      if (sib.dataset.bloomThink === 'open') break // 未配对，停手
      sib.dataset.bloomThinkBody = 'true'
    }
  }
}

export function watchThinkTags() {
  if (window.__dshBloomThinkObserver__) return
  let timer = null
  const schedule = () => {
    // 流式输出会高频触发，节流到 300ms
    if (timer) return
    timer = setTimeout(() => { timer = null; markThinkTags() }, 300)
  }
  const obs = new MutationObserver(schedule)
  obs.observe(document.body, { childList: true, subtree: true, characterData: true })
  window.__dshBloomThinkObserver__ = obs
  markThinkTags()
}

/* v0.5.0：氛围层（壁纸 / 玻璃开关 / 主题包）整体移除，玻璃改为默认常开。 */

export function readVariant() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return VARIANTS.includes(v) ? v : 'mist'
  } catch { return 'mist' }
}

export function injectCSS(css, idSuffix) {
  const tagId = PLUGIN_ID + '/' + idSuffix
  if (document.querySelector<HTMLElement>('style[data-plugin-css="' + tagId + '"]')) return
  const tag = document.createElement('style')
  tag.dataset.plugin = PLUGIN_ID
  tag.dataset.pluginCss = tagId
  tag.textContent = css
  document.head.appendChild(tag)
}

/**
 * 挂载点：优先塞进 DSH 顶栏的工具区，跟 Session log 等原生控件并排。
 *
 * 之前用 position:fixed 浮在右上角，实测矩形与 Session log 按钮几乎完全重合，
 * 把人家整个盖住点不到 —— 浮层永远有压住宿主控件的风险，挂进 DOM 才是根治。
 * 找不到宿主时退回浮动，但位置移到 header 下方（见 [data-floating] 样式）。
 */
export function findSwitcherHost() {
  // 必须限定在真顶栏（<header>）内部再找。
  //
  // 侧边栏「工作区」那一行也有个 [class*="_headerActions"] 容器（另一套 CSS Module
  // 前缀，实测 qDHVXG_headerActions vs 顶栏的 wSkVaW_headerActions），而它在 DOM 里
  // 排在顶栏之前 —— 不限定作用域时 document.querySelector 会先命中它，切换器就被
  // prepend 到左边侧边栏去了。新建会话时顶栏子树重建、_headerUtilities 短暂消失，
  // fallback 生效，于是「右上角的切换器跑到左边」。
  const header = document.querySelector<HTMLElement>('header[class*="_header"]') || document.querySelector<HTMLElement>('header')
  if (!header) return null
  return header.querySelector<HTMLElement>('[class*="_headerUtilities"]')
    || header.querySelector<HTMLElement>('[class*="_headerActions"]')
    || null
}
