import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// 2026-11-04 新增：系统适配层（prefers-reduced-transparency / prefers-contrast /
// forced-colors / data-input-modality / pointer:coarse）+ 用户自选的玻璃档位。
//
// 这组测试守的是「降级必须真的生效」—— 2026-11-04 连续三轮都栽在
// 选择器作用域拼错（body 套 body）上，规则静默失效、看着像没做。
// 所以每条都断言**计算后的样式**，而不是断言样式表里有那行字。

const { outputFiles } = await build({
  stdin: {
    contents: `import { ADAPTIVE_CSS } from './src/css/adaptive.ts';
      import { GLASS_CSS } from './src/css/glass.ts';
      import { readGlassMode, writeGlassMode, effectiveGlassMode, initGlassMode } from './src/glass.ts';
      window.fixture = { ADAPTIVE_CSS, GLASS_CSS, readGlassMode, writeGlassMode, effectiveGlassMode, initGlassMode };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})

const browser = await chromium.launch({
  executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
})
test.after(() => browser.close())

const SIDEBAR = '<div class="pI_x6G_sidebarCol"></div>'

async function setup(t, { html = SIDEBAR } = {}) {
  const context = await browser.newContext()
  t.after(() => context.close())
  const page = await context.newPage()
  await page.route('https://bloom.test/', route => route.fulfill({
    contentType: 'text/html',
    body: `<html><body data-bloom-variant="mist">${html}</body></html>`,
  }))
  await page.goto('https://bloom.test/')
  await page.addScriptTag({ content: outputFiles[0].text })
  // 两份都要注入：玻璃层（glass.css）提供 24px 的基础值，适配层（adaptive.css）
  // 在它上面做降级。只注入适配层的话，基础值不存在，降级断言就没有对照。
  await page.evaluate(() => {
    for (const css of [window.fixture.GLASS_CSS, window.fixture.ADAPTIVE_CSS]) {
      const style = document.createElement('style')
      style.textContent = css
      document.head.appendChild(style)
    }
    document.body.dataset.bloomVariant = 'mist'
  })
  return page
}

/** 侧栏玻璃挂在 ::before 上 —— 必须读伪元素的计算值。 */
const sidebarBlur = (page) => page.evaluate(() =>
  getComputedStyle(document.querySelector('[class*="sidebarCol"]'), '::before').backdropFilter)

/** 用 CDP 设媒体特性：Playwright 的 emulateMedia 不认 reduced-transparency。 */
async function emulate(page, features) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setEmulatedMedia', { features })
  await page.waitForTimeout(300)
  return cdp
}

test('the default keeps the full frosted glass', async t => {
  const page = await setup(t)
  assert.match(await sidebarBlur(page), /blur\(24px\)/)
})

test('the soft tier halves the blur and drops the saturation', async t => {
  const page = await setup(t)
  await page.evaluate(() => window.fixture.writeGlassMode('soft'))
  const blur = await sidebarBlur(page)
  assert.match(blur, /blur\(8px\)/)
  assert.doesNotMatch(blur, /saturate\(1\.3\)/)
})

test('the solid tier removes the blur entirely', async t => {
  const page = await setup(t)
  await page.evaluate(() => window.fixture.writeGlassMode('solid'))
  assert.equal(await sidebarBlur(page), 'none')
})

test('the tier is remembered across reloads', async t => {
  const page = await setup(t)
  await page.evaluate(() => window.fixture.writeGlassMode('soft'))
  assert.equal(await page.evaluate(() => window.fixture.readGlassMode()), 'soft')
  await page.reload()
  await page.addScriptTag({ content: outputFiles[0].text })
  assert.equal(await page.evaluate(() => window.fixture.readGlassMode()), 'soft')
})

test('an explicit tier survives a system transparency request', async t => {
  const page = await setup(t)
  await emulate(page, [{ name: 'prefers-reduced-transparency', value: 'reduce' }])
  // 用户明确选了「通透」→ 不被系统推翻
  await page.evaluate(() => window.fixture.writeGlassMode('glass'))
  assert.match(await sidebarBlur(page), /blur\(24px\)/)
})

test('the system transparency request downgrades an untouched theme', async t => {
  const page = await setup(t)
  await emulate(page, [{ name: 'prefers-reduced-transparency', value: 'reduce' }])
  assert.equal(await sidebarBlur(page), 'none')
})

test('more contrast removes the blur and deepens the hairline', async t => {
  const page = await setup(t)
  await emulate(page, [{ name: 'prefers-contrast', value: 'more' }])
  assert.equal(await sidebarBlur(page), 'none')
})

test('forced colors removes the blur and the ambient gradient', async t => {
  const page = await setup(t)
  await emulate(page, [{ name: 'forced-colors', value: 'active' }])
  assert.equal(await sidebarBlur(page), 'none')
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage)
  assert.equal(bg, 'none')
})

test('the mouse modality hides the focus ring but keeps it on inputs', async t => {
  const page = await setup(t, {
    html: `${SIDEBAR}<button id="btn">b</button><input id="inp" />`,
  })
  await page.evaluate(() => document.documentElement.dataset.inputModality = 'pointer')
  // 宿主的焦点环样式：outline-color 走 --dsw-focus-ring-color 变量。
  await page.addStyleTag({
    content: `:focus-visible { outline: 2px solid var(--dsw-focus-ring-color, red); }`,
  })
  await page.locator('#btn').focus()
  const btnRing = await page.evaluate(() =>
    getComputedStyle(document.querySelector('#btn')).getPropertyValue('--dsw-focus-ring-color').trim())
  assert.equal(btnRing, 'transparent')
  await page.locator('#inp').focus()
  const inpRing = await page.evaluate(() =>
    getComputedStyle(document.querySelector('#inp')).getPropertyValue('--dsw-focus-ring-color').trim())
  assert.notEqual(inpRing, 'transparent')
})

test('a coarse pointer grows the tappable rows', async t => {
  // 触屏要走真实的触屏上下文：CDP 的 Emulation.setEmulatedMedia 改不了
  // (pointer: coarse) 这个媒体特性（实测 matchMedia 仍返回 false）。
  const context = await browser.newContext({ hasTouch: true, isMobile: true })
  t.after(() => context.close())
  const page = await context.newPage()
  await page.route('https://bloom.test/', route => route.fulfill({
    contentType: 'text/html',
    body: `<html><body data-bloom-variant="mist">${SIDEBAR}</body></html>`,
  }))
  await page.goto('https://bloom.test/')
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => {
    for (const css of [window.fixture.GLASS_CSS, window.fixture.ADAPTIVE_CSS]) {
      const style = document.createElement('style')
      style.textContent = css
      document.head.appendChild(style)
    }
  })
  assert.equal(await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches), true)
  const minHeight = await page.evaluate(() => {
    const el = document.createElement('div')
    el.className = 'dsh-bloom-option'
    document.body.appendChild(el)
    return getComputedStyle(el).minHeight
  })
  assert.equal(minHeight, '44px')
})

test('print emulation drops the decorations and the switcher', async t => {
  const page = await setup(t)
  // 切换器在 DOM 里但默认隐藏 —— 先手动摆一个可见的出来测 display:none
  await page.evaluate(() => {
    const el = document.createElement('div')
    el.className = 'dsh-bloom-trigger'
    el.textContent = 'x'
    document.body.appendChild(el)
  })
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setEmulatedMedia', { features: [], media: 'print' })
  await page.waitForTimeout(300)
  assert.equal(await page.evaluate(() =>
    getComputedStyle(document.querySelector('[class*="sidebarCol"]'), '::before').backdropFilter), 'none')
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundImage), 'none')
  assert.equal(await page.evaluate(() =>
    getComputedStyle(document.querySelector('.dsh-bloom-trigger')).display), 'none')
})

test('the effective tier reports the system downgrade to the panel', async t => {
  const page = await setup(t)
  await emulate(page, [{ name: 'prefers-reduced-transparency', value: 'reduce' }])
  await page.evaluate(() => window.fixture.initGlassMode())
  assert.equal(await page.evaluate(() => window.fixture.effectiveGlassMode()), 'solid')
  await page.evaluate(() => window.fixture.writeGlassMode('glass'))
  assert.equal(await page.evaluate(() => window.fixture.effectiveGlassMode()), 'glass')
})
