/**
 * 星辉层（Starlight A 方案精修版）—— 深色模式下的全屏璀璨星空背景。
 *
 * 核心审美指标：
 * 1. 空间景深层次：
 *    - 近景主星（8 颗）：直径 2.4~3.2px，带 5 倍柔光晕与高亮白核，全局分散（带最小间距防扎堆）；
 *    - 中景晶星（26 颗）：直径 1.4~1.9px，清澈明亮，正弦缓闪；
 *    - 远景星尘（50 颗）：直径 0.8~1.1px，弥漫于深空背景，营造银河深邃感。
 * 2. 避免星点扎堆与遮挡：
 *    - 粒子自然散布于全屏（避开正中央强焦点），保持空灵呼吸；
 * 3. 莫兰迪色温自洽：
 *    - 冷色调（黛蓝/天青/松石）：冰月钻白与冷蓝星晕；
 *    - 暖色调（朱砂/落霞/橙黄/轻黄）：暖暮香槟金与温润星晕；
 *    - 柔粉调（桃夭/银红/粉霞）：粉霞晶钻与淡紫柔光；
 * 4. 绿色节能规范：
 *    - 仅深色模式激活；浅色完全清空且不开 rAF；
 *    - 切后台自动暂停；减少动效模式停用动画。
 */

import { currentIsDark } from './appearance.js'
import { readVariant } from './dom.js'

interface Star {
  xRatio: number
  yRatio: number
  r: number
  baseAlpha: number
  speed: number
  phase: number
  tier: 1 | 2 | 3
}

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let animationId: number | null = null
let stars: Star[] = []
let activeVariant = 'mist'
let isDark = false

interface StarColors {
  core: string
  glow: string
}

function getStarColors(variant: string): StarColors {
  if (variant === 'cinnabar' || variant === 'aurora' || variant === 'tangerine' || variant === 'osmanthus') {
    return {
      core: '255, 248, 230',
      glow: '255, 212, 155',
    }
  }
  if (variant === 'petal' || variant === 'silverrose' || variant === 'dawn') {
    return {
      core: '255, 242, 248',
      glow: '255, 198, 226',
    }
  }
  if (variant === 'mint' || variant === 'ripple' || variant === 'sage') {
    return {
      core: '235, 255, 250',
      glow: '185, 245, 230',
    }
  }
  // 默认冷色（mist, lapis, stone, lavender）
  return {
    core: '245, 250, 255',
    glow: '190, 225, 255',
  }
}

