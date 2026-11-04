import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// 2026-11-04 新增：输入时的呼吸光（typing glow）+ 匿名事件埋点（telemetry）。
const { outputFiles } = await build({
  stdin: {
    contents: `import { initTypingGlow } from './src/typing.ts';
      import { track, telemetryEnabled, setTelemetryEnabled } from './src/track.ts';
      window.fixture = { initTypingGlow, track, telemetryEnabled, setTelemetryEnabled };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())

async function setup(t) {
  const context = await browser.newContext()
  t.after(() => context.close())
  const page = await context.newPage()
  await page.route('https://bloom.test/', route => route.fulfill({
    contentType: 'text/html',
    body: `<html><body><div class="x_composer"><textarea id="ta"></textarea></div></body></html>`,
  }))
  await page.goto('https://bloom.test/')
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => { window.disposeGlow = window.fixture.initTypingGlow() })
  return page
}

test('typing in the composer turns the glow on, idling turns it off', async t => {
  const page = await setup(t)
  assert.equal(await page.locator('body').getAttribute('data-bloom-typing'), null)
  await page.locator('#ta').fill('hello')
  assert.equal(await page.locator('body').getAttribute('data-bloom-typing'), 'true')
  await page.waitForTimeout(1100)
  assert.equal(await page.locator('body').getAttribute('data-bloom-typing'), null)
})

test('glow turns off immediately when the composer loses focus', async t => {
  const page = await setup(t)
  await page.locator('#ta').fill('hi')
  assert.equal(await page.locator('body').getAttribute('data-bloom-typing'), 'true')
  await page.locator('#ta').blur()
  assert.equal(await page.locator('body').getAttribute('data-bloom-typing'), null)
})

test('disposing typing glow removes input listeners and clears its state', async t => {
  const page = await setup(t)
  await page.locator('#ta').fill('hi')
  await page.evaluate(() => window.disposeGlow())
  assert.equal(await page.locator('body').getAttribute('data-bloom-typing'), null)
  await page.locator('#ta').fill('still typing')
  assert.equal(await page.locator('body').getAttribute('data-bloom-typing'), null)
})

test('typing outside the composer does not trigger the glow', async t => {
  const page = await setup(t)
  await page.evaluate(() => {
    const el = document.createElement('input')
    document.body.append(el)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  assert.equal(await page.locator('body').getAttribute('data-bloom-typing'), null)
})

test('telemetry posts only event name, version and language', async t => {
  const page = await setup(t)
  const sent = []
  await page.route('https://www.webkubor.online/api/event', route => {
    sent.push(route.request().postData())
    route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true}' })
  })
  await page.evaluate(() => window.fixture.track('share', { extra: 'x' }))
  await page.waitForTimeout(200)
  assert.equal(sent.length, 1)
  const body = JSON.parse(sent[0])
  assert.equal(body.project, 'bloom')
  assert.equal(body.event, 'share')
  assert.ok(body.params.v)
  assert.equal(Object.keys(body.params).sort().join(','), 'lang,v')
})

test('telemetry can be turned off and then sends nothing', async t => {
  const page = await setup(t)
  const sent = []
  await page.route('https://www.webkubor.online/api/event', route => {
    sent.push(route.request().postData())
    route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true}' })
  })
  // Storage blocked/full must not prevent a session opt-out.
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new Error('blocked') }
    window.fixture.setTelemetryEnabled(false)
  })
  assert.equal(await page.evaluate(() => window.fixture.telemetryEnabled()), false)
  await page.evaluate(() => window.fixture.track('share'))
  await page.waitForTimeout(200)
  assert.equal(sent.length, 0)
})
