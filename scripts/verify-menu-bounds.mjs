import { chromium } from 'playwright'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

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
        const anchor = document.querySelector('[data-anchor]');
        if (anchor) anchor.appendChild(buildSwitcherEl('mist'));
      };`,
    resolveDir: ROOT,
  },
  bundle: true, write: false, format: 'iife',
})

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Users/webkubor/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell',
})

const HOST = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><style>
  :root{--dsw-alias-bg-layer-1:#1a1a1c;--dsw-alias-bg-layer-2:#242426;--dsw-alias-bg-base:#121214;
    --dsw-alias-label-primary:#ededed;--dsw-alias-label-secondary:#999;--dsw-alias-label-tertiary:#666;}
  body{margin:0;font-family:-apple-system,"Segoe UI",sans-serif;height:100vh;display:flex;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);}
  aside{width:280px;border-right:1px solid rgba(255,255,255,.06);padding:16px;box-sizing:border-box;}
  main{flex:1;display:flex;flex-direction:column;position:relative;}
  .sesshead{height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;}
  .flow{flex:1;padding:24px;}
  .bubble{padding:12px 16px;border-radius:12px;background:rgba(255,255,255,.04);display:inline-block;}
</style></head><body data-ds-dark-theme="true" data-bloom-variant="mist">
  <aside><div style="opacity:.6;font-size:13px">最近</div>
    <div style="margin-top:12px;font-size:13px">插件</div>
    <div style="font-size:13px">自动化任务</div>
    <div style="font-size:13px">ModelGo</div></aside>
  <main><div class="sesshead"><span style="display:flex;gap:8px;align-items:center"><span data-anchor></span><button>···</button></span>
    <span>会话标题</span></div>
    <div class="flow"><div class="bubble">你好！Bloom v0.28.0</div></div></main>
</body></html>`

const rows = []
for (const [w, h] of [[1280, 800], [1440, 900], [1024, 768], [1920, 1080]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.route('https://v.test/', r => r.fulfill({ contentType: 'text/html', body: HOST }))
  await page.goto('https://v.test/')
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => window.initDemo())
  await page.waitForTimeout(300)
  await page.locator('.dsh-bloom-trigger').click()
  await page.waitForTimeout(300)
  const m = await page.evaluate(() => {
    const el = document.querySelector('.dsh-bloom-menu')
    const r = el.getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight }
  })
  const ok = m.left >= 0 && m.right <= m.vw && m.top >= 0 && m.bottom <= m.vh
  rows.push({ viewport: `${w}x${h}`, ...m, pass: ok })
  await page.screenshot({ path: `/tmp/v028-check-${w}x${h}.png` })
  await page.close()
}

// resize 场景
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.route('https://v.test/', r => r.fulfill({ contentType: 'text/html', body: HOST }))
await page.goto('https://v.test/')
await page.addScriptTag({ content: outputFiles[0].text })
await page.evaluate(() => window.initDemo())
await page.waitForTimeout(300)
await page.locator('.dsh-bloom-trigger').click()
await page.waitForTimeout(200)
await page.setViewportSize({ width: 1024, height: 768 })
await page.waitForTimeout(300)
const rm = await page.evaluate(() => {
  const r = document.querySelector('.dsh-bloom-menu').getBoundingClientRect()
  return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, vw: innerWidth, vh: innerHeight }
})
rows.push({ viewport: 'resize 1280->1024', ...rm, pass: rm.left >= 0 && rm.right <= rm.vw && rm.top >= 0 && rm.bottom <= rm.vh })
await page.screenshot({ path: '/tmp/v028-check-resize.png' })
await page.close()

// 触发器在左端（share-ui 场景）+ 极窄视口：菜单不能从左边缘溢出
for (const [w, h, tag] of [[1000, 760, 'trigger-left'], [360, 600, 'narrow']]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } })
  await p.route('https://v.test/', r => r.fulfill({ contentType: 'text/html', body: HOST }))
  await p.goto('https://v.test/')
  await p.addScriptTag({ content: outputFiles[0].text })
  await p.evaluate(() => window.initDemo())
  await p.waitForTimeout(300)
  if (tag === 'trigger-left') {
    await p.evaluate(() => {
      const t = document.querySelector('.dsh-bloom-trigger')
      t.style.position = 'fixed'
      t.style.left = '80px'
      t.style.top = '40px'
    })
    await p.waitForTimeout(200)
  }
  await p.locator('.dsh-bloom-trigger').click()
  await p.waitForTimeout(400)
  const mm = await p.evaluate(() => {
    const r = document.querySelector('.dsh-bloom-menu').getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, vw: innerWidth, vh: innerHeight }
  })
  rows.push({ viewport: `${tag} ${w}x${h}`, ...mm, pass: mm.left >= 0 && mm.right <= mm.vw && mm.top >= 0 && mm.bottom <= mm.vh })
  await p.screenshot({ path: `/tmp/v028-check-${tag}.png` })
  await p.close()
}

fs.writeFileSync('/tmp/v028-check.json', JSON.stringify(rows, null, 2))
for (const r of rows) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.viewport.padEnd(18)} left=${r.left.toFixed(0)} right=${r.right.toFixed(0)} top=${r.top.toFixed(0)} bottom=${r.bottom.toFixed(0)}  viewport=${r.vw}x${r.vh}`)
}
await browser.close()
