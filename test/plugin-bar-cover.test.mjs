// 插件页吸顶遮罩回归（#100）：Bloom 的渐隐涂层必须对三方插件仍呈现为不透明遮罩。
// dshmarket 的 paintedCoverBottom 读 [data-plugin-bar]::before 的 computed
// background-color，透明即判定「无遮罩」并回退到静止高度 → 市场导航栏漂移。
import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: {
    contents: `import { GLASS_CSS } from './src/css/glass.ts'; window.GLASS_CSS = GLASS_CSS`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  },
  bundle: true, write: false, format: 'iife', platform: 'browser',
})

// 宿主插件页头的最小复刻：吸顶 bar + 绝对定位的不透明 ::before 涂层。
const HOST_FIXTURE = `
<style>
  :root { --dsw-alias-bg-base: rgb(30, 28, 32); }
  body { margin: 0; }
  [data-plugin-bar] { position: sticky; top: 0; height: 120px; }
  [data-plugin-bar]::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 72px;
    background: var(--dsw-alias-bg-base);
  }
</style>
<div data-plugin-bar></div>`

const TRANSPARENT = new Set(['transparent', 'rgba(0, 0, 0, 0)'])

test('[data-plugin-bar]::before keeps an opaque background-color and fades via mask (#100)', async t => {
  const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
  t.after(() => browser.close())
  const page = await browser.newPage()
  await page.setContent(HOST_FIXTURE)
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = window.GLASS_CSS
    document.head.append(style)
    document.body.dataset.bloomVariant = 'starlight'
  })

  for (const compact of [false, true]) {
    const cover = await page.evaluate(compact => {
      const bar = document.querySelector('[data-plugin-bar]')
      bar.toggleAttribute('data-compact', compact)
      const before = getComputedStyle(bar, '::before')
      return { color: before.backgroundColor, image: before.backgroundImage, mask: before.maskImage || before.webkitMaskImage }
    }, compact)
    const label = compact ? 'compact' : 'natural'
    assert.ok(!TRANSPARENT.has(cover.color), `${label}: background-color must stay opaque for cover detection, got ${cover.color}`)
    assert.equal(cover.image, 'none', `${label}: fade must not come from a background gradient`)
    assert.match(cover.mask, /linear-gradient/, `${label}: fade comes from mask-image`)
  }
})

// dshmarket 吸顶搜索区（#136）：复刻 market 1.73.20 自身的吸顶实底规则（特异性 0,3,0），
// 断言 Bloom 覆盖为半透明 + 毛玻璃，且同前缀的 _groupHead 等不被误伤。
const MARKET_FIXTURE = `
<style>
  :root { --dsw-alias-bg-base: rgb(30, 28, 32); }
  [data-dsh-market-plugins-tab=true]:not([data-dsh-market-fullscreen=true]) .m_head { position: sticky; background: var(--dsw-alias-bg-base, #fff); }
  [data-dsh-market-plugins-tab=true]:not([data-dsh-market-fullscreen=true]) .m_cats { position: sticky; background: var(--dsw-alias-bg-base, #fff); }
  .m_stickyHead { position: sticky; background: var(--dsw-alias-bg-base, #fff); }
  .m_groupHead { background: var(--dsw-alias-bg-base, #fff); }
</style>
<div data-dsh-market-root data-dsh-market-plugins-tab="true">
  <div class="m_head" id="head"></div>
  <div class="m_cats extra" id="cats"></div>
  <div class="m_stickyHead" id="sticky"></div>
  <div class="m_groupHead" id="group"></div>
</div>
<!-- 根属性之外：market 的实底规则照常生效，Bloom 覆盖不得越界 -->
<div data-dsh-market-plugins-tab="true">
  <div class="m_head" id="outside"></div>
</div>`

const alphaOf = color => {
  const m = color.match(/\/\s*([\d.]+)\)|rgba\([^)]*,\s*([\d.]+)\)/)
  return m ? Number(m[1] ?? m[2]) : 1
}

test('dshmarket sticky search head turns frosted glass, not a solid band (#136)', async t => {
  const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
  t.after(() => browser.close())
  const page = await browser.newPage()
  await page.setContent(MARKET_FIXTURE)
  await page.addScriptTag({ content: outputFiles[0].text })
  const styles = await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = window.GLASS_CSS
    document.head.append(style)
    document.body.dataset.bloomVariant = 'starlight'
    const read = id => {
      const cs = getComputedStyle(document.getElementById(id))
      return { bg: cs.backgroundColor, blur: cs.backdropFilter || cs.webkitBackdropFilter }
    }
    return Object.fromEntries(['head', 'cats', 'sticky', 'group', 'outside'].map(id => [id, read(id)]))
  })
  for (const id of ['head', 'cats', 'sticky']) {
    const alpha = alphaOf(styles[id].bg)
    assert.ok(alpha > 0 && alpha < 1, `${id}: background must be translucent, got ${styles[id].bg}`)
    assert.match(styles[id].blur, /blur\(/, `${id}: backdrop blur expected, got ${styles[id].blur}`)
  }
  for (const id of ['group', 'outside']) {
    assert.equal(alphaOf(styles[id].bg), 1, `${id}: must stay untouched, got ${styles[id].bg}`)
  }
})
