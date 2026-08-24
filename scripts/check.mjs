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
 *   4. 选择器稳定性：禁止硬编码 DSH 的 <hash>_<语义名> 类名
 *      hash 随 DSH 每次构建变化，写死会在升级后**静默失效**（无报错无告警）。
 *   5. 范围边界（棘轮）：/bloom 子命令与顶层 CSS 常量都是白名单
 *      本项目定位是「配色 + 质感 + 切换器」，越界功能已冻结，新增一律先撞这道闸门。
 *
 * 前 3 条是「改坏了会报错」，后 2 条是「改偏了会报错」—— 后者是本项目真正
 * 反复失血的地方（详见 DEV_NOTES「约束写了但没有闸门」）。规则只写在文档里
 * 等于没写：CONTRIBUTING 早就规定了选择器写法，仍然出现了 .VOzbGW_overlay。
 *
 * 用法：npm run check（CI 与本地同一份）
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(resolve(root, p), 'utf8')

/**
 * 递归读 src/ 下所有 .ts，返回 [{ path, code }]。
 *
 * 为什么不读 lib/：那是 **产物**，形态由打包器决定。这些闸门原本从
 * lib/client.js 正则匹配 `const PLUGIN_ID = '...'`，改用 esbuild 打包后产物变成
 * `var PLUGIN_ID = "..."`，两道闸门当场误报；而 CSS 常量白名单扫的是单个
 * src/client.ts，CSS 拆到 src/css/ 之后它扫到 0 个常量 —— **静默失效**，
 * 比误报更危险。源码才是唯一真源，且形态不随构建方式变化。
 */
