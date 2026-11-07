import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({ stdin: {
  contents: `import { SWITCHER_CSS } from './src/css/switcher.ts'; window.css = SWITCHER_CSS`,
  resolveDir: fileURLToPath(new URL('..', import.meta.url)),
}, bundle: true, write: false, format: 'iife', platform: 'browser' })

const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())

for (const dark of [false, true]) for (const english of [false, true]) for (const width of [360, 800]) {
  test(`footer and share panel: ${dark ? 'dark' : 'light'}, ${english ? 'English' : 'Chinese'}, ${width}px`, async t => {
    const context = await browser.newContext({ viewport: { width, height: 700 } })
    t.after(() => context.close())
    const page = await context.newPage()
    const labels = english ? ['Feedback', 'Star', 'Share', 'Copy install instructions', 'Share a screenshot', 'Save image', 'A longer explanatory hint wraps inside the panel'] : ['反馈', '点个星', '分享', '复制安装说明', '分享截图', '保存图片', '分享内容的说明文字']
    await page.setContent(`<body ${dark ? 'data-ds-dark-theme' : ''}><div class="dsh-bloom-switcher" data-slotted="true" style="left:8px;top:10px"><div class="dsh-bloom-menu" style="position:relative;top:0"><div style="height:220px"></div><div class="dsh-bloom-foot"><button class="dsh-bloom-more">Bloom v0.26.0</button><div class="dsh-bloom-foot__links"><button class="dsh-bloom-foot__link">${labels[0]}</button><button class="dsh-bloom-foot__link">${labels[1]}</button><div class="dsh-bloom-share-wrap"><button class="dsh-bloom-foot__link" id="share">${labels[2]}</button><div class="dsh-bloom-share-panel" hidden>${labels.slice(3, 6).map(s => `<button class="dsh-bloom-share-action"><span class="dsh-bloom-share-action__title">${s}</span><span class="dsh-bloom-share-action__hint">${labels[6]}</span></button>`).join('')}<div class="dsh-bloom-share-result" hidden><button>Copy</button><button>Save</button></div></div></div></div></div></div></div></body>`)
    await page.addScriptTag({ content: outputFiles[0].text })
    await page.evaluate(() => { const s = document.createElement('style'); s.textContent = window.css; document.head.append(s) })
    assert.equal(await page.locator('.dsh-bloom-share-panel').evaluate(e => getComputedStyle(e).display), 'none')
    await page.locator('.dsh-bloom-share-panel').evaluate(e => { e.hidden = false })
    const geometry = await page.evaluate(() => {
      const rect = el => { const r = el.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom } }
      return { menu: rect(document.querySelector('.dsh-bloom-menu')), foot: rect(document.querySelector('.dsh-bloom-foot')), panel: rect(document.querySelector('.dsh-bloom-share-panel')), links: [...document.querySelectorAll('.dsh-bloom-foot__link')].map(rect) }
    })
    assert.ok(geometry.panel.left >= geometry.menu.left && geometry.panel.right <= geometry.menu.right, JSON.stringify(geometry))
    assert.ok(geometry.panel.bottom <= geometry.foot.top, JSON.stringify(geometry))
    for (const link of geometry.links) assert.ok(link.left >= geometry.menu.left && link.right <= geometry.menu.right, JSON.stringify(geometry))
    await page.focus('#share')
    await page.keyboard.press('Tab')
    const focus = await page.evaluate(() => ({ cls: document.activeElement.className, outline: getComputedStyle(document.activeElement).outlineWidth }))
    assert.equal(focus.cls, 'dsh-bloom-share-action')
    assert.notEqual(focus.outline, '0px')
  })
}
