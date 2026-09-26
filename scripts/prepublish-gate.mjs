#!/usr/bin/env node
/**
 * prepublish-gate —— 发版前的机械门禁（四条契约）
 *
 * 🔴 这个文件是**拷贝**，真源在 CortexOS：
 *      CortexOS/scripts/release-gate/prepublish-gate.mjs
 *    同步检查：`node $CORTEXOS_ROOT/scripts/check-release-gate-sync.mjs`
 *    改逻辑请改真源，然后跑同步脚本把各仓拷一遍 —— 不要在各仓就地改。
 *
 * 为什么是门禁而不是文档：2026-09-26 一天里给 dsh-llm-hub 发了 1.5.0/1.5.1/1.5.2/1.5.3
 * 四个版本号，用户可感知的变化只有 1.5.0 一个；同一轮还漏了 bloom-theme 的 assets
 * （README 引用 11 个相对路径截图、tarball 里 0 个 → npm 页面上全是坏图；那 11 张合计
 * 10MB，正确修法是换成图床直链而不是把 10MB 塞进每个安装包）。共同点是
 * 「约定没做成门禁」，所以把判据做成能跑的：
 *
 *   契约 1 产物完整性 —— package.json 必须在；`files` 里每个字面量条目至少命中一个文件；
 *                       main / types / exports / dsh 引用的相对路径文件必须存在。
 *   契约 2 图片引用   —— README 里以**相对路径**引用的 assets/* 必须在 tarball 里。
 *                       否则 npm 页面上是坏图（bloom-theme 就是这么坏的）。
 *                       只认 `](assets/…)` 与 `src="assets/…"`，不认 URL 里的 assets/
 *                       （raw.githubusercontent 那种在 npm 上照样能显示，不算坏图）。
 *   契约 3 CHANGELOG  —— 存在 CHANGELOG.md 时，必含 `## [<当前 version>]` 段。
 *   契约 4 发版语义   —— 运行期载荷必须与上一个已发布版本**不同**。
 *                       见 docs/rules/release-semantics.md；ALLOW_METADATA_ONLY=1 是逃生舱。
 *
 * 任一条挂了 → exit 1 + stderr 指明错在哪、怎么修。
 */
import { readFileSync, mkdtempSync, rmSync, readdirSync, statSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { createHash } from 'node:crypto'

const GATE_VERSION = 1

const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = dirname(here)

const pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'))
const version = pkg.version
const errors = []

// ── 0. 打包清单 ────────────────────────────────────────────────────────────
let packFiles
try {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: pkgRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']
  })
  packFiles = JSON.parse(out)[0].files.map(f => f.path)
} catch (err) {
  console.error('[prepublish-gate] npm pack --dry-run 失败:', err.message)
  process.exit(2)
}
const inPack = (p) => packFiles.includes(p)

// ── 1. 产物完整性 ──────────────────────────────────────────────────────────
if (!inPack('package.json')) errors.push('tarball 里没有 package.json')

// files[] 里的字面量条目（不含 glob）必须命中至少一个文件
for (const entry of pkg.files ?? []) {
  if (/[*?[\]{}!]/.test(entry)) continue            // glob 跳过
  const e = entry.replace(/\/$/, '')
  const hit = packFiles.some(f => f === e || f.startsWith(e + '/'))
  if (!hit) {
    errors.push(`package.json#files 声明了 '${entry}'，但 tarball 里一个文件都没有\n  → 条目过期或文件被删/被 ignore`)
  }
}

// main / types / module / bin / exports / dsh.bundle 引用的路径必须在 tarball 里。
// 只走这几个字段，因为 package.json 里别的字符串不是路径 —— 典型陷阱：
// `dsh.client.platform: "web"` 和 `dsh.client.inject: ["@deepseek-ai/..."]`
// 一旦被当成路径就会误报。
const entryPaths = new Set()
const addPath = (v) => {
  if (typeof v !== 'string' || v === '') return
  if (/^[a-z][a-z0-9+.-]*:/i.test(v) || v.startsWith('/')) return   // URL / 绝对路径
  entryPaths.add(v.replace(/^\.\//, ''))
}
const walkStrings = (v) => {
  if (typeof v === 'string') addPath(v)
  else if (v && typeof v === 'object') for (const x of Object.values(v)) walkStrings(x)
}
for (const field of ['main', 'types', 'module', 'bin', 'exports']) walkStrings(pkg[field])
if (pkg.dsh && typeof pkg.dsh === 'object') walkStrings(pkg.dsh.bundle)

for (const p of entryPaths) {
  if (!inPack(p)) {
    errors.push(`package.json 的入口字段引用了 '${p}'，但 tarball 里没有\n  → 装包的人会在 require/import 时直接失败`)
  }
}

// ── 2. README 里相对引用的 assets/* 必须在 tarball 里 ──────────────────────
const readmes = ['README.md', 'README.en.md', 'README.zh.md', 'README.zh-CN.md']
  .filter(f => existsSync(join(pkgRoot, f)))

const referencedAssets = new Set()
for (const f of readmes) {
  const text = readFileSync(join(pkgRoot, f), 'utf8')
  // 只认相对引用：](assets/x) 与 src="assets/x"。URL 里的 assets/ 不算。
  for (const m of text.matchAll(/\]\((assets\/[^)\s]+)\)/g)) referencedAssets.add(m[1])
  for (const m of text.matchAll(/src=["'](assets\/[^"']+)["']/g)) referencedAssets.add(m[1])
}

