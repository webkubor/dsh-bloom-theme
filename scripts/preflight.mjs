#!/usr/bin/env node
/**
 * 发版前检查（preflight）—— `npm run check` 之外的那一层。
 *
 * 两者分工：
 *   npm run check      纯静态、无副作用、无网络 —— 挂在 pre-commit 和 CI 上，每次提交都跑
 *   npm run preflight  要读 git 状态、要连网 —— 发版前手动跑一次
 *
 * 为什么需要它：这个仓库出过的事故里，有一整类是 check 照不到的 ——
 *   · 版本四头分裂（npm 0.6.0 / git 0.6.1 / 工作区 0.6.2 / PR 想发 0.7.0）
 *   · `v0.6.0` tag 指向 0.4.0 的 commit，Publish workflow 因此挂了
 *   · 已合并的僵尸分支堆在远端，分不清哪些还在开发
 *   · awesome-dsh-plugin 的收录条目还写着「four variants」，而我们早就 8 个了；
 *     截图一张都没注册，市场详情页只能从 README 瞎抽
 * 这些都得对照**外部真源**（npm registry / git remote / awesome list）才能发现。
 *
 * 用法：npm run preflight        无网络时自动跳过联网项并标注
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(resolve(root, p), 'utf8')
const sh = (cmd) => {
  try { return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim() }
  catch { return null }
}

let failed = 0, skipped = 0, n = 0
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', X = '\x1b[0m'
const head = (t) => console.log(`\n${++n}. ${t}`)
const ok = (m) => console.log(`   ${G}✓${X} ${m}`)
const bad = (m) => { failed++; console.log(`   ${R}✗${X} ${m}`) }
const skip = (m) => { skipped++; console.log(`   ${Y}—${X} ${D}${m}${X}`) }

const pkg = JSON.parse(read('package.json'))
const online = sh('curl -sf -m 5 -o /dev/null -w "%{http_code}" https://registry.npmjs.org') === '200'

// ── 1. 版本真源：本地三处 + npm + git tag 五方一致 ───────────────
head('版本真源（本地三处 + npm + tag）')
{
  const manifest = JSON.parse(read('.release-please-manifest.json'))['.']
  const srcFiles = []
  const walk = (d) => { for (const e of readdirSync(resolve(root, d), { withFileTypes: true })) {
    const rel = `${d}/${e.name}`
    if (e.isDirectory()) walk(rel); else if (e.name.endsWith('.ts')) srcFiles.push(rel) } }
  walk('src')
  const pv = srcFiles.map((f) => read(f).match(/const PLUGIN_VERSION = '([^']+)'/)?.[1]).filter(Boolean)

  const local = new Set([pkg.version, manifest, ...pv])
  local.size === 1
    ? ok(`本地三处一致：${pkg.version}（package.json / manifest / PLUGIN_VERSION）`)
    : bad(`本地版本不一致：package.json=${pkg.version} manifest=${manifest} PLUGIN_VERSION=${pv.join(',')}`)

  if (online) {
    const npmVer = sh(`npm view ${pkg.name} version 2>/dev/null`)
    npmVer === pkg.version
      ? ok(`npm 上是 ${npmVer}，与本地一致`)
      : console.log(`   ${Y}—${X} ${D}npm 上是 ${npmVer}，本地 ${pkg.version}（未发布的改动，release PR 合并后会对齐）${X}`)
  } else skip('离线，跳过 npm 版本核对')

  // tag 必须指向 package.json 里写着同一版本号的 commit —— v0.6.0 曾指向 0.4.0 的 commit，
  // 导致 Publish workflow 的一致性校验失败、包只能手工发
  const tag = `v${pkg.version}`
  if (sh(`git rev-parse -q --verify refs/tags/${tag}`)) {
    const tagged = sh(`git show ${tag}:package.json`)
    const tv = tagged && JSON.parse(tagged).version
    tv === pkg.version
      ? ok(`tag ${tag} 指向的 commit 里 version 也是 ${tv}`)
      : bad(`tag ${tag} 指向的 commit version 是 ${tv} —— tag 打错了 commit（Publish 会因此失败）`)
  } else skip(`tag ${tag} 还不存在（release PR 合并后由 release-please 打）`)
}

// ── 2. git 状态：分支 / 同步 / 僵尸分支 ─────────────────────────
head('git 状态（分支 / 与远端同步 / 僵尸分支）')
{
  const branch = sh('git rev-parse --abbrev-ref HEAD')
  branch === 'main' ? ok('当前在 main') : bad(`当前在 ${branch} —— 本项目发版只从 main 走`)

  const dirty = sh('git status --porcelain')
  dirty ? bad(`工作区有未提交改动（${dirty.split('\n').length} 个文件）`) : ok('工作区干净')

  if (online) {
    sh('git fetch -q origin')
    const ahead = sh('git rev-list --count origin/main..HEAD')
    const behind = sh('git rev-list --count HEAD..origin/main')
    ahead === '0' && behind === '0'
      ? ok('与 origin/main 同步')
      : bad(`与 origin/main 不同步：本地领先 ${ahead}、落后 ${behind}`)
  } else skip('离线，跳过远端同步核对')

  // 已并入 main 却还留着的分支 —— 全局规则要求合并后立即删
  const merged = (sh('git branch --merged origin/main') || '')
    .split('\n').map((s) => s.replace(/^[*+]?\s*/, '').trim())
    .filter((b) => b && b !== 'main')
  merged.length === 0
    ? ok('无已合并的僵尸分支')
    : bad(`这些分支已并入 main 但还没删：${merged.join(', ')}`)

  const worktrees = (sh('git worktree list') || '').split('\n').filter((l) => l && !l.includes('[main]'))
  worktrees.length === 0 ? ok('无残留 worktree') : bad(`残留 worktree：${worktrees.length} 个`)
}

