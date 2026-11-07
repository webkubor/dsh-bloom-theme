import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: {
    contents: `import './test/slot-fixture.mjs'; import './src/client.ts';
      const services = { slots: window.fixtureSlots };
      const pending = [];
      const strictCtx = (declared = []) => new Proxy({}, {
        get(_, key) {
          if (key === 'effect') return (fn) => {
            const dispose = fn();
            if (typeof dispose === 'function') window.__disposers.push(dispose);
            return dispose;
          };
          if (key === 'inject') return (names, cb) => {
            const run = () => cb(strictCtx([...declared, ...names]));
            if (names.every(n => services[n] !== undefined)) run();
            else pending.push({ names, run });
          };
          if (typeof key === 'symbol' || key === 'then') return undefined;
          if (!declared.includes(key)) throw new Error('cannot get property "' + String(key) + '" without inject');
          return services[key];
        }
      });
      window.applyModule = (localeService, themeService) => {
        window.__disposers = [];
        if (localeService) services.locale = localeService;
        if (themeService) {
          services.theme = themeService;
          services['theme'] = themeService;
        }
        for (let i = pending.length - 1; i >= 0; i--) {
          if (pending[i].names.every(n => services[n] !== undefined)) {
            pending.splice(i, 1)[0].run();
          }
        }
        const mod = window.__ModuleLoader__._module;
        mod.apply(strictCtx(mod.inject ?? []));
      };
      window.disposeAll = () => {
        window.disposeFixtureSlots();
        while (window.__disposers.length) {
          const d = window.__disposers.pop();
          try { d(); } catch (e) { console.error('disposer err', e); }
        }
      };
    `,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  },
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
})

const browser = await chromium.launch({
  executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
})
test.after(() => browser.close())

async function setupPage(t) {
  const context = await browser.newContext({ locale: 'zh-CN' })
  t.after(() => context.close())
  const page = await context.newPage()
  await page.route('**/*', (route) => {
    const url = route.request().url()
    if (url === 'https://bloom.test/') {
      return route.fulfill({
        contentType: 'text/html',
        // Clipped host header: overflow hidden + contain:paint + its own low stacking context, with the
        // transcript stacked above it. A popup that stays inside the header is cut off / covered here.
        body: `<html><body style="margin:0">
<div id="scroller" style="height:100vh;overflow:auto">
<header style="position:relative;z-index:1;height:44px;overflow:hidden;contain:paint;display:flex;justify-content:center;align-items:center;margin-top:120px">
<div data-fixture-leading style="display:flex"></div><div class="_headerUtilities"></div></header>
<main id="transcript" style="position:relative;z-index:5;height:2000px;background:rgb(250,250,250)">
<div data-turn-process><span class="_label">深度求索中，用时 1分30秒</span></div></main>
</div></body></html>`,
      })
    }
    return route.fulfill({ status: 404, body: '' })
  })
  await page.goto('https://bloom.test/')
  await page.evaluate(() => {
    const dicts = {}
    const listeners = new Set()
    window.mockLocale = {
      active: 'zh',
      register(ns, dict) { dicts[ns] = dict; return () => delete dicts[ns] },
      bind(ns) { return (key) => dicts[ns]?.[this.active]?.[key] ?? key },
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
    }
    window.mockTheme = {
      preference: 'dark',
      getTheme: () => ({ preference: 'dark', active: { colorScheme: 'dark' } }),
      setTheme: (val) => {},
    }
  })
  await page.addScriptTag({ content: outputFiles[0].text })
  return page
}

test('loading script alone does not mount styles or switcher before apply', async (t) => {
  const page = await setupPage(t)
  const stylesCount = await page.evaluate(() => document.querySelectorAll('style[data-plugin="dsh-bloom-theme"]').length)
  const switcherCount = await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher').length)
  assert.equal(stylesCount, 0, 'no styles injected at top level')
  assert.equal(switcherCount, 0, 'no switcher injected at top level')
})

