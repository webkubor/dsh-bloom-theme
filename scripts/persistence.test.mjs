/**
 * 持久化契约测试。
 *
 * 2026-09-17 补。clampPos 有专门的自检（check-drag.mjs，变异 4/4 全抓住），
 * 但同样「坏了用户自己恢复不了」的另外两条路径是零覆盖的：
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
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const meta = readFileSync(join(root, 'src/meta.ts'), 'utf8')
const bundle = readFileSync(join(root, 'lib/client.js'), 'utf8')

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

test('派生键 float-pos 也要稳定 —— 它存浮动按钮位置', () => {
  assert.ok(
    bundle.includes('dsh-bloom-variant-float-pos') || bundle.includes('-float-pos'),
    '浮动按钮位置键丢失会让用户拖过的位置失效，回到默认角落',
  )
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
  // 把 dom.ts 的 catch 拿掉，drag.ts 里还有两处，断言照样通过。
  // 必须逐处判定 —— 漏掉任何一处都足以让整个插件在隐私模式下失效。
  const files = ['src/dom.ts', 'src/drag.ts', 'src/switcher.ts']
  const unguarded = []
  for (const f of files) {
    const lines = readFileSync(join(root, f), 'utf8').split('\n')
    lines.forEach((line, i) => {
      if (!/localStorage\.(getItem|setItem|removeItem)/.test(line)) return
      // 两种写法都算受保护：
      //   ① 单行：try { localStorage.setItem(...) } catch {}
      //   ② 多行：try { \n ... localStorage ... \n } catch
      const inline = /try\s*\{[^}]*localStorage\.[^}]*\}\s*catch/.test(line)
      const before = lines.slice(Math.max(0, i - 6), i).join('\n')
      const after = lines.slice(i, i + 6).join('\n')
      const block = /try\s*\{/.test(before) && /catch/.test(after)
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
