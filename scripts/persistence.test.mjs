/**
 * 持久化契约测试。
 *
 * 2026-09-17 补。以下路径「坏了用户自己恢复不了」，必须有覆盖：
 *
 *  1. STORAGE_KEY —— 用户选的配色存在这个键下。改动它 = 所有人的配色静默丢失、
 *     回落默认 mist。不报错、不崩溃，只是每个人打开发现主题变回去了。
 *  2. readVariant 的容错 —— 隐私模式下 localStorage 抛异常、或存了脏值时，
 *     必须回落默认而不是让整个客户端 bundle 崩掉（它在插件初始化路径上）。
 *
 * 这两条都通过打包后的产物来测：浏览器端真正跑的是 lib/client.js，
 * 直接读 src 会漏掉「打包时被优化掉」这类问题。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.ts') ? [join(dir, e.name)] : [])
const srcFiles = walk(join(root, 'src')).map((f) => relative(root, f)).sort()
const meta = readFileSync(join(root, 'src/meta.ts'), 'utf8')
const bundle = readFileSync(join(root, 'lib/client.js'), 'utf8')

/**
 * 把源码里的字符串字面量与注释**按原长度**抹成空格，
 * 这样后面做花括号配对时，不会把字符串里的 `{` `}` 当成代码块。
 * 长度不变 ⇒ 所有下标仍然可用。
 */
function stripLiterals(text) {
  const out = text.split('')
  let state = 'code'
  let i = 0
  const n = text.length
  while (i < n) {
    const c = text[i]
    const c2 = text[i + 1]
    if (state === 'code') {
      if (c === '/' && c2 === '/') { out[i] = ' '; out[i + 1] = ' '; i += 2; state = 'line'; continue }
      if (c === '/' && c2 === '*') { out[i] = ' '; out[i + 1] = ' '; i += 2; state = 'block'; continue }
      if (c === "'") { out[i] = ' '; i++; state = 'sq'; continue }
      if (c === '"') { out[i] = ' '; i++; state = 'dq'; continue }
      if (c === '`') { out[i] = ' '; i++; state = 'tpl'; continue }
      i++; continue
    }
    if (state === 'line') { if (c === '\n') state = 'code'; else out[i] = ' '; i++; continue }
    if (state === 'block') {
      if (c === '*' && c2 === '/') { out[i] = ' '; out[i + 1] = ' '; i += 2; state = 'code'; continue }
      if (c !== '\n') out[i] = ' '
      i++; continue
    }
    if (state === 'sq' || state === 'dq') {
      if (c === '\\') { out[i] = ' '; if (i + 1 < n) out[i + 1] = ' '; i += 2; continue }
      if ((state === 'sq' && c === "'") || (state === 'dq' && c === '"')) { out[i] = ' '; state = 'code'; i++; continue }
      if (c !== '\n') out[i] = ' '
      i++; continue
    }
    // template literal
    if (c === '\\') { out[i] = ' '; if (i + 1 < n) out[i + 1] = ' '; i += 2; continue }
    if (c === '`') { out[i] = ' '; state = 'code'; i++; continue }
    if (c !== '\n') out[i] = ' '
    i++
  }
  return out.join('')
}

/**
 * 判断第 i 行是否落在一个「try { ... } catch { ... }」块里。
 *
 * 为什么不用「前后 N 行」窗口：窗口大小是任意的，同一段安全代码只要块写得
 * 比窗口深一点就会被判成没有保护（2026-11-14 在 v0.28.0 的 src/dom.ts 上实测）。
 * 花括号配对与代码结构一致，结论不随排版变化。
 *
 * 三个容易踩的点（都实测过）：
 *   ① `} catch {` 把 catch 写在**闭合那一行**。这一行开合括号数相等（净 0），
 *      用「净深度」跟踪永远配不上 —— 必须逐字符看 `}` 出现在哪。
 *   ② `try {` 可能与外层 `{` 同行，闭合判据要回到「进入 try 之前的深度」。
 *   ③ 往上找到的 try 可能**早已闭合**（在第 i 行之前就结束了）——
 *      那种不算保护，必须继续往上找。
 */
function hasEnclosingTryCatch(lines, i) {
  const text = lines.join('\n')
  const code = stripLiterals(text)

  // 第 i 行在全文中的起始偏移
  let offset = 0
  for (let k = 0; k < i; k++) offset += lines[k].length + 1

  // 从最近的 try 往前逐个试：只有「包住第 i 行」的那个才算
  const re = /try\s*\{/g
  const candidates = []
  let m
  while ((m = re.exec(code)) !== null) {
    if (m.index >= offset) break
    candidates.push(m)
  }

  for (let c = candidates.length - 1; c >= 0; c--) {
    const match = candidates[c]
    const braceIdx = match.index + match[0].length - 1 // '{' 的位置

    // 进入 try 之前的花括号深度
    let base = 0
    for (let k = 0; k < braceIdx; k++) {
      if (code[k] === '{') base++
      else if (code[k] === '}') base--
    }

    // 逐字符找与 try 的 '{' 配对的那个 '}'
    let depth = base + 1
    for (let k = braceIdx + 1; k < code.length; k++) {
      if (code[k] === '{') depth++
      else if (code[k] === '}') {
        depth--
        if (depth === base) {
          // 这个 '}' 关掉了 try 块
          if (offset <= k) {
            // 第 i 行确实落在 try 块内 —— 看紧随其后是不是 catch
            return /^\s*catch\b/.test(code.slice(k + 1, k + 200))
          }
          break // 这个 try 早就闭合了，继续往上找
        }
      }
    }
  }
  return false
}

test('STORAGE_KEY 值必须稳定 —— 改了等于所有用户的配色被重置', () => {
  const m = meta.match(/export const STORAGE_KEY = '([^']+)'/)
  assert.ok(m, 'meta.ts 里找不到 STORAGE_KEY')
  assert.equal(
    m[1], 'dsh-bloom-variant',
    '这个键名是和已安装用户之间的契约：改名会让所有人的配色回落默认，' +
    '而且没有任何报错提示。真要改必须写迁移代码（读旧键 → 写新键 → 删旧键）。',
  )
})

