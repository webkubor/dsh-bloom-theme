import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// Ambience contract, asserted on computed styles:
// starlight exists only in dark; light uses themed glass backdrops; presets are CSS-only.

const { outputFiles } = await build({
  stdin: {
    contents: `import './test/slot-fixture.mjs';
      import * as React from 'react';
      import { createBloomComponents } from './src/ui.ts';
      import { buildSparkles } from './src/starlight.ts';
      import { GLASS_CSS } from './src/css/glass.ts';
      import { BACKGROUND_CSS } from './src/css/background.ts';
      import { COMPONENT_CSS } from './src/css/component.ts';
      import { initAmbience, writeAmbience, readAmbience, clearAmbience } from './src/ambience.ts';
      const { Decorations } = createBloomComponents(React, () => () => {});
      window.fixture = { mount: () => window.fixtureSlots.inject('shell.overlay', () => window.fixtureSlots.register({name:'shell.overlay', id:'dsh-bloom-theme.decorations', order:-100}, Decorations)), buildSparkles, GLASS_CSS, BACKGROUND_CSS, COMPONENT_CSS, initAmbience, writeAmbience, readAmbience, clearAmbience };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
    loader: 'ts',
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
})

const browser = await chromium.launch({
  executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined,
})
test.after(() => browser.close())

async function setup(t, dark) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } })
  t.after(() => context.close())
  const page = await context.newPage()
  await page.setContent(`<!doctype html><html><body data-bloom-variant="mist"${dark ? ' data-ds-dark-theme' : ''}></body></html>`)
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => {
    const st = document.createElement('style')
    st.textContent = window.fixture.GLASS_CSS + window.fixture.BACKGROUND_CSS
    document.head.appendChild(st)
    window.fixture.mount()
  })
  return page
}

const layerState = () => {
  const el = document.getElementById('dsh-bloom-sparkles')
  const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
  const shown = c => Array.from(el.querySelectorAll('i.' + c)).filter(i => getComputedStyle(i).display !== 'none').length
  return { display: cs.display, width: r.width, height: r.height, pe: cs.pointerEvents, bg: cs.backgroundImage,
    position: cs.position, tr: shown('s-tr'), bl: shown('s-bl'), amb: shown('s-amb') }
}

test('starlight is dark-only and never shows in light mode, whatever the presets', async t => {
  const page = await setup(t, false)
  const states = await page.evaluate(stateSrc => {
    const state = new Function('return (' + stateSrc + ')()')
    return ['diagonal', 'galaxy', 'corner', 'off'].map(p => { document.body.setAttribute('data-bloom-ambience-dark', p); return state().display })
  }, layerState.toString())
  assert.deepEqual(states, ['none', 'none', 'none', 'none'])
})

test('dark presets change geometry and particle clusters; layer never covers content', async t => {
  const page = await setup(t, true)
  const r = await page.evaluate(stateSrc => {
    const state = new Function('return (' + stateSrc + ')()')
    const out = { initial: state() }
    for (const p of ['diagonal', 'galaxy', 'corner', 'off']) { document.body.setAttribute('data-bloom-ambience-dark', p); out[p] = state() }
    return out
  }, layerState.toString())
  assert.equal(r.initial.display, 'block', 'default preset shows starlight')
  assert.equal(r.initial.width, 360, 'default dark preset keeps the v0.26.0 corner box')
  assert.equal(r.initial.height, 220)
  for (const k of ['diagonal', 'galaxy']) {
    assert.equal(r[k].display, 'block'); assert.equal(r[k].width, 1200); assert.equal(r[k].height, 800)
    assert.equal(r[k].pe, 'none'); assert.equal(r[k].bg, 'none'); assert.equal(r[k].position, 'fixed')
  }
  assert.ok(r.diagonal.bl > 0 && r.diagonal.amb === 0, 'diagonal = top-right nebula + bottom-left dust')
  assert.ok(r.galaxy.amb > 0 && r.galaxy.bl > 0, 'galaxy adds ambient dust')
  assert.equal(r.corner.width, 360); assert.equal(r.corner.height, 220)
  assert.ok(r.corner.tr > 0 && r.corner.bl === 0 && r.corner.amb === 0)
  assert.equal(r.off.display, 'none')
})

test('dark stars keep the v0.26.0 look: white points and palette-tinted points', async t => {
  const page = await setup(t, true)
  const r = await page.evaluate(() => {
    const white = document.querySelector('#dsh-bloom-sparkles > i:not(.t)')
    const tint = document.querySelector('#dsh-bloom-sparkles > i.t')
    document.body.style.setProperty('--bloom-accent', '#b63d73')
    const pink = getComputedStyle(tint).backgroundColor
    document.body.style.setProperty('--bloom-accent', '#297cb5')
    return { white: getComputedStyle(white).backgroundColor, pink, blue: getComputedStyle(tint).backgroundColor,
      names: getComputedStyle(white).animationName }
  })
  assert.equal(r.white, 'rgb(255, 255, 255)')
  assert.notEqual(r.pink, r.blue)
  assert.match(r.names, /bloom-spark-drift/)
  assert.match(r.names, /bloom-spark-twinkle/)
})

test('dark presets share the base backdrop, while off removes the background', async t => {
  const page = await setup(t, true)
  const r = await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = window.fixture.COMPONENT_CSS
    document.head.append(style)
    return ['corner', 'diagonal', 'galaxy', 'off'].map(p => {
      document.body.setAttribute('data-bloom-ambience-dark', p)
      return getComputedStyle(document.body, '::before').backgroundImage
    })
  })
  assert.equal(new Set(r.slice(0, 3)).size, 1)
  assert.equal(r[3], 'none')
})

test('reduced motion keeps dark stars visible and static', async t => {
  const page = await setup(t, true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const state = await page.locator('#dsh-bloom-sparkles > i').first().evaluate(dot => ({
    animation: getComputedStyle(dot).animationName, opacity: getComputedStyle(dot).opacity }))
  assert.equal(state.animation, 'none')
  assert.ok(Number(state.opacity) > 0)
})

test('dots drift with a non-zero offset and the layout is seed-stable across remounts', async t => {
  const page = await setup(t, true)
  const r = await page.evaluate(() => {
    const i = document.querySelector('#dsh-bloom-sparkles > i')
    const offset = parseFloat(i.style.getPropertyValue('--dx')) + parseFloat(i.style.getPropertyValue('--dy'))
    const a = window.fixture.buildSparkles(document).innerHTML
    const b = window.fixture.buildSparkles(document).innerHTML
    window.unmountFixtureSlot('shell.overlay')
    const gone = !document.getElementById('dsh-bloom-sparkles')
    window.remountFixtureSlot('shell.overlay')
    return { offset, same: a === b, gone, one: document.querySelectorAll('#dsh-bloom-sparkles').length === 1 }
  })
  assert.notEqual(r.offset, 0); assert.ok(r.same); assert.ok(r.gone); assert.ok(r.one)
})

test('light presets give distinct themed backdrops; dark keeps its own nebula', async t => {
  const page = await setup(t, false)
  const r = await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = window.fixture.COMPONENT_CSS
    document.head.append(style)
    document.body.style.setProperty('--bloom-morandi', '146,168,179')
    document.body.style.setProperty('--bloom-accent', '#297cb5')
    const bg = () => getComputedStyle(document.body, '::before').backgroundImage
    const out = { default: bg() }
    for (const p of ['stream', 'wash', 'clear', 'off']) { document.body.setAttribute('data-bloom-ambience-light', p); out[p] = bg() }
    document.body.setAttribute('data-bloom-ambience-light', 'stream')
    document.body.style.setProperty('--bloom-accent', '#b63d73')
    out.pinkStream = bg()
    document.body.setAttribute('data-ds-dark-theme', '')
    out.dark = bg()
    return out
  })
  assert.equal(r.default, r.stream, 'stream is the light default')
  assert.equal(new Set([r.stream, r.wash, r.clear]).size, 3, 'three light presets differ')
  assert.equal(r.off, 'none')
  assert.notEqual(r.stream, r.pinkStream, 'light glass follows the palette')
  assert.notEqual(r.dark, r.stream)
  assert.doesNotMatch(r.dark, /linear-gradient/)
})

test('ambience persists per scheme, rejects foreign presets and survives private mode', async t => {
  const page = await setup(t, false)
  const r = await page.evaluate(() => {
    const f = window.fixture
    const mem = new Map()
    let deny = false
    Object.defineProperty(window, 'localStorage', { configurable: true, get() {
      if (deny) throw new Error('denied')
      return { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)) }
    } })
    f.initAmbience()
    const defaults = [document.body.getAttribute('data-bloom-ambience-dark'), document.body.getAttribute('data-bloom-ambience-light')]
    const okDark = f.writeAmbience('dark', 'galaxy')
    const rejected = f.writeAmbience('dark', 'wash')
    f.writeAmbience('light', 'clear')
    const read = [f.readAmbience('dark'), f.readAmbience('light')]
    const glass = document.body.getAttribute('data-bloom-glass')
    deny = true
    const priv = f.readAmbience('dark'); f.writeAmbience('light', 'wash')
    f.clearAmbience()
    return { defaults, okDark, rejected, read, glass, priv, cleared: document.body.hasAttribute('data-bloom-ambience-light') }
  })
  assert.deepEqual(r.defaults, ['corner', 'stream'])
  assert.equal(r.okDark, true); assert.equal(r.rejected, false)
  assert.deepEqual(r.read, ['galaxy', 'clear'])
  assert.equal(r.glass, null, 'ambience writes never touch other dimensions')
  assert.equal(r.priv, 'galaxy', 'private mode keeps the just-written choice')
  assert.equal(r.cleared, false)
})

test('meteor shower shows only in dark galaxy, follows the palette and respects reduced motion', async t => {
  const page = await setup(t, true)
  const shown = () => page.evaluate(() => [...document.querySelectorAll('#dsh-bloom-sparkles > b.s-met')].filter(m => getComputedStyle(m).display !== 'none').length)
  const r = {}
  for (const p of ['corner', 'diagonal', 'galaxy']) { await page.evaluate(p => document.body.setAttribute('data-bloom-ambience-dark', p), p); r[p] = await shown() }
  const colors = await page.evaluate(() => {
    const m = document.querySelector('#dsh-bloom-sparkles > b.s-met')
    document.body.style.setProperty('--bloom-motion-1', '#b63d73'); const pink = getComputedStyle(m).backgroundImage
    document.body.style.setProperty('--bloom-motion-1', '#297cb5'); return { pink, blue: getComputedStyle(m).backgroundImage, anim: getComputedStyle(m).animationName }
  })
  await page.evaluate(() => document.body.removeAttribute('data-ds-dark-theme')); const light = await shown()
  await page.evaluate(() => document.body.setAttribute('data-ds-dark-theme', ''))
  await page.emulateMedia({ reducedMotion: 'reduce' }); const reduced = await shown()
  assert.equal(r.corner, 0); assert.equal(r.diagonal, 0); assert.ok(r.galaxy >= 20)
  assert.notEqual(colors.pink, colors.blue); assert.equal(colors.anim, 'bloom-meteor')
  assert.equal(light, 0); assert.equal(reduced, 0)
})

test('meteors keep the established shape: top-right to bottom-left, 40 streaks, unchanged count', async t => {
  const page = await setup(t, true)
  await page.evaluate(() => document.body.setAttribute('data-bloom-ambience-dark', 'galaxy'))
  const r = await page.evaluate(() => {
    const ms = [...document.querySelectorAll('#dsh-bloom-sparkles > b.s-met')]
    const angles = ms.map(m => parseFloat(m.style.getPropertyValue('--rot')))
    const travels = ms.map(m => parseFloat(m.style.getPropertyValue('--travel')))
    const cs = getComputedStyle(ms[0])
    return {
      count: ms.length,
      minAngle: Math.min(...angles),
      maxAngle: Math.max(...angles),
      minTravel: Math.min(...travels),
      originX: parseFloat(cs.transformOrigin),
      originY: parseFloat(cs.transformOrigin.split(' ')[1]),
      height: parseFloat(cs.height),
    }
  })
  assert.equal(r.count, 40, 'meteor count is unchanged')
  // -28deg to -44deg: the streak always falls towards the lower left.
  assert.ok(r.minAngle >= -44.5 && r.maxAngle <= -27.5, `angle range drifted: ${r.minAngle}..${r.maxAngle}`)
  // Long enough to actually reach the bottom-left corner of the screen.
  assert.ok(r.minTravel >= 900, `travel too short to cross the screen: ${r.minTravel}`)
  // The streak rotates around its left-middle point. Percentages resolve to
  // pixels per element, so compare against half of this meteor's own height
  // instead of a literal '50%' string.
  assert.equal(r.originX, 0, 'streak pivots on its left edge')
  assert.ok(Math.abs(r.originY - r.height / 2) < 0.01, `origin ${r.originY} is not the middle of ${r.height}`)
})

test('switching palette re-colours meteors one cycle at a time, not all at once', async t => {
  const page = await setup(t, true)
  await page.evaluate(() => document.body.setAttribute('data-bloom-ambience-dark', 'galaxy'))
  const r = await page.evaluate(async () => {
    const ms = [...document.querySelectorAll('#dsh-bloom-sparkles > b.s-met')]
    // Lock a colour on the first meteor to simulate a streak already in flight.
    ms[0].style.setProperty('--meteor-color', '#ff0000')
    document.body.style.setProperty('--bloom-motion-1', '#00ff00')
    const before = ms[0].style.getPropertyValue('--meteor-color')
    // Fire the animationiteration handler the way the browser does.
    ms[0].dispatchEvent(new AnimationEvent('animationiteration', { bubbles: true }))
    const after = ms[0].style.getPropertyValue('--meteor-color')
    return { before, after, other: ms[1].style.getPropertyValue('--meteor-color') }
  })
  // The in-flight meteor keeps the old colour until its next cycle starts.
  assert.equal(r.before, '#ff0000')
  // When the cycle restarts it picks up the new palette colour.
  assert.equal(r.after, '#00ff00')
  // Other meteors are untouched: they switch one by one, not all at once.
  assert.notEqual(r.other, '#00ff00')
})
