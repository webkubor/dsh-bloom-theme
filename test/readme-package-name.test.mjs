/**
 * 守卫：README 里不能出现本包的旧包名。
 *
 * 2026-09-17 owner 指出「你的 SOP 少环节导致每次老是留尾巴」——
 * 那天连发多个版本，README 里的 @webkubor/... 没跟着改到 @dsh-plugins/...，
 * 而 npm 包页展示的就是 README，用户第一眼看到的是错的安装命令。
 *
 * 只比对「同名不同 scope」的情况，不做全文校验 —— 宁可漏报不可误报，
 * 误报会让人把整条守卫关掉。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const bare = pkg.name.includes('/') ? pkg.name.split('/')[1] : pkg.name

for (const f of ['README.md', 'README.en.md']) {
  const url = new URL(`../${f}`, import.meta.url)
  if (!existsSync(url)) continue
  test(`${f} 里没有本包的旧包名`, () => {
    const text = readFileSync(url, 'utf8')
    // CHANGELOG 式的历史叙述不在 README 里，README 出现的都该是当前名
    const scoped = [...new Set(text.match(/@[\w-]+\/[\w.-]+/g) || [])]
    const stale = scoped.filter((n) => n.split('/')[1] === bare && n !== pkg.name)
    assert.deepEqual(
      stale, [],
      `${f} 里还写着旧包名 ${stale.join(', ')}，当前是 ${pkg.name}。` +
      'npm 包页展示的就是 README，用户会照着错的安装命令敲。',
    )
  })
}
