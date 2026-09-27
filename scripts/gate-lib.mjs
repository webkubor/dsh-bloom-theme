/**
 * 发版门禁的纯判据 —— 从 prepublish-gate.mjs 抽出来的可测部分。
 *
 * 为什么要抽：门禁脚本顶层会读 package.json、跑 npm pack、连 registry，
 * 没法直接 import 进来做单元测试；而契约 4 的「纯文档版放行」判据恰恰是
 * 最需要测的逻辑（判错的两个方向都很难看：误拦文档版 → 逼人用逃生舱；
 * 误放代码版 → 契约 4 形同虚设）。
 *
 * 这些函数**不含任何副作用**，只做字符串/文件内容比对。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

/**
 * 「运行期载荷」= tarball 里**除了文档/元数据/开发工具之外**的每一个文件。
 *
 * 判据必须能机械执行 —— 不用「CHANGELOG 里有没有 feat/fix 关键字」这种启发式
 * （自省段落里出现一个「修」字就会误放行）。详见 docs/rules/release-semantics.md。
 */
export const EXCLUDE = [
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

export const isRuntime = (p) => !EXCLUDE.some((re) => re.test(p))

/** 递归收集目录下所有文件（相对路径）。 */
export function collectAllFiles(root) {
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

/**
 * 找出「本次包里内容与上一已发布版不同」的运行期文件。
 *
 * 只服务于契约 4 的「载荷指纹相同」分支：指纹相同说明集合级没变，
 * 这时要再问一句「那到底动了什么」——
 *   · 动的是运行期文件 → 说明内容变了但指纹没体现（改注释 / 重构不生效分支），拦
 *   · 全是文档        → 纯文档版，放行
 *
 * 比对策略：逐文件 sha256。新增/删除也算「变了」。
 */
export function detectChangedRuntime(prevRoot, curRoot, curFiles) {
  const changed = []
  const prevFiles = new Set(collectAllFiles(prevRoot))

  const hashOf = (root, rel) => {
    try { return createHash('sha256').update(readFileSync(join(root, rel))).digest('hex') }
    catch { return null }
  }

  for (const rel of curFiles) {
    if (rel === 'package.json') continue
    if (!isRuntime(rel)) continue
    const cur = hashOf(curRoot, rel)
    if (cur === null) continue
    const prev = prevFiles.has(rel) ? hashOf(prevRoot, rel) : null
    if (prev !== cur) changed.push(rel)
  }
  for (const rel of prevFiles) {
    if (rel === 'package.json') continue
    if (!isRuntime(rel)) continue
    if (!curFiles.includes(rel)) changed.push(rel + ' (本次已移除)')
  }
  return changed
}