test('apply mounts DOM elements and styles, teardown cleanly removes them all', async (t) => {
  const page = await setupPage(t)
  await page.evaluate(() => window.applyModule(window.mockLocale, window.mockTheme))

  const appliedStyles = await page.evaluate(() => document.querySelectorAll('style[data-plugin="dsh-bloom-theme"]').length)
  const appliedSwitcher = await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher').length)
  const appliedBodyVariant = await page.evaluate(() => document.body.dataset.bloomVariant)
  assert.equal(appliedStyles, 5, 'all 5 css styles injected')
  assert.equal(appliedSwitcher, 1, 'switcher mounted')
  assert.ok(appliedBodyVariant, 'body has bloom variant')

  // Now dispose all effect disposers
  await page.evaluate(() => window.disposeAll())

  const postStyles = await page.evaluate(() => document.querySelectorAll('style[data-plugin="dsh-bloom-theme"]').length)
  const postSwitcher = await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher').length)
  const postBodyVariant = await page.evaluate(() => document.body.dataset.bloomVariant)
  const postSparkles = await page.evaluate(() => document.getElementById('dsh-bloom-sparkles'))

  assert.equal(postStyles, 0, 'styles removed on teardown')
  assert.equal(postSwitcher, 0, 'switcher removed on teardown')
  assert.equal(postBodyVariant, undefined, 'body variant attribute removed')
  assert.equal(postSparkles, null, 'sparkles removed on teardown')
})

test('switcher and decorations render only through declared React Slots and survive remount', async (t) => {
  const page = await setupPage(t)
  await page.evaluate(() => window.applyModule(window.mockLocale, window.mockTheme))
  const regs = await page.evaluate(() => window.slotRegistrations.map(r => r.name).sort())
  assert.deepEqual(regs, ['conversation.header.leading', 'shell.overlay'])
  assert.deepEqual(await page.evaluate(() => window.slotViolations), [], 'registrations follow the official { name, id, order } shape')
  // Ownership: the header Slot holds only Bloom's empty anchor; the whole widget lives in Bloom's overlay container.
  assert.equal(await page.evaluate(() =>
    document.querySelector('[data-fixture-slot="conversation.header.leading"] [data-bloom-slot="switcher"]')?.children.length), 0, 'anchor stays empty')
  assert.equal(await page.evaluate(() =>
    document.querySelectorAll('[data-fixture-slot="shell.overlay"] [data-bloom-slot="decorations"] > .dsh-bloom-switcher').length), 1, 'widget mounted in own overlay container')
  assert.equal(await page.evaluate(() => document.querySelectorAll('header .dsh-bloom-switcher').length), 0, 'no widget inside the host header')
  assert.equal(await page.evaluate(() =>
    !!document.querySelector('[data-fixture-slot="shell.overlay"] #dsh-bloom-sparkles')), true)
  assert.equal(await page.evaluate(() => document.querySelector('._headerUtilities').children.length), 0, 'host header untouched')

  await page.evaluate(() => window.unmountFixtureSlot('conversation.header.leading'))
  assert.equal(await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher').length), 0, 'React unmount removes switcher')
  await page.evaluate(() => window.remountFixtureSlot('conversation.header.leading'))
  assert.equal(await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher').length), 1, 'remount yields exactly one')

  await page.click('.dsh-bloom-trigger')
  assert.equal(await page.locator('.dsh-bloom-menu').evaluate(el => el.hidden), false, 'remounted switcher is interactive')
  const poems = await page.evaluate(() => [...document.querySelectorAll('.dsh-bloom-option__en')].map(p => {
    const r = p.getBoundingClientRect(); return { w: r.width, visible: getComputedStyle(p).display !== 'none' && r.width > 0 }
  }))
  assert.ok(poems.length > 0 && poems.every(p => p.visible), 'poetry visible with non-zero width after remount')
  await page.mouse.click(5, 700)
  assert.equal(await page.locator('.dsh-bloom-menu').evaluate(el => el.hidden), true, 'single outside-click listener still works')
  await page.evaluate(() => window.disposeAll())
  assert.equal(await page.evaluate(() => document.querySelectorAll('[data-fixture-slot]').length), 0, 'slot hosts disposed')
})

// Geometry helpers: Bloom's anchor vs its trigger, and what is actually hit at a point.
const anchorAndTrigger = page => page.evaluate(async () => {
  // The trigger plays a 0.2s bloom-fade-down entrance (transform). Measure the settled box, then let
  // ResizeObserver deliver (it runs between layout and paint).
  // A restarted animation rejects its old .finished with AbortError; re-read until none are pending.
  for (let i = 0; i < 10; i++) {
    const pending = document.querySelector('.dsh-bloom-trigger').getAnimations()
      .filter(a => a.playState !== 'finished' && Number.isFinite(a.effect?.getComputedTiming().endTime))
    if (!pending.length) break
    await Promise.all(pending.map(a => a.finished.catch(() => {})))
  }
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  const r = el => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height } }
  return { anchor: r(document.querySelector('[data-bloom-slot="switcher"]')), trigger: r(document.querySelector('.dsh-bloom-trigger')) }
})
const assertTriggerOnAnchor = (g, at) => {
  for (const k of ['x', 'y', 'w', 'h']) assert.ok(Math.abs(g.anchor[k] - g.trigger[k]) <= 1, `${at}: trigger ${k}=${g.trigger[k]} vs anchor ${g.anchor[k]} (${JSON.stringify(g)})`)
  assert.ok(g.trigger.w > 0 && g.trigger.h > 0, `${at}: trigger has a size`)
}

