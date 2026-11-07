import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// Light liquid-glass layout regressions measured against the production CSS
// order: bloom → components → glass → adaptive (client.ts installSkin), then
// switcher.css (injected when the switcher mounts). Assertions read real
// geometry and computed styles, not stylesheet text.
// Run: node --test test/liquid-layout.test.mjs

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
      window.BLOOM_CSS = [buildBloomCSS(), COMPONENT_CSS, GLASS_CSS, BACKGROUND_CSS, BUTTON_CSS, ADAPTIVE_CSS, SURFACES_CSS, SWITCHER_CSS];`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})

const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())

const ROWS = Array.from({ length: 30 }, (_, i) => `<div role="treeitem" class="r">Session ${i}</div>`).join('')
const HTML = `
<style>
  body { margin: 0; display: grid; grid-template-columns: 260px 1fr; height: 100vh; }
  .x_sidebarCol { margin: 40px 0 0 30px; height: 600px; display: flex; flex-direction: column; }
  .x_treeBody { flex: 1; overflow: auto; }
  .r { height: 28px; }
  .fixed-probe { position: fixed; left: 7px; top: 9px; width: 10px; height: 10px; }
  .x_composer { margin: 300px 40px; }
  .x_card { height: 120px; }
</style>
<div class="x_sidebarCol"><div class="x_treeBody" id="tree">${ROWS}</div><div class="fixed-probe" id="sideFixed"></div></div>
<main>
  <header class="x_header"><div class="x_tabs">tabs</div>
    <div class="dsh-bloom-switcher" id="sw" style="position:relative;display:inline-block;margin-left:200px">
      <button class="dsh-bloom-trigger" id="trigger">Bloom</button>
      <div class="dsh-bloom-menu" id="menu"><div class="dsh-bloom-option">Mist</div></div>
    </div>
  </header>
  <div class="x_composer"><div class="x_card" id="card"><textarea></textarea><div class="fixed-probe" id="cardFixed"></div></div></div>
