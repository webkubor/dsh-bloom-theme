import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// #113 角落座位回归守卫（取代 sidebar-clearance.test.mjs）：
// 主题切换器挂 conversation.session.header.corner（页头右侧角落），配一个绝对定位在
// 页头最右的原生控件（Session log 同位替身）。守住三件事：① 触发器贴着自己的锚点、
// 不盖住原生控件；② placeMenu 把菜单夹在视口内（860b5a5 时代菜单从触发器左缘展开、
// 右越界约 270px，32/50 控件点不到，645a6ab 因此回退过座位）；③ 菜单逃出 contain:paint
// 裁剪可点。窄屏负向对照用 !important 压掉 placeMenu 的 inline 布局复现右越界，再撤掉
// 验证恢复——保证测试不是「碰巧没撞上」。
const { outputFiles } = await build({ stdin: { resolveDir: fileURLToPath(new URL('..', import.meta.url)), contents: `
  import './test/slot-fixture.mjs'; import './src/client.ts';
  const services = { slots: window.fixtureSlots, locale: window.fixtureLocale }, disposers = [];
  window.__events = window.__events ?? {};
  const strict = declared => new Proxy({}, { get(_, key) {
    if (key === 'effect') return fn => { const d = fn(); if (typeof d === 'function') disposers.push(d); return d };
    if (key === 'inject') return (names, cb) => { if (names.every(n => services[n])) return cb(strict([...declared, ...names])) };
    // cordis 核心事件 API（on/off/emit）不是 inject 出来的服务：宿主
    // dsh-client-ui-theme 自己就写 ctx.on('theme/change', sync)，而它的
    // exports.inject 里并没有 'theme'。替身少了这三个 = 比宿主还严。
    if (key === 'on') return (event, listener) => {
      const bucket = window.__events[event] ?? (window.__events[event] = new Set());
      bucket.add(listener); return () => bucket.delete(listener);
    };
    if (key === 'off') return (event, listener) => { window.__events[event]?.delete(listener); return () => {} };
    if (key === 'emit') return (event, payload) => { for (const l of window.__events[event] ?? []) l(payload) };
    if (typeof key === 'symbol' || key === 'then') return undefined;
    if (!declared.includes(key)) throw Error('undeclared service ' + String(key));
    return services[key];
  }});
  const mod = window.__ModuleLoader__._module;
  mod.apply(strict(mod.inject));
  window.disposeBloom = () => { window.disposeFixtureSlots(); while (disposers.length) disposers.pop()() };
` }, bundle: true, write: false, format: 'iife', platform: 'browser' })
const scenarios = [
  { name: 'wide', width: 1000, frameLeft: 0 },
  { name: 'offset-frame', width: 1000, frameLeft: 280 },
  { name: 'narrow', width: 380, frameLeft: 0 },
]
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())
for (const lang of ['zh', 'en']) for (const scenario of scenarios) {
  test(`${lang}: ${scenario.name} keeps the corner seat clear of native controls`, async t => {
    const context = await browser.newContext({ viewport: { width: scenario.width, height: 700 }, reducedMotion: 'reduce' })
    t.after(() => context.close())
    const page = await context.newPage()
    await page.route('**/*', route => route.request().url() === 'https://bloom.test/'
      ? route.fulfill({ contentType: 'text/html', body: `<!doctype html><html data-platform="darwin"><head><style>
      * { box-sizing:border-box } body { margin:0 } .frame { position:relative; margin-left:${scenario.frameLeft}px; height:100vh }
      header { position:relative; display:grid; grid-template-columns:minmax(0,1fr) auto 88px; align-items:center; padding:10px 28px 0 20px; height:48px; overflow:hidden; contain:paint }
      .title { min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; padding-inline-end:12px }
      .seat { display:flex; align-items:center }
      .sesslog { position:absolute; right:28px; top:10px; width:72px; height:28px }
      main { position:relative; z-index:5; height:600px; background:#fafafa }
      </style></head><body><div class="frame">
      <header><div class="title">${lang === 'zh' ? '会话标题' : 'Conversation title'}</div><div class="seat" data-fixture-header></div><button class="sesslog" onclick="this.dataset.clicked='yes'">Log</button></header>
      <main></main></div></body></html>` })
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
      const sesslog = rect(document.querySelector('.sesslog'))
      const hit = document.elementFromPoint((sesslog.left + sesslog.right) / 2, (sesslog.top + sesslog.bottom) / 2)
      return { anchor, trigger, sesslog, sesslogHit: hit?.classList.contains('sesslog') }
    })
    for (const k of ['left', 'top', 'width', 'height']) assert.ok(Math.abs(geometry.anchor[k] - geometry.trigger[k]) <= 1, `${scenario.name}/${lang}: ${k} ${JSON.stringify(geometry)}`)
    const overlap = geometry.sesslog.left < geometry.trigger.right && geometry.sesslog.right > geometry.trigger.left && geometry.sesslog.top < geometry.trigger.bottom && geometry.sesslog.bottom > geometry.trigger.top
    assert.equal(overlap, false, `native control overlaps Bloom: ${JSON.stringify(geometry)}`)
    assert.equal(geometry.sesslogHit, true, `native control cannot receive pointer: ${JSON.stringify(geometry)}`)
    await page.click('.sesslog')
    assert.equal(await page.locator('.sesslog').getAttribute('data-clicked'), 'yes')
    await page.click('.dsh-bloom-trigger')
    const menu = await page.evaluate(() => {
      const m = document.querySelector('.dsh-bloom-menu'), b = m.getBoundingClientRect(), h = document.querySelector('header').getBoundingClientRect()
      const x = b.left + b.width / 2, y = Math.min(b.bottom - 4, innerHeight - 4, h.bottom + 30)
      return { hidden:m.hidden, left:b.left, right:b.right, bottom:b.bottom, headerBottom:h.bottom, vw:innerWidth, x, y, hit:!!document.elementFromPoint(x, y)?.closest('.dsh-bloom-menu') }
    })
    assert.ok(!menu.hidden && menu.bottom > menu.headerBottom + 20 && menu.hit, `menu clipped: ${JSON.stringify(menu)}`)
    assert.ok(menu.left >= -1, `menu escapes the left viewport edge: ${JSON.stringify(menu)}`)
    assert.ok(menu.right <= menu.vw + 1, `menu escapes the right viewport edge — placeMenu clamp broken: ${JSON.stringify(menu)}`)
    if (scenario.name === 'narrow') {
      // 负向对照：压掉 placeMenu 的 inline 布局并钉住自然菜单宽（真实面板 15 行配色
      // 约 340px），复现 860b5a5 时代 left: 0 锚在触发器左缘、右越出视口的回归。
      await page.evaluate(() => {
        const style = document.createElement('style')
        style.id = 'corner-seat-negative-control'
        style.textContent = '.dsh-bloom-switcher[data-slotted="true"] .dsh-bloom-menu { left: 0 !important; right: auto !important; width: 340px !important; max-width: 100vw !important }'
        document.head.append(style)
      })
      await page.waitForFunction(() => document.querySelector('.dsh-bloom-menu').getBoundingClientRect().right > innerWidth + 1)
      await page.evaluate(() => document.getElementById('corner-seat-negative-control').remove())
      await page.waitForFunction(() => document.querySelector('.dsh-bloom-menu').getBoundingClientRect().right <= innerWidth + 1)
    }
    await page.evaluate(() => window.disposeBloom())
    assert.equal(await page.locator('.dsh-bloom-switcher, [data-bloom-slot]').count(), 0)
    assert.equal(await page.locator('.sesslog').count(), 1)
  })
}

