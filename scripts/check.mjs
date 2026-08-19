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
// 已交给 contrast-guard（npm run check:contrast / CI 单独一步）。
// 它按 4 个变体逐组检查 8 组「主色+底色」，不达标时直接反推出该改成多少。
// 此处不再重复实现 —— 两份算法各写一遍必然漂移。

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
