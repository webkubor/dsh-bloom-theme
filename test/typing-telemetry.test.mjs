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

test('telemetry posts the Core schema with only event name and language', async t => {
  const page = await setup(t)
  const sent = []
  await page.route('https://api.webkubor.online/v1/analytics/events', route => {
    sent.push(route.request().postData())
    route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true}' })
  })
  await page.evaluate(() => window.fixture.track('share', { extra: 'x' }))
  await page.waitForTimeout(200)
  assert.equal(sent.length, 1)
  const body = JSON.parse(sent[0])
  assert.equal(body.project, 'bloom')
  assert.equal(body.event, 'share')
  assert.match(body.event_id, /^[0-9a-f-]{36}$/)
  assert.deepEqual(body.properties, { lang: 'en' })
  assert.deepEqual(Object.keys(body).sort(), ['event', 'event_id', 'project', 'properties'])
})

test('telemetry can be turned off and then sends nothing', async t => {
  const page = await setup(t)
  const sent = []
  await page.route('https://api.webkubor.online/v1/analytics/events', route => {
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

test('Core requests omit credentials and referrers, bound time and use unique IDs', async t => {
  const page = await setup(t)
  const requests = await page.evaluate(() => {
    const sent = []
    window.fetch = (url, options) => {
      sent.push({ url, credentials: options.credentials, referrerPolicy: options.referrerPolicy,
        contentType: options.headers['content-type'], signal: options.signal instanceof AbortSignal,
        body: JSON.parse(options.body) })
      return Promise.resolve(new Response())
    }
    window.fixture.track('share')
    window.fixture.track('feedback')
    window.fixture.track('unregistered-event')
    return sent
  })
  assert.equal(requests.length, 2)
  assert.notEqual(requests[0].body.event_id, requests[1].body.event_id)
  for (const request of requests) {
    assert.equal(request.credentials, 'omit')
    assert.equal(request.referrerPolicy, 'no-referrer')
    assert.equal(request.contentType, 'application/json')
    assert.equal(request.signal, true)
    assert.deepEqual(request.body.properties, { lang: 'en' })
  }
})

for (const preference of ['doNotTrack', 'globalPrivacyControl']) {
  test(`browser ${preference} prevents telemetry even after enabling the panel preference`, async t => {
    const page = await setup(t)
    assert.equal(await page.evaluate(preference => {
      let sent = 0
      window.fetch = () => { sent++; return Promise.resolve(new Response()) }
      Object.defineProperty(navigator, preference, { value: preference === 'doNotTrack' ? '1' : true })
      window.fixture.setTelemetryEnabled(true)
      window.fixture.track('share')
      return sent
    }, preference), 0)
  })
}

test('network failure and unavailable UUID never interrupt the UI action', async t => {
  const page = await setup(t)
  await page.evaluate(() => {
    window.fetch = () => Promise.reject(new Error('offline'))
    window.fixture.track('share')
    Object.defineProperty(crypto, 'randomUUID', { value: undefined })
    window.fixture.track('share')
  })
})
