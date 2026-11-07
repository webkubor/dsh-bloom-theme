import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: {
    contents: `import { buildFogDefinitions } from './src/fog.ts'; window.makeFog = buildFogDefinitions`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  },
  bundle: true, write: false, format: 'iife', platform: 'browser',
})

// Decode the actual Chromium screenshot, not SVG geometry or computed styles.
async function pixels(page) {
  const screenshot = await page.screenshot()
  return page.evaluate(async base64 => {
    const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob())
    const canvas = new OffscreenCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)
    const data = ctx.getImageData(0, 0, image.width, image.height).data
    const values = []
    for (let y = 0; y < image.height; y += 4) {
      for (let x = 0; x < image.width; x += 4) values.push(data[(y * image.width + x) * 4])
    }
    return values
  }, screenshot.toString('base64'))
}

test('inline SVG masks render distinct translucent mist on HTML and dispose', async t => {
  const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
  t.after(() => browser.close())
  const page = await browser.newPage({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  await page.setContent('<style>html,body{margin:0;background:#000}.overlay{position:fixed;inset:0;background:#fff}</style><div class="overlay"></div>')
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => { window.fog = window.makeFog(document); document.body.append(window.fog) })
  assert.equal(await page.locator('svg mask path, svg mask [stroke]').count(), 0, 'masks have no line or arc strokes')
  assert.equal(await page.locator('svg filter feTurbulence').count(), 1, 'masks share a bounded noise filter')
  const unmasked = await pixels(page)
  assert.ok(unmasked.every(value => value === 255), 'unmasked overlay is fully visible')
  const results = {}
  for (const name of ['stream', 'wash', 'clear']) {
    await page.evaluate(name => { document.querySelector('.overlay').style.maskImage = `url(#dsh-bloom-fog-${name})` }, name)
    const sample = await pixels(page)
    const max = Math.max(...sample)
    const visible = sample.filter(value => value >= 3).length
    const centre = sample.filter((_, i) => {
      const x = i % 160, y = Math.floor(i / 160)
      return x >= 56 && x < 104 && y >= 35 && y < 65
    })
    results[name] = { sample, max, visible, centreMax: Math.max(...centre) }
    assert.ok(visible > 50, `${name} produces visible mist pixels`)
    assert.ok(max < 200, `${name} never creates an opaque overlay (max ${max})`)
    assert.ok(Math.min(...sample) < 3, `${name} has transparent areas`)
    assert.ok(results[name].centreMax < 40, `${name} leaves the centre readable`)
  }
  for (const [a, b] of [['stream', 'wash'], ['stream', 'clear'], ['wash', 'clear']]) {
    const changed = results[a].sample.filter((value, i) => Math.abs(value - results[b].sample[i]) >= 3).length
    assert.ok(changed > 100, `${a} and ${b} differ in rendered pixels (${changed})`)
  }
  t.diagnostic(JSON.stringify(Object.fromEntries(Object.entries(results).map(([name, { max, visible, centreMax }]) => [name, { max, visible, centreMax }]))))
  await page.evaluate(() => window.fog.remove())
  assert.equal(await page.locator('#dsh-bloom-fog-stream, #dsh-bloom-fog-wash, #dsh-bloom-fog-clear').count(), 0)
  // A dangling CSS reference becomes fully transparent once its definition is removed.
  assert.ok((await pixels(page)).every(value => value === 0), 'removed mask no longer paints')
})
