/**
 * 面板验收：中英双语言 × 深浅两套，量测「动效」行与「自动换色」行的协调性，
 * 并确认新加的词条在中文界面下正确显示。
 *
 * 语言走真实路径：注入 DSH locale 服务替身 → 插件 apply(ctx) → bindLocale。
 * （不注入 locale 会回落英文，那样验证的就不是用户看到的界面。）
 */
import { chromium } from 'playwright'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
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
        add(buildBloomCSS()); add(COMPONENT_CSS);
        add(GLASS_CSS + BACKGROUND_CSS + BUTTON_CSS); add(SWITCHER_CSS);
        // 走真实路径：先 register 词条表，再 bind —— 少了 register，
        // locale.bind() 会原样返回中文 key，英文界面就验不到真译文。
        const locale = makeLocale(active)
        locale.register(LOCALE_NS, DICTS)
        bindLocale(locale)
        const a = document.querySelector('[data-anchor]');
        if (a) a.appendChild(buildSwitcherEl('mist'));
      };`,
    resolveDir: ROOT,
  },
  bundle: true, write: false, format: 'iife',
})

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Users/webkubor/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell',
})

const HOST = (dark) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  :root{--dsw-alias-bg-layer-1:#1a1a1c;--dsw-alias-bg-layer-2:#242426;--dsw-alias-bg-base:#121214;
    --dsw-alias-label-primary:#ededed;--dsw-alias-label-secondary:#999;--dsw-alias-label-tertiary:#666;}
  body{margin:0;font-family:-apple-system,"Segoe UI",sans-serif;height:100vh;display:flex;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);}
  main{flex:1;display:flex;flex-direction:column;position:relative;}
  .sesshead{height:48px;display:flex;align-items:center;justify-content:flex-end;padding:0 16px;}
</style></head><body ${dark ? 'data-ds-dark-theme="true"' : ''} data-bloom-variant="mist">
  <main><div class="sesshead"><span data-anchor></span></div></main>
</body></html>`

const rows = []
for (const lang of ['zh', 'en']) {
  for (const dark of [true, false]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
    await page.route('https://s.test/', r => r.fulfill({ contentType: 'text/html', body: HOST(dark) }))
    await page.goto('https://s.test/')
    await page.addScriptTag({ content: outputFiles[0].text })
    await page.evaluate(l => window.initDemo(l), lang)
    await page.waitForTimeout(400)
    await page.locator('.dsh-bloom-trigger').click()
    await page.waitForTimeout(400)
    await page.evaluate(() => {
      const m = document.querySelector('.dsh-bloom-menu')
      if (m) m.scrollTop = m.scrollHeight
    })
    await page.waitForTimeout(250)
    const tag = `${lang}-${dark ? 'dark' : 'light'}`
    await page.screenshot({ path: `/tmp/bloom-panel-${tag}.png` })

    const m = await page.evaluate(() => {
      const q = s => document.querySelector(s)
      const rect = el => el.getBoundingClientRect()
      const rotRows = [...document.querySelectorAll('.dsh-bloom-rotation, .dsh-bloom-motion-row')]
      const autoRow = rotRows.find(r => r.querySelector('select'))
      const motionRow = q('.dsh-bloom-motion-row')
      const sel = q('.dsh-bloom-rotation__select')
      const seg = q('.dsh-bloom-motion-seg')
      const label = q('.dsh-bloom-rotation__label')
      const ar = rect(autoRow), mr = rect(motionRow), sr = rect(sel), gr = rect(seg), lr = rect(label)
      return {
        autoLabel: autoRow.textContent.trim().replace(/\s+/g, ' '),
        motionLabel: motionRow.textContent.trim().replace(/\s+/g, ' '),
        rowHeightDelta: +(ar.height - mr.height).toFixed(2),
        controlHeightDelta: +(sr.height - gr.height).toFixed(2),
        labelSingleLine: lr.height <= 24,
        leftAligned: Math.abs(ar.left - mr.left) < 1,
        rightAligned: Math.abs(ar.right - mr.right) < 1,
        optionRows: document.querySelectorAll('.dsh-bloom-option').length,
      }
    })
    rows.push({ tag, ...m })
    await page.close()
  }
}

let bad = 0
for (const r of rows) {
  const ok = r.labelSingleLine && Math.abs(r.rowHeightDelta) <= 1 &&
    Math.abs(r.controlHeightDelta) <= 4 && r.leftAligned && r.rightAligned
  if (!ok) bad++
  console.log(`${ok ? '✅' : '❌'} ${r.tag.padEnd(11)} 行高差=${r.rowHeightDelta} 控件高差=${r.controlHeightDelta} label单行=${r.labelSingleLine} 左右对齐=${r.leftAligned && r.rightAligned} 配色行=${r.optionRows}`)
  console.log(`     自动换色行: "${r.autoLabel}"   动效行: "${r.motionLabel}"`)
}
await browser.close()
if (bad) { console.log(`\n${bad} 套未达标`); process.exit(1) }
console.log('\n✅ 中英 × 深浅 4 套全部协调')
