import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: {
    contents: `import { FEATURED_VARIANTS, PALETTE, PALETTE_GROUPS, isNewVariant } from './src/palette.ts';
      import { buildBloomCSS } from './src/tokens.ts';
      window.fixture = { FEATURED_VARIANTS, PALETTE, PALETTE_GROUPS, isNewVariant, buildBloomCSS };`,
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

test('menu order comes from color families and has no duplicate or unknown entry', async () => {
  const { groups, featured, palette } = await page.evaluate(() => ({
    groups: window.fixture.PALETTE_GROUPS,
    featured: window.fixture.FEATURED_VARIANTS,
    palette: window.fixture.PALETTE,
  }))
  const fromGroups = groups.flatMap(g => g.variants)
  assert.deepEqual(featured, fromGroups, 'FEATURED_VARIANTS 必须由 PALETTE_GROUPS 推导')
  assert.equal(new Set(featured).size, featured.length, '菜单里有重复项')
  for (const v of featured) assert.ok(palette[v], `菜单引用了不存在的配色 ${v}`)
})

test('new-palette badges are tied to the release version', async () => {
  const isNew = await page.evaluate(() => ({
    current: window.fixture.isNewVariant('mint', '0.22.0'),
    older: window.fixture.isNewVariant('mint', '0.21.0'),
    unknown: window.fixture.isNewVariant('mist', '0.99.0'),
    next: window.fixture.isNewVariant('osmanthus', '0.23.0'),
  }))
  assert.equal(isNew.current, true, '0.22.0 的新色应该有徽标')
  assert.equal(isNew.older, false, '旧版本不该显示新色徽标')
  assert.equal(isNew.unknown, false, '没有对应发布记录的版本不该有徽标')
  assert.equal(isNew.next, true, '0.23.0 的新色应该有徽标')
})

test('silver rose, dawn and lavender read apart from their neighbors', async () => {
  const palette = await page.evaluate(() => window.fixture.PALETTE)
  const pairs = [['silverrose', 'petal'], ['silverrose', 'dawn'], ['dawn', 'petal'], ['dawn', 'tangerine'], ['silverrose', 'tangerine'], ['silverrose', 'mint'], ['lavender', 'silverrose'], ['lavender', 'lapis'], ['dawn', 'cinnabar'], ['osmanthus', 'aurora'], ['osmanthus', 'mint'], ['cinnabar', 'tangerine']]
  for (const [a, b] of pairs) {
    const ha = hueOf(palette[a].accentD), hb = hueOf(palette[b].accentD)
    assert.ok(hueGap(ha, hb) >= 17, `${a} vs ${b} hue gap ${hueGap(ha, hb).toFixed(1)}° < 17°`)
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
