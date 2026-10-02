/**
 * DSH 语义选择器漂移检查。
 *
 * 为什么需要它：本主题全部靠 `[class*="_语义名"]` 匹配 DSH 的 CSS Module 类名
 * （形如 `wSkVaW_tabs`，hash 后跟语义后缀）。**DSH 改一次名，主题就静默失效一批** ——
 * 不报错、门禁全绿、只是那块样式没了。已经真实发生过两次：
 *   · 2026-09-29 `_turnStatus` 消失 → 「原来好看的渐变动效没了」
 *   · 2026-10-02 `_tableScroll`/`_sessionRow`/`_groupSection` 等消失
 * 现有 check.mjs 只查「没硬编码 hash」，查不出「语义名已经不存在」。
 *
 * 做法：把目标 DSH 版本的 client 包从 npm 下到本地缓存，逐个语义名做**子串**匹配
 * （必须用子串：DSH 用的是 class*=，`_composer` 命中 `_composerSeat` 才算对）。
 *
 * 退出码：出现**不在基线里**的缺失 → 1（挡住新漂移）；只有基线内的 → 0 并打印清单。
 * 基线见 scripts/dsh-drift-baseline.json —— 那里记的是「已确认失效但还没改」的名字，
 * 每一条都要写清为什么还没改。
 *
 * 用法：
 *   node scripts/dsh-drift.mjs                # 自动探测 DSH 版本
 *   node scripts/dsh-drift.mjs --dsh 0.2.0-rc.2
 *   node scripts/dsh-drift.mjs --offline      # 只用缓存（CI 无网/快速本地循环）
 *   node scripts/dsh-drift.mjs --update-baseline   # 把当前缺失写进基线（谨慎）
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cacheRoot = resolve(repoDir, 'node_modules/.cache/dsh-drift')
const baselinePath = resolve(repoDir, 'scripts/dsh-drift-baseline.json')
const args = process.argv.slice(2)
const offline = args.includes('--offline')
const updateBaseline = args.includes('--update-baseline')

/** 目标 DSH 版本：--dsh > 环境变量 > 桌面 profile 的声明 > 兜底。 */
function targetVersion () {
  const i = args.indexOf('--dsh')
  if (i !== -1 && args[i + 1]) return args[i + 1]
  if (process.env.DSH_VERSION) return process.env.DSH_VERSION
  // 本机桌面 profile 的依赖里带着 DSH 版本（app 独占托管，但文件可读）
  for (const p of ['desktop', 'desktop-local']) {
    const f = resolve(homedir(), '.dsh/profiles', p, 'package.json')
    if (!existsSync(f)) continue
    try {
      const deps = JSON.parse(readFileSync(f, 'utf8')).dependencies ?? {}
      for (const [k, v] of Object.entries(deps)) {
        // ⚠️ 别写 `!k.includes('cli')` —— "client" 里就含 "cli"，那样会把
        // @deepseek-ai/dsh-client-* 全部排除掉（Cursor reviewer 2026-10-02 指出的）。
        // 真正要排除的是独立发版的 @deepseek-ai/dsh-cli 本体，所以按全名比。
        if (!k.startsWith('@deepseek-ai/dsh-')) continue
        if (k === '@deepseek-ai/dsh-cli') continue
        return String(v).replace(/^[\^~]/, '')
      }
    } catch { /* 读不动就下一个 */ }
  }
  return '0.2.0-rc.2'
}

/**
 * 剥掉注释后的源码 —— 与 scripts/check.mjs 同一份实现（含 `(?<!:)` 那个保护，
 * 免得把 URL 里的 `//` 当行注释吃掉）。
 *
 * ⚠️ 必须先剥再扫：注释里举反例 / 记历史是合法的（本仓大量这么做），
 * 不剥就会把注释里的 `[class*="_xyz"]` 当成真实选择器收进清单。
 * 2026-10-02 Codex 与 Cursor 两个 reviewer 都指出了这一点，实测确实捞出一个
 * 假名字 sessionLogButton —— 它只存在于注释里，源码中根本没有这个选择器。
 */
const stripComments = (code) =>
  code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/.*$/gm, '')

/** 主题里所有 `[class*="_语义名"]` 的语义名（去重 + 排序）。 */
function themeNames () {
  const dir = resolve(repoDir, 'src/css')
  const names = new Set()
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.ts')) continue
    const src = stripComments(readFileSync(join(dir, f), 'utf8'))
    for (const m of src.matchAll(/class\*="_([A-Za-z][A-Za-z0-9]*)"/g)) names.add(m[1])
  }
  return [...names].sort()
}

