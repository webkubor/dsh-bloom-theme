/**
 * Starlight particle generation for dark-scheme ambience presets.
 * Preset selection lives in ambience.ts; visibility per preset is pure CSS (background.ts).
 */

import { STORAGE_KEY } from './meta.js'

export type MeteorColorMode = 'colorful' | 'solid'
const COLOR_MODE_KEY = `${STORAGE_KEY}-meteor-color-mode`
let colorMode: MeteorColorMode = 'colorful'
let pendingWrite = false
let priorValue: string | null | undefined

export function readMeteorColorMode(): MeteorColorMode {
  try {
    const stored = localStorage.getItem(COLOR_MODE_KEY)
    if (pendingWrite && priorValue !== undefined && priorValue === stored) return colorMode
    colorMode = stored === 'solid' ? 'solid' : 'colorful'
    pendingWrite = false
    priorValue = undefined
  } catch { /* retain the session choice */ }
  return colorMode
}

export function writeMeteorColorMode(mode: MeteorColorMode): boolean {
  if (mode !== 'colorful' && mode !== 'solid') return false
  let previous: string | null | undefined
  try { previous = localStorage.getItem(COLOR_MODE_KEY) } catch { /* private mode */ }
  colorMode = mode
  try {
    localStorage.setItem(COLOR_MODE_KEY, mode)
    pendingWrite = false
    priorValue = undefined
  } catch {
    pendingWrite = true
    priorValue = previous
  }
  return true
}

const LAYER_ID = 'dsh-bloom-sparkles'
const CORNER_COUNT = 64
const CORNER_W = 360
const CORNER_H = 220
const METEOR_COUNT = 40
const MOTION_VARS = ['--bloom-motion-1', '--bloom-motion-2', '--bloom-motion-3']

