import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: {
    contents: `import { FEATURED_VARIANTS, PALETTE } from './src/palette.ts';
      import { buildBloomCSS } from './src/tokens.ts';
      window.fixture = { FEATURED_VARIANTS, PALETTE, buildBloomCSS };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())
const context = await browser.newContext()
const page = await context.newPage()
await page.route('https://bloom.test/', r => r.fulfill({ contentType: 'text/html', body: '<html><body><header></header></body></html>' }))
await page.goto('https://bloom.test/')
await page.addScriptTag({ content: outputFiles[0].text })

const FEATURED = ['mist', 'petal', 'ripple', 'lapis', 'aurora', 'mint', 'tangerine', 'silverrose', 'dawn']

function hueOf(spec) {
  const m = /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/.exec(spec)
  if (m) return { l: +m[1], c: +m[2], h: +m[3] }
  return null
}
const hueGap = (a, b) => { const d = Math.abs(a.h - b.h) % 360; return d > 180 ? 360 - d : d }

test('new palettes keep at least 25 degrees from each other and neighboring featured hues', async () => {
  const palette = await page.evaluate(() => window.fixture.PALETTE)
  const hues = FEATURED.map(v => ({ v, ...hueOf(palette[v].accentD) }))
  const tooClose = []
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      const gap = hueGap(hues[i], hues[j])
      const isNew = ['silverrose', 'dawn'].includes(hues[i].v) || ['silverrose', 'dawn'].includes(hues[j].v)
      if (isNew && gap < 25) tooClose.push(`${hues[i].v}/${hues[j].v} gap=${gap.toFixed(1)}°`)
    }
  }
  assert.deepEqual(tooClose, [], `色相过近：${tooClose.join(', ')}`)
})

test('silver rose and dawn read apart from petal and tangerine', async () => {
  const palette = await page.evaluate(() => window.fixture.PALETTE)
  const pairs = [['silverrose', 'petal'], ['silverrose', 'dawn'], ['dawn', 'petal'], ['dawn', 'tangerine'], ['silverrose', 'tangerine'], ['silverrose', 'mint']]
  for (const [a, b] of pairs) {
    const ha = hueOf(palette[a].accentD), hb = hueOf(palette[b].accentD)
    assert.ok(hueGap(ha, hb) >= 20, `${a} vs ${b} hue gap ${hueGap(ha, hb).toFixed(1)}° < 20°`)
  }
})

test('every featured palette yields a distinct accent in light and dark', async () => {
  const seen = { light: new Set(), dark: new Set() }
  await page.evaluate(() => {
    const s = document.createElement('style'); s.textContent = window.fixture.buildBloomCSS(); document.head.append(s)
  })
  for (const variant of FEATURED) {
    for (const mode of ['light', 'dark']) {
      await page.evaluate(({ variant, mode }) => {
        document.body.dataset.bloomVariant = variant
        document.body.toggleAttribute('data-ds-dark-theme', mode === 'dark')
      }, { variant, mode })
      const accent = await page.evaluate(() => {
        const cs = getComputedStyle(document.body)
        return (cs.getPropertyValue('--bloom-accent') || '').trim()
      })
      assert.ok(accent, `${variant}/${mode} 没有解析出 --bloom-accent`)
      assert.ok(!seen[mode].has(accent), `${variant}/${mode} 与其它配色撞色：${accent}`)
      seen[mode].add(accent)
    }
  }
  assert.equal(seen.light.size, FEATURED.length)
  assert.equal(seen.dark.size, FEATURED.length)
})
