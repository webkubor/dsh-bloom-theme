import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// Same order as installSkin in client.ts; synthetic blank page only, no user content.
const { outputFiles } = await build({
  stdin: { resolveDir: fileURLToPath(new URL('..', import.meta.url)), contents: `
    import { buildBloomCSS } from './src/tokens.ts'
    import { COMPONENT_CSS } from './src/css/component.ts'
    import { GLASS_CSS } from './src/css/glass.ts'
    import { BACKGROUND_CSS } from './src/css/background.ts'
    import { BUTTON_CSS } from './src/css/button.ts'
    import { ADAPTIVE_CSS } from './src/css/adaptive.ts'
    import { SURFACES_CSS } from './src/css/surfaces.ts'
    window.productionStyles = [buildBloomCSS(), COMPONENT_CSS, GLASS_CSS + BACKGROUND_CSS + BUTTON_CSS, ADAPTIVE_CSS + SURFACES_CSS]
  ` }, bundle: true, write: false, format: 'iife', platform: 'browser',
})
const palettes = ['cinnabar', 'dawn', 'tangerine', 'aurora', 'osmanthus', 'mint', 'ripple', 'mist', 'lapis', 'lavender', 'silverrose', 'petal']
const points = [
  [20, 20], [780, 20], [20, 580], [780, 580], [400, 260],
  ...[100, 400, 700].flatMap(x => [419, 421, 440, 480, 530, 580, 595].map(y => [x, y])),
]
const luminance = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0)
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + .05) / (lo + .05) }
const difference = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])))
async function pixels(page) {
  const png = await page.screenshot({ animations: 'disabled' })
  return page.evaluate(async ({ base64, points }) => {
    const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob())
    const canvas = new OffscreenCanvas(image.width, image.height), ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)
    const colors = points.map(([x, y]) => [...ctx.getImageData(x, y, 1, 1).data].slice(0, 3))
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = getComputedStyle(document.querySelector('#text')).color; ctx.fillRect(0, 0, 1, 1)
    return { colors, text: [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3) }
  }, { base64: png.toString('base64'), points })
}

// Host CSS reproduced from the installed DSH conversation/layout bundles; injected in
// both orders because the host and plugin inject their styles independently.
const hostCSS = `
html,body { width:100%; height:100%; margin:0 }
html[data-platform], html[data-platform] body { background:transparent }
.PIRFFq_frame { box-sizing:border-box; background:var(--dsw-alias-bg-base); height:100%; display:grid; position:relative; overflow:hidden }
[data-platform=darwin] .PIRFFq_frame { background:0 0 }
.PIRFFq_centerCol { display:flex; flex-direction:column; min-width:0; overflow:hidden }
.PIRFFq_mainPanel { display:flex; flex-direction:column; flex:1; min-width:0; min-height:0 }
.kiGsTW_root { background:var(--dsw-alias-bg-base); flex-direction:column; min-width:0; height:100%; display:flex; position:relative }
.kiGsTW_body { flex-direction:column; flex:1; min-height:0; display:flex; position:relative }
.kiGsTW_embeddedBody { flex:1; min-height:0; display:flex; flex-direction:column }
.kiGsTW_scrollBody { scrollbar-gutter:stable; flex-direction:column; flex:1; min-height:0; margin-right:2px; display:flex; overflow-y:auto }
.kiGsTW_viewArea { flex-direction:column; flex:1; min-height:0; display:flex }
.kiGsTW_composerSeat { flex-direction:column; flex:none; display:flex }
.kiGsTW_root[data-phase=active] .kiGsTW_composerSeat, .kiGsTW_embeddedBody[data-content-phase=active] .kiGsTW_composerSeat {
  z-index:9; will-change:transform; overflow-anchor:none;
  background:linear-gradient(180deg, color-mix(in srgb, var(--dsw-alias-bg-base) 0%, transparent) 0px, var(--dsw-alias-bg-base) 36px);
  margin-top:auto; position:sticky; bottom:0
}
.kiGsTW_scrollBody:has([data-conversation-composer-overlay]) { scrollbar-gutter:auto; position:relative; overflow:hidden auto }
.kiGsTW_scrollBody:has([data-conversation-composer-overlay]) > .kiGsTW_composerSeat { right:var(--dsh-scrollbar-width); position:absolute; bottom:0; left:0 }
`

