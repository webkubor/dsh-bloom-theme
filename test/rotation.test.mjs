import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: {
    contents: `import { buildSwitcherEl, applyVariant } from './src/switcher.ts';
      import { SWITCHER_CSS } from './src/css/switcher.ts';
      window.fixture = { buildSwitcherEl, applyVariant, SWITCHER_CSS };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())
async function setup(t, saved = 'mist') {
  const context = await browser.newContext()
  t.after(() => context.close())
  const page = await context.newPage()
  await page.route('https://bloom.test/', route => route.fulfill({ contentType: 'text/html', body: '<html><body><header></header></body></html>' }))
  await page.goto('https://bloom.test/')
  await page.clock.install()
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(variant => {
    localStorage.setItem('dsh-bloom-variant', variant)
    const s = document.createElement('style'); s.textContent = window.fixture.SWITCHER_CSS; document.head.append(s)
    window.fixture.applyVariant(variant)
    document.body.append(window.fixture.buildSwitcherEl(variant))
  }, saved)
  return page
}

const current = page => page.locator('body').getAttribute('data-bloom-variant')
test('legacy saved color stays visible until user selects a featured color', async t => {
  const page = await setup(t, 'stone')
  await page.locator('.dsh-bloom-trigger').click()
  assert.equal(await page.locator('.dsh-bloom-option').count(), 10)
  assert.equal(await page.locator('[data-variant="stone"]').count(), 1)
  assert.equal(await page.locator('[data-variant="silverrose"]').count(), 1)
  assert.equal(await page.locator('[data-variant="dawn"]').count(), 1)
  await page.locator('.dsh-bloom-option[data-variant="dawn"]').click()
  await page.locator('.dsh-bloom-trigger').click()
  assert.equal(await page.locator('.dsh-bloom-option').count(), 9)
  assert.equal(await page.locator('[data-variant="stone"]').count(), 0)
  assert.equal(await current(page), 'dawn')
})

test('rotation starts off, changes after its interval, resets after manual selection, and pauses when hidden', async t => {
  const page = await setup(t)
  await page.clock.fastForward(6 * 60_000)
  assert.equal(await current(page), 'mist')
  await page.locator('.dsh-bloom-trigger').click()
  await page.locator('.dsh-bloom-rotation__select').selectOption('5')
  await page.clock.fastForward(5 * 60_000 + 5)
  await page.waitForFunction(() => document.body.dataset.bloomVariant !== 'mist')
  const first = await current(page)
  assert.notEqual(first, 'mist')
  assert.ok(await page.evaluate(() => localStorage.getItem('dsh-bloom-variant')))
  await page.evaluate(() => {
    if (document.querySelector('.dsh-bloom-menu').hidden) document.querySelector('.dsh-bloom-trigger').click()
  })
  await page.locator('.dsh-bloom-option[data-variant="petal"]').click()
  await page.waitForFunction(() => document.body.dataset.bloomVariant === 'petal')
  await page.clock.fastForward(4 * 60_000)
  assert.equal(await current(page), 'petal')
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')) })
  await page.clock.fastForward(20 * 60_000)
  assert.equal(await current(page), 'petal')
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')) })
  await page.clock.fastForward(5 * 60_000 + 5)
  await page.waitForFunction(() => document.body.dataset.bloomVariant !== 'petal')
  assert.notEqual(await current(page), 'petal')
  const second = await current(page)
  await page.clock.fastForward(5 * 60_000 + 5)
  await page.waitForFunction(previous => document.body.dataset.bloomVariant !== previous, second)
})

test('denied storage writes do not prevent turning rotation off', async t => {
  const page = await setup(t)
  await page.locator('.dsh-bloom-trigger').click()
  await page.locator('.dsh-bloom-rotation__select').selectOption('5')
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Denied', 'QuotaExceededError') }
  })
  await page.locator('.dsh-bloom-rotation__select').selectOption('0')
  assert.equal(await page.evaluate(() => localStorage.getItem('dsh-bloom-variant-rotation-minutes')), '5')
  await page.clock.fastForward(16 * 60_000)
  assert.equal(await current(page), 'mist')
  // A rerender must show the in-memory choice, rather than the stale persisted value.
  await page.evaluate(() => {
    const e = document.querySelector('.dsh-bloom-switcher')
    e.replaceWith(window.fixture.buildSwitcherEl('mist'))
  })
  assert.equal(await page.locator('.dsh-bloom-rotation__select').inputValue(), '0')
})

test('rotation select retains native Arrow and Home/End keyboard handling', async t => {
  const page = await setup(t)
  await page.locator('.dsh-bloom-trigger').click()
  const control = page.locator('.dsh-bloom-rotation__select')
  await control.focus()
  for (const key of ['ArrowDown', 'ArrowUp', 'End', 'Home']) {
    await control.press(key)
    assert.ok(await control.evaluate(el => document.activeElement === el), `${key} moved focus to palette options`)
    const intercepted = await control.evaluate((el, key) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      return event.defaultPrevented
    }, key)
    assert.equal(intercepted, false, `${key} was prevented by the palette handler`)
  }
})