test('menu escapes a clipped, lower-stacked host header and tracks Bloom\'s own anchor', async (t) => {
  const page = await setupPage(t)
  await page.setViewportSize({ width: 1000, height: 700 })
  await page.evaluate(() => window.applyModule(window.mockLocale, window.mockTheme))
  assertTriggerOnAnchor(await anchorAndTrigger(page), 'initial')

  // Trigger itself is clickable at its centre (the overlay layer passes pointer events through elsewhere).
  const hitTrigger = await page.evaluate(() => {
    const b = document.querySelector('.dsh-bloom-trigger').getBoundingClientRect()
    return !!document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)?.closest('.dsh-bloom-trigger')
  })
  assert.ok(hitTrigger, 'trigger is the topmost element at its own centre')
  await page.click('.dsh-bloom-trigger')
  const menu = await page.evaluate(() => {
    const m = document.querySelector('.dsh-bloom-menu'), b = m.getBoundingClientRect()
    const header = document.querySelector('header').getBoundingClientRect()
    // Hit-test the part of the menu inside the viewport, including just below the header's clip edge.
    const visibleBottom = Math.min(b.bottom, innerHeight) - 4
    const probes = [[0.5, 0.5], [0.5, 0.95], [0.2, 0.75], [0.8, 0.75], [0.5, 0.02]].map(([fx, fy]) => {
      const el = document.elementFromPoint(b.left + b.width * fx, b.top + (visibleBottom - b.top) * fy)
      return { fx, fy, inMenu: !!el?.closest('.dsh-bloom-menu'), hit: el ? `${el.tagName}#${el.id}.${el.className}` : null }
    })
    const cs = getComputedStyle(m)
    return { hidden: m.hidden, top: b.top, h: b.height, bottom: b.bottom, vh: innerHeight, headerBottom: header.bottom, maxH: cs.maxHeight, overflowY: cs.overflowY, probes }
  })
  assert.equal(menu.hidden, false)
  assert.ok(menu.bottom > menu.headerBottom + 100, `menu extends well past the clipped header (${menu.bottom} vs ${menu.headerBottom})`)
  for (const p of menu.probes) assert.ok(p.inMenu, `menu point ${p.fx},${p.fy} hits ${p.hit} instead of the menu (${JSON.stringify({ ...menu, probes: undefined })})`)
  // Real interaction through the overlay, below the header's clip edge. Let the staggered option
  // entrance finish first so the click lands on a settled row.
  await page.evaluate(async () => {
    const m = document.querySelector('.dsh-bloom-menu')
    await Promise.all(m.getAnimations({ subtree: true })
      .filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a => a.finished.catch(() => {})))
  })
  const before = await page.evaluate(() => document.body.dataset.bloomVariant)
  const target = await page.evaluate(cur => [...document.querySelectorAll('.dsh-bloom-option')].map(o => o.dataset.variant).find(v => v !== cur), before)
  await page.click(`.dsh-bloom-option[data-variant="${target}"]`)
  // ViewTransition applies the palette asynchronously after capturing the old frame.
  await page.waitForFunction(expected => document.body.dataset.bloomVariant === expected, target)
  assert.equal(await page.evaluate(() => document.body.dataset.bloomVariant), target, `option below the header edge is clickable (before ${before}, target ${target})`)

  // Inner scroll container moves the header: capture-phase scroll listener re-anchors.
  await page.evaluate(() => { document.getElementById('scroller').scrollTop = 80 })
  await page.waitForFunction(() => Math.abs(document.querySelector('.dsh-bloom-trigger').getBoundingClientRect().top - document.querySelector('[data-bloom-slot="switcher"]').getBoundingClientRect().top) <= 1)
  const scrolled = await anchorAndTrigger(page)
  assertTriggerOnAnchor(scrolled, 'after scroll')
  assert.ok(Math.abs(scrolled.anchor.y - 40) <= 12, `anchor actually moved up with the scroll (y=${scrolled.anchor.y})`)

  // Viewport resize re-centres the header content: the widget follows.
  const xBefore = scrolled.anchor.x
  await page.setViewportSize({ width: 700, height: 700 })
  await page.waitForFunction(() => Math.abs(document.querySelector('.dsh-bloom-trigger').getBoundingClientRect().left - document.querySelector('[data-bloom-slot="switcher"]').getBoundingClientRect().left) <= 1)
  const resized = await anchorAndTrigger(page)
  assertTriggerOnAnchor(resized, 'after resize')
  assert.ok(resized.anchor.x < xBefore - 100, `anchor moved with the resize (${xBefore} -> ${resized.anchor.x})`)

  // Disposal: no positioning listener survives (a later scroll must not resurrect or move anything).
  await page.evaluate(() => window.disposeAll())
  await page.evaluate(() => { document.getElementById('scroller').scrollTop = 0; window.dispatchEvent(new Event('resize')) })
  assert.equal(await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher, [data-bloom-slot]').length), 0, 'widget and anchor gone after dispose')
})