/** DSH 全部 client-ui 包的版本化缓存目录；缺了就下。 */
async function ensureDshSources (version) {
  const dir = join(cacheRoot, version)
  const marker = join(dir, '.done')
  if (existsSync(marker)) return dir
  if (offline) {
    throw new Error(`缓存里没有 DSH ${version}（--offline）。先联网跑一次。`)
  }
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })

  // 先问 registry 有哪些 client-ui 包，再挑有该版本的那些下。
  //
  // ⚠️ 别用 `npm search`：它默认只返回 20 条（--searchlimit 才改），本机实测
  // 56 个包里只拿到 20 个 → 少下的那 36 个包的语义名全被判成「漂移」，
  // 一次报出 4 个假阳性。**门禁报假警比没有门禁更坏**，所以这里直接打 registry API
  // 并显式要 size=250。
  const res = await fetch('https://registry.npmjs.org/-/v1/search?text=@deepseek-ai/dsh-client-ui&size=250')
  if (!res.ok) throw new Error(`registry 搜索失败：HTTP ${res.status}`)
  const names = (await res.json()).objects
    .map((o) => o.package.name)
    .filter((n) => n.startsWith('@deepseek-ai/dsh-client-ui'))
  if (names.length < 30) {
    // 数量突然塌下来 = 接口变了或被限流。宁可报错也不要拿半个清单去判漂移。
    throw new Error(`只拿到 ${names.length} 个 client-ui 包，明显偏少（正常 50+）—— 拒绝据此判漂移`)
  }

  let ok = 0
  for (const name of names) {
    try {
      execFileSync('npm', ['pack', `${name}@${version}`, '--silent'], {
        cwd: dir, stdio: 'ignore',
      })
    } catch { continue } // 该包没有这个版本 —— 正常，跳过
    ok += 1
  }
  if (ok === 0) throw new Error(`一个包都没下到：DSH ${version} 存在吗？`)
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.tgz')) continue
    const sub = join(dir, f.replace(/^deepseek-ai-/, '').replace(/-[\d.]+-rc\.[\d.]+\.tgz$|-\d+\.\d+\.\d+\.tgz$/, ''))
    mkdirSync(sub, { recursive: true })
    try { execFileSync('tar', ['xzf', join(dir, f), '-C', sub], { stdio: 'ignore' }) } catch { /* 坏包跳过 */ }
  }
  writeFileSync(marker, `${new Date().toISOString()}\n`)
  return dir
}

/** 在缓存目录里做子串匹配（和浏览器里 class*= 的语义一致）。 */
function exists (dir, name) {
  try {
    execFileSync('grep', ['-rql', `_${name}`, '--include=client.js', '.'], { cwd: dir, stdio: 'ignore' })
    return true
  } catch { return false }
}

const version = targetVersion()
const names = themeNames()
let dir
try {
  dir = await ensureDshSources(version)
} catch (e) {
  console.error(`⚠️  拿不到 DSH ${version} 的源码：${e.message}`)
  console.error('    漂移检查跳过（不阻塞）—— 但它没跑就等于没查。')
  process.exit(0)
}

const missing = names.filter((n) => !exists(dir, n))
let baseline = { note: '', names: {} }
if (existsSync(baselinePath)) baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
const known = new Set(Object.keys(baseline.names ?? {}))

if (updateBaseline) {
  const next = { ...baseline, names: {} }
  for (const n of missing) next.names[n] = baseline.names?.[n] ?? '待补：说明为什么还没改'
  writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`)
  console.log(`基线已更新：${missing.length} 个缺失名写入 ${baselinePath}`)
  process.exit(0)
}

console.log(`DSH 语义选择器漂移检查 —— 目标 DSH ${version}`)
console.log(`  主题语义名 ${names.length} 个，目标包里找不到 ${missing.length} 个\n`)

const fresh = missing.filter((n) => !known.has(n))
const stale = Object.keys(baseline.names ?? {}).filter((n) => !missing.includes(n))

for (const n of missing) {
  const isKnown = known.has(n)
  console.log(`  ${isKnown ? '·' : '✗'} _${n}${isKnown ? `  （基线内：${baseline.names[n]}）` : '  ← 新漂移，必须处理'}`)
}
if (stale.length) {
  console.log(`\n  基线里这 ${stale.length} 个名字在目标版本里已经回来了，可以从基线删掉：${stale.join(', ')}`)
}

if (fresh.length) {
  console.error(`\n✗ 出现 ${fresh.length} 个新漂移：${fresh.join(', ')}`)
  console.error('  DSH 改名了 → 主题这些规则已经静默失效。改完再把名字从基线移除。')
  process.exit(1)
}
console.log('\n✓ 没有新漂移（基线内的已知项见上）')
