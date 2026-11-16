import { chromium } from 'playwright'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const { outputFiles } = await build({
  stdin: {
    contents: `import './test/slot-fixture.mjs';
      import { buildSwitcherEl } from './src/switcher.ts';
      import { SWITCHER_CSS } from './src/css/switcher.ts';
      import { buildBloomCSS } from './src/tokens.ts';
      import { COMPONENT_CSS } from './src/css/component.ts';
      import { GLASS_CSS } from './src/css/glass.ts';
      import { BACKGROUND_CSS } from './src/css/background.ts';
      import { BUTTON_CSS } from './src/css/button.ts';
      window.initDemo = () => {
        const add = css => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
        add(buildBloomCSS()); add(COMPONENT_CSS);
        add(GLASS_CSS + BACKGROUND_CSS + BUTTON_CSS); add(SWITCHER_CSS);
        const a = document.querySelector('[data-anchor]'); if (a) a.appendChild(buildSwitcherEl('mist'));
      };`,
    resolveDir: ROOT,
  },
  bundle: true, write: false, format: 'iife',
})

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Users/webkubor/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell',
})
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  :root{--dsw-alias-bg-layer-1:#1a1a1c;--dsw-alias-bg-layer-2:#242426;--dsw-alias-bg-base:#121214;
    --dsw-alias-label-primary:#ededed;--dsw-alias-label-secondary:#999;--dsw-alias-label-tertiary:#666;}
  body{margin:0;font-family:-apple-system,"Segoe UI",sans-serif;height:100vh;display:flex;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);}
  aside{width:280px;border-right:1px solid rgba(255,255,255,.06);padding:16px;box-sizing:border-box;}
  main{flex:1;display:flex;flex-direction:column;position:relative;}
  .sesshead{height:48px;display:flex;align-items:center;justify-content:flex-end;padding:0 16px;}
</style></head><body data-ds-dark-theme="true" data-bloom-variant="mist">
  <aside><div style="font-size:13px">插件</div><div style="font-size:13px">自动化任务</div><div style="font-size:13px">ModelGo</div></aside>
  <main><div class="sesshead"><span data-anchor></span></div></main>
</body></html>`
await page.route('https://s.test/', r => r.fulfill({ contentType: 'text/html', body: html }))
await page.goto('https://s.test/')
await page.addScriptTag({ content: outputFiles[0].text })
await page.evaluate(() => window.initDemo())
await page.waitForTimeout(400)
await page.locator('.dsh-bloom-trigger').click()
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/bloom-15-flat.png' })

// 量化：内层列表是否还有滚动条、15 行是否都完整
const info = await page.evaluate(() => {
  const list = document.querySelector('.dsh-bloom-options')
  const menu = document.querySelector('.dsh-bloom-menu')
  const opts = [...list.querySelectorAll('.dsh-bloom-option')]
  const lr = list.getBoundingClientRect()
  const visible = opts.filter(o => {
    const r = o.getBoundingClientRect()
    return r.top >= lr.top - 1 && r.bottom <= lr.bottom + 1
  }).length
  return {
    listScrollable: list.scrollHeight > list.clientHeight + 1,
    listScrollH: list.scrollHeight, listClientH: list.clientHeight,
    menuScrollable: menu.scrollHeight > menu.clientHeight + 1,
    totalOptions: opts.length,
    fullyVisibleRows: visible,
    optionH: +opts[0].getBoundingClientRect().height.toFixed(2),
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