// ── 3. 展示资源完整性 ───────────────────────────────────────────
head('展示资源（截图齐全 + README 引用不断链）')
{
  const VARIANTS = ['mist', 'cinnabar', 'petal', 'ripple', 'sage', 'stone', 'lapis', 'amber']
  const shots = existsSync(resolve(root, 'assets/screenshots')) ? readdirSync(resolve(root, 'assets/screenshots')) : []
  const missing = []
  for (const v of VARIANTS) for (const m of ['light', 'dark']) {
    if (!shots.includes(`ui-${v}-${m}.png`)) missing.push(`ui-${v}-${m}.png`)
  }
  missing.length === 0
    ? ok(`8 变体 × 明暗 = 16 张截图齐全（另有 ${shots.length - 16} 张辅助图）`)
    : bad(`缺少截图：${missing.join(', ')}`)

  // README 里引用的本地图必须都存在
  const readmes = ['README.md', 'README.en.md'].filter((f) => existsSync(resolve(root, f)))
  const dead = []
  for (const f of readmes) {
    for (const m of read(f).matchAll(/src="(assets\/[^"]+)"/g)) {
      if (!existsSync(resolve(root, m[1]))) dead.push(`${f} → ${m[1]}`)
    }
  }
  dead.length === 0 ? ok(`README 引用的本地图片均存在（${readmes.join(' / ')}）`) : bad(`断链：${dead.join(', ')}`)
}

