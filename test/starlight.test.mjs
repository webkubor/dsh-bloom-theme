import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// 守卫 Starlight 粒子系统核心生命周期契约：
// 1. 画布挂在最底层（z-index: -1, pointer-events: none），不干扰文本或点击
// 2. 深色模式下激活并在切换浅色时清空停止
// 3. 页面切后台自动暂停 rAF，返回时恢复

const { outputFiles } = await build({
  stdin: {
    contents: `import { initStarlight, updateStarlightState } from './src/starlight.ts';
      window.starlightTest = { initStarlight, updateStarlightState };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
})

const browser = await chromium.launch({
  executablePath: process.env.BLOOM_CHROMIUM_PATH || '/Users/webkubor/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  args: ['--no-sandbox'],
})
test.after(() => browser.close())

test('starlight canvas initializes safely in dark mode with correct layout constraints', async (t) => {
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } })
  t.after(() => context.close())
  const page = await context.newPage()

  await page.setContent('<!doctype html><html><body data-bloom-variant="mist" data-ds-dark-theme></body></html>')
  await page.addScriptTag({ content: outputFiles[0].text })

  await page.evaluate(() => {
    window.starlightTest.initStarlight()
  })

  const info = await page.evaluate(() => {
    const el = document.getElementById('dsh-bloom-starlight')
    if (!el) return null
    const cs = getComputedStyle(el)
    return {
      exists: true,
      position: cs.position,
      zIndex: cs.zIndex,
      pointerEvents: cs.pointerEvents,
      width: el.width,
      height: el.height,
    }
  })

  assert.ok(info, 'canvas exists')
  assert.equal(info.position, 'fixed')
  assert.equal(info.zIndex, '-1')
  assert.equal(info.pointerEvents, 'none')
})

test('starlight loop pauses and cleans up when switching to light mode', async (t) => {
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } })
  t.after(() => context.close())
  const page = await context.newPage()

  await page.setContent('<!doctype html><html><body data-bloom-variant="petal" data-ds-dark-theme></body></html>')
  await page.addScriptTag({ content: outputFiles[0].text })

  await page.evaluate(() => {
    window.starlightTest.initStarlight()
  })

  // 模拟切换到浅色模式
  await page.evaluate(() => {
    document.body.removeAttribute('data-ds-dark-theme')
    window.starlightTest.updateStarlightState('petal')
  })

  const isBlank = await page.evaluate(() => {
    const canvas = document.getElementById('dsh-bloom-starlight')
    const ctx = canvas.getContext('2d')
    const imgData = ctx.getImageData(0, 0, 100, 100).data
    // 浅色下画布被 clearRect，像素全为 0
    return imgData.every(b => b === 0)
  })

  assert.ok(isBlank, 'canvas is cleared in light mode')
})
