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

const FEATURED = await page.evaluate(() => window.fixture.FEATURED_VARIANTS)

function hueOf(spec) {
  const m = /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/.exec(spec)
  if (m) return { l: +m[1], c: +m[2], h: +m[3] }
  return null
}
const hueGap = (a, b) => { const d = Math.abs(a.h - b.h) % 360; return d > 180 ? 360 - d : d }

// owner 2026-11-04：赤橙黄绿青蓝紫每个色系都要在菜单里有一套。按暗色 accent 的色相归类。
const FAMILIES = { 赤: [10, 35], 橙: [38, 60], 黄: [85, 110], 绿: [130, 175], 青: [180, 215], 蓝: [220, 270], 紫: [280, 305] }
test('menu covers every color family (赤橙黄绿青蓝紫)', async () => {
  const palette = await page.evaluate(() => window.fixture.PALETTE)
  const missing = Object.entries(FAMILIES).filter(([, [lo, hi]]) =>
    !FEATURED.some(v => { const h = hueOf(palette[v].accentD).h; return h >= lo && h <= hi }))
  assert.deepEqual(missing.map(([k]) => k), [], '缺色系')
})

test('silver rose, dawn and lavender read apart from their neighbors', async () => {
  const palette = await page.evaluate(() => window.fixture.PALETTE)
  const pairs = [['silverrose', 'petal'], ['silverrose', 'dawn'], ['dawn', 'petal'], ['dawn', 'tangerine'], ['silverrose', 'tangerine'], ['silverrose', 'mint'], ['lavender', 'silverrose'], ['lavender', 'lapis'], ['dawn', 'cinnabar'], ['osmanthus', 'aurora'], ['osmanthus', 'mint'], ['cinnabar', 'tangerine']]
  for (const [a, b] of pairs) {
    const ha = hueOf(palette[a].accentD), hb = hueOf(palette[b].accentD)
    assert.ok(hueGap(ha, hb) >= 17, `${a} vs ${b} hue gap ${hueGap(ha, hb).toFixed(1)}° < 20°`)
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
