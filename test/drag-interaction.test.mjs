import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// Compile in memory: this exercises the real menu delegation, not a click-handler imitation.
const { outputFiles } = await build({
  stdin: {
    contents: `import * as drag from './src/drag.ts';
      import { buildSwitcherEl } from './src/switcher.ts';
      import { SWITCHER_CSS } from './src/css/switcher.ts';
      window.fixture = { ...drag, mount(saved) {
        const old = document.querySelector('.dsh-bloom-switcher');
        if (old) { drag.disableFloatingDrag(old); old.remove(); }
        localStorage.removeItem('dsh-bloom-variant-float-pos');
        if (saved !== undefined) localStorage.setItem('dsh-bloom-variant-float-pos', JSON.stringify(saved));
        const style = document.createElement('style'); style.textContent = SWITCHER_CSS; document.head.append(style);
        const el = buildSwitcherEl('mist'); el.dataset.floating = 'true'; document.body.append(el);
        drag.enableFloatingDrag(el); return el;
      }};`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  },
  bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})
const browser = await chromium.launch({
  executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
})
test.after(() => browser.close())

async function setup(t, saved) {
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 } })
  t.after(() => context.close())
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  t.after(() => assert.deepEqual(errors, []))
  await page.route('https://bloom.test/', route => route.fulfill({
    contentType: 'text/html', body: '<html><body></body></html>',
  }))
  await page.goto('https://bloom.test/')
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(saved => window.fixture.mount(saved), saved)
  return page
}
const root = page => page.locator('.dsh-bloom-switcher')
const trigger = page => page.locator('.dsh-bloom-trigger')
const menu = page => page.locator('.dsh-bloom-menu')
const position = page => root(page).boundingBox()
async function physicalDrag(page, dx, dy) {
  const box = await trigger(page).boundingBox()
  const x = box.x + box.width / 2, y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + dx, y + dy, { steps: 5 })
  await page.mouse.up()
}

test('undragged and reset controls remain docked right while saved drags keep their coordinates', async t => {
  const page = await setup(t)
  for (const width of [1200, 800]) {
    await page.setViewportSize({ width, height: 700 })
    await page.waitForFunction(() => {
      const e = document.querySelector('.dsh-bloom-switcher')
      return Math.abs(innerWidth - e.getBoundingClientRect().right - 16) < 1
    })
    assert.equal(await root(page).evaluate(el => el.style.left), '')
  }
  await physicalDrag(page, -150, 90)
  const dragged = await position(page)
  await page.setViewportSize({ width: 1200, height: 700 })
  assert.ok(Math.abs((await position(page)).x - dragged.x) < 1)
  await page.evaluate(() => window.fixture.resetFloatingPos(document.querySelector('.dsh-bloom-switcher')))
  await page.setViewportSize({ width: 1400, height: 700 })
  await page.waitForFunction(() => Math.abs(innerWidth - document.querySelector('.dsh-bloom-switcher').getBoundingClientRect().right - 16) < 1)
})

test('physical mouse clicks retain button target; drag suppresses only its trailing click', async t => {
  const page = await setup(t)
  // Mouse input matters here: dispatchEvent/click() in page JS bypass pointer capture retargeting.
  await trigger(page).click()
  assert.equal(await menu(page).isVisible(), true)
  await trigger(page).click()
  assert.equal(await menu(page).isVisible(), false)
  const before = await position(page)
  await physicalDrag(page, -150, 90)
  const after = await position(page)
  assert.ok(after.x < before.x - 100)
  assert.equal(await menu(page).isVisible(), false)
  assert.equal(await root(page).getAttribute('data-dragging'), null)
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('dsh-bloom-variant-float-pos')))
  assert.equal(saved.left, after.x)
  assert.equal(saved.top, after.y)
  await trigger(page).click()
  assert.equal(await menu(page).isVisible(), true)
  // Real option clicks must still select and close; menu pointer presses never start a drag.
  await page.locator('.dsh-bloom-option[data-variant="petal"]').click()
  await page.waitForFunction(() => document.body.dataset.bloomVariant === 'petal')
  assert.equal(await page.locator('body').getAttribute('data-bloom-variant'), 'petal')
  assert.equal(await menu(page).isVisible(), false)
  assert.equal(await root(page).getAttribute('data-dragging'), null)
})