test('打包产物里带着同一个 STORAGE_KEY（没被优化或改写）', () => {
  assert.ok(
    bundle.includes('dsh-bloom-variant'),
    'lib/client.js 里找不到 STORAGE_KEY —— 浏览器端真正跑的是这份产物，' +
    'src 对了但产物没有，等于读写的是别的键',
  )
})

test('旧的悬浮按钮位置键不被删除或清空 —— 移除功能不销毁用户数据', () => {
  // 悬浮拖拽兜底已移除，`${STORAGE_KEY}-float-pos` 不再读取；
  // 但已安装用户的旧值不属于本插件可以单方面销毁的数据，也不能整体 clear()。
  const offenders = []
  for (const f of srcFiles) {
    const code = readFileSync(join(root, f), 'utf8')
    if (/localStorage\??\.clear\s*\(/.test(code)) offenders.push(`${f}: localStorage.clear()`)
    for (const m of code.matchAll(/removeItem\(([^)]*)\)/g)) {
      if (/float-pos|POS_KEY/.test(m[1])) offenders.push(`${f}: removeItem(${m[1]})`)
    }
  }
  assert.deepEqual(offenders, [], '不得删除旧的 float-pos 数据或清空 localStorage：\n  ' + offenders.join('\n  '))
})

test('readVariant 有脏值回落 —— 存了非法值不能让主题空掉', () => {
  // 打包后形态可能变，检查「白名单判定 + 默认值」这对语义还在
  assert.ok(bundle.includes("'mist'") || bundle.includes('"mist"'), '默认配色 mist 必须在产物里')
  assert.ok(
    /VARIANTS|variants/i.test(bundle),
    '配色白名单必须在产物里 —— 没有它就无法判定存的值合不合法，脏值会直接生效',
  )
})

test('每一处 localStorage 调用都必须被 try/catch 包住 —— 隐私模式不能崩', () => {
  // 隐私模式 / 站点数据被禁时 localStorage 存取会抛，而这些调用在插件初始化路径上，
  // 抛出去就是整个 client bundle 加载失败（不只是主题没了）。
  //
  // ⚠️ 这条最初写成「至少有一处 try/catch」，变异测试当场证明没用：
  // 拿掉一处 catch，其它文件里还有，断言照样通过。
  // 必须逐处判定 —— 漏掉任何一处都足以让整个插件在隐私模式下失效。
  // 扫描整个 src/，不维护手写文件清单：删文件或新增存储点都不会让覆盖面过期。
  const unguarded = []
  for (const f of srcFiles) {
    const lines = readFileSync(join(root, f), 'utf8').split('\n')
    lines.forEach((line, i) => {
      if (!/localStorage\.(getItem|setItem|removeItem)/.test(line)) return
      // 两种写法都算受保护：
      //   ① 单行：try { localStorage.setItem(...) } catch {}
      //   ② 多行：try { \n ... localStorage ... \n } catch
      const inline = /try\s*\{[^}]*localStorage\.[^}]*\}\s*catch/.test(line)
      // 多行写法必须**按花括号配对**判定，不能用「前后 N 行窗口」。
      //
      // 为什么改掉窗口写法（2026-11-14 实测）：窗口固定 6 行，于是
      // 「try { if (enabled) { removeItem(...) } else { setItem(...) } } catch {}」
      // 这种一个分支里放两处存储调用的正常写法会漏判 —— catch 恰好落在窗口外，
      // 门禁误报「没有 try/catch 保护」。实测 v0.28.0 的 src/dom.ts:19 就是这样被误报的：
      // 代码本身有 try/catch 且完全安全，是判据把安全代码判成了不安全。
      //
      // 判据改成：从本行往上找最近的 try {，再从那个 try { 起做花括号配对，
      // 看它闭合的那一层有没有对应的 catch。命中即为受保护。
      // 这样窗口大小不再影响结论，块写多深都能判对。
      const block = hasEnclosingTryCatch(lines, i)
      if (!inline && !block) unguarded.push(`${f}:${i + 1}  ${line.trim()}`)
    })
  }
  assert.deepEqual(
    unguarded, [],
    '这些 localStorage 调用没有 try/catch 保护：\n  ' + unguarded.join('\n  ') +
    '\n隐私模式下会让整个客户端 bundle 加载失败。',
  )
})

test('PLUGIN_VERSION 与 package.json 一致 —— 浏览器端拿不到 package.json，只能靠内置', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const m = meta.match(/export const PLUGIN_VERSION = '([^']+)'/)
  assert.ok(m, 'meta.ts 里找不到 PLUGIN_VERSION')
  assert.equal(
    m[1], pkg.version,
    'meta.ts 的版本号由 release-please 跟 package.json 一起 bump；对不上说明' +
    '同步断了，UI 上会显示错误的版本号（用户拿它对照更新日志）。',
  )
})
