import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const {version: currentVersion} = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

/**
 * DSH locale 服务的最小替身。
 *
 * 按 DSH 的真实契约实现（dsh-client-locale）：注册词条、bind 取词（回落链
 * 当前语言 → 声明的 fallback → en → key 本身）、setLocale 改偏好并广播、
 * subscribe 订阅变化。
 *
 * @param active - 起始语言（对应 DSH 的 locale.preference）。
 */
const makeLocale = (active) => ({
  active,
  dicts: {},
  listeners: new Set(),
  register(ns, dicts) { this.dicts[ns] = dicts },
  bind(ns) {
    const dicts = this.dicts[ns] ?? {}
    return (key) => {
      for (const loc of [this.active, 'en']) {
        const v = dicts[loc]?.[key]
        if (v !== undefined) return v
      }
      return key
    }
  },
  getSnapshot() { return { active: this.active } },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn) },
  setLocale(id) { this.active = id; for (const fn of this.listeners) fn() },
  addLanguage() { return () => {} },
})

// Exercise the real client and its DOM event handlers; all network traffic is mocked.
const { outputFiles } = await build({
  stdin: { contents: `import './src/client.ts'; import * as lang from './src/lang.ts'; import * as version from './src/version.ts';
    window.bloomTest = {lang, version};
    // 宿主注入 locale 服务后，cordis 会 materialize 插件的 apply(ctx)。
    // 测试里手动调它，走和真实宿主同一条路径。
    // ⚠️ ctx 必须是「严格」的：cordis 的 ctx 是 Proxy，读没在 inject 里声明的服务会抛
    //    \`cannot get property "x" without inject\`。2026-10-30 这里曾给了个普通对象
    //    {locale, effect}，测试全绿、桌面端启动失败 —— 替身比宿主宽松，等于没测。
    const strictCtx = (services, declared) => new Proxy({}, {
      get(_, key) {
        if (key === 'effect') return (fn) => fn()
        if (key === 'inject') return (names, cb) => cb(strictCtx(services, [...declared, ...names]))
        if (typeof key === 'symbol' || key === 'then') return undefined
        if (!declared.includes(key)) throw new Error('cannot get property "' + String(key) + '" without inject')
        return services[key]
      },
    })
    window.bloomTest.applyWithLocale = () => {
      const mod = window.__ModuleLoader__?._module
      mod?.apply(strictCtx({ locale: window.__dshLocale }, mod.inject ?? []))
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
  zh: { heading: '外观', banner: 'Bloom 主题有新版本', share: '装到你的 DSH：', error: 'registry 无可用通道（tags: 无）', badge: '可更新到 v' },
  en: { heading: 'Appearance', banner: 'A new Bloom version is out', share: 'Install Bloom into your DSH:', error: 'No usable channel in the registry (tags: none)', badge: 'update available: v' },
  ru: { heading: 'Внешний вид', banner: 'Новая версия Bloom', share: 'Установите к себе в DSH:', error: 'В registry нет доступных каналов (теги: нет)', badge: 'доступна v' },
}
/**
 * DSH locale 服务的最小替身见文件头的 makeLocale —— 浏览器里用的是它序列化过去的副本。
 */
async function setup(locale, saved, mode = 'dark', variant = 'petal', hostBody = null) {
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
  await page.evaluate(({saved, mode, variant, locale, localeSrc}) => {
    if (saved) localStorage.setItem('dsh-bloom-lang', saved)
    localStorage.setItem('dsh-bloom-variant', variant)
    localStorage.setItem('bloom-appearance-mode', mode)
    // DSH 的 ModuleLoader 真的会调 factory 并 materialize 出来的模块 ——
    // 测试里要照抄这个行为，否则拿不到插件的 apply(ctx)。
    window.__ModuleLoader__ = {
      _module: null,
      load(def) { this._module = def.factory() },
    }
    window.copied = ''
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copied = text } } })
    // ── DSH locale 服务的最小替身 ──────────────────────────────────────
    // 语言是体系配置，真源在 DSH（2026-10-30 改）。测试里不能只改 localStorage ——
    // 那样测的就不是新架构了。这里按 DSH 的真实契约实现一份：注册词条、bind 取词、
    // setLocale 改偏好并广播、subscribe 订阅变化。
    window.__dshLocale = new Function('return (' + localeSrc + ')')()(saved || (locale.startsWith('zh') ? 'zh' : 'en'))
    // 宿主把 locale 服务交给插件：apply(ctx) 会从这里取
    window.__dshApply = (ctx) => window.__dshApplyModule?.apply(ctx)
  }, {saved, mode, variant, locale, localeSrc: makeLocale.toString()})
  await page.clock.install()
  await page.addScriptTag({ content: outputFiles[0].text })
  // 让插件走 apply(ctx) 这条真实路径（宿主注入 locale 后才会 bind 上）
  await page.evaluate(() => window.bloomTest.applyWithLocale?.())
  await page.waitForFunction(() => window.bloomTest.version.dshCheckError)
  await page.clock.fastForward(4100)
  await page.waitForSelector('#dsh-bloom-update-banner')
  return { page, context, errors }
}
const click = (page, selector) => page.locator(selector).evaluate(el => el.click())
const text = (page, selector) => page.locator(selector).textContent()
for (const locale of ['zh-CN', 'en-US', 'ru-RU']) {
  for (const saved of [null, 'zh', 'en', 'ru']) {
    test(`${locale}: saved ${saved || 'auto'} controls panel and banner`, async () => {
      const {page, context, errors} = await setup(locale, saved)
      try {
        const lang = saved || (locale.startsWith('zh') ? 'zh' : 'en')
        assert.equal(await text(page, '.dsh-bloom-head__title'), expected[lang].heading)
        assert.equal(await text(page, '#dsh-bloom-update-banner strong'), expected[lang].banner)
        assert.equal(await page.locator('.dsh-bloom-trigger').getAttribute('title'), `${lang === 'zh' ? 'Bloom 主题' : lang === 'en' ? 'Bloom theme' : 'Тема Bloom'} · v${currentVersion}${lang === 'zh' ? '（可更新到 v99.0.0）' : lang === 'en' ? ' (updatable to v99.0.0)' : ' (доступно v99.0.0)'}`)
        assert.deepEqual(errors, [])
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
      for (const lang of ['ru', 'zh', 'en']) {
        await click(page, `[data-lang="${lang}"]`)
        assert.equal(await text(page, '.dsh-bloom-head__title'), expected[lang].heading)
        assert.equal(await text(page, '#dsh-bloom-update-banner strong'), expected[lang].banner)
        assert.equal(await page.locator('[data-dsh-state]').getAttribute('title'), expected[lang].error)
        assert.ok((await page.locator('.dsh-bloom-version__update').getAttribute('title')).startsWith(expected[lang].badge))
        assert.equal(await page.locator('.dsh-bloom-version__update').evaluate(el => el.hidden), false)
        assert.equal(await page.locator('.dsh-bloom-menu').evaluate(el => el.hidden), false)
        assert.equal(await page.locator('.dsh-bloom-more-body').evaluate(el => el.hidden), false)
        assert.equal(await page.locator('.dsh-bloom-trigger').getAttribute('aria-expanded'), 'true')
        assert.equal(await page.locator(`[data-mode="${mode}"]`).getAttribute('aria-pressed'), 'true')
        assert.equal(await page.locator(`[data-lang="${lang}"]`).getAttribute('aria-pressed'), 'true')
        const after = await page.evaluate(() => ({storage: {...localStorage}, session: {...sessionStorage}, variant: document.body.dataset.bloomVariant, dark: document.body.hasAttribute('data-ds-dark-theme')}))
        // 语言不再写自己的 localStorage —— 真源是 DSH 的 locale.preference。
        // 其余持久化状态（配色/模式/版本）一律不变。
        assert.deepEqual(after, before)
        assert.equal(await page.evaluate(() => window.__dshLocale.active), lang)
        await click(page, '.dsh-bloom-share')
        await page.waitForFunction(() => window.copied)
        assert.ok((await page.evaluate(() => window.copied)).includes(expected[lang].share))
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
      await click(page, '[data-lang="ru"]')
      assert.equal(await page.locator('#dsh-bloom-update-banner').count(), 0)
      assert.deepEqual(errors, [])
    } finally { await context.close() }
  })
}
test('manual selection works when localStorage throws', async () => {
  const { page, context } = await setup('en-US', 'en')
  try {
    await page.evaluate(() => { Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new DOMException('blocked', 'SecurityError') } })
    await click(page, '.dsh-bloom-trigger')
    await click(page, '[data-lang="ru"]')
    assert.equal(await text(page, '.dsh-bloom-head__title'), expected.ru.heading)
    assert.equal(await text(page, '#dsh-bloom-update-banner strong'), expected.ru.banner)
  } finally { await context.close() }
})

for (const [name, check] of [
  ['share uses live language', async page => {
    await click(page, '.dsh-bloom-share')
    await page.waitForFunction(() => window.copied)
    assert.ok((await page.evaluate(() => window.copied)).includes(expected.ru.share))
  }],
  ['cached failure uses live language', async page => {
    assert.equal(await page.locator('[data-dsh-state]').getAttribute('title'), expected.ru.error)
  }],
  ['Bloom update badge survives rerender', async page => {
    assert.equal(await page.locator('.dsh-bloom-version__update').evaluate(el => el.hidden), false)
    assert.ok((await page.locator('.dsh-bloom-trigger').getAttribute('title')).includes('99.0.0'))
  }],
  ['keyboard focus survives rerender', async page => {
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.lang), 'ru')
    await page.keyboard.press('ArrowDown')
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.variant), 'mist')
  }],
]) {
  test(name, async () => {
    const {page, context} = await setup('en-US', 'en')
    try {
      await click(page, '.dsh-bloom-trigger')
      await click(page, '[data-lang="ru"]')
      await check(page)
    } finally { await context.close() }
  })
}
test('all palettes retain computed colors and selection after switching language', async () => {
  const {page, context} = await setup('en-US', 'en')
  try {
    const variants = ['mist','cinnabar','petal','ripple','sage','stone','lapis','amber','aurora','lavender']
    for (const variant of variants) {
      await click(page, '.dsh-bloom-trigger')
      await click(page, `[data-variant="${variant}"]`)
      await page.waitForFunction(v => document.body.dataset.bloomVariant === v, variant)
      await click(page, '.dsh-bloom-trigger')
      const colors = () => page.evaluate(() => {
        const css = getComputedStyle(document.body)
        return [document.body.dataset.bloomVariant, css.getPropertyValue('--bloom-accent'), css.getPropertyValue('--dsw-alias-bg-layer-1')]
      })
      const before = await colors()
      for (const lang of ['ru', 'zh', 'en']) {
        await click(page, `[data-lang="${lang}"]`)
        assert.deepEqual(await colors(), before)
        assert.equal(await page.evaluate(() => localStorage.getItem('dsh-bloom-variant')), variant)
        assert.equal(await page.locator(`[data-variant="${variant}"]`).getAttribute('aria-selected'), 'true')
      }
      await click(page, '.dsh-bloom-close')
    }
  } finally { await context.close() }
})
test('saved language and appearance replay on reload; invalid language falls back', async () => {
  const {page, context} = await setup('zh-CN', 'en', 'dark', 'lapis')
  try {
    await click(page, '.dsh-bloom-trigger')
    await click(page, '[data-lang="ru"]')
    // 语言写在 DSH 的 locale.preference 上（不再是自己存 localStorage）。
    // 模拟「重启后 DSH 把偏好还给插件」：active 仍是 ru。
    assert.equal(await page.evaluate(() => window.__dshLocale.active), 'ru')
    await page.reload()
    // 重载后宿主重新注入 locale 服务，并把偏好（ru）交给插件。
    // 这正是新架构：语言状态在 DSH 那边，不在插件的 localStorage。
    await page.evaluate(([src, active]) => {
      window.__dshLocale = new Function('return (' + src + ')')()(active)
      window.__ModuleLoader__ = { _module: null, load(def) { this._module = def.factory() } }
    }, [makeLocale.toString(), 'ru'])
    await page.addScriptTag({content: outputFiles[0].text})
    await page.evaluate(() => window.bloomTest.applyWithLocale?.())
    assert.equal(await text(page, '.dsh-bloom-head__title'), expected.ru.heading)
    assert.equal(await page.evaluate(() => document.body.dataset.bloomVariant), 'lapis')
    assert.equal(await page.evaluate(() => document.body.hasAttribute('data-ds-dark-theme')), true)
    // 旧版自己存的那份语言从此不再生效（架构已改：真源只有 DSH）
    await page.evaluate(() => localStorage.setItem('dsh-bloom-lang', 'zh'))
    assert.equal(await page.evaluate(() => window.bloomTest.lang.getLang()), 'ru')
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
    await click(page, '[data-lang="ru"]')
    assert.equal(await page.locator('[data-dsh-state]').getAttribute('title'), 'Тайм-аут (8 с)')
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
    for (const lang of ['ru', 'zh', 'en']) {
      await click(page, `[data-lang="${lang}"]`)
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
    await click(page, '[data-lang="ru"]')
    await page.evaluate(() => window.finishCheck())
    await page.waitForFunction(() => !window.bloomTest.version.dshCheckPromise)
    assert.equal(await page.locator('[data-dsh-state]').getAttribute('title'), expected.ru.error)
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
