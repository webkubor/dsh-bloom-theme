/**
 * 兜底浮动形态的拖动与位置记忆（issue #14）。
 *
 * 为什么只给 floating 形态：挂进 header 的正常形态跟着顶栏布局走，
 * 侧边栏一开顶栏就缩，按钮自然让位、压不到谁。而 floating 是
 * 「找不到宿主容器」的降级路径 —— 它 position:fixed 钉在
 * top:84px / right:16px，会挡住什么完全取决于用户装了哪些插件：
 * #14 是侧边栏展开后顶部那排按钮，下一个可能是别人的浮层。
 * 与其穷举「避让某个具体元素」，不如让用户拖一次、我们记住。
 *
 * 位置只在 floating 时读写；一旦宿主出现、切换器被迁回 header
 * （injectSwitcher 会把 data-floating 置回 false），内联的 left/top
 * 必须清掉，否则 fixed 的坐标会残留在 inline-flex 元素上把它顶歪。
 */
import { STORAGE_KEY } from './meta.js'

const POS_KEY = `${STORAGE_KEY}-float-pos`
/** 小于这个位移算点击、不算拖动 —— 否则轻微手抖就打不开菜单 */
const DRAG_THRESHOLD = 4
/** 离视口边缘至少留这么多，别让按钮贴边贴到抓不住 */
const MARGIN = 8

type Pos = { left: number; top: number }

/**
 * 把位置夹回视口内。三种情况都靠它兜：存的是上次大窗口下的坐标、
 * 用户中途缩小了窗口、外接屏拔掉后分辨率变了。
 * 用 Math.max(MARGIN, ...) 兜住「视口比元素还小」的极端情形，
 * 那时至少保证 left/top 不是负数。
 */
export function clampPos(p: Pos, w: number, h: number, vw: number, vh: number): Pos {
  return {
    left: Math.min(Math.max(p.left, MARGIN), Math.max(MARGIN, vw - w - MARGIN)),
    top: Math.min(Math.max(p.top, MARGIN), Math.max(MARGIN, vh - h - MARGIN)),
  }
}

function readPos(): Pos | null {
  try {
    const raw = localStorage.getItem(POS_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return typeof p?.left === 'number' && typeof p?.top === 'number' ? p : null
  } catch { return null }   // 隐私模式 / 存了脏值：当没存过
}

function savePos(p: Pos) {
  try { localStorage.setItem(POS_KEY, JSON.stringify(p)) } catch { /* 存不了就算了，不影响本次拖动 */ }
}

/** 落位：写 inline 样式 + 按左右半屏决定菜单朝哪边展开（否则拖到左侧菜单会溢出屏幕） */
function apply(el: HTMLElement, p: Pos) {
  el.style.left = `${p.left}px`
  el.style.top = `${p.top}px`
  el.style.right = 'auto'
  el.dataset.menuSide = p.left + el.offsetWidth / 2 > window.innerWidth / 2 ? 'right' : 'left'
}

/** 清掉浮动坐标 —— 切换器迁回 header 时必须调，见文件头注释 */
export function clearFloatingPos(el: HTMLElement) {
  el.style.left = el.style.top = el.style.right = ''
  delete el.dataset.menuSide
}

export function enableFloatingDrag(el: HTMLElement) {
  if (el.dataset.dragBound === 'true') return   // 重挂时不重复绑
  el.dataset.dragBound = 'true'

  const restore = () => {
    const saved = readPos()
    if (!saved) return
    apply(el, clampPos(saved, el.offsetWidth, el.offsetHeight, window.innerWidth, window.innerHeight))
  }
  restore()
  window.addEventListener('resize', () => { if (el.dataset.floating === 'true') restore() })

  let start: { x: number; y: number; left: number; top: number } | null = null
  let moved = false

  el.addEventListener('pointerdown', (e) => {
    if (el.dataset.floating !== 'true') return
    if ((e as PointerEvent).button !== 0) return
    // 菜单里的选项/链接不参与拖动，否则选变体要先躲开拖拽判定
    if ((e.target as HTMLElement).closest('.dsh-bloom-menu')) return
    const r = el.getBoundingClientRect()
    start = { x: e.clientX, y: e.clientY, left: r.left, top: r.top }
    moved = false
    el.setPointerCapture(e.pointerId)
  })

  el.addEventListener('pointermove', (e) => {
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (!moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return
    moved = true
    el.dataset.dragging = 'true'
    apply(el, clampPos(
      { left: start.left + dx, top: start.top + dy },
      el.offsetWidth, el.offsetHeight, window.innerWidth, window.innerHeight,
    ))
  })

  const finish = (e: PointerEvent) => {
    if (!start) return
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    start = null
    delete el.dataset.dragging
    if (!moved) return
    const r = el.getBoundingClientRect()
    savePos({ left: r.left, top: r.top })
  }
  el.addEventListener('pointerup', finish)
  el.addEventListener('pointercancel', finish)

  // 拖完那一下浏览器还会派发 click —— 不拦住的话松手即弹菜单。
  // capture 阶段拦，早于 switcher 自己那个 click 处理器。
  el.addEventListener('click', (e) => {
    if (!moved) return
    moved = false
    e.stopPropagation()
    e.preventDefault()
  }, true)
}