function rand(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Sample the current theme motion colour so an in-flight meteor keeps its launch hue. */
function sampleMotionColor(doc: Document, streamIndex: number): string {
  const view = doc.defaultView
  if (!view || !doc.body) return ''
  const prop = readMeteorColorMode() === 'solid' ? '--bloom-accent' : (MOTION_VARS[streamIndex] ?? MOTION_VARS[0])
  return view.getComputedStyle(doc.body).getPropertyValue(prop).trim()
}

export function buildSparkles(doc: Document, seed = 7): HTMLElement {
  const layer = doc.createElement('div')
  layer.id = LAYER_ID
  layer.className = 'dsh-bloom-sparkles'
  layer.setAttribute('aria-hidden', 'true')

  // Top-right cluster: the v0.26.0 corner starlight, same seed and parameters,
  // anchored in pixels to the corner so every preset keeps it unchanged.
  const r = rand(seed * 9973 + 17)
  for (let i = 0; i < CORNER_COUNT; i++) {
    const x = 88 + r() * 12
    const y = -3 + r() * 10
    const ang = (95 + r() * 90) * Math.PI / 180
    const k = r()
    const dist = 50 + k * k * 560
    const big = r() < 0.15
    const size = big ? 1.8 + r() * 0.9 : 0.7 + r() * 1.0
    const dot = makeDot(doc, r, 's-tr', size, Math.cos(ang) * dist, Math.sin(ang) * dist * 0.75, 6, 7, 1.1, 1.6, 0.55)
    dot.style.right = `${(CORNER_W - (x / 100) * CORNER_W - size).toFixed(2)}px`
    dot.style.top = `${((y / 100) * CORNER_H).toFixed(2)}px`
    layer.appendChild(dot)
  }

  // Extra clusters for the wider presets use their own stream so the corner
  // cluster above stays bit-for-bit identical.
  const q = rand(seed * 7919 + 3)
  // Cluster 2: Bottom-Left Counter-Glow
  for (let i = 0; i < 26; i++) {
    const x = 2 + q() * 24
    const y = 74 + q() * 24
    const ang = (275 + q() * 85) * Math.PI / 180
    const dist = 30 + Math.pow(q(), 1.6) * 460
    createParticle(doc, layer, q, x, y, ang, dist, 's-bl')
  }

  // Cluster 3: Ambient Cosmic Dust
  for (let i = 0; i < 28; i++) {
    const x = q() * 100
    const y = q() * 100
    const ang = q() * 360 * Math.PI / 180
    const dist = 25 + q() * 160
    createParticle(doc, layer, q, x, y, ang, dist, 's-amb')
  }

  // Cluster 4: Bottom-Right Corner Starlight (extends coverage to the right-lower side)
  for (let i = 0; i < 36; i++) {
    const x = 68 + q() * 31
    const y = 58 + q() * 40
    const ang = (150 + q() * 120) * Math.PI / 180
    const dist = 35 + Math.pow(q(), 1.6) * 420
    createParticle(doc, layer, q, x, y, ang, dist, 's-amb')
  }

  // Cluster 5: Full Bottom Horizon Starlight (spreads across the entire lower edge)
  for (let i = 0; i < 44; i++) {
    const x = 4 + q() * 92
    const y = 76 + q() * 23
    const ang = (195 + q() * 150) * Math.PI / 180
    const dist = 25 + Math.pow(q(), 1.6) * 320
    createParticle(doc, layer, q, x, y, ang, dist, 's-amb')
  }

  // Meteor shower for the galaxy preset: original shape, direction and count.
  const m = rand(seed * 6151 + 29)
  for (let i = 0; i < METEOR_COUNT; i++) layer.appendChild(makeMeteor(doc, m, i))

  // Per-meteor colour transition: in-flight meteors keep their old colour,
  // newly launched meteors pick up the new palette colour.
  layer.addEventListener('animationiteration', (event) => {
    const el = event.target as HTMLElement | null
    if (!el || el.tagName !== 'B') return
    const match = /\bm([123])\b/.exec(el.className)
    const color = sampleMotionColor(doc, match ? Number(match[1]) - 1 : 0)
    if (color) el.style.setProperty('--meteor-color', color)
  })

  return layer
}

function makeMeteor(doc: Document, r: () => number, i: number): HTMLElement {
  const meteor = doc.createElement('b')
  meteor.className = `s-met m${(i % 3) + 1}`
  // Original top/right start, original angle, original shape — only travel extended so it reaches bottom-left.
  const fromTop = r() < 0.62
  const left = fromTop ? 8 + r() * 100 : 70 + r() * 34
  const top = fromTop ? -6 + r() * 10 : r() * 62
  const len = 140 + r() * 200
  const dur = 4.5 + r() * 7
  const st = meteor.style
  st.left = `${left.toFixed(2)}%`
  st.top = `${top.toFixed(2)}%`
  st.width = `${len.toFixed(0)}px`
  st.height = `${(1.8 + r() * 1.4).toFixed(2)}px`
  st.setProperty('--rot', `${(-28 - r() * 16).toFixed(1)}deg`)
  st.setProperty('--travel', `${(920 + r() * 980).toFixed(0)}px`)
  st.setProperty('--peak', (0.75 + r() * 0.25).toFixed(2))
  st.animationDuration = `${dur.toFixed(2)}s`
  st.animationDelay = `${(-r() * dur).toFixed(2)}s`
  const color = sampleMotionColor(doc, i % 3)
  if (color) st.setProperty('--meteor-color', color)
  return meteor
}

function makeDot(
  doc: Document, r: () => number, cluster: string, size: number, dx: number, dy: number,
  durBase: number, durSpan: number, twBase: number, twSpan: number, tintRatio: number,
): HTMLElement {
  const peak = 0.35 + r() * 0.65
  const dur = durBase + r() * durSpan
  const tw = twBase + r() * twSpan
  const tint = r() < tintRatio
  const dot = doc.createElement('i')
  dot.className = tint ? `${cluster} t` : cluster
  const st = dot.style
  st.width = `${size.toFixed(2)}px`
  st.height = `${size.toFixed(2)}px`
  st.setProperty('--dx', `${dx.toFixed(1)}px`)
  st.setProperty('--dy', `${dy.toFixed(1)}px`)
  st.setProperty('--peak', peak.toFixed(2))
  st.setProperty('--glow', `${(size * 2.4).toFixed(1)}px`)
  st.animationDuration = `${dur.toFixed(2)}s, ${tw.toFixed(2)}s`
  st.animationDelay = `${(-r() * dur).toFixed(2)}s, ${(-r() * tw).toFixed(2)}s`
  return dot
}

function createParticle(
  doc: Document, layer: HTMLElement, r: () => number,
  x: number, y: number, ang: number, dist: number, cluster: string,
): void {
  const big = r() < 0.15
  const size = big ? 1.8 + r() * 0.9 : 0.7 + r() * 1.0
  const dot = makeDot(doc, r, cluster, size, Math.cos(ang) * dist, Math.sin(ang) * dist * 0.75, 6.5, 7.5, 1.2, 1.8, 0.55)
  dot.style.left = `${x.toFixed(2)}%`
  dot.style.top = `${y.toFixed(2)}%`
  layer.appendChild(dot)
}
