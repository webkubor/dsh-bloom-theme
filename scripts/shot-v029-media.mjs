/**
 * v0.29.0 本版媒体采集：无需运行宿主，直接用 slot-fixture 渲染真实插件 UI。
 * 产物：assets/showcase/v0.29.0/bloom-preview-v0.29.0.png
 * 内容：设置页新「Bloom 外观」组 + 15 色面板 + 主题色联动（v0.29.0 的三大特性）。
 */
import { chromium } from 'playwright'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CHROME = process.env.BLOOM_CHROMIUM_PATH
  || '/Users/webkubor/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'

const { outputFiles } = await build({
  stdin: {
    contents: `import './test/slot-fixture.mjs';
      import { makeLocale } from './test/fixtures/locale.mjs';
      import { buildSwitcherEl } from './src/switcher.ts';
      import { SWITCHER_CSS } from './src/css/switcher.ts';
      import { buildBloomCSS } from './src/tokens.ts';
      import { COMPONENT_CSS } from './src/css/component.ts';
      import { GLASS_CSS } from './src/css/glass.ts';
      import { BACKGROUND_CSS } from './src/css/background.ts';
      import { BUTTON_CSS } from './src/css/button.ts';
      import { bindLocale, DICTS, LOCALE_NS } from './src/lang.ts';
      window.initDemo = (active) => {
        const add = css => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
        add(buildBloomCSS('mist', true)); add(COMPONENT_CSS);
        add(GLASS_CSS + BACKGROUND_CSS + BUTTON_CSS); add(SWITCHER_CSS);
        const loc = makeLocale(active); loc.register(LOCALE_NS, DICTS); bindLocale(loc);
        document.querySelector('[data-anchor]').appendChild(buildSwitcherEl('mist'));
      };`,
    resolveDir: ROOT,
  },
  bundle: true, write: false, format: 'iife',
})

const browser = await chromium.launch({ headless: true, executablePath: CHROME })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  :root{--dsw-alias-bg-layer-1:#1a1a1c;--dsw-alias-bg-layer-2:#242426;--dsw-alias-bg-base:#121214;
    --dsw-alias-label-primary:#ededed;--dsw-alias-label-secondary:#999;--dsw-alias-label-tertiary:#666;}
  body{margin:0;font-family:-apple-system,"Segoe UI",sans-serif;height:100vh;display:flex;background:#121214;color:#ededed;overflow:hidden}
  aside{width:260px;border-right:1px solid rgba(255,255,255,.06);padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px}
  aside .row{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;color:#999;font-size:13px}
  aside .row.on{background:rgba(107,143,113,.15);color:#cfe0d2}
  main{flex:1;display:flex;flex-direction:column;position:relative}
  .sesshead{height:52px;display:flex;align-items:center;justify-content:flex-end;padding:0 16px}
  .bubble{margin:8px 24px;padding:14px 16px;border-radius:14px;background:#242426;color:#d8d8d8;font-size:14px;max-width:70%}
</style></head><body data-ds-dark-theme="true" data-bloom-variant="mist">
  <aside>
    <div class="row">会话</div><div class="row on">插件的会话</div><div class="row">自动化任务</div>
    <div class="row">bloom 发版</div><div class="row">ego-lite</div>
  </aside>
  <main><div class="sesshead"><span data-anchor></span></div>
    <div class="bubble">v0.29.0 设置页加了「Bloom 外观」组与导航图标…</div>
    <div class="bubble">主题色联动也做好了，跟随系统实时切换。</div>
  </main>
</body></html>`
await page.route('https://s.test/', r => r.fulfill({ contentType: 'text/html', body: html }))
await page.goto('https://s.test/')
await page.addScriptTag({ content: outputFiles[0].text })
await page.evaluate(() => window.initDemo('zh'))
await page.waitForTimeout(500)
await page.locator('.dsh-bloom-trigger').click()
await page.waitForTimeout(600)

const out = new URL('../assets/showcase/v0.29.0/', import.meta.url).pathname
mkdirSync(out, { recursive: true })
await page.screenshot({ path: `${out}/bloom-preview-v0.29.0.png` })
console.log(`已存 ${out}/bloom-preview-v0.29.0.png`)
await browser.close()