test('menu stays reachable inside a short desktop window (no part below the viewport without scrolling)', async (t) => {
  const page = await setupPage(t)
  await page.setViewportSize({ width: 1000, height: 700 })
  await page.evaluate(() => window.applyModule(window.mockLocale, window.mockTheme))
  await page.click('.dsh-bloom-trigger')
  const m = await page.evaluate(async () => {
    const menu = document.querySelector('.dsh-bloom-menu')
    // Only finite entrance animations; looping ones (e.g. shimmer) never finish.
    await Promise.all(menu.getAnimations({ subtree: true })
      .filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a => a.finished))
    const b = menu.getBoundingClientRect(), cs = getComputedStyle(menu)
    const scrollable = /auto|scroll/.test(cs.overflowY) && menu.scrollHeight > menu.clientHeight
    const last = [...menu.querySelectorAll('button')].filter(node => node.getClientRects().length > 0 && getComputedStyle(node).visibility === 'visible').at(-1)
    if (scrollable) last.scrollIntoView({ block: 'nearest' })
    const lb = last.getBoundingClientRect()
    const hit = document.elementFromPoint(lb.left + lb.width / 2, lb.top + lb.height / 2)
    return { top: b.top, bottom: b.bottom, vh: innerHeight, maxH: cs.maxHeight, overflowY: cs.overflowY, scrollable,
      lastLabel: last.textContent.trim().slice(0, 20), lastReachable: !!hit && last.contains(hit) }
  })
  assert.ok(m.bottom <= m.vh || m.scrollable, `menu bottom ${m.bottom}px exceeds the ${m.vh}px viewport and cannot scroll (${JSON.stringify(m)})`)
  assert.ok(m.lastReachable, `last menu control "${m.lastLabel}" is not clickable (${JSON.stringify(m)})`)
})

