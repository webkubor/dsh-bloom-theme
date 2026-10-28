#!/usr/bin/env node
/**
 * version-sync-gate —— 发版时的「版本号 → 文档」同步门禁
 *
 * 🔴 本文件是真源，只在这里改。各仓的拷贝用同步脚本下发：
 *      node $CORTEXOS_ROOT/scripts/check-release-gate-sync.mjs --fix
 *
 * ## 为什么需要它
 *
 * prepublish-gate 保证 CHANGELOG 有当前版本段、README 首屏合规，但**没有一条门禁
 * 在发新版时把版本号同步进「记录当前版本」的文档**。于是出现最常见的老化：
 *   · 工作区台账 `vite-plugins/README.md` 版本列停在上个版本
 *   · 包自带的 SKILL.md frontmatter `version` 停在更早的版本（`cs skill validate` 会
 *     因此标红 —— 仓打 tag 时 SKILL.md version 必须同步，这是 SKILL_SPEC 的强同步规则）
 *
 * 这与 prepublish-gate 的出发点相同：**约定没做成门禁，就会烂。**
 *
 * ## 设计取舍
 *
 * 仓库文档里有两类「版本相关的数字」，语义完全不同，必须分开对待：
 *
 *   ① **台账版本列 + SKILL.md version** ——「这个插件当前是几版 / 这个 skill 是几版」，
 *      语义就是 package.json 的 version，随发版**必须**同步。→ 自动改写。
 *   ② **功能引入版本**（文档站里 `0.10.0+` / `0.14.0+` 这类标记）——「这个功能
 *      是哪个版本引入的」，语义是历史事实，**不随新版本变**。→ 绝不改写。
 *
 * ## 契约
 *   契约 A 台账同步 —— 若 `<pkgRoot>/../README.md`（工作区台账）里有一行以该包名开头、
 *       内嵌包名的表格行，则把该行尾部的版本号改写为 `package.json#version`。
 *       找不到包对应行 → 拦（该插件没登记进分类台账）。
 *   契约 B SKILL.md 同步 —— 若包根存在 `SKILL.md`，把其 frontmatter 的 `version:` 改写为
 *       `package.json#version`（版本号`## 如何同步 SKILL.md`）。缺 SKILL.md 时跳过（非必填）。
 *   契约 C 可重复 —— A/B 改写后立即重复（同样的 version）仍为幂等，不产生 diff。
 *
 * 逃生舱：VERSION_SYNC_OFF=1 全跳过；VERSION_SYNC_DRY_RUN=1 只报告不改写（用于首次接入审计）。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GATE_VERSION = 4
const NAME = 'version-sync-gate'
const here = dirname(fileURLToPath(import.meta.url))
// 目标包目录：可显式传参（多仓批处理/CI 用），默认取脚本所在目录的上一层（本脚本拷贝在 <pkg>/scripts/ 下）。
const targetArg = process.argv[2]
const pkgRoot = targetArg
  ? (targetArg.startsWith('/') || targetArg.startsWith('~') ? targetArg : join(process.cwd(), targetArg))
  : dirname(here)

const errors = []
const notes = []

if (String(process.env.VERSION_SYNC_OFF).toLowerCase() === '1' ||
    String(process.env.VERSION_SYNC_OFF).toLowerCase() === 'true') {
  console.log(`[${NAME}] ↩ VERSION_SYNC_OFF=1 —— 跳过所有检查`)
  process.exit(0)
}

const DRY_RUN = String(process.env.VERSION_SYNC_DRY_RUN).toLowerCase() === '1' ||
  String(process.env.VERSION_SYNC_DRY_RUN).toLowerCase() === 'true'

const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'))
const version = String(pkg.version ?? '')
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`[${NAME}] ✖ package.json version 不是合法 SemVer: ${version}`)
  process.exit(1)
}
const fileName = (pkg.name.split('/').pop() ?? '')
// 台账里包名可能以两种形式出现：去 scope 的目录名（`pkg/`）或完整 scope 名（`@scope/pkg`）。
const pkgNames = new Set([fileName, pkg.name])

// ── 契约 A：父目录台账版本列 ────────────────────────────────────────────────
const ledger = join(pkgRoot, '..', 'README.md')
if (existsSync(ledger)) {
  const raw = readFileSync(ledger, 'utf8')
  const lines = raw.split(/\r?\n/)
  // 定位含 `[<包名>` 的表格行。行首链接可能用去 scope 的目录名 `[pkg/`，也可能用完整 scope 名 `[@scope/pkg/`。
  const escFull = pkg.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const rowLead = new Set([fileName, pkg.name])
  const rowLeadAlt = [...rowLead].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\//g, '\\/')).join('|')
  const rowRe = new RegExp(`^\\|\\s*\\[\\s*[\`](?:${rowLeadAlt})\\/?[\`]?`, 'i')
  let idx = -1
  for (let i = 0; i < lines.length; i++) { if (rowRe.test(lines[i])) { idx = i; break } }
  if (idx < 0) {
    // 台账整体是不是「版本表格」？不是的话，契约 A 对这个仓**不适用** ——
    // 那种台账是组件清单（`- **\`pkg/\`**：说明」），本来就没有版本列可同步。
    // 2026-10-28 之前这里一律报「没登记 → 拦」，于是 museav-cli 这种仓一装这道门禁
    // 就永久 exit 1、发版直接卡死 —— 实际它压根没有需要同步的版本号
    // （无 SKILL.md、台账行不带版本）。
    // 「台账没有版本列」与「该仓漏登记进台账」是两回事，必须分开判。
    const tableRows = lines.filter(l => /^\|.*\|/.test(l.trim()) && l.trim().length > 2)
    if (tableRows.length === 0) {
      // 台账不是表格格式 → 契约 A 不适用，跳过（不算失败）
      console.log(`[${NAME}] · 台账 ${ledger} 不是版本表格格式（无表格行）—— 契约 A 不适用，跳过`)
    } else {
      errors.push(
        `台账 ${ledger} 里没有 ${pkg.name} 对应行（判据：以 | [\`${fileName}/` + '` 开头的表格行）。\n' +
        `  → 该插件未登记进分类台账，或台账是老式 markdown 列表而非表格。发版后台账仍会是空的/旧的，先补登记。`
      )
    }
  } else {
    const row = lines[idx]
    // 按表格单元拆分：| a | b | ... | → ["a","b",...]。单元内可能含 `code`、加粗、链接。
    // 版本号不总是最后一行 token —— dsh 台账在第 4 列版本后面还有「谁在用」列。
    // 判据：找到「剔除非字符后与包名一致」的那个单元，把它后面第一个纯 semver 单元当作版本列改写。
    const cells = row.split('|').slice(1, -1).map(c => c.trim())
    // 查找包名单元：该单元格以 Markdown 链接或裸名开头，且**不含 `]`**（链接单元格里 `](` 后是相对路径，
    // 若把整格剥到只剩屏显文本再判，会把 `](new/` 当成分隔 —— 所以这里只看单元格前缀是否命中包名）。
    const pkgNameEsc = (pkg.name.match(/[^/]+\/?$/) ?? [fileName])[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const nameRe = new RegExp(`^(?:${fileName}\\b|${pkgNameEsc}\\b|\\[\\s*[\`]?(?:${fileName}|${pkgNameEsc}))`, 'i')
    let pkgCol = -1
    for (let i = 0; i < cells.length; i++) {
      if (nameRe.test(cells[i])) { pkgCol = i; break }
    }
    if (pkgCol < 0) {
      errors.push(`台账行（第 ${idx + 1} 行）里没找到包名单元 ${pkg.name}: ${row}`)
    } else {
// 从包名后面找「纯 semver」单元格（版本列）。版本号后面可能还有其它列（如「谁在用」），
      // 也可能嵌在备注里（`0.14.0 起`/`1.5.3` 这种）——它必然带后续文字。
      let verCol = -1
      for (let i = pkgCol + 1; i < cells.length; i++) {
        const c = cells[i]
        // 剥掉反引号围栏后必须是纯 semver（`0.1.0` / 0.1.0 都认）；museav` 这类带尾注的忽略
        const verMatch = c.match(/^`?(\d+\.\d+\.\d+)`?$/)
        if (verMatch) { verCol = i; break }
        if (/^\d+\.\d+\.\d+/.test(c)) {
          // 带后续文字/括号 → 不是版本列
          const rest = c.replace(/^\d+\.\d+\.\d+/, '').trim()
          if (rest === '' || /^[-_!#?]/.test(rest)) { verCol = i; break }
        }
      }
      if (verCol < 0) {
        errors.push(`台账行（第 ${idx + 1} 行）里找不到版本列（${pkg.name} 包名后没有纯 semver 单元）: ${row}`)
      } else {
        const oldV = cells[verCol]
        // 按列改写而不是重组整行：cells 已经去了 trim 和围栏，重组会丢掉单元格内的反引号/链接。
        // 逐步定位到目标单元格，只替换其内部版本号。
        const segs = row.split('|')
        let cellIdx = 0
        for (let i = 1; i < segs.length - 1; i++) {
          // 跳过边框（空）段；行为与 cells 的切分一一对应
          if (i === 1 && segs[i].trim() === '') continue
          if (cellIdx === verCol) {
            segs[i] = segs[i].replace(/\d+\.\d+\.\d+/, version)
            break
          }
          cellIdx++
        }
        const newRow = segs.join('|')
        if (row !== newRow) {
          notes.push(`台账行版本 ${oldV} → ${version}`)
          if (!DRY_RUN) { lines[idx] = newRow; writeFileSync(ledger, lines.join('\n'), 'utf8') }
          else notes.push(`（DRY_RUN：台账第 ${idx + 1} 行未落盘）`)
        } else {
          notes.push(`台账行已是 ${version}，幂等无改动`)
        }
      }
    }
  }
} else {
  notes.push(`未发现父目录台账 ${ledger}（此包可能不在归类目录下）——跳过台账同步`)
}

// ── 契约 B：包内 SKILL.md frontmatter version ──────────────────────────────
// SKILL_SPEC 强同步规则：仓打 tag 时 SKILL.md version 必须等于包版本，否则 cs skill validate 标红。
const skillPath = join(pkgRoot, 'SKILL.md')
if (existsSync(skillPath)) {
  const skillText = readFileSync(skillPath, 'utf8')
  const fmRe = /^(\s*version\s*:\s*)[^\s]+(\s*)$/m
  if (fmRe.test(skillText)) {
    const newText = skillText.replace(fmRe, (_, pre, post) => pre + version + post)
    if (newText !== skillText) {
      const oldV = skillText.match(fmRe)?.[0].trim()
      notes.push(`SKILL.md frontmatter version ${oldV?.split(':').pop()?.trim()} → ${version}`)
      if (!DRY_RUN) writeFileSync(skillPath, newText, 'utf8')
      else notes.push(`（DRY_RUN：SKILL.md version 未落盘）`)
    } else {
      notes.push(`SKILL.md version 已是 ${version}，幂等无改动`)
    }
  } else {
    notes.push(`SKILL.md 没有 version 字段——SKILL_SPEC 要求必填，建议补充（本次不拦）`)
  }
} else {
  notes.push(`包根无 SKILL.md——跳过 SKILL version 同步（非必填）`)
}

// ── 报告 ──────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error(`\n[${NAME}] ${errors.length} 条契约不满足:\n`)
  for (const e of errors) console.error('  ✖', e)
  console.error(`\n[${NAME}] exit 1 → 发布中止。修完再推。`)
  process.exit(1)
}

console.log(`[${NAME}] ✓ ${pkg.name}@${version} 版本同步通过（gate v${GATE_VERSION}）`)
if (DRY_RUN) console.log(`[${NAME}]   · DRY_RUN 模式：只报告，未改写`)
for (const n of notes) console.log(`[${NAME}]   · ${n}`)