const missingAssets = [...referencedAssets].filter(a => existsSync(join(pkgRoot, a)) && !inPack(a))
if (missingAssets.length > 0) {
  errors.push(
    `README 引用了 ${missingAssets.length} 个 assets 文件，但 tarball 里没有 —— npm 页面上会是坏图:\n` +
    missingAssets.slice(0, 5).map(a => `    · ${a}`).join('\n') +
    (missingAssets.length > 5 ? `\n    …（共 ${missingAssets.length} 个）` : '') +
    `\n  → 二选一：(a) 把 'assets' 加进 package.json 的 'files'（图小就用这个）；` +
    `\n                (b) 把 README 改成图床绝对 URL 并确认真能打开（图大就用这个，别把十几 MB 塞进每个安装包）`
  )
}

// ── 3. CHANGELOG 必须有当前版本段 ──────────────────────────────────────────
// 标题写法各仓不一（`## [1.5.3]` / `## 3.7.0 (2026-09-16)` /
// `## [0.14.0](compare-link) (2026-09-25)` / `## v0.14.0`），
// 只认「二级标题 + 版本号本身」，不强制 keep-a-changelog 的方括号。
// 版本号后用负向前瞻收尾，避免 0.14.0 命中 0.14.01 这种前缀。
const changelogPath = join(pkgRoot, 'CHANGELOG.md')
if (existsSync(changelogPath)) {
  const text = readFileSync(changelogPath, 'utf8')
  const esc = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const heading = new RegExp(`^##\\s*\\[?v?${esc}(?![\\d.])`, 'm')
  if (!heading.test(text)) {
    errors.push(
      `CHANGELOG.md 缺少当前版本（${version}）的二级标题段\n` +
      `  → 发版正文（GitHub Release / npm 页）直接取这一段；缺了会出现「npm 上了 / Release 没建」的漂移`
    )
  }
}