test('switcher waits for the overlay and re-anchors when either Slot remounts', async (t) => {
  const page = await setupPage(t)
  await page.evaluate(() => window.applyModule(window.mockLocale, window.mockTheme))
  await page.evaluate(() => window.unmountFixtureSlot('shell.overlay'))
  assert.equal(await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher').length), 0, 'no widget without Bloom\'s overlay container (no body fallback)')
  assert.equal(await page.evaluate(() => document.querySelectorAll('[data-bloom-slot="switcher"]').length), 1, 'anchor remains in the header Slot')
  await page.evaluate(() => window.remountFixtureSlot('shell.overlay'))
  assert.equal(await page.evaluate(() => document.querySelectorAll('[data-fixture-slot="shell.overlay"] .dsh-bloom-switcher').length), 1, 'overlay remount restores exactly one widget')
  assertTriggerOnAnchor(await anchorAndTrigger(page), 'after overlay remount')
  await page.evaluate(() => { window.unmountFixtureSlot('conversation.header.leading'); window.remountFixtureSlot('conversation.header.leading') })
  assert.equal(await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher').length), 1, 'anchor remount keeps one widget')
  assertTriggerOnAnchor(await anchorAndTrigger(page), 'after anchor remount')
})

const activeInfo = page => page.evaluate(() => {
  const a = document.activeElement
  return { inMenu: !!a?.closest('.dsh-bloom-menu'), isTrigger: !!a?.closest('.dsh-bloom-trigger'), tag: a?.tagName,
    glass: a?.dataset?.glass ?? null, select: a?.matches?.('.dsh-bloom-rotation__select') ?? false,
    label: (a?.getAttribute?.('aria-label') || a?.textContent || '').trim().slice(0, 24),
    menuHidden: document.querySelector('.dsh-bloom-menu').hidden }
})

test('keyboard alone reaches and operates glass and rotation controls; Tab closes only at the boundary', async (t) => {
  const page = await setupPage(t)
  await page.setViewportSize({ width: 1000, height: 900 })
  await page.evaluate(() => window.applyModule(window.mockLocale, window.mockTheme))
  await page.focus('.dsh-bloom-trigger')
  await page.keyboard.press('Enter')
  assert.equal(await page.evaluate(() => document.querySelector('.dsh-bloom-menu').hidden), false, 'Enter on trigger opens the menu')

  // Count the panel's visible focusable controls while it is open (palette rows use arrow keys, tabindex -1).
  const expectedStops = await page.evaluate(() => [...document.querySelector('.dsh-bloom-menu').querySelectorAll('button:not([disabled]), select, a[href], [tabindex="0"]')]
    .filter(n => n.tabIndex >= 0 && n.getClientRects().length > 0).map(n => `${n.tagName}:${(n.getAttribute('aria-label') || n.textContent || '').trim().slice(0, 24)}|${n.className}|vis=${getComputedStyle(n).visibility}`))
  const expected = expectedStops.length
  // Walk forward with Tab, recording every stop, until focus leaves the menu.
  const visited = []
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab')
    const a = await activeInfo(page)
    if (!a.inMenu) { visited.push(a); break }
    visited.push(a)
    assert.equal(a.menuHidden, false, `Tab inside the panel keeps it open (stop ${i}: ${a.label})`)
  }
  const last = visited.at(-1)
  assert.ok(last.isTrigger && last.menuHidden, `Tab past the last stop closes and returns focus to the trigger (${JSON.stringify(last)})`)
  const glassStops = visited.filter(v => v.glass).map(v => v.glass)
  assert.deepEqual(glassStops, ['frosted', 'matte', 'liquid'], `all glass choices are Tab stops (${JSON.stringify(visited.map(v => v.label))})`)
  assert.ok(visited.some(v => v.select), 'rotation select is a Tab stop')
  // Opening focuses the active palette row; controls before it in DOM order (the close button) are
  // reached with Shift+Tab. Together the two walks must cover every visible focusable control once.
  await page.focus('.dsh-bloom-trigger')
  await page.keyboard.press('Enter')
  const backward = []
  for (let k = 0; k < 60; k++) {
    await page.keyboard.press('Shift+Tab')
    const a = await activeInfo(page)
    if (!a.inMenu) { assert.ok(a.isTrigger && a.menuHidden, `Shift+Tab past the first stop closes and focuses the trigger (${JSON.stringify(a)})`); break }
    assert.equal(a.menuHidden, false, `Shift+Tab inside the panel keeps it open (${a.label})`)
    backward.push(`${a.tag}:${a.label}`)
  }
  const reached = new Set([...visited.slice(0, -1), ].map(v => `${v.tag}:${v.label}`).concat(backward))
  const want = expectedStops.map(x => x.split('|')[0])
  assert.deepEqual(want.filter(x => !reached.has(x)), [], `unreachable panel controls (forward ${JSON.stringify(visited.map(v => v.tag + ':' + v.label))}, backward ${JSON.stringify(backward)})`)
  assert.equal(new Set(visited.slice(0, -1).map(v => `${v.tag}:${v.label}`)).size, visited.length - 1, 'forward walk visits no stop twice')

  // Operate the controls by keyboard only.
  await page.focus('.dsh-bloom-trigger')
  await page.keyboard.press('Enter')
  for (let i = 0; i < 60 && !(await activeInfo(page)).glass; i++) await page.keyboard.press('Tab')
  while ((await activeInfo(page)).glass !== 'liquid') await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  assert.equal(await page.evaluate(() => document.body.dataset.bloomGlass), 'liquid', 'Enter on a focused glass choice applies it')
  assert.equal(await page.evaluate(() => document.querySelector('[data-glass="liquid"]').getAttribute('aria-pressed')), 'true')
  assert.equal((await activeInfo(page)).menuHidden, false, 'activating a glass choice keeps the panel open')

  while (!(await activeInfo(page)).select) await page.keyboard.press('Tab')
  const before = await page.evaluate(() => document.querySelector('.dsh-bloom-rotation__select').value)
  // Arrow keys belong to the <select>, not the option list.
  await page.keyboard.press('ArrowDown')
  const after = await activeInfo(page)
  assert.ok(after.select, 'ArrowDown on the rotation select keeps focus on it (not stolen by the palette list)')
  // Headless Chromium on macOS ignores every key sequence on a native <select> (verified on a bare page),
  // so the value change goes through selectOption, which fires the same change event a keyboard pick does.
  // Focus staying on the select above is the part the plugin controls.
  const target = await page.evaluate(cur => [...document.querySelectorAll('.dsh-bloom-rotation__select option')].map(o => o.value).find(v => v !== cur), before)
  await page.selectOption('.dsh-bloom-rotation__select', target)
  assert.ok((await activeInfo(page)).select && !(await activeInfo(page)).menuHidden, 'changing the interval keeps focus and the panel open')
  const finalValue = await page.evaluate(() => document.querySelector('.dsh-bloom-rotation__select').value)
  assert.notEqual(finalValue, before, 'keyboard changed the rotation interval')
  assert.equal(await page.evaluate(() => localStorage.getItem('dsh-bloom-variant-rotation-minutes')), finalValue, 'rotation choice persisted')
  await page.keyboard.press('Escape')
  const esc = await activeInfo(page)
  assert.ok(esc.isTrigger && esc.menuHidden, 'Escape from the select closes the panel and focuses the trigger')

  // Shift+Tab at the first stop also leaves through the boundary.
  await page.keyboard.press('Enter')
  await page.evaluate(() => {
    const m = document.querySelector('.dsh-bloom-menu')
    ;[...m.querySelectorAll('button:not([disabled]), select, a[href], [tabindex="0"]')].filter(n => n.tabIndex >= 0 && n.getClientRects().length > 0)[0].focus()
  })
  await page.keyboard.press('Shift+Tab')
  const back = await activeInfo(page)
  assert.ok(back.isTrigger && back.menuHidden, `Shift+Tab before the first stop closes and focuses the trigger (${JSON.stringify(back)})`)
})

