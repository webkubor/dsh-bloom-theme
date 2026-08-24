#!/usr/bin/env node
/**
 * 把 src/client.ts 及其 import 打包成**单个** lib/client.js。
 *
 * 为什么必须 bundle：DSH 的插件 client.js 是当 **classic script** 执行的
 * （实测页面上 `/plugins/.../client.js` 的 script 标签 type 是 classic，
 * 且它由 dsh-client-modules 动态加载、末尾调 `window.__ModuleLoader__.load()`）。
 * classic script 里出现 `import` / `export` 直接是语法错误 —— 插件会整个挂掉，
 * 而且报错在浏览器端，跟 node 侧的 lib/index.js 一点关系没有
 * （这个混淆已经害过一次，见 DEV_NOTES 2026-08-18「启动白屏」）。
 *
 * 所以源码可以随意拆模块，产物必须是一个自包含文件：
 *   format: 'iife'  —— 输出 `(() => { ... })();`，无 import/export，classic-safe
 *   bundle: true    —— 把 import 全部内联
 *   external: []    —— 不允许任何外部依赖漏到产物里（本插件运行时零依赖）
 *
 * node 半侧的 lib/index.js 反过来**必须**是 ESM（cordis loader 按 ESM 读它），
 * 由 tsc 单独编译，不走这里。
 */
import { build } from 'esbuild'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

const result = await build({
  entryPoints: [resolve(root, 'src/client.ts')],
  outfile: resolve(root, 'lib/client.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  // 保留注释：本项目的注释记录了大量「为什么这么写」的踩坑结论，
  // 产物随包分发（files 白名单含 lib），读者可能直接看 lib/client.js。
  legalComments: 'inline',
  minify: false,
  charset: 'utf8',
  logLevel: 'warning',
  metafile: true,
  banner: {
    js: `/* ${pkg.name} v${pkg.version} —— 由 scripts/bundle.mjs 从 src/*.ts 打包生成，请勿直接编辑。\n`
      + `   源码入口 src/client.ts；改完跑 npm run build。 */`,
  },
})

// 产物自检：classic script 里绝不能出现顶层 import/export
const out = readFileSync(resolve(root, 'lib/client.js'), 'utf8')
const bad = []
if (/^\s*import[\s{*]/m.test(out)) bad.push('顶层 import')
if (/^\s*export[\s{]/m.test(out)) bad.push('顶层 export')
if (/\brequire\(/.test(out)) bad.push('require() 调用')
if (bad.length) {
  console.error(`✗ 产物不是 classic-safe：出现 ${bad.join(' / ')}`)
  process.exit(1)
}
if (!out.includes('window.__ModuleLoader__')) {
  console.error('✗ 产物里找不到 window.__ModuleLoader__.load —— DSH 不会注册这个插件')
  process.exit(1)
}

const inputs = Object.keys(result.metafile.inputs).filter((f) => f.endsWith('.ts')).length
const kb = (out.length / 1024).toFixed(1)
console.log(`✔ lib/client.js  ${kb} kB  ← ${inputs} 个源文件，classic-safe`)