</main>`

async function setup(t, { dark = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } })
  t.after(() => context.close())
  const page = await context.newPage()
  await page.route('https://bloom.test/', route => route.fulfill({ contentType: 'text/html', body: `<html><body data-bloom-variant="mist">${HTML}</body></html>` }))
  await page.goto('https://bloom.test/')
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(dark => {
    for (const css of window.BLOOM_CSS) {
      const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s)
    }
    if (dark) document.body.setAttribute('data-ds-dark-theme', '')
  }, dark)
  return page
}

test('menu stays absolutely anchored below its trigger and inside the viewport', async t => {
  const page = await setup(t)
  const m = await page.evaluate(() => {
    const menu = document.getElementById('menu').getBoundingClientRect()
    const trig = document.getElementById('trigger').getBoundingClientRect()
    return { pos: getComputedStyle(document.getElementById('menu')).position, menuTop: menu.top, trigBottom: trig.bottom, right: menu.right, w: innerWidth }
  })
  assert.equal(m.pos, 'absolute')
  assert.ok(m.menuTop >= m.trigBottom, `menu top ${m.menuTop} below trigger ${m.trigBottom}`)
  assert.ok(m.right <= m.w)
})

test('fixed descendants of sidebar and composer stay viewport-fixed (no filtered containing block)', async t => {
  const page = await setup(t)
  const r = await page.evaluate(() => ['sideFixed', 'cardFixed'].map(id => {
    const b = document.getElementById(id).getBoundingClientRect(); return [id, b.left, b.top]
  }))
  for (const [id, left, top] of r) assert.deepEqual([left, top], [7, 9], `${id} escaped to a filtered ancestor`)
})

test('glass pseudos remain absolutely positioned decoration layers', async t => {
  const page = await setup(t)
  const pos = await page.evaluate(() => ({
    sidebar: getComputedStyle(document.querySelector('.x_sidebarCol'), '::before').position,
    card: getComputedStyle(document.getElementById('card'), '::before').position,
    sidebarHost: getComputedStyle(document.querySelector('.x_sidebarCol')).position,
    cardHost: getComputedStyle(document.getElementById('card')).position,
  }))
  assert.equal(pos.sidebar, 'absolute')
  assert.equal(pos.card, 'absolute')
  assert.notEqual(pos.sidebarHost, 'static')
  assert.notEqual(pos.cardHost, 'static')
})

test('sidebar content is never masked, so the last row stays readable', async t => {
  const page = await setup(t)
  await page.evaluate(() => { const t = document.getElementById('tree'); t.scrollTop = t.scrollHeight })
  const masked = await page.evaluate(() => {
    const out = []
    for (let el = document.querySelector('.r:last-child'); el && el !== document.documentElement; el = el.parentElement) {
      const cs = getComputedStyle(el)
      if (cs.maskImage !== 'none' || cs.webkitMaskImage !== 'none') out.push(el.className)
    }
    return out
  })
  assert.deepEqual(masked, [])
})

test('light composer hover keeps a single edge (no host border on top of the liquid rim)', async t => {
  const page = await setup(t)
  await page.hover('#card')
  const s = await page.evaluate(() => {
    const cs = getComputedStyle(document.getElementById('card'))
    const alpha = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 1; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? Number(p[3]) : 1 }
    const border = parseFloat(cs.borderTopWidth) > 0 && alpha(cs.borderTopColor) > 0
    const insetRing = /inset/.test(cs.boxShadow) && /0px 0px 0px 1px/.test(cs.boxShadow)
    return { border, insetRing, borderColor: cs.borderTopColor, shadow: cs.boxShadow }
  })
  assert.ok(!(s.border && s.insetRing), `doubled edge: border ${s.borderColor} + ${s.shadow}`)
})

test('reduced motion stops light typing glow; light never uses the dark sweep', async t => {
  const page = await setup(t)
  await page.evaluate(() => document.body.setAttribute('data-bloom-typing', 'true'))
  const anim = () => page.evaluate(() => getComputedStyle(document.getElementById('card'), '::after').animationName)
  assert.notEqual(await anim(), 'dsh-bloom-typing-sweep', 'light typing must not sweep')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(await anim(), 'none')
})

test('light typing animation never starts while idle and stops after input ends', async t => {
  const page = await setup(t)
  const state = () => page.evaluate(() => {
    const cs = getComputedStyle(document.getElementById('card'), '::after')
    return { animation: cs.animationName, opacity: Number(cs.opacity) }
  })
  for (const material of ['frosted', 'matte', 'liquid']) {
    await page.evaluate(value => document.body.dataset.bloomGlass = value, material)
    assert.deepEqual(await state(), { animation: 'none', opacity: 0 }, `${material}: idle`)
    await page.evaluate(() => document.body.dataset.bloomTyping = 'true')
    assert.equal((await state()).animation, 'dsh-bloom-typing-breath')
    await page.evaluate(() => delete document.body.dataset.bloomTyping)
    await page.waitForTimeout(400)
    assert.deepEqual(await state(), { animation: 'none', opacity: 0 }, `${material}: stopped`)
  }
})

test('dark typing keeps its sweep', async t => {
  const page = await setup(t, { dark: true })
  await page.evaluate(() => document.body.setAttribute('data-bloom-typing', 'true'))
  const name = await page.evaluate(() => getComputedStyle(document.getElementById('card'), '::after').animationName)
  assert.match(name, /dsh-bloom-typing-sweep/)
})

test('selected palette has one keyboard focus edge and no pointer focus frame', async t => {
  const page = await setup(t)
  await page.evaluate(() => {
    const option = document.querySelector('.dsh-bloom-option')
    option.tabIndex = 0
    option.dataset.active = 'true'
    document.documentElement.dataset.inputModality = 'keyboard'
  })
  await page.focus('#trigger')
  await page.keyboard.press('Tab')
  const state = () => page.evaluate(() => {
    const option = document.querySelector('.dsh-bloom-option')
    const cs = getComputedStyle(option)
    return { focused: document.activeElement === option, width: cs.outlineWidth, color: cs.outlineColor, shadow: cs.boxShadow }
  })
  const keyboard = await state()
  assert.equal(keyboard.focused, true)
  assert.equal(keyboard.width, '2px')
  assert.notEqual(keyboard.color, 'rgba(0, 0, 0, 0)')
  assert.equal(keyboard.shadow, 'none', 'selection rim must not duplicate the keyboard focus outline')
  await page.evaluate(() => document.documentElement.dataset.inputModality = 'pointer')
  await page.click('.dsh-bloom-option')
  const pointer = await state()
  assert.ok(pointer.width === '0px' || pointer.color === 'rgba(0, 0, 0, 0)', `unexpected pointer outline: ${JSON.stringify(pointer)}`)
})
