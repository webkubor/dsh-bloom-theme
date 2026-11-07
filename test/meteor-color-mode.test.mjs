import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: { contents: `import * as starlight from './src/starlight.ts'; window.starlight = starlight`, resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
  bundle: true, write: false, format: 'iife', platform: 'browser',
})
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())

async function setup(t) {
  const page = await browser.newPage()
  t.after(() => page.close())
  await page.route('https://bloom.test/', route => route.fulfill({ contentType: 'text/html', body: '<html><body></body></html>' }))
  await page.goto('https://bloom.test/')
  await page.addScriptTag({ content: outputFiles[0].text })
  return page
}

const setPalette = (page, accent, colors) => page.evaluate(({ accent, colors }) => {
  document.body.style.setProperty('--bloom-accent', accent)
  colors.forEach((color, i) => document.body.style.setProperty(`--bloom-motion-${i + 1}`, color))
}, { accent, colors })
const colors = page => page.evaluate(() => [...document.querySelectorAll('.s-met')].slice(0, 3).map(el => el.style.getPropertyValue('--meteor-color')))

test('color mode and palette changes take effect only at each meteor iteration', async t => {
  const page = await setup(t)
  await setPalette(page, 'rgb(1, 2, 3)', ['rgb(10, 20, 30)', 'rgb(40, 50, 60)', 'rgb(70, 80, 90)'])
  await page.evaluate(() => document.body.append(window.starlight.buildSparkles(document)))
  assert.equal(await page.evaluate(() => window.starlight.readMeteorColorMode()), 'colorful')
  const initial = await colors(page)
  assert.deepEqual(initial, ['rgb(10, 20, 30)', 'rgb(40, 50, 60)', 'rgb(70, 80, 90)'])
  assert.equal(await page.evaluate(() => window.starlight.writeMeteorColorMode('solid')), true)
  await setPalette(page, 'rgb(101, 102, 103)', ['rgb(110, 120, 130)', 'rgb(140, 150, 160)', 'rgb(170, 180, 190)'])
  assert.deepEqual(await colors(page), initial, 'in-flight colors remain frozen')
  await page.evaluate(() => document.querySelector('.s-met.m2').dispatchEvent(new Event('animationiteration', { bubbles: true })))
  assert.deepEqual(await colors(page), [initial[0], 'rgb(101, 102, 103)', initial[2]])
  await page.evaluate(() => window.starlight.writeMeteorColorMode('colorful'))
  await page.evaluate(() => document.querySelector('.s-met.m3').dispatchEvent(new Event('animationiteration', { bubbles: true })))
  assert.deepEqual(await colors(page), [initial[0], 'rgb(101, 102, 103)', 'rgb(170, 180, 190)'])
  await page.evaluate(() => { document.getElementById('dsh-bloom-sparkles').remove(); document.body.append(window.starlight.buildSparkles(document)) })
  assert.deepEqual(await colors(page), ['rgb(110, 120, 130)', 'rgb(140, 150, 160)', 'rgb(170, 180, 190)'])
})

test('preference persists, validates values and honors external changes', async t => {
  const page = await setup(t)
  assert.equal(await page.evaluate(() => window.starlight.writeMeteorColorMode('solid')), true)
  assert.equal(await page.evaluate(() => window.starlight.writeMeteorColorMode('invalid')), false)
  assert.equal(await page.evaluate(() => window.starlight.readMeteorColorMode()), 'solid')
  await page.reload()
  await page.addScriptTag({ content: outputFiles[0].text })
  assert.equal(await page.evaluate(() => window.starlight.readMeteorColorMode()), 'solid')
  await page.evaluate(() => localStorage.setItem('dsh-bloom-variant-meteor-color-mode', 'colorful'))
  assert.equal(await page.evaluate(() => window.starlight.readMeteorColorMode()), 'colorful')
})

test('storage exceptions preserve the session mode and read-only storage detects external changes', async t => {
  const page = await setup(t)
  const result = await page.evaluate(() => {
    const proto = Storage.prototype, originalGet = proto.getItem, originalSet = proto.setItem
    let denyReads = true
    try {
      proto.getItem = function (...args) { if (denyReads) throw Error('private'); return originalGet.apply(this, args) }
      proto.setItem = () => { throw Error('private') }
      window.starlight.writeMeteorColorMode('solid')
      const denied = window.starlight.readMeteorColorMode()
      denyReads = false
      originalSet.call(localStorage, 'dsh-bloom-variant-meteor-color-mode', 'colorful')
      window.starlight.writeMeteorColorMode('solid')
      const failedWrite = window.starlight.readMeteorColorMode()
      originalSet.call(localStorage, 'dsh-bloom-variant-meteor-color-mode', 'invalid')
      const external = window.starlight.readMeteorColorMode()
      return { denied, failedWrite, external }
    } finally { proto.getItem = originalGet; proto.setItem = originalSet }
  })
  assert.deepEqual(result, { denied: 'solid', failedWrite: 'solid', external: 'colorful' })
})
