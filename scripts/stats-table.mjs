#!/usr/bin/env node
/**
 * 生成「可以直接贴出去」的真实数据片段：对比度表 + 下载量 + star 数。
 *
 * 为什么要有这个脚本：推广帖草稿里的数字曾经是**手写死**的 ——
 * 「344 downloads as of 2026-08-19」、只列 4 个变体的对比度表 —— 于是 8 变体上线后
 * 那份公开可见的草稿就一直在讲过时的事。数据能统计就不该手写。
 *
 * 三个来源都是真源，不自己重算：
 *   · 对比度  `contrast-guard --json`（它从 lib/client.js 里解析 OKLCH 实算）
 *     ⚠️ 绝不在这里自己实现 oklch→sRGB→WCAG。check.mjs 的注释早写过
 *        「两份算法各写一遍必然漂移」，本脚本第一版就犯了这个错：自己换算出
 *        mist light = 5.29，contrast-guard 是 5.28。差 0.01 无害，但两套算法
 *        本身就是隐患。
 *   · 下载量  api.npmjs.org/downloads/point/last-month
 *   · star    GitHub API（有 gh CLI 就用它，省 token 配置）
 *
 * 用法：
 *   npm run stats            打印 markdown 片段
 *   npm run stats -- --json  输出结构化数据
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const sh = (cmd) => {
  try { return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim() }
  catch { return null }
}
const wantJson = process.argv.includes('--json')

// ── 1. 对比度：一律取 contrast-guard 的输出 ────────────────────
const raw = sh('npx contrast-guard --json 2>/dev/null')
if (!raw) { console.error('✗ contrast-guard --json 跑不起来（先 npm install）'); process.exit(1) }
const cg = JSON.parse(raw.slice(raw.indexOf('{')))

const ZH = { mist: '雾蓝', cinnabar: '朱砂', petal: '花瓣', ripple: '涟漪',
             sage: '鼠尾草', stone: '暖石', lapis: '青金', amber: '琥珀' }
const rows = cg.results.map((r) => ({
  variant: r.group,
  mode: /浅色|light/i.test(r.pair) ? 'light' : 'dark',
  accent: r.fgHex,
  bg: r.bgHex,
  ratio: Math.round(r.ratio * 100) / 100,
  wcag: r.ratio >= 7 ? 'AAA' : r.ratio >= 4.5 ? 'AA' : 'FAIL',
}))
const ratios = rows.map((r) => r.ratio)
const summary = {
  pairs: cg.checked,
  failed: cg.failed,
  min: Math.min(...ratios),
  max: Math.max(...ratios),
  aaa: rows.filter((r) => r.wcag === 'AAA').length,
}

// ── 2. 下载量与 star ───────────────────────────────────────────
const dl = sh(`curl -sf -m 8 "https://api.npmjs.org/downloads/point/last-month/${pkg.name}"`)
const downloads = dl ? JSON.parse(dl).downloads : null
const repo = (pkg.repository?.url || '').replace(/^git\+/, '').replace(/\.git$/, '').replace('https://github.com/', '')
const stars = repo ? sh(`gh api repos/${repo} --jq .stargazers_count 2>/dev/null`) : null
const today = sh('date +%Y-%m-%d')

if (wantJson) {
  console.log(JSON.stringify({ version: pkg.version, downloads, stars: stars ? +stars : null, date: today, summary, rows }, null, 2))
  process.exit(0)
}

// ── 3. markdown 片段 ──────────────────────────────────────────
console.log(`<!-- 由 npm run stats 生成于 ${today} · v${pkg.version} · 勿手改数字 -->\n`)
console.log(`| Variant | Mode | Accent | Background | Ratio | WCAG |`)
console.log(`|---|---|---|---|---:|---|`)
for (const r of rows) {
  const name = `\`${r.variant}\`${ZH[r.variant] ? ` (${ZH[r.variant]})` : ''}`
  console.log(`| ${name} | ${r.mode} | \`${r.accent}\` | \`${r.bg}\` | **${r.ratio.toFixed(2)}:1** | ${r.wcag === 'AAA' ? '**AAA**' : r.wcag} |`)
}
console.log(`\n${summary.pairs} 组「主色 + 底色」全部实测：最低 **${summary.min.toFixed(2)}:1**、最高 **${summary.max.toFixed(2)}:1**，`
  + `其中 ${summary.aaa} 组达 AAA，不达标 ${summary.failed} 组。`)
console.log(`\n数据来源（都可复现，不是手写）：`)
console.log(`- 对比度：\`npx contrast-guard --json\` —— 从 \`lib/client.js\` 解析 OKLCH 实算，改了配色数字就会跟着变`)
if (downloads !== null) console.log(`- 下载量：近 30 天 **${downloads.toLocaleString('en-US')}** 次（api.npmjs.org，${today}）`)
if (stars) console.log(`- Star：**${stars}**（GitHub API，${today}）`)
console.log(`- 版本：**v${pkg.version}**`)
