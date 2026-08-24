#!/usr/bin/env node
/**
 * 给 GitHub Release 补上「详细说明」—— release-please 只会取 commit 的 subject。
 *
 * 问题：conventional-changelog 的规范就是**只取 subject 行**，body 全丢。而本项目的
 * commit body 才是有价值的部分（现象 → 根因 → 修法 → 实测数字，动辄几十行）。
 * 结果 Release 页面上只有一行「fix(switcher): 复制/检查按钮改就地反馈」，
 * 点进去才知道背后是「三层问题叠加、最低 1.38:1」这么回事 —— 看起来很寒酸。
 *
 * 这个脚本把 tag 区间内每个 commit 的 body 折叠追加到 Release notes 末尾：
 * 顶部保留 release-please 生成的简洁列表（适合扫读），
 * 底部是可展开的详细说明（适合想知道「为什么」的人）。
 *
 * 用法：
 *   node scripts/enrich-release.mjs v0.8.3        指定 tag
 *   node scripts/enrich-release.mjs               用最新 tag
 *   node scripts/enrich-release.mjs v0.8.3 --dry  只打印，不写回
 *
 * 幂等：已经补过的（notes 里含 MARKER）会先剥掉旧的详细段落再重写。
 */
import { execSync } from 'node:child_process'

const MARKER = '<!-- enriched-by-scripts/enrich-release.mjs -->'
const args = process.argv.slice(2)
const dry = args.includes('--dry')
const tag = args.find((a) => /^v\d/.test(a)) || run('git describe --tags --abbrev=0')

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}
function tryRun(cmd) { try { return run(cmd) } catch { return null } }

// 上一个 tag —— 区间起点
const prev = tryRun(`git describe --tags --abbrev=0 ${tag}^ 2>/dev/null`)
const range = prev ? `${prev}..${tag}` : tag
console.error(`区间：${range}`)

// 取区间内的 commit（跳过 release-please 自己的 release commit）
const sep = ''
const raw = tryRun(`git log --format='%H${sep}%s${sep}%b${sep}END' ${range}`)
if (!raw) { console.error('✗ 取不到 commit'); process.exit(1) }

const commits = raw.split('END').map((chunk) => {
  const [hash, subject, body] = chunk.replace(/^\n/, '').split(sep)
  return hash && subject ? { hash: hash.trim(), subject: subject.trim(), body: (body || '').trim() } : null
}).filter(Boolean)
  // release-please 的 release commit 没有信息量
  .filter((c) => !/^chore\(main\): release /.test(c.subject))
  // 只有带 body 的才值得展开
  .filter((c) => c.body.length > 0)

if (commits.length === 0) {
  console.error('— 区间内没有带 body 的 commit，无需补充')
  process.exit(0)
}

const detail = [
  '',
  '---',
  '',
  MARKER,
  '<details>',
  `<summary><b>详细说明</b> —— 每条改动的现象 / 根因 / 实测数字（${commits.length} 条）</summary>`,
  '',
  ...commits.flatMap((c) => [
    `### ${c.subject}`,
    '',
    c.body,
    '',
    `<sub>\`${c.hash.slice(0, 7)}\`</sub>`,
    '',
  ]),
  '</details>',
].join('\n')

const current = run(`gh release view ${tag} --json body --jq .body`)
// 幂等：剥掉此前补过的段落
const base = current.split(/\n*---\n*<!-- enriched-by/)[0].replace(/\s+$/, '')
const next = base + '\n' + detail

if (dry) {
  console.log(next)
  process.exit(0)
}
const tmp = `/tmp/release-notes-${tag}.md`
execSync(`cat > ${tmp}`, { input: next })
run(`gh release edit ${tag} --notes-file ${tmp}`)
console.error(`✔ ${tag} 的 Release notes 已补上 ${commits.length} 条详细说明`)
