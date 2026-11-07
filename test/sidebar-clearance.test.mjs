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
        style.textContent = '.dsh-bloom-slot { margin-inline-start: 0 !important; transform: none !important }'
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

for (const lang of ['zh', 'en']) for (const width of [1000, 380]) {
  test(`${lang}/${width}: dynamic sidebar changes keep title adjacent and controls clickable`, async t => {
    const context = await browser.newContext({ viewport: { width, height: 700 }, reducedMotion: 'reduce' })
    t.after(() => context.close())
    const page = await context.newPage()
    await page.route('**/*', route => route.request().url() === 'https://bloom.test/'
      ? route.fulfill({ contentType:'text/html', body:`<!doctype html><html data-platform="darwin"><head><style>
        * { box-sizing:border-box } body { margin:0 } .frame { position:relative; height:100vh; --dsh-frame-leading-clearance:0px }
        .icon { position:absolute; top:11px; width:28px; height:28px; z-index:15 }
        header { position:relative; display:grid; grid-template-columns:auto minmax(0,1fr); padding:10px 28px 0 20px; height:48px; overflow:hidden; contain:paint }
        .leading { display:flex; grid-area:1/1; align-items:center }
        .title { min-width:0; min-height:30px; grid-column:2; align-items:center; display:flex; padding-inline-start:max(0px,calc(var(--dsh-frame-leading-clearance,0px) - 20px)) }
        .title-button { min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis }
      </style></head><body><div class="frame"><button class="icon" onclick="this.dataset.clicks=String(Number(this.dataset.clicks||0)+1)">S</button><header><div class="leading" data-fixture-leading></div><div class="title"><button class="title-button" onclick="this.dataset.clicks=String(Number(this.dataset.clicks||0)+1)">${lang === 'zh' ? '会话标题' : 'Conversation title'}</button></div></header></div></body></html>` })
      : route.fulfill({ status:404, body:'' }))
    await page.goto('https://bloom.test/')
    await page.evaluate(lang => {
      const dict = {}
      window.fixtureLocale = { active:lang, register(ns,d) { dict[ns]=d; return () => delete dict[ns] }, bind(ns) { return key => dict[ns]?.[this.active]?.[key] ?? key }, subscribe() { return () => {} } }
    }, lang)
    await page.addScriptTag({ content:outputFiles[0].text })
    const outcomes = []
    for (const state of [{clearance:0,frameLeft:80,iconX:-40}, {clearance:160,frameLeft:0,iconX:100}, {clearance:84,frameLeft:0,iconX:12}, {clearance:0,frameLeft:80,iconX:-40}]) {
      await page.evaluate(s => {
        const frame=document.querySelector('.frame'); frame.style.marginLeft=s.frameLeft+'px'; frame.style.setProperty('--dsh-frame-leading-clearance',s.clearance+'px')
        document.querySelector('.icon').style.left=s.iconX+'px'
      }, state)
      await page.waitForFunction(() => {
        const a=document.querySelector('[data-bloom-slot="switcher"]')?.getBoundingClientRect(), b=document.querySelector('.dsh-bloom-trigger')?.getBoundingClientRect()
        return a && b && Math.abs(a.left-b.left)<1 && Math.abs(a.top-b.top)<1
      })
      const g = await page.evaluate(() => {
        const rect=sel=>{const r=document.querySelector(sel).getBoundingClientRect(); return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width}}
        const anchor=rect('[data-bloom-slot="switcher"]'), trigger=rect('.dsh-bloom-trigger'), icon=rect('.icon'), title=rect('.title-button')
        const hit = r => document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2)
        return {anchor,trigger,icon,title,iconHit:hit(icon)?.closest('.icon')!==null,titleHit:hit(title)?.closest('.title-button')!==null}
      })
      const overlaps=(a,b)=>a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
      const gap=g.title.left-g.trigger.right
      if (overlaps(g.icon,g.trigger) || !g.iconHit || overlaps(g.title,g.trigger) || !g.titleHit || gap < -1 || gap > 8)
        outcomes.push({state, gap, ...g})
      if (g.iconHit) await page.locator('.icon').click()
      if (g.titleHit) await page.locator('.title-button').click()
    }
    await page.evaluate(() => window.disposeBloom())
    assert.equal(await page.locator('.dsh-bloom-switcher, [data-bloom-slot]').count(), 0)
    assert.deepEqual(outcomes, [], 'dynamic layout: controls overlap, lose hit targets, or double-count the host title clearance')
  })
}
