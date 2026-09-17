/**
 * 守卫：cordis.patch.yml 若引用本包，名字必须与 package.json 的 name 一致。
 *
 * 它是 dsh.bundle.patch 的入口，宿主按这个名字从 profile 的 node_modules 解析包。
 * 名字对不上不是「这个插件不加载」，而是**整棵插件树加载失败、DSH 服务起不来**：
 *   dsh: plugin tree failed to load: ... Cannot find package 'dsh-user-mirror'
 *
 * 2026-09-17 真实发生：dsh-user-mirror 0.6.3 改 scope 时改了 package.json 和
 * client.js，漏了这里，装上后本机 DSH 直接 crash loop。漏的原因是 grep 用了
 * "@webkubor/dsh-user-mirror" 做搜索词，而文件里写的是不带 scope 的形式 ——
 * 搜索词带前缀本身就是一种过滤器。
 *
 * ⚠️ 只校验「引用本包」的那些行。patch 里合法地存在引用**其他**包的行
 * （如 dsh-llm-hub 引用 @deepseek-ai/dsh-tool-subagent 注册子代理工具），
 * 那些 name 本来就不该等于自己。判据：末段同名 = 指向本包。
 *
 * 与 plugin-id.test.mjs 是两件事，都要有：
 *   - plugin-id  → client.js 的 __ModuleLoader__.load({id})，管客户端 bundle 注册
 *   - 本文件     → cordis.patch.yml 的 name，管服务端插进 boot graph
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const patchUrl = new URL('../cordis.patch.yml', import.meta.url)
const bare = pkg.name.includes('/') ? pkg.name.split('/')[1] : pkg.name

test('cordis.patch.yml 里指向本包的 name 与 package.json 一致', () => {
  assert.ok(existsSync(patchUrl), 'cordis.patch.yml 不存在 —— package.json 声明了 dsh.bundle.patch 却没有这个文件')
  const yml = readFileSync(patchUrl, 'utf8')
  const names = [...yml.matchAll(/^\s*name:\s*['"]?([^'"\n]+?)['"]?\s*$/gm)].map((m) => m[1])
  assert.ok(names.length > 0, 'cordis.patch.yml 里没找到 name: 字段')

  // 末段同名即视为「指向本包」，此时全名必须完全一致
  const selfRefs = names.filter((n) => (n.includes('/') ? n.split('/')[1] : n) === bare)
  assert.ok(
    selfRefs.length > 0,
    `cordis.patch.yml 里没有任何一行指向本包（${pkg.name}）。` +
    '至少要有一行把自己插进 boot graph，否则装了也不会加载。',
  )
  for (const n of selfRefs) {
    assert.equal(
      n, pkg.name,
      `cordis.patch.yml 写着 name: ${n}，而包名是 ${pkg.name}。` +
      '宿主按这个名字解析包，对不上会让整棵插件树加载失败、DSH 起不来。',
    )
  }
})
