import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: {
    contents: `import { buildBloomCSS } from './src/tokens.ts';
      import { COMPONENT_CSS } from './src/css/component.ts';
      import { GLASS_CSS } from './src/css/glass.ts';
      import { BACKGROUND_CSS } from './src/css/background.ts';
      import { BUTTON_CSS } from './src/css/button.ts';
      import { buildFogDefinitions } from './src/fog.ts';
      import { ADAPTIVE_CSS } from './src/css/adaptive.ts';
      import { SURFACES_CSS } from './src/css/surfaces.ts';
      import { buildLiquidLens } from './src/liquid-lens.ts';
      window.fixture = { css: [buildBloomCSS(), COMPONENT_CSS, GLASS_CSS, BACKGROUND_CSS, BUTTON_CSS, ADAPTIVE_CSS, SURFACES_CSS], buildLiquidLens, buildFogDefinitions };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  }, bundle: true, write: false, format: 'iife', platform: 'browser',
})
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())

async function setup(t, dark) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
  t.after(() => page.close())
  await page.setContent(`<body data-bloom-variant="mist"${dark ? ' data-ds-dark-theme' : ''}>
    <style>body{margin:0}.x_sidebarCol,.x_header,.x_card,.x_bar{border-radius:18px;width:300px;height:90px;margin:10px}.probe{position:fixed;top:9px;left:7px}</style>
    <header class="x_header"><button>Header</button></header>
    <aside class="x_sidebarCol"><button>Sidebar</button><i class="probe"></i></aside>
    <div class="x_composer"><div class="x_card"><input aria-label="Input"></div></div>
    <div class="x_composerSeat"><div class="x_dock"><div class="x_bar"><button>Send</button></div></div></div>
    <div class="x_bubble">Message</div></body>`)
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => {
    document.body.append(window.fixture.buildLiquidLens(document), window.fixture.buildFogDefinitions(document))
    for (const css of window.fixture.css) { const style = document.createElement('style'); style.textContent = css; document.head.append(style) }
  })
  return page
}

test('macOS host sidebar tint does not cover the glass surface', async t => {
  const page=await setup(t, true)
  const result=await page.evaluate(()=>{
    document.documentElement.dataset.platform='darwin'
    document.body.dataset.bloomGlass='liquid'
    const sidebar=document.querySelector('.x_sidebarCol'),frame=document.createElement('div')
    frame.className='x_frame';sidebar.before(frame);frame.append(sidebar)
    const host=document.createElement('style')
    host.textContent='[data-platform=darwin] [data-ds-dark-theme] .x_frame:not([data-sidebar-drawer]) .x_sidebarCol { background: linear-gradient(to bottom,#7a9bf014,#7a9bf000 35%,#8f89b800 68%,#8f89b812), color-mix(in srgb,#372d2c 50%,transparent) }'
    document.head.append(host)
    const s=getComputedStyle(document.querySelector('.x_sidebarCol'))
    return {background:s.backgroundColor,image:s.backgroundImage}
  })
  assert.equal(result.background,'rgba(0, 0, 0, 0)','host tint must not sit above the glass pane')
  assert.equal(result.image,'none','host fixed blue gradient must not cover theme glass')
})

for (const dark of [false, true]) {
  test(`${dark ? 'dark' : 'light'} shell uses shared pseudo-element glass in each material`, async t => {
    const page = await setup(t, dark)
    const materialStyles = {}
    for (const material of ['liquid', 'frosted', 'matte']) {
      await page.evaluate(material => document.body.dataset.bloomGlass = material, material)
      const states = await page.evaluate(() => ['.x_sidebarCol', '.x_header', '.x_card', '.x_bar'].map(selector => {
        const el = document.querySelector(selector), host = getComputedStyle(el), pane = getComputedStyle(el, '::before')
        return { selector, hostFilter: host.backdropFilter, filter: pane.backdropFilter, content: pane.content,
          hostRadius: host.borderRadius, radius: pane.borderRadius, fill: pane.backgroundColor, image: pane.backgroundImage,
          variable: host.getPropertyValue('--bloom-surface-filter').trim(), hostShadow: host.boxShadow,
          paneShadow: pane.boxShadow, border: pane.borderTopWidth }
      }))
      materialStyles[material] = states
      assert.equal(new Set(states.map(s => s.variable)).size, 1, material)
      for (const s of states) {
        if (material === 'matte') assert.match(s.image, /data:image\/svg\+xml/, `${s.selector} grain`)
        else if (material === 'liquid') {
          assert.match(s.image, /gradient/, `${s.selector} liquid highlight`)
          assert.doesNotMatch(s.image, /data:image\/svg\+xml/, `${s.selector} liquid has no grain`)
        } else assert.equal(s.image, 'none', `${material} ${s.selector} has no grain`)
        assert.equal(s.hostFilter, 'none', `${material} ${s.selector} host`)
        assert.notEqual(s.filter, 'none', `${material} ${s.selector} pane`)
        assert.equal(s.content, '""', s.selector)
        assert.equal(s.radius, s.hostRadius, s.selector)
        assert.match(s.fill, /\/\s*0?\.\d+\)$/, `${s.selector} translucent: ${s.fill}`)
        assert.equal(s.hostShadow, 'none', s.selector)
        assert.equal(s.border, '0px', s.selector)
      }
      assert.equal(await page.locator('.x_bubble').evaluate(el => getComputedStyle(el).backdropFilter), 'none', `${material} message stays clear`)
      assert.deepEqual(await page.locator('.probe').evaluate(el => { const r = el.getBoundingClientRect(); return [r.x, r.y] }), [7, 9])
      for (const selector of ['.x_sidebarCol', '.x_header', '.x_card', '.x_bar']) {
        await page.locator(selector).hover()
        await page.locator(`${selector} :is(button,input)`).focus()
        const state = await page.locator(selector).evaluate(el => ({ shadow: getComputedStyle(el).boxShadow, border: getComputedStyle(el, '::before').borderTopWidth, paneShadow: getComputedStyle(el, '::before').boxShadow }))
        assert.equal(state.shadow, 'none', `${selector} hover/focus host has no extra border`)
        assert.equal(state.border, '0px', `${selector} pane has no border`)
        assert.equal(state.paneShadow, states.find(s => s.selector === selector).paneShadow, `${selector} edge unchanged`)
      }
    }
    for (let i = 0; i < 4; i++) {
      for (const property of ['fill', 'paneShadow', 'filter']) {
        assert.equal(new Set(['liquid', 'frosted', 'matte'].map(mode => materialStyles[mode][i][property])).size, 3, `${materialStyles.liquid[i].selector} distinct ${property}`)
      }
    }
  })
}

for (const dark of [false, true]) test(`${dark ? 'dark' : 'light'} accessibility settings remove shell filters and grain`, async t => {
  const page = await setup(t, dark)
  const cdp = await page.context().newCDPSession(page)
  for (const feature of ['prefers-reduced-transparency', 'prefers-contrast', 'forced-colors']) {
    const value = feature === 'forced-colors' ? 'active' : feature === 'prefers-contrast' ? 'more' : 'reduce'
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: feature, value }] })
    for (const mode of ['auto', 'liquid', 'frosted', 'matte']) {
      await page.evaluate(mode => { if (mode === 'auto') delete document.body.dataset.bloomGlass; else document.body.dataset.bloomGlass = mode }, mode)
      for (const selector of ['.x_sidebarCol', '.x_header', '.x_card', '.x_bar']) {
        const pane = await page.locator(selector).evaluate(el => { const s = getComputedStyle(el, '::before'); return { filter: s.backdropFilter, image: s.backgroundImage, color: s.backgroundColor } })
        if (feature === 'prefers-reduced-transparency' && mode !== 'auto') {
          assert.notEqual(pane.filter, 'none', `${feature} explicit ${mode} ${selector} filter`)
          if (mode === 'matte') assert.match(pane.image, /data:image\/svg\+xml/, `${feature} explicit matte grain`)
        } else {
          assert.equal(pane.filter, 'none', `${feature} ${mode} ${selector} filter`)
          assert.equal(pane.image, 'none', `${feature} ${mode} ${selector} grain`)
          assert.ok(!/\/\s*0?\.\d+\)$/.test(pane.color), `${feature} ${mode} ${selector} solid: ${pane.color}`)
        }
      }
    }
  }
})
