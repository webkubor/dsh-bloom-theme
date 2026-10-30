import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const {version: currentVersion} = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

// Exercise the real client and its DOM event handlers; all network traffic is mocked.
const { outputFiles } = await build({
  stdin: { contents: `import './src/client.ts'; import * as lang from './src/lang.ts'; import * as version from './src/version.ts'; window.bloomTest = {lang, version};`, resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
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
  await page.evaluate(({saved, mode, variant}) => {
    if (saved) localStorage.setItem('dsh-bloom-lang', saved)
    localStorage.setItem('dsh-bloom-variant', variant)
    localStorage.setItem('bloom-appearance-mode', mode)
    window.__ModuleLoader__ = { load() {} }
    window.copied = ''
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copied = text } } })
  }, {saved, mode, variant})
  await page.clock.install()
  await page.addScriptTag({ content: outputFiles[0].text })
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
        assert.deepEqual(after, {...before, storage: {...before.storage, 'dsh-bloom-lang': lang}})
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
    await page.reload()
    await page.evaluate(() => { window.__ModuleLoader__ = {load(){}} })
    await page.addScriptTag({content: outputFiles[0].text})
    assert.equal(await text(page, '.dsh-bloom-head__title'), expected.ru.heading)
    assert.equal(await page.evaluate(() => document.body.dataset.bloomVariant), 'lapis')
    assert.equal(await page.evaluate(() => document.body.hasAttribute('data-ds-dark-theme')), true)
    await page.evaluate(() => localStorage.setItem('dsh-bloom-lang', 'invalid'))
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
