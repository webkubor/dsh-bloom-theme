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
      import { ADAPTIVE_CSS } from './src/css/adaptive.ts';
      import { SURFACES_CSS } from './src/css/surfaces.ts';
      import { SWITCHER_CSS } from './src/css/switcher.ts';
      import { buildLiquidLens } from './src/liquid-lens.ts';
      window.fixture = { css: [buildBloomCSS(), COMPONENT_CSS, GLASS_CSS, BACKGROUND_CSS, BUTTON_CSS, ADAPTIVE_CSS, SURFACES_CSS, SWITCHER_CSS], buildLiquidLens };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())

const HTML = `<style>
body { margin:0; }
.x_sidebarCol { position:relative; width:250px; height:400px; margin:30px; }
.x_header { position:relative; height:60px; }
.x_composer { margin:40px; width:600px; }
.x_card { height:120px; }
.fixed-probe { position:fixed; left:7px; top:9px; width:5px; height:5px; }
</style>
<header class="x_header"><div class="x_tabs">Tabs</div></header>
<div class="x_sidebarCol"><div class="x_treeBody">Content</div><i id="sideFixed" class="fixed-probe"></i></div>
<div class="x_composer"><div class="x_card"><input id="input"><i id="cardFixed" class="fixed-probe"></i></div></div>
<div class="dsh-bloom-switcher"><button class="dsh-bloom-trigger">Bloom</button><div class="dsh-bloom-menu">Appearance</div></div>`

async function setup(t, { dark = false, touch = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, hasTouch: touch, isMobile: touch })
  t.after(() => context.close())
  const page = await context.newPage()
  await page.route('https://bloom.test/', route => route.fulfill({ contentType: 'text/html', body: `<html><body data-bloom-variant="mist">${HTML}</body></html>` }))
  await page.goto('https://bloom.test/')
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(dark => {
    document.body.append(window.fixture.buildLiquidLens(document))
    for (const css of window.fixture.css) { const s = document.createElement('style'); s.textContent = css; document.head.append(s) }
    if (dark) document.body.setAttribute('data-ds-dark-theme', '')
  }, dark)
  return page
}
const select = (page, material) => page.evaluate(material => {
  if (material) document.body.dataset.bloomGlass = material
  else delete document.body.dataset.bloomGlass
}, material)
const measure = page => page.evaluate(() => {
  const get = (selector, pseudo) => {
    const el = document.querySelector(selector), s = getComputedStyle(el, pseudo)
    return { blur: s.backdropFilter, image: s.backgroundImage, color: s.backgroundColor, shadow: s.boxShadow, position: s.position, mask: s.maskImage }
  }
  return { sidebar: get('.x_sidebarCol', '::before'), header: get('.x_header', '::before'), card: get('.x_card', '::before'), menu: get('.dsh-bloom-menu'), host: get('.x_card') }
})
async function emulate(page, features) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setEmulatedMedia', { features })
  await page.waitForTimeout(100)
}

