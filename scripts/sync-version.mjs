#!/usr/bin/env node
/**
 * 把 package.json 的 version 同步进源码里的 PLUGIN_VERSION 常量（本地 dev 兜底）。
 *
 * 为什么需要内置版本号：client 在浏览器端拿不到 package.json（DSH 只 serve roster
 * 里的 client.js，`/plugins/<id>/package.json` 返回空）。下拉底部要显示「当前装的
 * 版本」并跟 npm latest 比，只能内置。
 *
 * ── 发布路径不走这里 ──
 * release-please 通过 `extra-files` + 行尾 `x-release-please-version` 标记，在
 * release PR 里连同 package.json 一起 bump 源码，那是版本号的唯一真源。
 * 本脚本只服务本地 `npm run deploy` / `npm run dev`：手改 package.json 后
 * 不必等 release PR 就能在本机看到正确版本号。
 *
 * ── 不硬编码文件名 ──
 * 上一版写死了 `src/client.ts`。2026-08-24 把 client.ts 拆成 10 个模块、
 * PLUGIN_VERSION 搬到 src/meta.ts 之后，这里直接 exit 1 —— 而它挂在
 * `npm run deploy` 的 `&&` 链首位，于是**整个 deploy 静默中断**，部署点留着
 * 上一版产物，页面显示旧版本号。查了半天才发现不是主题坏了，是构建没跑完。
 * 所以现在改成扫 src/ 找那个常量：源码怎么拆都不会再断。
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MARKER = "const PLUGIN_VERSION = '"

/** 递归列出 src 下所有 .ts */
function srcFiles(dir = 'src') {
  const out = []
  for (const e of readdirSync(resolve(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`
    if (e.isDirectory()) out.push(...srcFiles(rel))
    else if (e.name.endsWith('.ts')) out.push(rel)
  }
  return out
}

/** @returns {boolean} 文件是否被修改 */
export function syncVersion() {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  const hits = srcFiles().filter((f) => readFileSync(resolve(root, f), 'utf8').includes(MARKER))

  if (hits.length === 0) {
    console.error(`✗ src/ 下找不到 \`${MARKER}…\` —— 版本号常量被删或改名了`)
    process.exit(1)
  }
  if (hits.length > 1) {
    // 多处定义 = 版本号不再唯一，迟早漂移（这个仓库为此吃过版本四头分裂）
    console.error(`✗ PLUGIN_VERSION 在多个文件里定义：${hits.join(', ')} —— 版本号必须唯一`)
    process.exit(1)
  }

  const path = resolve(root, hits[0])
  const src = readFileSync(path, 'utf8')
  const at = src.indexOf(MARKER)
  const start = at + MARKER.length
  const end = src.indexOf("'", start)
  const current = src.slice(start, end)

  if (current === pkg.version) return false

  writeFileSync(path, src.slice(0, start) + pkg.version + src.slice(end))
  console.log(`✔ PLUGIN_VERSION: ${current} → ${pkg.version} (${hits[0]})`)
  return true
}

// 直接执行时跑一次（import 使用时跳过）
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncVersion()
}
