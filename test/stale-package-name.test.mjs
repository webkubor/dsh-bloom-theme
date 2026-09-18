/**
 * 守卫：源码与构建脚本里不能残留旧包名 / 旧 scope。
 *
 * 2026-09-18 发现昨天的包名迁移漏了两处，两处都**静默失效、零报错**：
 *   1. package.json 的 deploy script 还 rsync 到 node_modules/@webkubor/...，
 *      而 profile 里装的是 node_modules/dsh-bloom-theme —— rsync 会把目录建出来，
 *      文件落进一个 DSH 根本不加载的地方，改完代码刷新页面毫无变化。
 *   2. visual-audit 的 style[data-plugin-css^="@kubor"] 匹配 0 个元素，
 *      基线对比退化成「无差异」，审计照常输出结论、只是结论全错。
 *
 * 已有的 README / cordis.patch.yml 守卫只管文档和 boot 配置，管不到这两处。
 * 包名还要再改一次（等 npm 账号解冻收敛到无 scope），所以守卫比逐处修更值。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const root = new URL('..', import.meta.url).pathname

// 本包用过的全部 scope；当前这个不算“旧”。改 scope 时在这里加一个词。
const STALE = ['@kubor', '@webkubor', '@dsh-plugins'].filter(
  (s) => !pkg.name.startsWith(s + '/'),
)

// 只扫会被执行的东西。历史叙述（CHANGELOG / DEV_NOTES / 讨论稿）本来就该留旧名，
// lib/ 是产物跟着源码走，test/ 自己要写旧名做断言。
const files = execFileSync('git', ['ls-files', 'package.json', 'scripts', 'src', '*.yml', '*.yaml'], {
  cwd: root, encoding: 'utf8',
}).split('\n').filter(Boolean).filter((f) => !f.endsWith('.test.mjs'))

for (const f of files) {
  // 剥掉注释再判断 —— 注释里写旧 scope 是有价值的历史叙述（「原先写的是 @kubor，
  // 结果...」），守卫误报会逼人删掉这些记录，最后整条守卫被关掉。
  const code = readFileSync(root + f, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '')
  const hits = STALE.filter((s) => code.includes(s))
  if (!hits.length) continue
  test(`${f} 里不能有旧 scope`, () => {
    assert.deepEqual(
      hits, [],
      `${f} 残留旧 scope ${hits.join(', ')}，当前包名是 ${pkg.name}。` +
      '这类残留一律静默失效：rsync 会建出没人读的目录，选择器会匹配 0 个元素。',
    )
  })
}

test('守卫本身有效 —— 扫到的文件数不为 0', () => {
  assert.ok(files.length > 3, `只扫到 ${files.length} 个文件，git ls-files 的路径参数可能失配`)
})