test('subthreshold mouse jitter and keyboard activation stay usable', async t => {
  const page = await setup(t)
  const box = await trigger(page).boundingBox()
  await page.mouse.move(box.x + 15, box.y + 15)
  await page.mouse.down()
  await page.mouse.move(box.x + 16, box.y + 16)
  await page.mouse.up()
  assert.equal(await menu(page).isVisible(), true)
  await page.keyboard.press('Escape')
  await trigger(page).focus()
  await page.keyboard.press('Enter')
  assert.equal(await menu(page).isVisible(), true)
})

test('saved and live positions recover below titlebar on resize, including missing storage', async t => {
  const page = await setup(t, { left: 9000, top: -20 })
  assert.ok((await position(page)).y >= 84)
  assert.ok((await position(page)).x < 1000)
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--dsh-windows-titlebar-height', '110px')
    localStorage.removeItem('dsh-bloom-variant-float-pos')
    const el = document.querySelector('.dsh-bloom-switcher')
    el.style.top = '8px'; el.style.left = '900px'
  })
  await page.setViewportSize({ width: 500, height: 400 })
  await page.waitForFunction(() => document.querySelector('.dsh-bloom-switcher').getBoundingClientRect().top >= 118)
  let box = await position(page)
  assert.ok(box.y >= 118)
  assert.ok(box.x + box.width <= 492)
  await physicalDrag(page, 0, -300)
  assert.ok((await position(page)).y >= 118)
  await page.evaluate(() => window.fixture.resetFloatingPos(document.querySelector('.dsh-bloom-switcher')))
  assert.equal(await page.evaluate(() => localStorage.getItem('dsh-bloom-variant-float-pos')), null)
  assert.ok((await position(page)).y >= 118)
})

test('document fallback finishes a physical drag released outside the control', async t => {
  const page = await setup(t)
  await page.evaluate(() => {
    // Emulate a host where capture is unavailable; the real mouse release still reaches document.
    document.querySelector('.dsh-bloom-switcher').setPointerCapture = () => { throw new Error('capture unavailable') }
  })
  await physicalDrag(page, -100, -300)
  assert.equal(await root(page).getAttribute('data-dragging'), null)
  assert.ok((await position(page)).y >= 84)
  assert.ok(await page.evaluate(() => localStorage.getItem('dsh-bloom-variant-float-pos')))
  await trigger(page).click()
  assert.equal(await menu(page).isVisible(), true)
})

test('interrupted gesture, disposal and rebind release capture and listeners', async t => {
  const page = await setup(t)
  const box = await trigger(page).boundingBox()
  await page.mouse.move(box.x + 20, box.y + 15)
  await page.mouse.down()
  await page.mouse.move(box.x - 80, box.y + 65)
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  assert.equal(await root(page).getAttribute('data-dragging'), null)
  await page.mouse.up()
  await page.evaluate(() => {
    const el = document.querySelector('.dsh-bloom-switcher')
    window.fixture.disableFloatingDrag(el)
    window.fixture.disableFloatingDrag(el)
    el.style.left = '12px'; el.style.top = '12px'
    window.dispatchEvent(new Event('resize'))
  })
  assert.equal((await position(page)).y, 12)
  await page.evaluate(() => {
    const el = document.querySelector('.dsh-bloom-switcher')
    window.fixture.enableFloatingDrag(el)
    window.fixture.enableFloatingDrag(el)
  })
  assert.ok((await position(page)).y >= 84)
  await physicalDrag(page, -50, 30)
  assert.equal(await root(page).getAttribute('data-dragging'), null)
  assert.equal(await menu(page).isVisible(), false)
  await trigger(page).click()
  assert.equal(await menu(page).isVisible(), true)
})