function readSrc() {
  const out = []
  const walk = (dir) => {
    for (const e of readdirSync(resolve(root, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`
      if (e.isDirectory()) walk(rel)
      else if (e.name.endsWith('.ts')) out.push({ path: rel, code: read(rel) })
    }
  }
  walk('src')
  return out
}
/** 剥掉注释后的源码（注释里举反例/记历史是合法的） */
const stripComments = (code) =>
  code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/.*$/gm, '')

const SRC = readSrc()
const SRC_ALL = SRC.map((f) => f.code).join('\n')
const SRC_CODE = SRC.map((f) => stripComments(f.code)).join('\n')

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

// 包名与源码里的 PLUGIN_ID 必须一致，否则 loader 注册对不上
const idMatch = SRC_ALL.match(/const PLUGIN_ID = '([^']+)'/)
idMatch?.[1] === pkg.name
  ? ok(`PLUGIN_ID 与包名一致（${pkg.name}）`)
  : bad(`PLUGIN_ID (${idMatch?.[1]}) 与包名 (${pkg.name}) 不一致 —— DSH 会报 "loaded without registering"`)

// ── 2. 配色无障碍 ──────────────────────────────────────────────
// 已交给 contrast-guard（npm run check:contrast / CI 单独一步）。
// 它按 4 个变体逐组检查 8 组「主色+底色」，不达标时直接反推出该改成多少。
// 此处不再重复实现 —— 两份算法各写一遍必然漂移。

// ── 2.5 文档里教的命令必须真实存在 ─────────────────────────────
console.log('\n文档命令有效性')

// README 教用户跑 `npm run publish` 跑了很久 —— 而那个 script 因为撞 npm 生命周期
// 钩子早就删了，照着文档做会直接报错。文档与代码脱节没有任何东西会报警，
// 除非把它变成一条断言。
{
  const scripts = new Set(Object.keys(pkg.scripts || {}))
  const docs = ['README.md', 'README.en.md', 'CONTRIBUTING.md']
  const stale = []
  for (const f of docs) {
    let text
    try { text = read(f) } catch { continue }
    for (const m of text.matchAll(/npm run ([a-z][a-z0-9:-]*)/g)) {
      if (!scripts.has(m[1])) stale.push(`${f} → npm run ${m[1]}`)
    }
  }
  const uniq = [...new Set(stale)]
  uniq.length === 0
    ? ok(`文档提到的 npm 脚本全部存在（${scripts.size} 个脚本）`)
    : bad(`文档教了不存在的命令：${uniq.join(', ')} —— 照着做会报错`)
}

// ── 3. 前景色 token 反模式 ─────────────────────────────────────
console.log('\n前景色 token 反模式')

// inline-code 是背景色变量：给裸 oklch 值几乎必然是按文字色给的，暗色下会翻车
const inlineCode = [...SRC_ALL.matchAll(/--dsw-alias-markdown-inline-code:\s*([^;]+);/g)].map((m) => m[1].trim())
const badInline = inlineCode.filter((v) => /^oklch\(/.test(v))
badInline.length === 0
  ? ok(`markdown-inline-code 全部走变量（${inlineCode.length} 处）`)
  : bad(`markdown-inline-code 有 ${badInline.length} 处写成裸色值：${badInline.join(', ')} —— 它是背景色，按文字色给值会得到极低对比度`)

// 暗色阴影必须是纯黑，不能用前景色 mix
const darkShadow = SRC_ALL.match(/--bloom-shadow:[^;]*\$\{dark \? '([^']+)'/)
darkShadow?.[1]?.includes('rgba(0,0,0')
  ? ok('暗色阴影使用纯黑')
  : bad('暗色阴影未使用纯黑 —— 用前景色 mix 会渲染成白雾')

// ── 1.5 scripts 不得撞 npm 生命周期钩子 ────────────────────────
console.log('\nscripts 命名')

// npm 会在特定时机**自动**执行同名 script。踩过的坑：package.json 里定义了
// `"publish": "... && npm publish"`，而 `publish` 本身就是 npm 的生命周期钩子 ——
// CI 跑 `npm publish` 成功后，npm 自动触发这个 script，里面又 `npm publish` 一次，
// 第二次撞 `403 You cannot publish over the previously published versions`。
// 结果：包其实发成功了，Publish workflow 却永远标红（v0.7.0 实际发生）。
// `prepublishOnly` / `prepare` / `prepack` 是有意使用的钩子，不在禁用名单里。
const HOOK_NAMES = ['publish', 'prepublish', 'postpublish', 'install', 'preinstall', 'postinstall',
  'version', 'preversion', 'postversion', 'uninstall', 'preuninstall', 'postuninstall']
const clashes = Object.keys(pkg.scripts || {}).filter((n) => HOOK_NAMES.includes(n))
clashes.length === 0
  ? ok(`无 script 撞 npm 生命周期钩子（${Object.keys(pkg.scripts || {}).length} 个 script）`)
  : bad(
      `这些 script 名与 npm 生命周期钩子同名，会被自动触发：${clashes.join(', ')}\n` +
        `    → 改个名字（如 release:npm）。同名 script 里再调用同名命令会无限递归/撞 403。`,
    )

// ── 3.5 版本真源唯一性 ─────────────────────────────────────────
console.log('\n版本真源')

// 版本号有三处副本：package.json（npm）、.release-please-manifest.json（release-please
// 的账本）、src/client.ts 的 PLUGIN_VERSION（浏览器端读不到 package.json，只能内置）。
// 三处必须一致，否则会出现「npm 上 0.6.0 / git 里 0.6.1 / UI 显示 0.6.2」这种
// 四头分裂（2026-08-24 实际发生过，根因见 DEV_NOTES）。
// release-please 靠 extra-files + 行尾 x-release-please-version 标记同时 bump
// package.json 与 src/client.ts，所以 release PR 的 CI 也能过这道闸门。
const manifestVer = JSON.parse(read('.release-please-manifest.json'))['.']
const pluginVer = SRC_ALL.match(/const PLUGIN_VERSION = '([^']+)'/)?.[1]

manifestVer === pkg.version
  ? ok(`release-please manifest 与 package.json 一致（${pkg.version}）`)
  : bad(`manifest (${manifestVer}) ≠ package.json (${pkg.version}) —— 别手工改版本号，交给 release-please`)

pluginVer === pkg.version
  ? ok(`PLUGIN_VERSION 与 package.json 一致（${pkg.version}）`)
  : bad(
      `PLUGIN_VERSION (${pluginVer}) ≠ package.json (${pkg.version})\n` +
        `    → 跑 npm run sync-version，或检查 src/client.ts 行尾的 x-release-please-version 标记是否被删。`,
    )

// release-please 的 extra-files 指向的文件必须真的存在、且带 x-release-please-version
// 标记，否则 release PR 只 bump package.json、源码里的版本号原地不动 —— 而这种漂移
// 只有发版后在页面上才看得出来。2026-08-24 把 client.ts 拆成 10 个模块、
// PLUGIN_VERSION 搬到 meta.ts 时就漂了一次。
const rpCfg = JSON.parse(read('release-please-config.json'))
const extraFiles = (rpCfg.packages?.['.']?.['extra-files'] || []).map((f) => (typeof f === 'string' ? f : f.path))
if (extraFiles.length === 0) {
  bad('release-please 未配置 extra-files —— 源码里的 PLUGIN_VERSION 不会被 bump')
} else {
  const broken = extraFiles.filter((f) => {
    try { return !read(f).includes('x-release-please-version') } catch { return true }
  })
  broken.length === 0
    ? ok(`release-please extra-files 均带 x-release-please-version 标记（${extraFiles.join(', ')}）`)
    : bad(`extra-files 指向的文件缺标记或不存在：${broken.join(', ')} —— release PR 不会 bump 它`)
}

// ── 3.8 --bloom-* 变量引用必须都有定义 ─────────────────────────
console.log('\n自有 CSS 变量引用')

// 这次踩的坑：更新横幅写了 var(--bloom-glass-bg, rgba(255,255,255,0.72)) 和
// var(--bloom-tx, inherit) —— 这两个变量**从来没定义过**，于是背景 fallback 成
// 一个「亮色」假设的浅白底、文字 fallback 成 inherit（暗色主题的近白），
// 浅白底 + 近白字实测只有 1.62:1，「（当前 x.y.z）」叠了 opacity 后 1.38:1。
//
// 关键是它躲在 client.ts 的内联 <style> 里，既不在 src/css/ 也不是顶层 CSS 常量，
// CSS 白名单和视觉审计都扫不到；而横幅只在「有新版可用」时出现，跑审计时通常
// 已是最新版，所以它烂了很久没人发现。
//
// --bloom-* 是我们自己的命名空间，可以穷举 —— 引用了没定义的一律 fail。
// （--dsw-alias-* 由 DSH 定义，无法穷举，不在此列。）
{
  // 用剥注释后的源码 —— 注释里复述「原先写的是 var(--bloom-tx)」是合法的
  const defined = new Set(
    [...SRC_CODE.matchAll(/^\s*(--bloom-[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
  )
  const referenced = [...SRC_CODE.matchAll(/var\(\s*(--bloom-[a-z0-9-]+)/g)].map((m) => m[1])
  const undef = [...new Set(referenced)].filter((v) => !defined.has(v))
  undef.length === 0
    ? ok(`${new Set(referenced).size} 个 --bloom-* 引用全部有定义（共定义 ${defined.size} 个）`)
    : bad(
        `引用了未定义的自有变量：${undef.join(', ')}\n` +
          `    → 它们会静默 fallback 到第二参数，颜色完全脱离主题控制。\n` +
          `      要么在 tokens.ts 里定义，要么改用已有 token。`,
      )
}

// ── 4. 选择器稳定性：禁止硬编码 DSH hash 类名 ──────────────────
console.log('\n选择器稳定性')

// 源码是唯一真源（lib/ 是产物）。DSH 类名形如 wSkVaW_root / VOzbGW_overlay：
// 6~8 位 base64-ish hash + 下划线 + 语义名。语义名稳定、hash 不稳定。
// 扫全部源码（已剥注释）—— 注释里举反例（「不要写 .VOzbGW_overlay」）是合法的
const hardcoded = [
  ...SRC_CODE.matchAll(/(^|[\s,>+~({])\.([A-Za-z0-9]{6,8})_([a-zA-Z][a-zA-Z0-9]*)/gm),
].map((m) => `.${m[2]}_${m[3]}`)
// 自有类名一律 dsh-bloom- 前缀（含连字符，不会命中上面的 hash 形态），
// 所以命中的必然是 DSH 内部类名。
const uniqHardcoded = [...new Set(hardcoded)]
uniqHardcoded.length === 0
  ? ok('无硬编码 DSH hash 类名（全部走 [class*="_语义名"]）')
  : bad(
      `硬编码了 ${uniqHardcoded.length} 个 DSH hash 类名：${uniqHardcoded.join(', ')}\n` +
        `    → hash 随 DSH 构建变化，升级后样式静默失效。改用 [class*="_语义名"]，\n` +
        `      需要收紧作用域时用 :has() 按 DOM 结构特征匹配。`,
    )

// CSS 常量是模板字符串，注释里写反引号会**提前终止模板** —— tsc 报的是
// 「',' expected」这种毫不相干的语法错，定位很费时间（实测踩过）。
const backtickBugs = []
for (const f of SRC.filter((x) => /\/css\//.test(x.path))) {
  const inner = f.code.replace(/^[\s\S]*?= `/, '').replace(/`[\s\S]*$/, '')
  if (inner.includes('`')) backtickBugs.push(f.path)
}
backtickBugs.length === 0
  ? ok('CSS 模板字符串内无裸反引号')
  : bad(`这些 CSS 模板里有裸反引号，会提前终止模板：${backtickBugs.join(', ')}`)

// ── 5. 范围边界（棘轮）─────────────────────────────────────────
console.log('\n范围边界')

// 定位（README「一句话」）：给 DSH 的「玻璃 + 莫兰迪」主题 = 配色 + 质感 + 切换器。
// 下面两份白名单是**棘轮**：只能减、不能加。想加新功能时先问一句
// 「它属于配色/质感/切换器吗」—— 不属于就该是独立插件，而不是塞进主题。
// 历史教训：0.4.0 加壁纸氛围层 → 0.5.0 全删；stats 卡撑了三个版本、展示的全是
// 硬编码假数据（它要读的 /bloom-stats.json 端点根本不存在），0.8.0 整块删除。
const ALLOWED_SUBCOMMANDS = []   // 空 —— 主题不提供任何 /bloom 子命令（stats 已于 2026-08-24 移除）
const ALLOWED_CSS_BLOCKS = ['COMPONENT_CSS', 'GLASS_CSS', 'SWITCHER_CSS']

// 用剥注释后的源码：说明「这里曾注册过 /bloom stats、为什么删掉」是合法且有价值的
const subcommands = [...SRC_CODE.matchAll(/\/bloom\s+([a-z][a-z0-9-]*)/g)].map((m) => m[1])
const strayCmds = [...new Set(subcommands)].filter((c) => !ALLOWED_SUBCOMMANDS.includes(c))
strayCmds.length === 0
  ? ok(`/bloom 子命令未越界（白名单：${ALLOWED_SUBCOMMANDS.join(', ')}）`)
  : bad(
      `/bloom 新增了白名单外的子命令：${strayCmds.join(', ')}\n` +
        `    → 主题插件只做配色/质感/切换器。确实要加，先改 ALLOWED_SUBCOMMANDS 并在\n` +
        `      README「一句话」里同步扩定位 —— 让范围扩张成为一次显式决策。`,
    )

const cssBlocks = [...SRC_ALL.matchAll(/^(?:export )?const ([A-Z][A-Z0-9_]*CSS) = `/gm)].map((m) => m[1])
const strayCss = cssBlocks.filter((c) => !ALLOWED_CSS_BLOCKS.includes(c))
// 扫到 0 个必然是这道闸门自己坏了（选择器与源码结构脱节），不能当成「通过」
cssBlocks.length === 0
  ? bad('没扫到任何顶层 CSS 常量 —— 这道闸门失效了，检查 readSrc/正则是否与当前源码结构脱节')
  : strayCss.length === 0
  ? ok(`顶层 CSS 常量未越界（${cssBlocks.length} 个，全在白名单内）`)
  : bad(
      `新增了白名单外的顶层 CSS 常量：${strayCss.join(', ')}\n` +
        `    → 同上：新视觉模块要么归入现有四块，要么显式扩 ALLOWED_CSS_BLOCKS。`,
    )

// ── 结果 ───────────────────────────────────────────────────────
console.log()
if (failed) {
  console.log(`[31m${failed} 项未通过[0m\n`)
  process.exit(1)
}
console.log('[32m全部通过[0m\n')