for (const kind of ['aria-modal', 'dialog']) {
  test(`host ${kind} hides the widget and closes the menu, then the widget recovers on its anchor`, async (t) => {
    const page = await setupPage(t)
    await page.setViewportSize({ width: 1000, height: 700 })
    await page.evaluate(() => window.applyModule(window.mockLocale, window.mockTheme))
    await page.click('.dsh-bloom-trigger')
    assert.equal(await page.evaluate(() => document.querySelector('.dsh-bloom-menu').hidden), false)
    const hitTrigger = () => page.evaluate(() => {
      const b = document.querySelector('.dsh-bloom-trigger').getBoundingClientRect()
      return !!document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)?.closest('.dsh-bloom-trigger')
    })

    await page.evaluate(k => {
      const retained = document.createElement('div')
      retained.setAttribute('role', 'dialog')
      retained.setAttribute('aria-modal', 'true')
      retained.hidden = true
      document.body.append(retained)
      const m = k === 'dialog' ? document.createElement('dialog') : document.createElement('div')
      m.id = 'host-modal'
      m.textContent = 'Host settings'
      if (k === 'dialog') { document.body.append(m); m.showModal() }
      else { m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.style.cssText = 'position:fixed;inset:200px;background:#fff'; document.body.append(m) }
    }, kind)
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.dsh-bloom-switcher')).visibility === 'hidden')
    assert.equal(await page.evaluate(() => document.querySelector('.dsh-bloom-menu').hidden), true, 'open menu is closed under a modal')
    assert.equal(await hitTrigger(), false, 'hidden trigger cannot be hit while the modal is open')
    // visibility:hidden keeps layout, so the trigger keeps its size and the anchor is not collapsed.
    const dims = await page.evaluate(() => { const b = document.querySelector('.dsh-bloom-trigger').getBoundingClientRect(); return [b.width, b.height] })
    assert.ok(dims[0] > 0 && dims[1] > 0, `trigger keeps its dimensions while hidden (${dims})`)
    assert.equal(await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher').length), 1, 'no remount or duplicate while hidden')

    await page.evaluate(k => { const m = document.getElementById('host-modal'); if (k === 'dialog') m.close(); m.remove() }, kind)
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.dsh-bloom-switcher')).visibility === 'visible')
    assertTriggerOnAnchor(await anchorAndTrigger(page), `after ${kind} closes`)
    assert.equal(await hitTrigger(), true, 'trigger is hittable again')
    await page.click('.dsh-bloom-trigger')
    assert.equal(await page.evaluate(() => document.querySelector('.dsh-bloom-menu').hidden), false, 'menu reopens after recovery')
    assert.equal(await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher').length), 1)
  })
}

test('re-enabling after teardown restores styles, switcher and listeners correctly', async (t) => {
  const page = await setupPage(t)
  await page.evaluate(() => window.applyModule(window.mockLocale, window.mockTheme))
  await page.evaluate(() => window.disposeAll())

  // Re-enable
  await page.evaluate(() => window.applyModule(window.mockLocale, window.mockTheme))

  const reStyles = await page.evaluate(() => document.querySelectorAll('style[data-plugin="dsh-bloom-theme"]').length)
  const reSwitcher = await page.evaluate(() => document.querySelectorAll('.dsh-bloom-switcher').length)
  const reBodyVariant = await page.evaluate(() => document.body.dataset.bloomVariant)
  assert.equal(reStyles, 5, 'all 5 css styles re-injected on re-enable')
  assert.equal(reSwitcher, 1, 'switcher re-mounted on re-enable')
  assert.ok(reBodyVariant, 'body has bloom variant on re-enable')

  // Final teardown
  await page.evaluate(() => window.disposeAll())
  const finalStyles = await page.evaluate(() => document.querySelectorAll('style[data-plugin="dsh-bloom-theme"]').length)
  assert.equal(finalStyles, 0, 'clean after second teardown')
})

test('teardown cancels and prevents timers or observers from executing or leaking', async (t) => {
  const page = await setupPage(t)
  await page.evaluate(() => window.applyModule(window.mockLocale, window.mockTheme))

  // Observers should exist
  assert.equal(await page.evaluate(() => !!window.__dshBloomThinkObserver__), true, 'think observer running')

  // Now dispose
  await page.evaluate(() => window.disposeAll())

  // Observers disconnected and cleared
  assert.equal(await page.evaluate(() => window.__dshBloomThinkObserver__), undefined, 'think observer undefined')
  assert.equal(await page.evaluate(() => window.__dshBloomObserver__), undefined, 'bloom observer undefined')
  assert.equal(await page.evaluate(() => window.__dshBloomGlassOff__), undefined, 'glass off undefined')

  // Verify DOM mutations don't trigger marks after disposal
  await page.evaluate(() => {
    const div = document.createElement('div')
    div.innerHTML = '<think>some reasoning</think>'
    document.body.appendChild(div)
  })
  // Give throttled scheduler a moment
  await page.waitForTimeout(400)
  const thinkMarked = await page.evaluate(() => document.querySelectorAll('[data-bloom-think]').length)
  assert.equal(thinkMarked, 0, 'no think tags marked after disposal')
})

test('material and per-scheme backgrounds remain independent through UI changes and reload', async t => {
  const page = await setupPage(t)
  await page.evaluate(() => window.applyModule(window.mockLocale))
  const menu = page.locator('.dsh-bloom-menu')
  const open = async () => { if (await menu.isHidden()) await page.click('.dsh-bloom-trigger') }
  const state = () => page.evaluate(() => ({
    dark: document.body.hasAttribute('data-ds-dark-theme'),
    material: document.body.dataset.bloomGlass,
    light: document.body.dataset.bloomAmbienceLight,
    darkBackground: document.body.dataset.bloomAmbienceDark,
  }))
  await open()
  assert.deepEqual(await menu.locator('[data-glass]').allTextContents(), ['毛玻璃', '磨砂玻璃', '液态玻璃'])
  await menu.locator('[data-mode="light"]').click()
  await menu.locator('[data-glass="matte"]').click()
  await menu.locator('[data-scheme="light"] [data-preset="wash"]').click()
  assert.deepEqual(await state(), { dark: false, material: 'matte', light: 'wash', darkBackground: 'corner' })
  await menu.locator('[data-mode="dark"]').click()
  await menu.locator('[data-scheme="dark"] [data-preset="galaxy"]').click()
  assert.deepEqual(await state(), { dark: true, material: 'matte', light: 'wash', darkBackground: 'galaxy' })
  await menu.locator('[data-mode="light"]').click()
  assert.deepEqual(await state(), { dark: false, material: 'matte', light: 'wash', darkBackground: 'galaxy' })
  await menu.locator('[data-glass="liquid"]').click()
  await menu.locator('[data-mode="dark"]').click()
  assert.deepEqual(await state(), { dark: true, material: 'liquid', light: 'wash', darkBackground: 'galaxy' })
  await page.reload()
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => window.applyModule())
  assert.deepEqual(await state(), { dark: true, material: 'liquid', light: 'wash', darkBackground: 'galaxy' })
  await open()
  await menu.locator('[data-mode="light"]').click()
  assert.deepEqual(await state(), { dark: false, material: 'liquid', light: 'wash', darkBackground: 'galaxy' })
})
