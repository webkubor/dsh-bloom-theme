#!/usr/bin/env node
/**
 * clampPos 自检。
 *
 * 为什么单独给它一个可运行的检查：这是 #14 那条浮动按钮唯一的安全网。
 * clamp 一旦算错，按钮会被推到视口之外——而它是 position:fixed，
 * 出界就再也点不到，用户连"拖回来"都做不到，只能去清 localStorage。
 * 静态门禁看不出算术错误，所以这里真的跑一遍。
 */
import { buildSync } from 'esbuild'
import assert from 'node:assert/strict'

const { outputFiles } = buildSync({
  entryPoints: ['src/drag.ts'],
  bundle: true, format: 'esm', write: false, platform: 'neutral',
})
const { clampPos } = await import(
  'data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64')
)

const M = 8   // 与 drag.ts 的 MARGIN 一致
const [W, H, VW, VH] = [40, 32, 1000, 800]

// 1. 视口内的位置原样保留
assert.deepEqual(clampPos({ left: 100, top: 100 }, W, H, VW, VH), { left: 100, top: 100 })
// 2. 超出右/下边界 → 夹到「视口 - 元素 - 边距」
assert.deepEqual(clampPos({ left: 9999, top: 9999 }, W, H, VW, VH),
  { left: VW - W - M, top: VH - H - M })
// 3. 负坐标（窗口缩小后旧位置变负） → 夹到边距
assert.deepEqual(clampPos({ left: -50, top: -50 }, W, H, VW, VH), { left: M, top: M })
// 4. 视口比元素还小（极端窄窗）→ 至少不能是负数，否则按钮飞出左上角
const tiny = clampPos({ left: -10, top: -10 }, 400, 300, 100, 80)
assert.ok(tiny.left >= 0 && tiny.top >= 0, `视口过小时出界: ${JSON.stringify(tiny)}`)

console.log('  \x1b[32m✓\x1b[0m clampPos 边界正确（视口内 / 超界 / 负值 / 视口过小）')
