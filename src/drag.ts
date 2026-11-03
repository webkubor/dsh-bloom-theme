/** Floating switcher dragging and position recovery (#14, #50, #61, #87). */
import { STORAGE_KEY } from './meta.js'

const POS_KEY = `${STORAGE_KEY}-float-pos`
const DRAG_THRESHOLD = 4
const MARGIN = 8
const TITLEBAR_MIN_TOP = 84

type Pos = { left: number; top: number }
const bindings = new WeakMap<HTMLElement, () => void>()

/** Keep the generic viewport clamp independent of the desktop titlebar. */
export function clampPos(p: Pos, w: number, h: number, vw: number, vh: number): Pos {
  return {
    left: Math.min(Math.max(p.left, MARGIN), Math.max(MARGIN, vw - w - MARGIN)),
    top: Math.min(Math.max(p.top, MARGIN), Math.max(MARGIN, vh - h - MARGIN)),
  }
}

function readPos(): Pos | null {
  try {
    const p = JSON.parse(localStorage.getItem(POS_KEY) || 'null')
    return Number.isFinite(p?.left) && Number.isFinite(p?.top) ? p : null
  } catch { return null }
}

function savePos(p: Pos) {
  try { localStorage.setItem(POS_KEY, JSON.stringify(p)) } catch { /* Storage is optional. */ }
}

function safePos(el: HTMLElement, p: Pos): Pos {
  const height = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dsh-windows-titlebar-height'))
  const floor = Math.max(TITLEBAR_MIN_TOP, Number.isFinite(height) ? height + MARGIN : 0)
  const pos = clampPos(p, el.offsetWidth, el.offsetHeight, window.innerWidth, window.innerHeight)
  // In a tiny viewport retain as much of the control as possible below the titlebar.
  pos.top = Math.max(pos.top, Math.min(floor, Math.max(MARGIN, window.innerHeight - el.offsetHeight - MARGIN)))
  return pos
}

function apply(el: HTMLElement, p: Pos) {
  el.style.left = `${p.left}px`
  el.style.top = `${p.top}px`
  el.style.right = 'auto'
  el.dataset.menuSide = p.left + el.offsetWidth / 2 > window.innerWidth / 2 ? 'right' : 'left'
}

export function disableFloatingDrag(el: HTMLElement) {
  bindings.get(el)?.()
}

/** Called when migrating back into the host header. */
export function clearFloatingPos(el: HTMLElement) {
  disableFloatingDrag(el)
  el.style.left = el.style.top = el.style.right = ''
  delete el.dataset.menuSide
}

/** Explicit recovery also clears storage, including an old offscreen position. */
export function resetFloatingPos(el: HTMLElement) {
  try { localStorage.removeItem(POS_KEY) } catch { /* Storage is optional. */ }
  clearFloatingPos(el)
  if (el.dataset.floating === 'true') enableFloatingDrag(el)
}

export function enableFloatingDrag(el: HTMLElement) {
  if (bindings.has(el)) return
  el.dataset.dragBound = 'true'
  let start: { id: number; x: number; y: number; left: number; top: number } | null = null
  let moved = false
  let suppressClick = false

  const restore = () => {
    if (el.dataset.floating !== 'true') return
    const r = el.getBoundingClientRect()
    apply(el, safePos(el, readPos() || { left: r.left, top: r.top }))
  }
  const stopListening = () => {
    document.removeEventListener('pointermove', move, true)
    document.removeEventListener('pointerup', finish, true)
    document.removeEventListener('pointercancel', cancel, true)
    window.removeEventListener('blur', cancel)
  }
  const end = (suppress: boolean) => {
    if (!start) return
    const id = start.id
    start = null
    stopListening()
    delete el.dataset.dragging
    if (el.hasPointerCapture(id)) el.releasePointerCapture(id)
    if (moved) {
      const r = el.getBoundingClientRect()
      const p = safePos(el, { left: r.left, top: r.top })
      apply(el, p)
      savePos(p)
    }
    suppressClick = moved && suppress
    moved = false
    // Keep this through an interrupted gesture's eventual pointerup. A fresh press
    // resets it, and keyboard clicks (detail=0) are never suppressed.
  }
  const finish = (e: PointerEvent) => { if (e.pointerId === start?.id) end(true) }
  const cancel = (e: Event) => {
    if (e instanceof PointerEvent && e.pointerId !== start?.id) return
    end(true)
  }
  const move = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return
    if (el.dataset.floating !== 'true' || !el.isConnected) { end(false); return }
    if (e.buttons === 0) { end(false); return }
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (!moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return
    if (!moved) {
      moved = true
      // Capture only a real drag: capturing the wrapper on press retargets button clicks.
      try { el.setPointerCapture(e.pointerId) } catch { /* Document listeners remain a fallback. */ }
    }
    el.dataset.dragging = 'true'
    e.preventDefault()
    apply(el, safePos(el, { left: start.left + dx, top: start.top + dy }))
  }
  const down = (e: PointerEvent) => {
    if (start) return
    suppressClick = false
    if (el.dataset.floating !== 'true' || e.button !== 0 || !e.isPrimary) return
    if ((e.target as Element).closest('.dsh-bloom-menu')) return
    const r = el.getBoundingClientRect()
    start = { id: e.pointerId, x: e.clientX, y: e.clientY, left: r.left, top: r.top }
    document.addEventListener('pointermove', move, true)
    document.addEventListener('pointerup', finish, true)
    document.addEventListener('pointercancel', cancel, true)
    window.addEventListener('blur', cancel)
  }
  const click = (e: MouseEvent) => {
    if (!suppressClick || e.detail === 0) return
    suppressClick = false
    e.stopImmediatePropagation()
    e.preventDefault()
  }
  const lost = (e: PointerEvent) => { if (e.pointerId === start?.id) end(true) }
  const cleanup = () => {
    end(false)
    suppressClick = false
    window.removeEventListener('resize', restore)
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('lostpointercapture', lost)
    el.removeEventListener('click', click, true)
    bindings.delete(el)
    delete el.dataset.dragBound
  }
  bindings.set(el, cleanup)
  el.addEventListener('pointerdown', down)
  el.addEventListener('lostpointercapture', lost)
  el.addEventListener('click', click, true)
  window.addEventListener('resize', restore)
  restore()
}