for (const lang of ['zh', 'en']) for (const width of [1000, 380]) {
  test(`${lang}/${width}: dynamic frame geometry keeps the corner tracked and controls clickable`, async t => {
    const context = await browser.newContext({ viewport: { width, height: 700 }, reducedMotion: 'reduce' })
    t.after(() => context.close())
    const page = await context.newPage()
    await page.route('**/*', route => route.request().url() === 'https://bloom.test/'
      ? route.fulfill({ contentType: 'text/html', body: `<!doctype html><html data-platform="darwin"><head><style>
      * { box-sizing:border-box } body { margin:0 } .frame { position:relative; height:100vh }
      header { position:relative; display:grid; grid-template-columns:minmax(0,1fr) auto 88px; align-items:center; padding:10px 28px 0 20px; height:48px; overflow:hidden; contain:paint }
      .title { min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; padding-inline-end:12px }
      .seat { display:flex; align-items:center }
      .sesslog { position:absolute; right:28px; top:10px; width:72px; height:28px }
      main { position:relative; z-index:5; height:600px; background:#fafafa }
      </style></head><body><div class="frame">
      <header><div class="title">${lang === 'zh' ? '会话标题' : 'Conversation title'}</div><div class="seat" data-fixture-header></div><button class="sesslog" onclick="this.dataset.clicked=String(Number(this.dataset.clicked||0)+1)">Log</button></header>
      <main></main></div></body></html>` })
      : route.fulfill({ status: 404, body: '' }))
    await page.goto('https://bloom.test/')
    await page.evaluate(lang => {
      const dict = {}
      window.fixtureLocale = { active: lang, register(ns, d) { dict[ns] = d; return () => delete dict[ns] },
        bind(ns) { return key => dict[ns]?.[this.active]?.[key] ?? key }, subscribe() { return () => {} } }
    }, lang)
    await page.addScriptTag({ content: outputFiles[0].text })
    await page.waitForSelector('.dsh-bloom-trigger')
    const outcomes = []
    for (const state of [{ frameLeft: 0, sessW: 72 }, { frameLeft: 60, sessW: 80 }, { frameLeft: 0, sessW: 48 }, { frameLeft: 60, sessW: 72 }]) {
      await page.evaluate(s => {
        document.querySelector('.frame').style.marginLeft = s.frameLeft + 'px'
        document.querySelector('.sesslog').style.width = s.sessW + 'px'
      }, state)
      await page.waitForFunction(() => {
        const a = document.querySelector('[data-bloom-slot="switcher"]')?.getBoundingClientRect(), b = document.querySelector('.dsh-bloom-trigger')?.getBoundingClientRect()
        return a && b && Math.abs(a.left - b.left) < 1 && Math.abs(a.top - b.top) < 1
      })
      const g = await page.evaluate(() => {
        const rect = sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom } }
        const trigger = rect('.dsh-bloom-trigger'), sesslog = rect('.sesslog')
        const at = (r, sel) => !!document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2)?.closest(sel)
        return { trigger, sesslog, triggerHit: at(trigger, '.dsh-bloom-trigger'), sesslogHit: at(sesslog, '.sesslog') }
      })
      const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
      if (overlaps(g.trigger, g.sesslog) || !g.triggerHit || !g.sesslogHit) outcomes.push({ state, ...g })
      if (g.sesslogHit) await page.locator('.sesslog').click()
      if (g.triggerHit) {
        await page.locator('.dsh-bloom-trigger').click()
        assert.equal(await page.locator('.dsh-bloom-menu').evaluate(el => el.hidden), false, `${JSON.stringify(state)}: menu opens`)
        await page.mouse.click(5, 650)
      }
    }
    await page.evaluate(() => window.disposeBloom())
    assert.equal(await page.locator('.dsh-bloom-switcher, [data-bloom-slot]').count(), 0)
    assert.equal(await page.locator('.sesslog').count(), 1)
    assert.deepEqual(outcomes, [], 'dynamic layout: controls overlap or lose hit targets')
  })
}
