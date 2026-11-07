import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// Real React / host-loaded plugin and official Slot registration, with a synthetic host header.
const { outputFiles } = await build({ stdin: { resolveDir: fileURLToPath(new URL('..', import.meta.url)), contents: `
  import './test/slot-fixture.mjs'; import './src/client.ts';
  const services = { slots: window.fixtureSlots, locale: window.fixtureLocale }, disposers = [];
  const strict = declared => new Proxy({}, { get(_, key) {
    if (key === 'effect') return fn => { const d = fn(); if (typeof d === 'function') disposers.push(d); return d };
    if (key === 'inject') return (names, cb) => { if (names.every(n => services[n])) return cb(strict([...declared, ...names])) };
    if (typeof key === 'symbol' || key === 'then') return undefined;
    if (!declared.includes(key)) throw Error('undeclared service ' + String(key));
    return services[key];
  }});
  const mod = window.__ModuleLoader__._module;
  mod.apply(strict(mod.inject));
  window.disposeBloom = () => { window.disposeFixtureSlots(); while (disposers.length) disposers.pop()() };
` }, bundle: true, write: false, format: 'iife', platform: 'browser' })
const scenarios = [
  { name: 'expanded', width: 1000, clearance: '0px', iconX: -40, frameLeft: 280 },
  { name: 'collapsed', width: 1000, clearance: '160px', iconX: 100 },
  { name: 'fullscreen', width: 1000, clearance: '84px', iconX: 12 },
  { name: 'drawer', width: 700, clearance: '160px', iconX: 88 },
  { name: 'narrow-drawer', width: 380, clearance: '84px', iconX: 12 },
  { name: 'missing-variable', width: 1000, clearance: null, iconX: -40, frameLeft: 280 },
]
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())
for (const lang of ['zh', 'en']) for (const scenario of scenarios) {
  test(`${lang}: ${scenario.name} respects host leading clearance`, async t => {
    const context = await browser.newContext({ viewport: { width: scenario.width, height: 700 }, reducedMotion: 'reduce' })
    t.after(() => context.close())
    const page = await context.newPage()
    await page.route('**/*', route => route.request().url() === 'https://bloom.test/'
      ? route.fulfill({ contentType: 'text/html', body: `<!doctype html><html data-platform="darwin"><head><style>
      * { box-sizing:border-box } body { margin:0 } .frame { position:relative; margin-left:${scenario.frameLeft ?? 0}px; height:100vh }
      .icon { position:absolute; left:${scenario.iconX}px; top:11px; width:28px; height:28px; z-index:15 }
      header { position:relative; display:grid; grid-template-columns:auto minmax(0,1fr); padding:10px 28px 0 20px; height:48px; overflow:hidden; contain:paint }
      .leading { display:flex; grid-area:1/1; align-items:center } .title { grid-column:2 }
      main { position:relative; z-index:5; height:600px; background:#fafafa }
      </style></head><body><div class="frame" ${scenario.clearance === null ? '' : `style="--dsh-frame-leading-clearance:${scenario.clearance}"`}>
      <button class="icon" aria-label="sidebar" onclick="this.dataset.clicked='yes'"></button>
      <header><div class="leading" data-fixture-leading></div><div class="title"></div></header><main></main></div></body></html>` })
      : route.fulfill({ status: 404, body: '' }))
    await page.goto('https://bloom.test/')
    await page.evaluate(lang => {
      const dict = {}
      window.fixtureLocale = { active: lang, register(ns, d) { dict[ns] = d; return () => delete dict[ns] },
        bind(ns) { return key => dict[ns]?.[this.active]?.[key] ?? key }, subscribe() { return () => {} } }
    }, lang)
    await page.addScriptTag({ content: outputFiles[0].text })
    await page.waitForSelector('.dsh-bloom-trigger')
    await page.evaluate(async () => {
      const trigger = document.querySelector('.dsh-bloom-trigger')
      await Promise.all(trigger.getAnimations().filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a => a.finished.catch(() => {})))
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    })
    const geometry = await page.evaluate(() => {
      const rect = el => { const r = el.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height } }
      const anchor = rect(document.querySelector('[data-bloom-slot="switcher"]'))
      const trigger = rect(document.querySelector('.dsh-bloom-trigger'))
      const icon = rect(document.querySelector('.icon'))
      const hit = document.elementFromPoint((icon.left+icon.right)/2, (icon.top+icon.bottom)/2)
      return { anchor, trigger, icon, iconHit: hit?.classList.contains('icon') }
    })
    for (const k of ['left', 'top', 'width', 'height']) assert.ok(Math.abs(geometry.anchor[k] - geometry.trigger[k]) <= 1, `${scenario.name}/${lang}: ${k} ${JSON.stringify(geometry)}`)
    const overlap = geometry.icon.left < geometry.trigger.right && geometry.icon.right > geometry.trigger.left && geometry.icon.top < geometry.trigger.bottom && geometry.icon.bottom > geometry.trigger.top
    assert.equal(overlap, false, `native icon overlaps Bloom: ${JSON.stringify(geometry)}`)
    assert.equal(geometry.iconHit, true, `native icon cannot receive pointer: ${JSON.stringify(geometry)}`)
    await page.click('.icon')
    assert.equal(await page.locator('.icon').getAttribute('data-clicked'), 'yes')
    await page.click('.dsh-bloom-trigger')
    const menu = await page.evaluate(() => {
      const m = document.querySelector('.dsh-bloom-menu'), b = m.getBoundingClientRect(), h = document.querySelector('header').getBoundingClientRect()
      const x = b.left + b.width / 2, y = Math.min(b.bottom - 4, innerHeight - 4, h.bottom + 30)
      return { hidden:m.hidden, bottom:b.bottom, headerBottom:h.bottom, x, y, hit:!!document.elementFromPoint(x,y)?.closest('.dsh-bloom-menu') }
    })
    assert.ok(!menu.hidden && menu.bottom > menu.headerBottom + 20 && menu.hit, `menu clipped: ${JSON.stringify(menu)}`)
    if (scenario.name === 'collapsed') {
      // Negative control reproduces the pre-fix anchor with no clearance. Verify
      // overlap appears, so a passing test cannot simply miss the original bug.
      await page.evaluate(() => {
        const style = document.createElement('style')
        style.textContent = '.dsh-bloom-slot { margin-inline-start: 0 !important }'
        document.head.append(style)
      })
      await page.waitForFunction(() => Math.abs(document.querySelector('.dsh-bloom-trigger').getBoundingClientRect().left - document.querySelector('[data-bloom-slot="switcher"]').getBoundingClientRect().left) <= 1)
      const overlaps = await page.evaluate(() => {
        const a = document.querySelector('.dsh-bloom-trigger').getBoundingClientRect(), b = document.querySelector('.icon').getBoundingClientRect()
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
      })
      assert.equal(overlaps, true, 'negative control must reproduce native icon overlap')
    }
    await page.evaluate(() => window.disposeBloom())
    assert.equal(await page.locator('.dsh-bloom-switcher, [data-bloom-slot]').count(), 0)
    assert.equal(await page.locator('.icon').count(), 1)
  })
}
