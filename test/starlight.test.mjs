import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// 星辉层契约（断言计算后样式，不断言源码字符串）：
// 1. 深色下出现、浅色下 display:none
// 2. 层在内容之下且不吃指针
// 3. 光点真的在动（两条动画都挂上，且 drift 位移非零）
// 4. 种子稳定：两次生成的布局完全一致

const { outputFiles } = await build({
  stdin: {
    contents: `import { initStarlight, buildSparkles } from './src/starlight.ts';
      import { GLASS_CSS } from './src/css/glass.ts';
      window.fixture = { initStarlight, buildSparkles, GLASS_CSS };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
    loader: 'ts',
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
})

const browser = await chromium.launch({
  executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined,
})
test.after(() => browser.close())

async function setup(t, dark) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } })
  t.after(() => context.close())
  const page = await context.newPage()
  await page.setContent(`<!doctype html><html><body data-bloom-variant="mist"${dark ? ' data-ds-dark-theme' : ''}></body></html>`)
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => {
    const st = document.createElement('style')
    st.textContent = window.fixture.GLASS_CSS
    document.head.appendChild(st)
    window.fixture.initStarlight()
  })
  return page
}

test('sparkle layer shows in dark mode, beneath content, without catching the pointer', async t => {
  const page = await setup(t, true)
  const info = await page.evaluate(() => {
    const el = document.getElementById('dsh-bloom-sparkles')
    const cs = getComputedStyle(el)
    return { display: cs.display, position: cs.position, z: cs.zIndex, pe: cs.pointerEvents, dots: el.children.length }
  })
  assert.equal(info.display, 'block')
  assert.equal(info.position, 'fixed')
  assert.equal(info.z, '-1')
  assert.equal(info.pe, 'none')
  assert.ok(info.dots >= 40, `expected many dots, got ${info.dots}`)
})

test('sparkle layer is hidden in light mode', async t => {
  const page = await setup(t, false)
  const display = await page.evaluate(() => getComputedStyle(document.getElementById('dsh-bloom-sparkles')).display)
  assert.equal(display, 'none')
})

test('dots actually animate: drift + twinkle with a non-zero offset', async t => {
  const page = await setup(t, true)
  const dot = await page.evaluate(() => {
    const i = document.querySelector('#dsh-bloom-sparkles > i')
    const cs = getComputedStyle(i)
    return { names: cs.animationName, dx: i.style.getPropertyValue('--dx'), dy: i.style.getPropertyValue('--dy') }
  })
  assert.match(dot.names, /bloom-spark-drift/)
  assert.match(dot.names, /bloom-spark-twinkle/)
  assert.notEqual(parseFloat(dot.dx) + parseFloat(dot.dy), 0)
})

test('layout is seed-stable and init is idempotent', async t => {
  const page = await setup(t, true)
  const same = await page.evaluate(() => {
    const a = window.fixture.buildSparkles(document).innerHTML
    const b = window.fixture.buildSparkles(document).innerHTML
    window.fixture.initStarlight()
    return a === b && document.querySelectorAll('#dsh-bloom-sparkles').length === 1
  })
  assert.ok(same)
})
