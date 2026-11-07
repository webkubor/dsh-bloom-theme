import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: { contents: `import { collectDiagnostics, formatDiagnosticsMarkdown, copyDiagnostics } from './src/diagnostics.ts'; window.diagnostics = { collectDiagnostics, formatDiagnosticsMarkdown, copyDiagnostics };`, resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
  bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())
async function setup(t) {
  const context = await browser.newContext()
  t.after(() => context.close())
  const page = await context.newPage()
  await page.route('**/*', route => route.fulfill({ contentType: 'text/html', body: '<html><body><textarea>draft-secret-message</textarea><header class="_header"></header></body></html>' }))
  await page.goto('https://bloom.test/')
  await page.addScriptTag({ content: outputFiles[0].text })
  return page
}

test('real DOM secrets and resource URLs never reach collected diagnostics or Markdown', async t => {
  const page = await setup(t)
  const result = await page.evaluate(() => {
    document.body.dataset.hostSecret = 'HOST_SECRET_4711'
    document.body.dataset.bloomTyping = 'true'
    document.body.dataset.bloomGlass = 'liquid'
    document.body.dataset.bloomAmbienceDark = 'corner'
    document.body.dataset.bloomAmbienceLight = 'wash'
    document.body.dataset.bloomVariant = 'mist'
    document.body.dataset.bloomUpdate = 'UPDATE_SECRET_9123'
    document.body.style.backgroundImage = 'linear-gradient(red, blue), url("https://private.invalid/path?token=URL_SECRET_8221")'
    document.body.style.setProperty('--bloom-accent', 'url("https://private.invalid/path?token=TOKEN_SECRET_1177")')
    const data = window.diagnostics.collectDiagnostics()
    return { data, markdown: window.diagnostics.formatDiagnosticsMarkdown(data) }
  })
  for (const forbidden of ['HOST_SECRET_4711', 'URL_SECRET_8221', 'TOKEN_SECRET_1177', 'UPDATE_SECRET_9123', 'private.invalid', 'draft-secret-message']) {
    assert.ok(!JSON.stringify(result).includes(forbidden), `${forbidden} leaked`)
  }
  assert.equal(result.data.domAudit.body.backgroundImage, '[redacted]')
  assert.deepEqual(result.data.bloom.bodyDataset, { bloomVariant: 'mist', bloomGlass: 'liquid', bloomAmbienceLight: 'wash', bloomAmbienceDark: 'corner', bloomTyping: 'true' })
  assert.ok(result.data.bloom.version)
  assert.equal(result.data.bloom.appearance, 'light')
  assert.ok(result.markdown.includes('```json'))
})

test('safe colors and gradients survive while unknown values in known attributes are excluded', async t => {
  const page = await setup(t)
  const data = await page.evaluate(() => {
    document.body.dataset.bloomGlass = 'HOST_SECRET_IN_ALLOWED_KEY'
    document.body.style.backgroundImage = 'linear-gradient(rgb(255, 0, 0), rgb(0, 0, 255))'
    document.body.style.setProperty('--bloom-accent', '#789abc')
    return window.diagnostics.collectDiagnostics()
  })
  assert.match(data.domAudit.body.backgroundImage, /^linear-gradient\(/)
  assert.equal(data.tokens['--bloom-accent'], '#789abc')
  assert.equal(data.bloom.bodyDataset.bloomGlass, undefined)
  assert.ok(!JSON.stringify(data).includes('HOST_SECRET_IN_ALLOWED_KEY'))
})

test('collecting and formatting do not copy or make requests; explicit copy writes sanitized Markdown', async t => {
  const page = await setup(t)
  const result = await page.evaluate(async () => {
    let copies = 0, requests = 0, copied = ''
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { copies++; copied = text } } })
    window.fetch = () => { requests++; throw new Error('unexpected request') }
    document.body.dataset.hostSecret = 'CLIPBOARD_SECRET_902'
    window.diagnostics.collectDiagnostics()
    window.diagnostics.formatDiagnosticsMarkdown()
    const before = { copies, requests }
    const ok = await window.diagnostics.copyDiagnostics()
    return { before, copies, requests, copied, ok }
  })
  assert.deepEqual(result.before, { copies: 0, requests: 0 })
  assert.equal(result.ok, true)
  assert.equal(result.copies, 1)
  assert.equal(result.requests, 0)
  assert.ok(!result.copied.includes('CLIPBOARD_SECRET_902'))
  assert.match(result.copied, /Bloom 诊断信息/)
})

test('explicit copy falls back to execCommand when clipboard is unavailable', async t => {
  const page = await setup(t)
  const result = await page.evaluate(async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    document.body.dataset.hostSecret = 'FALLBACK_SECRET_31'
    let calls = 0, copied = ''
    document.execCommand = command => {
      assertUnused(command)
      calls++
      copied = document.activeElement.value
      return true
    }
    function assertUnused(command) { if (command !== 'copy') throw new Error('unexpected command') }
    const ok = await window.diagnostics.copyDiagnostics()
    return { ok, calls, copied, textareas: document.querySelectorAll('textarea').length }
  })
  assert.equal(result.ok, true)
  assert.equal(result.calls, 1)
  assert.equal(result.textareas, 1, 'temporary textarea removed, original input untouched')
  assert.ok(!result.copied.includes('FALLBACK_SECRET_31'))
})