function initStars(): void {
  stars = []
  let seed = 45678
  function rnd(): number {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  // 1. 近景大星 (8 颗，带最小距离约束，严禁扎堆重叠)
  const majorStars: { x: number; y: number }[] = []
  for (let attempt = 0; attempt < 100 && majorStars.length < 8; attempt++) {
    const x = 0.05 + rnd() * 0.9
    const y = 0.05 + rnd() * 0.8
    // 检查与已有大星的距离
    const tooClose = majorStars.some(m => {
      const dx = m.x - x
      const dy = m.y - y
      return Math.sqrt(dx * dx + dy * dy) < 0.22
    })
    if (!tooClose) {
      majorStars.push({ x, y })
      stars.push({
        xRatio: x,
        yRatio: y,
        r: 2.2 + rnd() * 0.9,
        baseAlpha: 0.82 + rnd() * 0.18,
        speed: 0.0006 + rnd() * 0.0008,
        phase: rnd() * Math.PI * 2,
        tier: 3,
      })
    }
  }

  // 2. 中景晶星 (26 颗)
  for (let i = 0; i < 26; i++) {
    stars.push({
      xRatio: 0.02 + rnd() * 0.96,
      yRatio: 0.02 + rnd() * 0.94,
      r: 1.3 + rnd() * 0.6,
      baseAlpha: 0.52 + rnd() * 0.35,
      speed: 0.0008 + rnd() * 0.0012,
      phase: rnd() * Math.PI * 2,
      tier: 2,
    })
  }

  // 3. 远景细碎星尘 (50 颗，全屏空间景深)
  for (let i = 0; i < 50; i++) {
    stars.push({
      xRatio: rnd(),
      yRatio: rnd(),
      r: 0.7 + rnd() * 0.4,
      baseAlpha: 0.3 + rnd() * 0.35,
      speed: 0.001 + rnd() * 0.0015,
      phase: rnd() * Math.PI * 2,
      tier: 1,
    })
  }
}

function resizeCanvas(): void {
  if (!canvas || !ctx) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function renderFrame(time: number): void {
  if (!canvas || !ctx || !isDark) return

  const w = window.innerWidth
  const h = window.innerHeight
  ctx.clearRect(0, 0, w, h)

  const { core, glow } = getStarColors(activeVariant)
  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  for (const s of stars) {
    const x = s.xRatio * w
    const y = s.yRatio * h
    const flicker = prefersReduceMotion ? 1 : (0.72 + 0.28 * Math.sin(time * s.speed + s.phase))
    const alpha = Math.min(1, s.baseAlpha * flicker)

    if (s.tier === 3) {
      // 近景大星：多层光晕 + 高亮光芯
      const glowR = s.r * 4.6
      const g = ctx.createRadialGradient(x, y, 0, x, y, glowR)
      g.addColorStop(0, `rgba(${core}, ${alpha})`)
      g.addColorStop(0.25, `rgba(${glow}, ${alpha * 0.7})`)
      g.addColorStop(0.65, `rgba(${glow}, ${alpha * 0.2})`)
      g.addColorStop(1, `rgba(${glow}, 0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, glowR, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, s.r * 0.85, 0, Math.PI * 2)
      ctx.fill()
    } else if (s.tier === 2) {
      // 中景星：平滑柔晕
      const glowR = s.r * 3.2
      const g = ctx.createRadialGradient(x, y, 0, x, y, glowR)
      g.addColorStop(0, `rgba(${core}, ${alpha})`)
      g.addColorStop(0.4, `rgba(${glow}, ${alpha * 0.45})`)
      g.addColorStop(1, `rgba(${glow}, 0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, glowR, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // 远景细碎星尘
      ctx.fillStyle = `rgba(${core}, ${alpha * 0.75})`
      ctx.beginPath()
      ctx.arc(x, y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (!prefersReduceMotion && !document.hidden) {
    animationId = requestAnimationFrame(renderFrame)
  }
}

function startLoop(): void {
  stopLoop()
  if (!isDark) return
  resizeCanvas()
  animationId = requestAnimationFrame(renderFrame)
}

function stopLoop(): void {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (canvas && ctx) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  }
}

export function updateStarlightState(variant?: string): void {
  if (variant) activeVariant = variant
  isDark = currentIsDark()

  if (isDark) {
    startLoop()
  } else {
    stopLoop()
  }
}

export function initStarlight(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById('dsh-bloom-starlight')) return

  initStars()

  canvas = document.createElement('canvas')
  canvas.id = 'dsh-bloom-starlight'
  canvas.className = 'dsh-bloom-starlight'
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;'
  ctx = canvas.getContext('2d')

  document.body.prepend(canvas)

  activeVariant = document.body.dataset.bloomVariant || readVariant() || 'mist'
  isDark = currentIsDark()

  window.addEventListener('resize', resizeCanvas, { passive: true })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
    } else if (isDark) {
      animationId = requestAnimationFrame(renderFrame)
    }
  })

  const observer = new MutationObserver(() => {
    const curVariant = document.body.dataset.bloomVariant || 'mist'
    const curDark = currentIsDark()
    if (curVariant !== activeVariant || curDark !== isDark) {
      activeVariant = curVariant
      isDark = curDark
      if (isDark) startLoop(); else stopLoop()
    }
  })
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-bloom-variant', 'data-ds-dark-theme', 'class'] })

  if (isDark) {
    startLoop()
  }
}
