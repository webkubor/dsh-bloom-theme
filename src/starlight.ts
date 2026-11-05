/**
 * 星辉层 —— 深色模式下，从窗口右上角「滑出来」的闪烁光点。
 *
 * 做法照搬 ModelGo 控制台账单余额桶的 BucketSparkles（owner 指定的参照物），
 * 不是画布星空：
 *   · 每颗光点是一个真实 <i>，位置 / 方向 / 大小 / 峰值亮度 / 时长 / 相位
 *     全由种子伪随机生成 —— 稳定，不随刷新变化；
 *   · 两条 CSS 动画叠加：drift 从角里向左 / 左下 / 下发散（起点小而暗，
 *     滑出途中放大点亮，末端渐隐），twinkle 叠一层不规则亮灭；
 *   · 距离用平方分布：大多数光点停在角附近，少数滑得很远 —— 这就是
 *     「从角里溢出来」的观感来源，不是均匀撒满屏；
 *   · 两种色：主题色提亮的一档 + 白，各自带 box-shadow 光晕。
 *
 * 为什么不用 canvas / rAF：纯 CSS 动画由合成器跑，切后台浏览器自动节流，
 * 不需要任何 JS 循环；深浅切换也只靠 CSS 选择器，不需要监听。
 * 显隐与样式见 css/glass.ts「星辉层」一节，只在 body[data-ds-dark-theme] 下出现。
 */

const LAYER_ID = 'dsh-bloom-sparkles'
const COUNT = 64

function rand(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function buildSparkles(doc: Document, seed = 7, count = COUNT): HTMLElement {
  const layer = doc.createElement('div')
  layer.id = LAYER_ID
  layer.className = 'dsh-bloom-sparkles'
  layer.setAttribute('aria-hidden', 'true')

  const r = rand(seed * 9973 + 17)
  for (let i = 0; i < count; i++) {
    // 起点贴着右上角（右侧 0–12%、顶部 -3–7%）
    const x = 88 + r() * 12
    const y = -3 + r() * 10
    // 方向：左 / 左下 / 下（以右为 0°、向下为正，95°–185°）
    const ang = (95 + r() * 90) * Math.PI / 180
    const k = r()
    const dist = 50 + k * k * 560
    const dx = Math.cos(ang) * dist
    const dy = Math.sin(ang) * dist * 0.75
    const big = r() < 0.15
    const size = big ? 1.8 + r() * 0.9 : 0.7 + r() * 1.0
    const peak = 0.35 + r() * 0.65
    const dur = 6 + r() * 7
    const tw = 1.1 + r() * 1.6
    const tint = r() < 0.55

    const dot = doc.createElement('i')
    if (tint) dot.className = 't'
    const st = dot.style
    st.left = `${x.toFixed(2)}%`
    st.top = `${y.toFixed(2)}%`
    st.width = `${size.toFixed(2)}px`
    st.height = `${size.toFixed(2)}px`
    st.setProperty('--dx', `${dx.toFixed(1)}px`)
    st.setProperty('--dy', `${dy.toFixed(1)}px`)
    st.setProperty('--peak', peak.toFixed(2))
    st.setProperty('--glow', `${(size * 2.4).toFixed(1)}px`)
    st.animationDuration = `${dur.toFixed(2)}s, ${tw.toFixed(2)}s`
    st.animationDelay = `${(-r() * dur).toFixed(2)}s, ${(-r() * tw).toFixed(2)}s`
    layer.appendChild(dot)
  }
  return layer
}

export function initStarlight(): void {
  if (typeof document === 'undefined' || !document.body) return
  if (document.getElementById(LAYER_ID)) return
  // 旧版 canvas 若因热更新残留，一并清掉
  document.getElementById('dsh-bloom-starlight')?.remove()
  document.body.prepend(buildSparkles(document))
}