for (const dark of [false, true]) {
  const scheme = dark ? 'dark' : 'light'
  test(`${scheme}: three physical materials have distinct blur, grain and edge`, async t => {
    const page = await setup(t, { dark }), styles = {}
    for (const material of ['frosted', 'matte', 'liquid']) {
      await select(page, material); styles[material] = await measure(page)
      for (const key of ['sidebar', 'header', 'card', 'menu']) {
        const s = styles[material][key]
        if (material === 'frosted') {
          assert.match(s.blur, /blur\(24px\)/, key)
          assert.doesNotMatch(s.blur, /url\(/, key)
          assert.equal(s.image, 'none', `${key}: smooth frosted has no grain`)
        } else if (material === 'matte') {
          assert.match(s.blur, /blur\(12px\)/, key)
          assert.match(s.image, /data:image\/svg\+xml/, `${key}: grain present`)
          assert.doesNotMatch(s.blur, /url\(/, key)
        } else {
          assert.match(s.blur, /blur\(3px\)/, key)
          assert.match(s.blur, /url\(["']?#dsh-bloom-liquid-lens/, `${key}: actual lens in both schemes`)
          assert.match(s.image, /linear-gradient/, key)
        }
      }
    }
    assert.notEqual(styles.frosted.card.color, styles.matte.card.color)
    assert.notEqual(styles.frosted.card.shadow, styles.matte.card.shadow)
    assert.equal(styles.liquid.host.shadow, 'none', 'liquid shell has no duplicate host edge')
    assert.equal(styles.matte.host.shadow, 'none', 'matte shell has no duplicate host edge')
  })

  test(`${scheme}: every material preserves fixed descendants, anchor layout and content`, async t => {
    const page = await setup(t, { dark })
    for (const material of ['frosted', 'matte', 'liquid']) {
      await select(page, material)
      const s = await measure(page)
      assert.equal(s.host.blur, 'none')
      assert.equal(s.host.position, 'relative')
      for (const k of ['sidebar', 'header', 'card', 'menu']) assert.equal(s[k].position, 'absolute', k)
      const rects = await page.evaluate(() => ['sideFixed', 'cardFixed'].map(id => {
        const r = document.getElementById(id).getBoundingClientRect(); return [r.x, r.y]
      }))
      assert.deepEqual(rects, [[7, 9], [7, 9]], material)
      assert.equal(await page.locator('.x_treeBody').evaluate(e => getComputedStyle(e).maskImage), 'none')
    }
  })

  test(`${scheme}: high contrast removes all material filters and images`, async t => {
    const page = await setup(t, { dark })
    await emulate(page, [{ name: 'prefers-contrast', value: 'more' }])
    for (const material of ['frosted', 'matte', 'liquid']) {
      await select(page, material)
      const s = await measure(page)
      for (const k of ['sidebar', 'header', 'card', 'menu']) {
        assert.equal(s[k].blur, 'none', `${material}/${k}`)
        assert.equal(s[k].image, 'none', `${material}/${k}`)
      }
    }
  })

  test(`${scheme}: reduced transparency downgrades auto only`, async t => {
    const page = await setup(t, { dark })
    await emulate(page, [{ name: 'prefers-reduced-transparency', value: 'reduce' }])
    for (const s of Object.values(await measure(page)).slice(0, 4)) {
      assert.equal(s.blur, 'none'); assert.equal(s.image, 'none')
    }
    await select(page, 'liquid')
    assert.match((await measure(page)).card.blur, /dsh-bloom-liquid-lens/)
  })
}

test('auto is liquid in both schemes; switching materials leaves background alone', async t => {
  const page = await setup(t)
  assert.match((await measure(page)).card.blur, /dsh-bloom-liquid-lens/)
  for (const dark of [false, true]) {
    await page.evaluate(dark => document.body.toggleAttribute('data-ds-dark-theme', dark), dark)
    const bg = () => page.evaluate(() => [getComputedStyle(document.body).backgroundImage, getComputedStyle(document.body, '::before').backgroundImage])
    const before = await bg()
    for (const material of ['frosted', 'matte', 'liquid']) { await select(page, material); assert.deepEqual(await bg(), before) }
    await select(page, null)
  }
  assert.match((await measure(page)).card.blur, /dsh-bloom-liquid-lens/)
})

test('dark liquid has dark token fill; matte uses scheme-specific grain', async t => {
  const page = await setup(t)
  await select(page, 'liquid'); const lightLiquid = (await measure(page)).card.image
  await select(page, 'matte'); const lightGrain = (await measure(page)).card.image
  await page.evaluate(() => document.body.setAttribute('data-ds-dark-theme', ''))
  const darkGrain = (await measure(page)).card.image
  assert.notEqual(lightGrain, darkGrain, 'dark grain selector must match body itself, not a nested body')
  await select(page, 'liquid'); const dark = await measure(page)
  assert.notEqual(dark.card.image, lightLiquid)
  const fill=await page.evaluate(()=>{
    const color=getComputedStyle(document.querySelector('.x_card'),'::before').backgroundColor
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1
    const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1,1)
    return [...ctx.getImageData(0,0,1,1).data].slice(0,3)
  })
  assert.ok(Math.max(...fill)<120, `dark liquid fill must remain dark: ${fill}`)
  assert.match(dark.card.blur, /dsh-bloom-liquid-lens/)
})

test('forced colors removes lens, grain and ambient images for all materials', async t => {
  const page = await setup(t)
  await emulate(page, [{ name: 'forced-colors', value: 'active' }])
  for (const material of ['frosted', 'matte', 'liquid']) {
    await select(page, material)
    for (const s of Object.values(await measure(page)).slice(0, 4)) { assert.equal(s.blur, 'none'); assert.equal(s.image, 'none') }
  }
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundImage), 'none')
})

test('mouse modality hides button focus token but not editable input focus', async t => {
  const page = await setup(t)
  await page.evaluate(() => document.documentElement.dataset.inputModality = 'pointer')
  for (const selector of ['.dsh-bloom-trigger', '#input']) {
    await page.locator(selector).focus()
    const token = await page.locator(selector).evaluate(e => getComputedStyle(e).getPropertyValue('--dsw-focus-ring-color').trim())
    if (selector === '#input') assert.notEqual(token, 'transparent')
    else assert.equal(token, 'transparent')
  }
})

test('coarse pointer grows tappable rows', async t => {
  const page = await setup(t, { touch: true })
  const height = await page.evaluate(() => {
    const e = document.createElement('button'); e.className = 'dsh-bloom-option'; document.body.append(e)
    return getComputedStyle(e).minHeight
  })
  assert.equal(height, '44px')
})

test('printing removes material filters and switcher', async t => {
  const page = await setup(t)
  await select(page, 'liquid'); await page.emulateMedia({ media: 'print' })
  assert.equal((await measure(page)).card.blur, 'none')
  assert.equal(await page.locator('.dsh-bloom-trigger').evaluate(e => getComputedStyle(e).display), 'none')
})