// ── 4. awesome-dsh-plugin 收录信息是否还准 ─────────────────────
head('awesome-dsh-plugin 收录同步')
{
  const ENTRY = 'https://raw.githubusercontent.com/awesome-dsh-plugin/awesome-dsh-plugin/main/data/plugins/webkubor__dsh-bloom-theme.yml'
  const SHOTS = 'https://raw.githubusercontent.com/awesome-dsh-plugin/awesome-dsh-plugin/main/data/screenshots.json'
  // 收录信息由第三方仓库合并,不该阻塞我们自己的发版 —— 有在途 PR 就记为 pending
  const UP = 'awesome-dsh-plugin/awesome-dsh-plugin'
  const pendingPr = online
    ? sh(`gh pr list --repo ${UP} --author @me --state open --json number,files --jq '[.[] | select(.files[].path | test("dsh-bloom-theme|screenshots.json"))] | .[0].number' 2>/dev/null`)
    : null
  const pending = pendingPr && pendingPr !== 'null' ? pendingPr : null

  if (!online) { skip('离线，跳过收录核对'); }
  else {
    const entry = sh(`curl -sf -m 8 "${ENTRY}"`)
    if (!entry) bad('拉不到收录条目 —— 条目被删了？还是文件名变了？')
    else {
      // 条目描述里的变体数必须跟实际一致（曾长期停留在 four variants）
      const claimsFour = /\bfour\b|四款|四个/i.test(entry)
      const claimsEight = /\beight\b|八款|八个/i.test(entry)
      claimsEight && !claimsFour
        ? ok('条目描述的变体数与实际（8）一致')
        : pending
        ? skip(`条目描述还过时（写着 four），但更正 PR #${pending} 在途，等上游合并`)
        : bad(`条目描述的变体数过时（${claimsFour ? '写着 four' : '未声明八款'}）—— 实际已有 8 个变体，去提 PR 更正`)
    }
    const shotsJson = sh(`curl -sf -m 8 "${SHOTS}"`)
    if (!shotsJson) skip('拉不到 screenshots.json')
    else {
      let registered = []
      try { registered = JSON.parse(shotsJson)['https://github.com/webkubor/dsh-bloom-theme'] || [] } catch {}
      registered.length > 0
        ? ok(`已注册 ${registered.length} 张市场截图（dsh-market 详情页用）`)
        : pending
        ? skip(`市场截图还没注册，但 PR #${pending} 在途，等上游合并`)
        : bad('一张市场截图都没注册 —— dsh-market 详情页只能从 README 瞎抽，顺序和选图都不可控')
    }
  }
}

// ── 5. 本地 DSH profile 是否真装着当前版本 ─────────────────────
head('本地 DSH profile 装的版本')
{
  const home = process.env.HOME
  const profiles = ['web', 'desktop']
  let any = false
  for (const prof of profiles) {
    const pkgPath = `${home}/.dsh/profiles/${prof}/package.json`
    const modPath = `${home}/.dsh/profiles/${prof}/node_modules/${pkg.name}/package.json`
    if (!existsSync(pkgPath)) continue
    any = true
    let declared, installed
    try { declared = JSON.parse(readFileSync(pkgPath, 'utf8')).dependencies?.[pkg.name] } catch {}
    try { installed = JSON.parse(readFileSync(modPath, 'utf8')).version } catch {}
    if (!declared) { skip(`${prof} profile 没声明本插件`); continue }

    // caret 对 0.x 的语义是 >=0.x.y <0.(x+1).0 —— ^0.3.4 **不**匹配 0.8.1。
    // 这个坑真实发生过：web profile 长期声明 ^0.3.4，而 npm run deploy 用 rsync
    // 直接覆盖文件、绕过了依赖声明，所以开发时一直「看着是最新的」；直到某次
    // pnpm install 按声明把插件打回 0.3.4（4 变体、无玻璃），才暴露出来。
    const m = /^[\^~]?(\d+)\.(\d+)\./.exec(declared)
    const cur = /^(\d+)\.(\d+)\./.exec(pkg.version)
    const satisfied = m && cur && declared.startsWith('^') && m[1] === '0'
      ? m[1] === cur[1] && m[2] === cur[2]     // 0.x：caret 锁次版本号
      : installed === pkg.version               // 其余情况以实装版本为准
    if (installed === pkg.version && satisfied) ok(`${prof}: 声明 ${declared}，实装 ${installed}`)
    else if (installed === pkg.version) bad(`${prof}: 实装 ${installed} 是对的，但声明 ${declared} 不匹配 —— 下次 pnpm install 会把它打回去`)
    else bad(`${prof}: 声明 ${declared} / 实装 ${installed}，当前版本是 ${pkg.version}`)
  }
  if (!any) skip('本机没有 ~/.dsh/profiles，跳过')
}

// ── 结果 ────────────────────────────────────────────────────────
console.log()
if (failed) {
  console.log(`${R}${failed} 项未通过${X}${skipped ? D + `，${skipped} 项跳过` + X : ''}\n`)
  process.exit(1)
}
console.log(`${G}全部通过${X}${skipped ? D + `（${skipped} 项跳过）` + X : ''}\n`)