test('dark full-window glow continues behind the composer seat for every featured palette', async t => {
  const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
  t.after(() => browser.close())
  const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  await page.setContent('<!doctype html><html><body data-ds-dark-theme data-bloom-variant="aurora" data-bloom-ambience-dark="corner" style="margin:0"><span id="text" style="position:absolute;left:-9999px;color:var(--dsw-alias-label-primary)">A</span><div class="fixture_root"><div class="fixture_composerSeat" style="position:fixed;left:0;right:0;bottom:0;height:180px"></div></div></body></html>')
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => { for (const css of window.productionStyles) { const style = document.createElement('style'); style.textContent = css; document.head.append(style) } })
  const failures = [], paletteCorners = new Set()
  for (const variant of palettes) {
    await page.evaluate(v => { document.body.dataset.bloomVariant = v; document.body.dataset.bloomAmbienceDark = 'corner'; document.querySelector('.fixture_composerSeat').style.visibility = 'visible' }, variant)
    const withSeat = await pixels(page)
    await page.locator('.fixture_composerSeat').evaluate(el => { el.style.visibility = 'hidden' })
    const bare = await pixels(page)
    const deltas = points.map((p, i) => ({ p, delta: difference(withSeat.colors[i], bare.colors[i]) }))
    const max = Math.max(...deltas.map(x => x.delta))
    // The dock must not replace the shared fixed backdrop with a differently aligned
    // solid layer. A two-level tolerance allows Chromium's colour rounding only.
    if (max > 2) failures.push({ variant, max, affected: deltas.filter(x => x.delta > 2) })
    const corners = bare.colors.slice(0, 4)
    paletteCorners.add(JSON.stringify(corners))
    const cornerSpread = Math.max(...corners.flatMap((a, i) => corners.slice(i + 1).map(b => difference(a, b))))
    if (cornerSpread < 4) failures.push({ variant, cornerSpread, corners })
    const ratio = Math.min(...bare.colors.map(color => contrast(bare.text, color)))
    if (ratio < 4.5) failures.push({ variant, minimumContrast: ratio })
    await page.evaluate(() => { document.body.dataset.bloomAmbienceDark = 'off' })
    const off = await page.evaluate(() => ({ image: getComputedStyle(document.body).backgroundImage, before: getComputedStyle(document.body, '::before').backgroundImage }))
    if (off.image !== 'none' || off.before !== 'none') failures.push({ variant, darkOff: off })
  }
  assert.ok(paletteCorners.size >= 8, `four-corner colours should follow palettes, got ${paletteCorners.size} distinct sets`)
  assert.deepEqual(failures, [], 'seat pixel discontinuity, missing corner distribution, poor centre contrast or dark-off background')
})

