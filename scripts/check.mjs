#!/usr/bin/env node
/**
 * 发布前自检 —— 三件事，全部是真会出问题的地方，不是摆设：
 *
 *   1. 打包契约：dsh.bundle / cordis.patch.yml / files 白名单
 *      awesome-dsh-plugin 明写「最常见的被拒原因是只声明 dsh.client」，
 *      而漏了 files 白名单会让装上的包缺 patch 文件。
 *   2. 配色无障碍：8 组「主色 + 底色」的 WCAG 对比度必须 ≥ 4.5:1
 *      petal / ripple 的亮色主色曾是 3.55:1 / 3.02:1，改色值极易再次破线。
 *   3. 前景色 token 反模式：inline-code 之类的背景色变量不得写成裸色值
 *      暗色下前景近白，当背景用会得到 1.2:1 的白底白字。
 *
 * 用法：npm run check（CI 与本地同一份）
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(resolve(root, p), 'utf8')

let failed = 0
const ok = (m) => console.log(`  [32m✓[0m ${m}`)
const bad = (m) => { failed++; console.log(`  [31m✗[0m ${m}`) }

// ── 1. 打包契约 ────────────────────────────────────────────────
console.log('\n打包契约')
const pkg = JSON.parse(read('package.json'))

pkg.dsh?.bundle?.patch
  ? ok(`dsh.bundle.patch = ${pkg.dsh.bundle.patch}`)
  : bad('缺 dsh.bundle.patch —— 装上也进不了 boot graph，且不符合 awesome 收录门槛')

try {
  const patch = read('cordis.patch.yml')
  patch.includes(pkg.name)
    ? ok(`cordis.patch.yml 引用的包名与 package.json 一致（${pkg.name}）`)
    : bad(`cordis.patch.yml 里的包名与 package.json 不一致，应为 ${pkg.name}`)
} catch {
  bad('cordis.patch.yml 不存在')
}

for (const f of ['cordis.patch.yml', 'lib']) {
  pkg.files?.includes(f)
    ? ok(`files 白名单含 ${f}`)
    : bad(`files 白名单漏了 ${f} —— 发布出去会缺文件`)
}

pkg.publishConfig?.access === 'public'
  ? ok('publishConfig.access = public')
  : bad('scoped 包缺 publishConfig.access=public，发布会失败')

// 包名与 client.js 里的 PLUGIN_ID 必须一致，否则 loader 注册对不上
const client = read('lib/client.js')
const idMatch = client.match(/const PLUGIN_ID = '([^']+)'/)
idMatch?.[1] === pkg.name
  ? ok(`PLUGIN_ID 与包名一致（${pkg.name}）`)
  : bad(`PLUGIN_ID (${idMatch?.[1]}) 与包名 (${pkg.name}) 不一致 —— DSH 会报 "loaded without registering"`)

// ── 2. 配色无障碍 ──────────────────────────────────────────────
console.log('\n配色对比度（WCAG AA ≥ 4.5:1）')

const oklch2rgb = (L, C, H) => {
  const h = (H * Math.PI) / 180
  const a = C * Math.cos(h), b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const [l, m, s] = [l_ ** 3, m_ ** 3, s_ ** 3]
  const enc = (x) => {
    x = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055
    return Math.min(1, Math.max(0, x))
  }
  return [
    enc(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    enc(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    enc(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}
const lum = (rgb) => {
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2])
}
const ratio = (c1, c2) => {
  const [a, b] = [lum(c1), lum(c2)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}
const parse = (s) => {
  const m = s.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!m) throw new Error('无法解析 oklch: ' + s)
  return oklch2rgb(parseFloat(m[1]) / 100, parseFloat(m[2]), parseFloat(m[3]))
}

// 从 client.js 的 PALETTE 直接取值，避免测试与实现各写一份而漂移
const paletteSrc = client.slice(client.indexOf('const PALETTE = {'), client.indexOf('const VARIANT_LABELS'))
const variants = [...paletteSrc.matchAll(/^\s{2}(\w+):\s*\{([\s\S]*?)^\s{2}\},/gm)]
if (variants.length !== 4) bad(`PALETTE 解析到 ${variants.length} 个变体，预期 4 个`)

for (const [, name, body] of variants) {
  const get = (k) => body.match(new RegExp(k + `:\\s*'([^']+)'`))?.[1]
  for (const [mode, accentKey, bgKey] of [['亮', 'accentL', 'bgL'], ['暗', 'accentD', 'bgD']]) {
    const a = get(accentKey), bg = get(bgKey)
    if (!a || !bg) { bad(`${name} 缺 ${accentKey}/${bgKey}`); continue }
    const r = ratio(parse(a), parse(bg))
    r >= 4.5
      ? ok(`${name.padEnd(9)} ${mode}色 ${r.toFixed(2)}:1`)
      : bad(`${name} ${mode}色仅 ${r.toFixed(2)}:1，低于 AA 门槛 4.5:1`)
  }
}

// ── 3. 前景色 token 反模式 ─────────────────────────────────────
console.log('\n前景色 token 反模式')

// inline-code 是背景色变量：给裸 oklch 值几乎必然是按文字色给的，暗色下会翻车
const inlineCode = [...client.matchAll(/--dsw-alias-markdown-inline-code:\s*([^;]+);/g)].map((m) => m[1].trim())
const badInline = inlineCode.filter((v) => /^oklch\(/.test(v))
badInline.length === 0
  ? ok(`markdown-inline-code 全部走变量（${inlineCode.length} 处）`)
  : bad(`markdown-inline-code 有 ${badInline.length} 处写成裸色值：${badInline.join(', ')} —— 它是背景色，按文字色给值会得到极低对比度`)

// 暗色阴影必须是纯黑，不能用前景色 mix
const darkShadow = client.match(/--bloom-shadow:[^;]*\$\{dark \? '([^']+)'/)
darkShadow?.[1]?.includes('rgba(0,0,0')
  ? ok('暗色阴影使用纯黑')
  : bad('暗色阴影未使用纯黑 —— 用前景色 mix 会渲染成白雾')

// ── 结果 ───────────────────────────────────────────────────────
console.log()
if (failed) {
  console.log(`[31m${failed} 项未通过[0m\n`)
  process.exit(1)
}
console.log('[32m全部通过[0m\n')
