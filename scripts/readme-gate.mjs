#!/usr/bin/env node
/**
 * readme-gate —— 开源包装的首屏门禁
 *
 * 🔴 这个文件是**拷贝**，真源在 CortexOS：
 *      CortexOS/scripts/release-gate/readme-gate.mjs
 *    同步检查：node $CORTEXOS_ROOT/scripts/check-release-gate-sync.mjs
 *    改逻辑请改真源，然后跑同步脚本把各仓拷一遍 —— 不要在各仓就地改。
 *
 * 为什么是门禁而不是文档：cs rule open_source_project_baseline 早就写明了
 * README 首屏金字塔（居中品牌 → for-the-badge → Why This 对比表 → 30 秒上手），
 * 但 2026-09-27 一查四个插件，规则说的和仓库里躺的完全是两回事：
 *
 *     · 徽章：四个仓全用 style=flat-square（8/10/8/7 个），规则要求 for-the-badge
 *     · 居中标题：bloom-theme / llm-hub 用 <p align="center"> 而非 <h1 align="center">
 *     · Why This 对比表：dsh-user-mirror 缺
 *     · 英文 README：dsh-env-inspector 缺
 *
 * 共同点还是那句「约定没做成门禁」。所以把判据做成能跑的：
 *
 *   契约 1 居中品牌   —— 存在 <h1 align="center"> 开头且带 emoji/品牌名的标题
 *   契约 2 徽章规格   —— 至少 1 个 for-the-badge；且不得残留 flat-square
 *   契约 3 对比矩阵   —— 首屏（前 80 行）内有 Why This 对比表（Markdown 表格）
 *   契约 4 双语       —— 存在 README.en.md（生态面向全球，英文是默认入场券）
 *
 * 逃生舱：README_GATE=off 跳过全部检查（仅限明确不需要包装的内部包）。
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GATE_VERSION = 1

const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = dirname(here)

const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'))
const errors = []
const notes = []

if (String(process.env.README_GATE).toLowerCase() === 'off') {
  console.log('[readme-gate] ↩ README_GATE=off —— 跳过首屏包装检查')
  process.exit(0)
}

const readmePath = join(pkgRoot, 'README.md')
if (!existsSync(readmePath)) {
  console.error('[readme-gate] ✖ 找不到 README.md —— 一个没有 README 的包不可能被人用起来')
  process.exit(1)
}
const readme = readFileSync(readmePath, 'utf8')
const lines = readme.split(/\r?\n/)

// ── 1. 居中品牌标题 ────────────────────────────────────────────────────────
// 接受 <h1 align="center">…</h1>；<p align="center"><h1> 也算（有些仓这么写）。
const h1Centered =
  /<h1[^>]*align=["']center["'][^>]*>/i.test(readme) ||
  /<p[^>]*align=["']center["'][^>]*>\s*<h1/i.test(readme)

if (!h1Centered) {
  errors.push(
    'README 缺少居中的 <h1 align="center"> 标题\n' +
    '  → 首屏第一眼必须是品牌：<h1 align="center">🔐 项目名</h1>，紧跟一句居中 slogan'
  )
} else {
  // 标题里带 emoji 或品牌名才像样，光 <h1 align="center"></h1> 是空的
  const m = readme.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (m && m[1].replace(/<[^>]+>/g, '').trim().length < 2) {
    errors.push('README 的居中标题是空的 —— 补上 emoji + 项目名')
  }
}

// ── 2. 徽章规格：for-the-badge，且不残留 flat-square ───────────────────────
const badgeCount = (readme.match(/for-the-badge/g) ?? []).length
const flatSquare = (readme.match(/flat-square/g) ?? []).length

if (badgeCount === 0) {
  errors.push(
    'README 没有任何 style=for-the-badge 徽章\n' +
    '  → 规则要求立体大徽章（style=for-the-badge），版本/许可证/DSH 版本/Build 这几个是基本盘'
  )
}
if (flatSquare > 0) {
  errors.push(
    'README 里有 ' + flatSquare + ' 个 style=flat-square 徽章\n' +
    '  → 统一换成 style=for-the-badge（把 URL 里的 flat-square 直接替换即可），' +
    '否则首屏是细长方块，视觉重量撑不起品牌'
  )
}

// ── 3. Why This 对比矩阵必须在首屏 ─────────────────────────────────────────
// 「首屏」= 前 80 行。表格判定：连续的 | ... | 行，至少 3 行（表头+分隔+1 行数据）。
const HEAD_LINES = 80
const head = lines.slice(0, HEAD_LINES).join('\n')
const tableBlocks = []
let run = 0
for (const l of lines.slice(0, HEAD_LINES)) {
  if (/^\s*\|.*\|\s*$/.test(l)) { run++; if (run === 3) tableBlocks.push(1) }
  else run = 0
}
const hasWhyTable = tableBlocks.length > 0

if (!hasWhyTable) {
  errors.push(
    'README 首屏（前 ' + HEAD_LINES + ' 行）没有对比表格\n' +
    '  → Why This Table 是转化率的关键：用 ✅ / ❌ 说明「为什么用你这个而不是别的」。' +
    '同类方案、原生能力、手动配置都值得列成列'
  )
}

// ── 4. 英文 README ─────────────────────────────────────────────────────────
const hasEn = ['README.en.md', 'README.en-US.md', 'README.en_US.md']
  .some((f) => existsSync(join(pkgRoot, f)))

if (!hasEn) {
  errors.push(
    '缺少英文 README（README.en.md）\n' +
    '  → dsh-plugin 生态面向全球，英文是默认入场券；中文 README 首行加上 [English](README.en.md) | 中文'
  )
}

// ── 额外提示（不拦，但值得知道）───────────────────────────────────────────
const shotCount = ['assets']
  .flatMap((d) => {
    const p = join(pkgRoot, d)
    if (!existsSync(p)) return []
    return readdirSync(p).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
  }).length
if (shotCount === 0) {
  notes.push('assets/ 里没有截图 —— 插件页没图等于没人点，建议至少 1 张真实界面截图')
}

// ── 汇总 ───────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error('[readme-gate] ✖ README 首屏不合规（gate v' + GATE_VERSION + '）：')
  for (const e of errors) console.error('  · ' + e)
  console.error('\n  真源：cs rule open_source_project_baseline（README 金字塔标准）')
  console.error('  逃生舱：README_GATE=off（仅限内部包）')
  process.exit(1)
}

console.log('[readme-gate] ✓ README 首屏四条契约通过（gate v' + GATE_VERSION + '）')
console.log('  · for-the-badge 徽章 ' + badgeCount + ' 个；首屏对比表 ' + tableBlocks.length + ' 个；英文版 ✓')
for (const n of notes) console.log('  · 提示：' + n)