test('host active and embedded seat backgrounds preserve the same pixels regardless of CSS injection order', async t => {
  const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
  t.after(() => browser.close())
  const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  const results = []
  for (const mode of ['active', 'embedded']) for (const order of ['host-first', 'host-last']) {
    const root = mode === 'active' ? '<div class="kiGsTW_root" data-phase="active">' : '<div class="kiGsTW_root"><div class="kiGsTW_embeddedBody" data-content-phase="active">'
    const end = mode === 'active' ? '</div>' : '</div></div>'
    await page.setContent(`<!doctype html><html data-platform="darwin"><body data-ds-dark-theme data-bloom-variant="aurora" data-bloom-ambience-dark="corner" style="margin:0"><span id="text" style="position:absolute;left:-9999px;color:var(--dsw-alias-label-primary)">A</span><div class="PIRFFq_frame"><div class="PIRFFq_centerCol"><div class="PIRFFq_mainPanel">${root}<div class="kiGsTW_body"><div class="kiGsTW_scrollBody" data-conversation-scroll><div class="kiGsTW_viewArea"></div><div class="kiGsTW_composerSeat" data-composer-seat data-conversation-region="composer" style="height:180px"></div></div></div>${end}</div></div></div></body></html>`)
    await page.addScriptTag({ content: outputFiles[0].text })
    await page.evaluate(({ hostCSS, order }) => {
      const add = css => { const style = document.createElement('style'); style.textContent = css; document.head.append(style) }
      if (order === 'host-first') add(hostCSS)
      window.productionStyles.forEach(add)
      if (order === 'host-last') add(hostCSS)
    }, { hostCSS, order })
    // Ensure active host selectors really apply; the seat is at the viewport bottom.
    const rect = await page.locator('[data-composer-seat]').boundingBox()
    assert.ok(rect && Math.abs(rect.y - 420) < 1 && Math.abs(rect.height - 180) < 1, `${mode}/${order}: unexpected seat ${JSON.stringify(rect)}`)
    for (const variant of palettes) {
      await page.evaluate(v => { document.body.dataset.bloomVariant = v; document.querySelector('[data-composer-seat]').style.visibility = 'visible' }, variant)
      const withSeat = await pixels(page)
      await page.locator('[data-composer-seat]').evaluate(el => { el.style.visibility = 'hidden' })
      const bare = await pixels(page)
      const changed = points.map((p, i) => ({ p, delta: difference(withSeat.colors[i], bare.colors[i]) })).filter(x => x.delta > 2)
      if (changed.length) results.push({ mode, order, variant, max: Math.max(...changed.map(x => x.delta)), affected: changed })
    }
    for (const variant of palettes) {
      await page.evaluate(v => {
        document.body.dataset.bloomVariant = v
        document.body.dataset.bloomAmbienceDark = 'off'
        document.querySelector('[data-composer-seat]').style.visibility = 'visible'
      }, variant)
      const images = await page.evaluate(() => {
        const seat = document.querySelector('[data-composer-seat]')
        return { body: getComputedStyle(document.body).backgroundImage,
          bodyBefore: getComputedStyle(document.body, '::before').backgroundImage,
          seat: getComputedStyle(seat).backgroundImage,
          seatBefore: getComputedStyle(seat, '::before').backgroundImage }
      })
      if (Object.values(images).some(image => image !== 'none')) results.push({ mode, order, variant, darkOffImages: images })
      const withSeat = await pixels(page)
      await page.locator('[data-composer-seat]').evaluate(el => { el.style.visibility = 'hidden' })
      const bare = await pixels(page)
      const max = Math.max(...points.map((_, i) => difference(withSeat.colors[i], bare.colors[i])))
      if (max > 2) results.push({ mode, order, variant, darkOffMax: max })
    }
    // Check every light preset still paints a body background in this same host cascade.
    for (const preset of ['stream', 'wash', 'clear']) {
      const light = await page.evaluate(preset => {
        document.body.removeAttribute('data-ds-dark-theme')
        document.body.dataset.bloomAmbienceLight = preset
        return getComputedStyle(document.body).backgroundImage
      }, preset)
      if (light === 'none' || !light.includes('gradient(')) results.push({ mode, order, lightPreset: preset, background: light })
    }
    await page.evaluate(() => { document.body.setAttribute('data-ds-dark-theme', ''); document.body.dataset.bloomAmbienceDark = 'corner' })
    // Negative control reenables the actual host seat gradient while removing Bloom's
    // seat pseudo-element. It must turn this same-pixel test red.
    await page.evaluate(() => {
      document.body.dataset.bloomVariant = 'aurora'
      document.querySelector('[data-composer-seat]').style.visibility = 'visible'
      const style = document.createElement('style')
      style.textContent = `html body[data-bloom-variant] [class*="_root"] [class*="_composerSeat"] { background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-bg-base) 0%,transparent) 0px,var(--dsw-alias-bg-base) 36px) !important } html body[data-bloom-variant] [class*="_root"] [class*="_composerSeat"]::before { content:none !important }`
      document.head.append(style)
    })
    const negative = await pixels(page)
    await page.locator('[data-composer-seat]').evaluate(el => { el.style.visibility = 'hidden' })
    const bareNegative = await pixels(page)
    const negativeMax = Math.max(...points.map((_, i) => difference(negative.colors[i], bareNegative.colors[i])))
    assert.ok(negativeMax > 2, `${mode}/${order}: negative control did not expose the host seat background (${negativeMax})`)
    console.log(`${mode}/${order}: negative-control max RGB delta ${negativeMax}`)
  }
  console.log('continuity failures:', JSON.stringify(results.map(({ mode, order, variant, max }) => ({ mode, order, variant, max }))))
  assert.deepEqual(results, [], 'host background or Bloom seat layer causes visible discontinuity')
})