// ── 4. 发版语义：运行期载荷必须与上一已发布版本不同 ────────────────────────
//
// 「运行期载荷」= tarball 里**除了文档/元数据/开发工具之外**的每一个文件，
// 外加 package.json 的运行期字段。判据要能机械执行 —— 不用「CHANGELOG 里有没有
// feat/fix 关键字」这种启发式（自省段落里出现一个「修」字就会误放行）。
//
// 详见 docs/rules/release-semantics.md。
const EXCLUDE = [
  /^readme(\.[^/]*)?$/i,
  /^changelog(\.[^/]*)?$/i,
  /^(license|notice|contributing)(\.[^/]*)?$/i,
  /^docs\//i,
  /^assets\//i,
  /^scripts\//i,
  /^\.github\//i,
  /^\.githooks\//i,
  /^tsconfig[^/]*\.json$/i,
  /^(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/i,
  /^(screenshots\.json|llms\.txt|dev_notes[^/]*)$/i,
  /^(\.npmignore|\.gitignore|\.gitattributes)$/i
]
const isRuntime = (p) => !EXCLUDE.some(re => re.test(p))

const RUNTIME_PKG_FIELDS = [
  'name', 'type', 'main', 'module', 'types', 'exports', 'bin', 'dsh', 'files',
  'dependencies', 'peerDependencies', 'optionalDependencies', 'engines'
]

/** 运行期载荷指纹: 排序后的 "路径:哈希" 列表。 */
function runtimeFingerprint(root, list) {
  const entries = []
  for (const rel of list) {
    if (!isRuntime(rel)) continue
    if (rel === 'package.json') continue
    try {
      entries.push([rel, createHash('sha256').update(readFileSync(join(root, rel))).digest('hex')])
    } catch { /* 目录项或读不到，跳过 */ }
  }
  try {
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    const runtimePkg = {}
    for (const f of RUNTIME_PKG_FIELDS) {
      if (manifest[f] !== undefined) runtimePkg[f] = manifest[f]
    }
    entries.push(['package.json(运行期字段)', createHash('sha256').update(JSON.stringify(runtimePkg)).digest('hex')])
  } catch { /* 读不到是别处的问题 */ }
  return entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
}

if (process.env.ALLOW_METADATA_ONLY === '1') {
  console.warn('[prepublish-gate] ⚠️  ALLOW_METADATA_ONLY=1 —— 跳过契约 4（纯文档/元数据版本）')
} else {
  try {
    const raw = execFileSync('npm', ['view', pkg.name, 'versions', '--json'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
    })
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : [parsed]
    const previous = list.filter(v => v !== version).pop()

    if (previous === undefined) {
      console.log(`[prepublish-gate]   · 契约 4: ${pkg.name} 尚无更早版本, 跳过载荷比对`)
    } else {
      const tarballUrl = execFileSync('npm', ['view', `${pkg.name}@${previous}`, 'dist.tarball'], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
      }).trim()
      const stage = mkdtempSync(join(tmpdir(), 'prepublish-gate-'))
      try {
        const tgz = join(stage, 'prev.tgz')
        const res = await fetch(tarballUrl)
        if (!res.ok) throw new Error(`下载 ${previous} tarball 失败: HTTP ${res.status}`)
        const { writeFileSync } = await import('node:fs')
        writeFileSync(tgz, Buffer.from(await res.arrayBuffer()))
        execFileSync('tar', ['-xzf', tgz, '-C', stage], { stdio: 'ignore' })
        const prevRoot = join(stage, 'package')

        const before = runtimeFingerprint(prevRoot, collectAllFiles(prevRoot))
        const after = runtimeFingerprint(pkgRoot, packFiles)
        if (JSON.stringify(before) === JSON.stringify(after)) {
          errors.push(
            `运行期载荷与上一个已发布版本 ${previous} **完全相同** —— 这个 semver 号没有承载任何用户可感知的变化\n` +
            `  → 本次只动了: ${packFiles.filter(p => !isRuntime(p)).slice(0, 6).join(', ') || '(仅 package.json 非运行期字段)'}\n` +
            `  → semver 是对用户的契约: 流程修补 / 元数据修正 / 自省笔记不该占版本号（docs/rules/release-semantics.md）。\n` +
            `     确实要发纯文档版时显式设 ALLOW_METADATA_ONLY=1`
          )
        } else {
          console.log(`[prepublish-gate]   · 契约 4: 运行期载荷相对 ${previous} 有变化（${before.length} 项比对）`)
        }
      } finally {
        rmSync(stage, { recursive: true, force: true })
      }
    }
  } catch (err) {
    // 网络/registry 不可用时不阻断发版：门禁不该因为一次查询失败就卡住真实发布。
    console.warn(`[prepublish-gate] ⚠️  契约 4 未能执行（不阻断）: ${err.message}`)
  }
}

/** 递归收集目录下所有文件（相对路径），用于对上一版本解包目录做指纹。 */
function collectAllFiles(root) {
  const out = []
  const walk = (rel) => {
    const abs = rel ? join(root, rel) : root
    let st
    try { st = statSync(abs) } catch { return }
    if (st.isDirectory()) {
      for (const e of readdirSync(abs)) walk(rel ? join(rel, e) : e)
    } else {
      out.push(rel)
    }
  }
  walk('')
  return out
}

// ── 报告 ──────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error(`\n[prepublish-gate] ${errors.length} 条契约不满足, 拒绝发版:\n`)
  for (const e of errors) {
    console.error('  ✖', e)
    console.error('')
  }
  console.error('[prepublish-gate] exit 1 → npm publish 已中止。修完再推。')
  process.exit(1)
}

console.log(`[prepublish-gate] ✓ ${pkg.name}@${version} 四条契约通过（gate v${GATE_VERSION}）`)
console.log(`[prepublish-gate]   · tarball ${packFiles.length} 个文件；运行期载荷 ${packFiles.filter(isRuntime).length} 个`)
if (referencedAssets.size > 0) console.log(`[prepublish-gate]   · README 引用的 ${referencedAssets.size} 个 assets 均在包内`)
console.log(`[prepublish-gate]   · CHANGELOG 含当前版本段`)
