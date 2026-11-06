import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// 星辉层契约（断言计算后样式，不断言源码字符串）：
// 1. 深浅模式都出现；浅色跟随主题色渐变，深色保留白色辉光
// 2. 图层只占右上角，不铺满正文也不吃指针
// 3. 光点真的在动（两条动画都挂上，且 drift 位移非零）
// 4. 种子稳定：两次生成的布局完全一致

const { outputFiles } = await build({
  stdin: {
    contents: `import './test/slot-fixture.mjs';
      import * as React from 'react';
      import { createBloomComponents } from './src/ui.ts';
      import { buildSparkles } from './src/starlight.ts';
      import { GLASS_CSS } from './src/css/glass.ts';
      const { Decorations } = createBloomComponents(React, () => () => {});
      window.fixture = { mount: () => window.fixtureSlots.inject('shell.overlay', () => window.fixtureSlots.register({name:'shell.overlay', id:'dsh-bloom-theme.decorations', order:-100}, Decorations)), buildSparkles, GLASS_CSS };`,
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
    window.fixture.mount()
  })
  return page
}

test('sparkle layer shows in dark mode without covering content or catching the pointer', async t => {
  const page = await setup(t, true)
  const info = await page.evaluate(() => {
    const el = document.getElementById('dsh-bloom-sparkles')
    const cs = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    return { display: cs.display, position: cs.position, z: cs.zIndex, pe: cs.pointerEvents, dots: el.children.length, width: rect.width, height: rect.height, bg: cs.backgroundImage }
  })
  assert.equal(info.display, 'block')
  assert.equal(info.position, 'fixed')
  assert.equal(info.z, '0')
  assert.equal(info.bg, 'none', 'overlay cannot wash the transcript with a full-screen glow')
  assert.equal(info.width, 360)
  assert.equal(info.height, 220)
  assert.equal(info.pe, 'none')
  assert.ok(info.dots >= 40, `expected many dots, got ${info.dots}`)
})

test('light sparkles stay visible and change gradient with the theme without recreating dots', async t => {
  const page = await setup(t, false)
  const result = await page.evaluate(() => {
    const layer = document.getElementById('dsh-bloom-sparkles')
    const dot = layer.firstElementChild
    document.body.style.setProperty('--bloom-accent', '#b63d73')
    const pink = getComputedStyle(dot).backgroundImage
    document.body.style.setProperty('--bloom-accent', '#297cb5')
    const blue = getComputedStyle(dot).backgroundImage
    return { display: getComputedStyle(layer).display, pink, blue,
      same: dot === layer.firstElementChild, names: getComputedStyle(dot).animationName,
      pointer: getComputedStyle(layer).pointerEvents }
  })
  assert.equal(result.display, 'block')
  assert.match(result.pink, /linear-gradient/)
  assert.match(result.blue, /linear-gradient/)
  assert.notEqual(result.pink, result.blue)
  assert.equal(result.same, true)
  assert.match(result.names, /bloom-spark-drift/)
  assert.equal(result.pointer, 'none')
})

test('switching to dark preserves white highlights and both animation timelines', async t => {
  const page = await setup(t, false)
  const result = await page.evaluate(() => {
    const dot = document.querySelector('#dsh-bloom-sparkles > i:not(.t)')
    const before = getComputedStyle(dot).animationDuration
    document.body.setAttribute('data-ds-dark-theme', '')
    const cs = getComputedStyle(dot)
    return { bg: cs.backgroundColor, image: cs.backgroundImage,
      before, after: cs.animationDuration, display: getComputedStyle(dot.parentElement).display }
  })
  assert.equal(result.bg, 'rgb(255, 255, 255)')
  assert.equal(result.image, 'none')
  assert.equal(result.before, result.after)
  assert.equal(result.display, 'block')
})

for (const dark of [false, true]) {
  test(`reduced motion keeps ${dark ? 'dark' : 'light'} sparkles visible and static`, async t => {
    const page = await setup(t, dark)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const state = await page.locator('#dsh-bloom-sparkles > i').first().evaluate(dot => ({
      animation: getComputedStyle(dot).animationName,
      opacity: getComputedStyle(dot).opacity,
      display: getComputedStyle(dot.parentElement).display,
    }))
    assert.equal(state.animation, 'none')
    assert.ok(Number(state.opacity) > 0)
    assert.equal(state.display, 'block')
  })
}

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

test('layout is seed-stable and React remount keeps one layer', async t => {
  const page = await setup(t, true)
  const same = await page.evaluate(() => {
    const a = window.fixture.buildSparkles(document).innerHTML
    const b = window.fixture.buildSparkles(document).innerHTML
    window.unmountFixtureSlot('shell.overlay')
    if (document.getElementById('dsh-bloom-sparkles')) return false
    window.remountFixtureSlot('shell.overlay')
    return a === b && document.querySelectorAll('#dsh-bloom-sparkles').length === 1
  })
  assert.ok(same)
})
