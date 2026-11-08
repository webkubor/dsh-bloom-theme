import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const {version: currentVersion} = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

// Exercise the real client and its DOM event handlers; all network traffic is mocked.
const { outputFiles } = await build({
  stdin: { contents: `import './test/slot-fixture.mjs'; import './src/client.ts'; import * as lang from './src/lang.ts'; import * as version from './src/version.ts'; import * as switcher from './src/switcher.ts';
    import { makeLocale } from './test/fixtures/locale.mjs';
    window.bloomTest = {lang, version, switcher, makeLocale};
    // 宿主注入 locale 服务后，cordis 会 materialize 插件的 apply(ctx)。
    // 测试里手动调它，走和真实宿主同一条路径。
    // ⚠️ ctx 必须是「严格」的：cordis 的 ctx 是 Proxy，读没在 inject 里声明的服务会抛
    //    \`cannot get property "x" without inject\`。2026-10-30 这里曾给了个普通对象
    //    {locale, effect}，测试全绿、桌面端启动失败 —— 替身比宿主宽松，等于没测。
    const strictCtx = (services, declared) => new Proxy({}, {
      get(_, key) {
        if (key === 'effect') return (fn) => fn()
        if (key === 'inject') return (names, cb) => names.every(name => services[name] !== undefined) ? cb(strictCtx(services, [...declared, ...names])) : undefined
        if (typeof key === 'symbol' || key === 'then') return undefined
        if (!declared.includes(key)) throw new Error('cannot get property "' + String(key) + '" without inject')
        return services[key]
      },
    })
    window.bloomTest.applyWithLocale = () => {
      const mod = window.__ModuleLoader__?._module
      mod?.apply(strictCtx({ locale: window.__dshLocale, slots: window.fixtureSlots }, mod.inject ?? []))
    };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
  bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})
const browser = await chromium.launch({
  executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
})
test.after(() => browser.close())
const expected = {
  zh: { heading: '外观', banner: 'Bloom 主题有新版本', share: '请帮我安装', error: 'registry 无可用通道（tags: 无）', badge: '可更新到 v' },
  en: { heading: 'Appearance', banner: 'A new Bloom version is out', share: 'Please install and enable', error: 'No usable channel in the registry (tags: none)', badge: 'update available: v' },
}
/**
 * DSH locale 服务的最小替身见文件头的 makeLocale —— 浏览器里用的是它序列化过去的副本。
 */
async function setup(locale, active, mode = 'dark', variant = 'petal', hostBody = null, legacy = 'en') {
  const context = await browser.newContext({ locale, colorScheme: 'dark' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', err => errors.push(err.message))
  await page.route('**/*', route => {
    const url = route.request().url()
    if (url === 'https://bloom.test/') return route.fulfill({ contentType: 'text/html', body: '<html data-dsh-runtime-version="0.2.0-rc.2"><body><header></header></body></html>' })
    // host 半的版本端点：测试要能指定它回什么（含 platform 字段）。
    if (url.includes('/api/bloom/dsh-version')) {
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(hostBody ?? { ok: false, reason: 'no host' }) })
    }
    const body = url.includes('@deepseek-ai') ? { 'dist-tags': {} } : { version: '99.0.0' }
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
  })
  await page.goto('https://bloom.test/')
  await page.clock.install()
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(({active, mode, variant, legacy}) => {
    localStorage.setItem('dsh-bloom-lang', legacy)
    localStorage.setItem('dsh-bloom-variant', variant)
    localStorage.setItem('bloom-appearance-mode', mode)
    // __ModuleLoader__ 由 test/slot-fixture.mjs 提供：factory(require) 拿到真实 React。
    window.copied = ''
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copied = text } } })
    // ── DSH locale 服务的最小替身 ──────────────────────────────────────
    // 语言是体系配置，真源在 DSH（2026-10-30 改）。测试里不能只改 localStorage ——
    // 那样测的就不是新架构了。这里按 DSH 的真实契约实现一份：注册词条、bind 取词、
    // setLocale 改偏好并广播、subscribe 订阅变化。
    window.__dshLocale = window.bloomTest.makeLocale(active)
    // 宿主把 locale 服务交给插件：apply(ctx) 会从这里取
    window.__dshApply = (ctx) => window.__dshApplyModule?.apply(ctx)
  }, {active, mode, variant, legacy})
  // 让插件走 apply(ctx) 这条真实路径（宿主注入 locale 后才会 bind 上）
  await page.evaluate(() => window.bloomTest.applyWithLocale?.())
  await page.waitForFunction(() => window.bloomTest.version.dshCheckError)
  await page.clock.fastForward(4100)
  await page.waitForSelector('#dsh-bloom-update-banner')
  return { page, context, errors }
}
const click = (page, selector) => page.locator(selector).evaluate(el => el.click())
// 2026-11-03：面板不再有语言开关，语言只跟随 DSH。测试里换语言 = 在 DSH 侧 setLocale。
const hostSwitch = (page, lang) => page.evaluate(l => window.__dshLocale.setLocale(l), lang)
const text = (page, selector) => page.locator(selector).textContent()

test('unbound locale uses English regardless of browser or legacy preference', async () => {
  const context = await browser.newContext({ locale: 'zh-CN' })
  const page = await context.newPage()
  try {
    await page.route('**/*', route => route.fulfill({ contentType: 'text/html', body: '<html><body></body></html>' }))
    await page.goto('https://bloom.test/')
    await page.evaluate(() => localStorage.setItem('dsh-bloom-lang', 'zh'))
    const { outputFiles } = await build({
      stdin: { contents: `import * as lang from './src/lang.ts'; window.langTest = lang`, resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
      bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
    })
    await page.addScriptTag({ content: outputFiles[0].text })
    assert.deepEqual(await page.evaluate(() => [window.langTest.getLang(), window.langTest.tr('外观')]), ['en', 'Appearance'])
  } finally { await context.close() }
})

test('unknown host locale falls back to English', async () => {
  const { page, context } = await setup('zh-CN', 'fr')
  try {
    assert.equal(await page.evaluate(() => window.bloomTest.lang.getLang()), 'en')
    assert.equal(await text(page, '.dsh-bloom-head__title'), expected.en.heading)
    await click(page, '.dsh-bloom-trigger')
    const before = await text(page, '[data-head-name]')
    await hostSwitch(page, 'en')
    assert.equal(await text(page, '[data-head-name]'), before)
  } finally { await context.close() }
})
for (const locale of ['zh-CN', 'en-US', 'fr-FR']) {
  for (const active of ['zh', 'en']) {
    test(`${locale}: DSH ${active} controls panel and banner`, async () => {
      const {page, context, errors} = await setup(locale, active, 'dark', 'petal', null, active === 'zh' ? 'en' : 'zh')
      try {
        assert.equal(await text(page, '.dsh-bloom-head__title'), expected[active].heading)
        assert.equal(await text(page, '#dsh-bloom-update-banner strong'), expected[active].banner)
        assert.equal(await page.locator('.dsh-bloom-trigger').getAttribute('title'), `${active === 'zh' ? 'Bloom 主题' : 'Bloom theme'} · v${currentVersion}${active === 'zh' ? '（可更新到 v99.0.0）' : ' (updatable to v99.0.0)'}`)
        assert.equal(await page.evaluate(() => localStorage.getItem('dsh-bloom-lang')), null)
        assert.deepEqual(await page.evaluate(() => Object.keys(window.__dshLocale.dicts['dsh-bloom-theme']).sort()), ['en', 'zh'])
        assert.deepEqual(errors, [])
      } finally { await context.close() }
    })
  }
}
for (const language of ['zh', 'en']) {
  test(`${language}: poem column aligns across rows without overflow`, async () => {
    const { page, context } = await setup('en-US', language)
    try {
      await click(page, '.dsh-bloom-trigger')
      await page.clock.fastForward(500)
      const geometry = await page.evaluate(() => [...document.querySelectorAll('.dsh-bloom-option')].map(row => {
        const box = row.getBoundingClientRect()
        const poem = row.querySelector('.dsh-bloom-option__en')
        return { left: poem.getBoundingClientRect().left - box.left,
          overflows: row.scrollWidth > row.clientWidth + 1,
          titleContainsPoem: row.title.includes(poem.textContent) }
      }))
      assert.equal(geometry.length, 12)
      assert.ok(geometry.every(row => Math.abs(row.left - geometry[0].left) < 1))
      assert.ok(geometry.every(row => !row.overflows && row.titleContainsPoem))
    } finally { await context.close() }
  })
}
// 对齐不等于看得见：量像素宽度、行内垂直包含、名称不被截断、渐变首端合成后的对比度。
// 页面 <html lang> 故意和 DSH 语言相反 —— 列宽必须跟 DSH 语言走，不能继承页面 lang。
const measureRows = () => {
  const toRGBA = css => {
    const c = document.createElement('canvas').getContext('2d')
    c.fillStyle = css; c.fillRect(0, 0, 1, 1)
    const e = c.getImageData(0, 0, 1, 1).data
    return [e[0], e[1], e[2], e[3] / 255]
  }
  // 从 html 往下逐层 source-over 合成背景，得到诗句真实压在上面的底色。
  const backdrop = el => {
    const chain = []; for (let n = el; n; n = n.parentElement) chain.unshift(n)
    let rgb = [255, 255, 255]
    for (const n of chain) {
      const [r, g, b, a] = toRGBA(getComputedStyle(n).backgroundColor)
      rgb = [r * a + rgb[0] * (1 - a), g * a + rgb[1] * (1 - a), b * a + rgb[2] * (1 - a)]
    }
    return rgb
  }
  const lum = ([r, g, b]) => { const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  const contrast = (fg, bg) => { const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x); return (a + 0.05) / (b + 0.05) }
  return [...document.querySelectorAll('.dsh-bloom-option')].map(row => {
    const poem = row.querySelector('.dsh-bloom-option__en')
    const name = row.querySelector('.dsh-bloom-option__name')
    const check = row.querySelector('.dsh-bloom-check')
    const rb = row.getBoundingClientRect(), pb = poem.getBoundingClientRect(), cb = check.getBoundingClientRect()
    const cs = getComputedStyle(poem)
    const stops = [...cs.backgroundImage.matchAll(/(?:rgba?|oklch|oklab|color|lab|lch)\([^()]*(?:\([^()]*\)[^()]*)*\)/g)].map(m => m[0])
    const bg = backdrop(row)
    const comp = css => { const [r, g, b, a] = toRGBA(css); return [r * a + bg[0] * (1 - a), g * a + bg[1] * (1 - a), b * a + bg[2] * (1 - a)] }
    return {
      variant: row.dataset.variant, poemLang: poem.lang,
      poemWidth: pb.width, poemText: poem.textContent, poemFull: poem.scrollWidth,
      poemTop: pb.top - rb.top, poemBottom: rb.bottom - pb.bottom, poemHeight: pb.height,
      nameText: name.textContent, nameWidth: name.clientWidth, nameNeeded: name.scrollWidth,
      checkRight: rb.right - cb.right, checkCenter: (cb.top + cb.bottom) / 2 - (rb.top + rb.bottom) / 2,
      opacity: Number(cs.opacity), clip: cs.webkitBackgroundClip || cs.backgroundClip, color: cs.color,
      stops, firstContrast: stops[0] ? contrast(comp(stops[0]), bg) : 0,
      lastContrast: stops.at(-1) ? contrast(comp(stops.at(-1)), bg) : 0,
    }
  })
}
for (const language of ['zh', 'en']) {
  for (const mode of ['light', 'dark']) {
    test(`${language}/${mode}: poems are visible, names fit, checks align, all gradient endpoints reach 4.5:1`, async () => {
      const { page, context } = await setup('en-US', language, mode)
      try {
        await page.evaluate(l => { document.documentElement.lang = l === 'zh' ? 'en' : 'zh-CN' }, language)
        await click(page, '.dsh-bloom-trigger')
        await page.clock.fastForward(500)
        assert.equal(await page.evaluate(() => document.body.hasAttribute('data-ds-dark-theme')), mode === 'dark')
        const rows = await page.evaluate(measureRows)
        assert.equal(rows.length, 12)
        for (const r of rows) {
          const at = `${language}/${mode} ${r.variant}`
          assert.equal(r.poemLang, language, `${at}: poem carries the DSH language`)
          assert.ok(r.poemText.trim().length > 0, `${at}: poem has text`)
          assert.ok(r.poemWidth >= 60, `${at}: poem column ${r.poemWidth}px is too narrow to read`)
          assert.ok(r.poemHeight >= 10 && r.poemTop >= 0 && r.poemBottom >= 0, `${at}: poem text box ${JSON.stringify([r.poemTop, r.poemHeight, r.poemBottom])} sits inside the row`)
          assert.equal(r.opacity, 1, `${at}: no whole-line fade`)
          assert.equal(r.clip, 'text', `${at}: gradient is clipped to glyphs`)
          assert.ok(r.stops.length >= 2, `${at}: gradient has two endpoints (${r.stops})`)
        }
        // Small text (11.5–12.5px): every gradient endpoint must meet WCAG AA 4.5:1. Collect all
        // offenders so one run names every failing palette instead of stopping at the first.
        const weak = rows.flatMap(r => [
          r.firstContrast < 4.5 && `${r.variant} start ${r.stops[0]} = ${r.firstContrast.toFixed(2)}`,
          r.lastContrast < 4.5 && `${r.variant} end ${r.stops.at(-1)} = ${r.lastContrast.toFixed(2)}`,
        ].filter(Boolean))
        assert.deepEqual(weak, [], `${language}/${mode}: gradient endpoints below 4.5:1`)
        const clipped = rows.filter(r => r.nameNeeded > r.nameWidth + 1).map(r => `${r.nameText} needs ${r.nameNeeded}px, has ${r.nameWidth}px`)
        assert.deepEqual(clipped, [], `${language}/${mode}: palette names truncated`)
        assert.ok(rows.every(r => Math.abs(r.checkRight - rows[0].checkRight) < 1 && Math.abs(r.checkCenter) < 1.5), 'check marks share one column and are vertically centred')
        if (language === 'en') {
          const tangerine = rows.find(r => r.variant === 'tangerine')
          assert.equal(tangerine.nameText.replace(/新|New/, '').trim(), 'Tangerine')
        }
      } finally { await context.close() }
    })
  }
}
for (const mode of ['light', 'dark', 'system']) {
  test(`live switching preserves ${mode}, palette, menu, update cache and clipboard actions`, async () => {
    const { page, context, errors } = await setup('en-US', 'en', mode)
    try {
      await click(page, '.dsh-bloom-trigger')
      await click(page, '.dsh-bloom-more')
      const before = await page.evaluate(() => ({storage: {...localStorage}, session: {...sessionStorage}, variant: document.body.dataset.bloomVariant, dark: document.body.hasAttribute('data-ds-dark-theme')}))
      for (const lang of ['zh', 'en', 'zh']) {
        await hostSwitch(page, lang)
        assert.equal(await text(page, '.dsh-bloom-head__title'), expected[lang].heading)
        assert.equal(await text(page, '#dsh-bloom-update-banner strong'), expected[lang].banner)
        assert.equal(await page.locator('[data-dsh-state]').getAttribute('title'), expected[lang].error)
        assert.ok((await page.locator('.dsh-bloom-version__update').getAttribute('title')).startsWith(expected[lang].badge))
        assert.equal(await page.locator('.dsh-bloom-version__update').evaluate(el => el.hidden), false)
        assert.equal(await page.locator('.dsh-bloom-menu').evaluate(el => el.hidden), false)
        assert.equal(await page.locator('.dsh-bloom-more-body').evaluate(el => el.hidden), false)
        assert.equal(await page.locator('.dsh-bloom-trigger').getAttribute('aria-expanded'), 'true')
        assert.equal(await page.locator(`[data-mode="${mode}"]`).getAttribute('aria-pressed'), 'true')
        const after = await page.evaluate(() => ({storage: {...localStorage}, session: {...sessionStorage}, variant: document.body.dataset.bloomVariant, dark: document.body.hasAttribute('data-ds-dark-theme')}))
        // 语言不再写自己的 localStorage —— 真源是 DSH 的 locale.preference。
        // 其余持久化状态（配色/模式/版本）一律不变。
        assert.deepEqual(after, before)
        assert.equal(await page.evaluate(() => window.__dshLocale.active), lang)
        await page.evaluate(() => { window.copied = null })
        await click(page, '.dsh-bloom-share')
        await click(page, '.dsh-bloom-share-install')
        await page.waitForFunction(() => window.copied)
        assert.ok((await page.evaluate(() => window.copied)).includes(expected[lang].share))
        await click(page, '.dsh-bloom-share')
        await click(page, '#dsh-bloom-update-banner [data-act="copy"]')
        await page.waitForFunction(() => window.copied.startsWith('dsh plugin'))
        await click(page, '.dsh-bloom-trigger')
        assert.match(await page.evaluate(() => window.copied), /add dsh-bloom-theme@99\.0\.0$/)
        assert.equal(await text(page, '#dsh-bloom-update-banner code'), await page.evaluate(() => window.copied))
      }
      // A real update request still runs and its exact command reaches the clipboard.
      await page.route('**/@deepseek-ai/dsh', route => route.fulfill({contentType:'application/json', body: JSON.stringify({'dist-tags':{next:'0.2.0-rc.3'}})}))
      await click(page, '[data-act="refresh"]')
      await page.waitForFunction(() => window.bloomTest.version.dshLatestVersion === '0.2.0-rc.3')
      await click(page, '.dsh-bloom-dsh-update [data-act="copy"]')
      await page.waitForFunction(() => window.copied.includes('npm i -g @deepseek-ai/dsh@0.2.0-rc.3'))
      await click(page, '#dsh-bloom-update-banner .bloom-upd-x')
      assert.equal(await page.evaluate(() => localStorage.getItem('dsh-bloom-update-dismissed')), '99.0.0')
      await hostSwitch(page, 'zh')
      assert.equal(await page.locator('#dsh-bloom-update-banner').count(), 0)
      assert.deepEqual(errors, [])
    } finally { await context.close() }
  })
}
test('DSH language switch works when localStorage throws', async () => {
  const { page, context } = await setup('en-US', 'en')
  try {
    await page.evaluate(() => { Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException('blocked', 'SecurityError') } })
    await click(page, '.dsh-bloom-trigger')
    await hostSwitch(page, 'zh')
    assert.equal(await text(page, '.dsh-bloom-head__title'), expected.zh.heading)
    assert.equal(await text(page, '#dsh-bloom-update-banner strong'), expected.zh.banner)
  } finally { await context.close() }
})

for (const [name, check] of [
  ['share uses live language', async page => {
    await click(page, '.dsh-bloom-share')
    await click(page, '.dsh-bloom-share-install')
    await page.waitForFunction(() => window.copied)
    assert.ok((await page.evaluate(() => window.copied)).includes(expected.zh.share))
  }],
  ['cached failure uses live language', async page => {
    assert.equal(await page.locator('[data-dsh-state]').getAttribute('title'), expected.zh.error)
  }],
  ['Bloom update badge survives rerender', async page => {
    assert.equal(await page.locator('.dsh-bloom-version__update').evaluate(el => el.hidden), false)
    assert.ok((await page.locator('.dsh-bloom-trigger').getAttribute('title')).includes('99.0.0'))
  }],
  ['panel has no language switch of its own', async page => {
    assert.equal(await page.locator('[data-lang]').count(), 0)
    assert.equal(await page.locator('.dsh-bloom-menu').evaluate(el => el.hidden), false)
  }],
]) {
  test(name, async () => {
    const {page, context} = await setup('en-US', 'en')
    try {
      await click(page, '.dsh-bloom-trigger')
      await hostSwitch(page, 'zh')
      await check(page)
    } finally { await context.close() }
  })
}
test('all palettes retain computed colors and selection after switching language', async () => {
  const {page, context} = await setup('en-US', 'en')
  try {
    const variants = ['mist','cinnabar','petal','ripple','sage','stone','lapis','amber','aurora','lavender','mint','tangerine','silverrose','dawn','osmanthus']
    for (const variant of variants) {
      // Legacy preferences remain supported even though their colors leave the featured menu.
      await page.evaluate(v => window.bloomTest.switcher.applyVariant(v), variant)
      await page.waitForFunction(v => document.body.dataset.bloomVariant === v, variant)
      await click(page, '.dsh-bloom-trigger')
      const colors = () => page.evaluate(() => {
        const css = getComputedStyle(document.body)
        return [document.body.dataset.bloomVariant, css.getPropertyValue('--bloom-accent'), css.getPropertyValue('--dsw-alias-bg-layer-1')]
      })
      const before = await colors()
      for (const lang of ['zh', 'en', 'zh']) {
        await hostSwitch(page, lang)
        assert.deepEqual(await colors(), before)
        assert.equal(await page.evaluate(() => localStorage.getItem('dsh-bloom-variant')), variant)
        assert.equal(await page.locator(`[data-variant="${variant}"]`).getAttribute('aria-selected'), 'true')
      }
      await click(page, '.dsh-bloom-close')
    }
  } finally { await context.close() }
})
test('DSH language and appearance replay on reload; legacy preference is ignored', async () => {
  const {page, context} = await setup('zh-CN', 'en', 'dark', 'lapis')
  try {
    await click(page, '.dsh-bloom-trigger')
    await hostSwitch(page, 'zh')
    // 语言写在 DSH 的 locale.preference 上（不再是自己存 localStorage）。
    // 模拟「重启后 DSH 把偏好还给插件」：active 仍是 zh。
    assert.equal(await page.evaluate(() => window.__dshLocale.active), 'zh')
    await page.reload()
    // 重载后宿主重新注入 locale 服务，并把偏好（zh）交给插件。
    // 这正是新架构：语言状态在 DSH 那边，不在插件的 localStorage。
    await page.addScriptTag({content: outputFiles[0].text})
    await page.evaluate(() => {
      window.__dshLocale = window.bloomTest.makeLocale('zh')
    })
    await page.evaluate(() => window.bloomTest.applyWithLocale?.())
    assert.equal(await text(page, '.dsh-bloom-head__title'), expected.zh.heading)
    assert.equal(await page.evaluate(() => document.body.dataset.bloomVariant), 'lapis')
    assert.equal(await page.evaluate(() => document.body.hasAttribute('data-ds-dark-theme')), true)
    // 旧版自己存的那份语言从此不再生效（架构已改：真源只有 DSH）
    await page.evaluate(() => localStorage.setItem('dsh-bloom-lang', 'en'))
    assert.equal(await page.evaluate(() => window.bloomTest.lang.getLang()), 'zh')
  } finally { await context.close() }
})

test('timeout diagnostics rerender in the selected language', async () => {
  const {page, context} = await setup('en-US', 'en')
  try {
    await page.evaluate(() => {
      window.fetch = (_url, options) => new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      })
      void window.bloomTest.version.checkDshLatest(true)
    })
    await page.clock.fastForward(8100)
    await page.waitForFunction(() => window.bloomTest.version.dshCheckError?.startsWith('Timed out'))
    await click(page, '.dsh-bloom-trigger')
    await hostSwitch(page, 'zh')
    assert.equal(await page.locator('[data-dsh-state]').getAttribute('title'), '超时 8s')
  } finally { await context.close() }
})
test('desktop update bridge stays functional across language changes', async () => {
  const {page, context} = await setup('en-US', 'en')
  try {
    await page.evaluate(() => {
      window.desktopOpened = 0
      window.dshDesktop = {updates: {
        open: () => { window.desktopOpened++ },
        status: async () => ({phase: 'available', version: '0.2.0-rc.3'}),
      }}
    })
    await click(page, '.dsh-bloom-trigger')
    await click(page, '.dsh-bloom-more')
    for (const lang of ['zh', 'en', 'zh']) {
      await hostSwitch(page, lang)
      await page.waitForFunction(() => document.querySelector('[data-dsh-latest]').textContent === '0.2.0-rc.3')
      assert.equal(await page.locator('[data-act="refresh"]').getAttribute('disabled'), null)
      await click(page, '[data-act="refresh"]')
    }
    assert.equal(await page.evaluate(() => window.desktopOpened), 3)
  } finally { await context.close() }
})

test('an update check completing after a language switch uses the new language', async () => {
  const {page, context} = await setup('en-US', 'en')
  try {
    await page.evaluate(() => {
      window.fetch = () => new Promise(resolve => { window.finishCheck = () => resolve({ok:true, json:async () => ({'dist-tags':{}})}) })
      void window.bloomTest.version.checkDshLatest(true)
    })
    await click(page, '.dsh-bloom-trigger')
    await hostSwitch(page, 'zh')
    await page.evaluate(() => window.finishCheck())
    await page.waitForFunction(() => !window.bloomTest.version.dshCheckPromise)
    assert.equal(await page.locator('[data-dsh-state]').getAttribute('title'), expected.zh.error)
  } finally { await context.close() }
})

// 宿主形态标签（桌面端 / Web）—— 用户装的是哪一版宿主，面板上一眼可见。
test('host platform tag shows desktop or web', async () => {
  for (const [platform, label] of [['desktop', '桌面端'], ['web', 'Web']]) {
    const { page, context } = await setup('zh-CN', 'zh', 'dark', 'petal',
      { ok: true, version: '0.2.1-rc.5', platform })
    try {
      await click(page, '.dsh-bloom-trigger')
      await click(page, '.dsh-bloom-more')
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-dsh-platform]')
        return el && !el.hidden
      })
      assert.equal(await text(page, '[data-dsh-platform]'), label)
      assert.equal(await page.locator('[data-dsh-platform]').getAttribute('data-platform'), platform)
    } finally { await context.close() }
  }
})

// host 半拿不到 platform 时不该乱猜 —— 标签隐藏，而不是显示错的形态。
test('host platform tag stays hidden when the host cannot tell', async () => {
  const { page, context } = await setup('zh-CN', 'zh', 'dark', 'petal',
    { ok: true, version: '0.2.1-rc.5' })
  try {
    await click(page, '.dsh-bloom-trigger')
    await click(page, '.dsh-bloom-more')
    // 版本已经取到，说明这次请求走完了；此时标签必须仍然是隐藏的。
    await page.waitForFunction(() => document.querySelector('[data-dsh-current]').textContent === '0.2.1-rc.5')
    assert.equal(await page.locator('[data-dsh-platform]').evaluate(el => el.hidden), true)
  } finally { await context.close() }
})

// host 答了形态但没答出版本（ok:false）时，形态标签也要露出来。
// Web 宿主没有桌面桥兜底，少了这一步重绘，标签会一直藏着（Codex PR #72 P2）。
test('host platform tag appears even when only the platform is answered', async () => {
  const { page, context } = await setup('zh-CN', 'zh', 'dark', 'petal',
    { ok: false, reason: 'dsh package not found', platform: 'web' })
  try {
    await click(page, '.dsh-bloom-trigger')
    await click(page, '.dsh-bloom-more')
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-dsh-platform]')
      return el && !el.hidden
    })
    assert.equal(await text(page, '[data-dsh-platform]'), 'Web')
  } finally { await context.close() }
})

// 第一次向 host 半问版本失败（端点还没起来）后，后面还能重试 ——
// 不能因为一次失败就把整个会话锁死在旧版本上（Codex PR #72 P2）。
test('a failed host-version request can be retried', async () => {
  const { page, context } = await setup('zh-CN', 'zh', 'dark', 'petal',
    { ok: true, version: '0.2.1-rc.5', platform: 'desktop' })
  try {
    // 第一次请求直接失败（模拟端点还没起来）。
    await page.route('**/api/bloom/dsh-version', route => route.abort())
    await click(page, '.dsh-bloom-trigger')
    await click(page, '.dsh-bloom-more')
    await page.waitForTimeout(300)
    // 撤掉拦截后点刷新 —— 应该能重新问出来。
    await page.unroute('**/api/bloom/dsh-version')
    await click(page, '[data-act="refresh"]')
    await page.waitForFunction(() => document.querySelector('[data-dsh-current]').textContent === '0.2.1-rc.5')
    assert.equal(await text(page, '[data-dsh-platform]'), '桌面端')
  } finally { await context.close() }
})
