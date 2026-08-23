#!/usr/bin/env node
/**
 * 把 package.json 的 version 同步进 src/client.ts 的 PLUGIN_VERSION 常量。
 *
 * 为什么需要：client 在浏览器端拿不到 package.json（DSH 只 serve roster 里的
 * client.js，/plugins/<id>/package.json 返回空）。更新检测要拿「当前装的版本」
 * 跟 npm latest 比，只能内置。
 *
 * v0.5.0 起前端改为 TS（src/*.ts → lib/*.js）：这里同步**源码** src/client.ts，
 * 再由 build（tsc）编译出带正确版本号的 lib/client.js。若直接改 lib/client.js，
 * 下一次 build 会把版本号覆盖回源码里的旧值 —— 必须同步到源码侧。
 *
 * 由 deploy / dev / prepublishOnly 在 build 之前调用，幂等；version 没变不改文件。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** @returns {boolean} 文件是否被修改 */
export function syncVersion() {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  const clientPath = resolve(root, 'src/client.ts')
  const src = readFileSync(clientPath, 'utf8')

  const marker = "const PLUGIN_VERSION = '"
  const at = src.indexOf(marker)
  if (at === -1) {
    console.error(`✗ src/client.ts 里找不到 "${marker}" 常量，无法同步版本号`)
    process.exit(1)
  }
  const start = at + marker.length
  const end = src.indexOf("'", start)
  const current = src.slice(start, end)

  if (current === pkg.version) return false

  writeFileSync(clientPath, src.slice(0, start) + pkg.version + src.slice(end))
  console.log(`✔ PLUGIN_VERSION: ${current} → ${pkg.version} (src/client.ts)`)
  return true
}

// 直接执行时跑一次（import 使用时跳过）
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncVersion()
}
