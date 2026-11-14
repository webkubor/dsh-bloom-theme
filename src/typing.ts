/**
 * 输入时的呼吸光（2026-11-04 owner：「至少我输入过程中是有个渐变光效的」）。
 *
 * 做法：监听 composer 里的输入框（textarea / contenteditable），有输入时给
 * `<body>` 打上 `data-bloom-typing="true"`，CSS 据此让卡片上的光带横向扫过；
 * 停手 900ms（或失焦）后撤掉，光带淡出。
 *
 * 为什么用 body 属性而不是给卡片加 class：
 *   - 卡片是 DSH 自己的 DOM（[class*="_card"] 是靠类名片段匹配的），我们不敢改它；
 *   - body 上的属性是插件自己的状态，不与 DSH 的渲染逻辑打架；
 *   - 一处属性就能同时驱动卡片光带、发送键呼吸等任何想跟着「正在输入」变的样式。
 *
 * 事件用捕获阶段挂在 document 上：DSH 可能对输入框做过 stopPropagation，
 * 冒泡阶段收不到；捕获阶段一定先于目标。
 */

import { readMotion } from './dom.js'

const TYPING_ATTR = 'data-bloom-typing'
const IDLE_MS = 900

let disposeCurrent: (() => void) | undefined

function isComposerInput(el: EventTarget | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false
  if (el.closest('[class*="_composer"]') === null) return false
  const tag = el.tagName
  if (tag === 'TEXTAREA') return true
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type
    return type === 'text' || type === 'search' || type === 'email'
  }
  return el.isContentEditable
}

function setTyping(on: boolean): void {
  const body = document.body
  if (!body) return
  if (on && readMotion()) body.setAttribute(TYPING_ATTR, 'true')
  else body.removeAttribute(TYPING_ATTR)
}

/**
 * 装上监听，返回卸载函数。
 *
 * 必须可卸载：apply(ctx) 会被 cordis 多次调用（materialize / HMR / 插件停用），
 * 旧实现用模块级 `bound` 防重复，代价是监听器、计时器和 body 上的
 * data-bloom-typing 永远留在页面上 —— 插件停掉之后光效还在跑。
 * 现在重复调用先卸载上一份；调用方把返回值交给 ctx.effect 即可随插件回收。
 */
export function initTypingGlow(): () => void {
  if (typeof document === 'undefined') return () => {}
  disposeCurrent?.()

  let timer: number | undefined
  const clearIdle = () => {
    if (timer !== undefined) { window.clearTimeout(timer); timer = undefined }
  }

  const onInput = (e: Event) => {
    if (!isComposerInput(e.target)) return
    setTyping(true)
    clearIdle()
    timer = window.setTimeout(() => { timer = undefined; setTyping(false) }, IDLE_MS)
  }
  const onFocusOut = (e: Event) => {
    if (!isComposerInput(e.target)) return
    // 失焦直接熄：光跟着人走，不留在空框上
    clearIdle()
    setTyping(false)
  }

  document.addEventListener('input', onInput, true)
  document.addEventListener('focusout', onFocusOut, true)

  const dispose = () => {
    document.removeEventListener('input', onInput, true)
    document.removeEventListener('focusout', onFocusOut, true)
    clearIdle()
    setTyping(false)
    if (disposeCurrent === dispose) disposeCurrent = undefined
  }
  disposeCurrent = dispose
  return dispose
}
