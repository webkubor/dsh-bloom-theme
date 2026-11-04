import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// 2026-11-04 新增：深浅状态交还宿主。
//
// v0.23.0 及之前，插件自己写 body[data-ds-dark-theme] 并把档位存进 localStorage ——
// 跟宿主形成两个真源：宿主 ThemePresenter 下一次 theme/change 就会无声覆盖插件
// 写的值，设置面板里的选中态也跟插件的档位各说各话。
//
// 现在（有宿主 theme 服务时）：状态归宿主，面板只调 ctx.theme.setTheme()。
// 没有宿主服务时退回旧路径，老宿主上深浅切换仍然可用。

const { outputFiles } = await build({
  stdin: {
    contents: `import { bindHostTheme, readStoredMode, setMode, currentIsDark, initAppearanceSync } from './src/appearance.ts';
      window.fixture = { bindHostTheme, readStoredMode, setMode, currentIsDark, initAppearanceSync };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})

const browser = await chromium.launch({
  executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined,
  args: ['--no-sandbox'],
})
test.after(() => browser.close())

/** 宿主的 theme 服务替身：记录被写入的偏好，并按偏好维护 body 属性。 */
const hostService = (page) => page.evaluateHandle(() => {
  const state = { preference: 'light', calls: [] }
  const service = {
    getTheme: () => ({ preference: state.preference, active: { colorScheme: state.preference === 'dark' ? 'dark' : 'light' } }),
    setTheme: (id) => {
      state.calls.push(id)
      state.preference = id
      document.body.toggleAttribute('data-ds-dark-theme', id === 'dark')
    },
  }
  window.__hostTheme = state
  return service
})

async function setup(t) {
  const context = await browser.newContext()
  t.after(() => context.close())
  const page = await context.newPage()
  await page.route('https://bloom.test/', route => route.fulfill({
    contentType: 'text/html',
    body: '<html><body></body></html>',
  }))
  await page.goto('https://bloom.test/')
  await page.addScriptTag({ content: outputFiles[0].text })
  return page
}

test('with a host theme service the preference is handed to the host', async t => {
  const page = await setup(t)
  const handle = await hostService(page)
  await page.evaluate((svc) => window.fixture.bindHostTheme(svc), handle)
  await page.evaluate(() => window.fixture.setMode('dark'))
  const calls = await page.evaluate(() => window.__hostTheme.calls)
  assert.deepEqual(calls, ['dark'])
  // 插件自己不碰 body 属性 —— 那是宿主的活
  const attr = await page.evaluate(() => document.body.getAttribute('data-ds-dark-theme'))
  assert.equal(attr, '')
})

test('with a host theme service the plugin keeps no local copy', async t => {
  const page = await setup(t)
  const handle = await hostService(page)
  await page.evaluate((svc) => window.fixture.bindHostTheme(svc), handle)
  await page.evaluate(() => window.fixture.setMode('dark'))
  const stored = await page.evaluate(() => localStorage.getItem('bloom-appearance-mode'))
  assert.equal(stored, null)
})

test('with a host theme service the current mode comes from the host snapshot', async t => {
  const page = await setup(t)
  const handle = await hostService(page)
  await page.evaluate((svc) => window.fixture.bindHostTheme(svc), handle)
  await page.evaluate(() => window.fixture.setMode('dark'))
  assert.equal(await page.evaluate(() => window.fixture.readStoredMode()), 'dark')
  assert.equal(await page.evaluate(() => window.fixture.currentIsDark()), true)
  await page.evaluate(() => window.fixture.setMode('light'))
  assert.equal(await page.evaluate(() => window.fixture.readStoredMode()), 'light')
  assert.equal(await page.evaluate(() => window.fixture.currentIsDark()), false)
})

test('without a host theme service the legacy local path still works', async t => {
  const page = await setup(t)
  await page.evaluate(() => window.fixture.bindHostTheme(null))
  await page.evaluate(() => window.fixture.setMode('dark'))
  assert.equal(await page.evaluate(() => document.body.hasAttribute('data-ds-dark-theme')), true)
  assert.equal(await page.evaluate(() => localStorage.getItem('bloom-appearance-mode')), 'dark')
  await page.evaluate(() => window.fixture.setMode('light'))
  assert.equal(await page.evaluate(() => document.body.hasAttribute('data-ds-dark-theme')), false)
})

test('a legacy stored mode is ignored once the host service appears', async t => {
  const page = await setup(t)
  await page.evaluate(() => localStorage.setItem('bloom-appearance-mode', 'dark'))
  await page.evaluate(() => window.fixture.bindHostTheme(null))
  assert.equal(await page.evaluate(() => window.fixture.readStoredMode()), 'dark')
  const handle = await hostService(page)
  await page.evaluate((svc) => window.fixture.bindHostTheme(svc), handle)
  // 宿主的偏好说了算，旧档位不再参与
  assert.equal(await page.evaluate(() => window.fixture.readStoredMode()), 'light')
})

test('releasing the host service falls back to the legacy path', async t => {
  const page = await setup(t)
  const handle = await hostService(page)
  // evaluateHandle 的返回值是句柄，不能直接当函数传 —— 让页面自己存下释放函数。
  await page.evaluate((svc) => { window.__release = window.fixture.bindHostTheme(svc) }, handle)
  await page.evaluate(() => window.fixture.setMode('dark'))
  await page.evaluate(() => window.__release())
  // 宿主没了之后，插件退回自己管
  await page.evaluate(() => window.fixture.setMode('light'))
  assert.equal(await page.evaluate(() => localStorage.getItem('bloom-appearance-mode')), 'light')
})
