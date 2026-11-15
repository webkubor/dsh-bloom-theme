/**
 * 面板观感回归：把当前版本与 v0.27.0 基线在同一环境下逐项量测。
 * 目的：客观回答"这次改动有没有改掉面板观感"，不靠肉眼。
 *
 * 用法：在仓库根运行 node scripts/panel-visual-regression.mjs
 * 产物：/tmp/panel-regression.json
 */
import { chromium } from 'playwright'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { execSync } from 'node:child_process'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CHROME = '/Users/webkubor/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell'

/** 把某一版源码打包成可注入的脚本。ref 为空表示用当前工作区。 */
async function bundleAt(ref) {
  const dir = fs.mkdtempSync('/tmp/panel-reg-')
  if (ref) {
    execSync(`git -C ${ROOT} archive ${ref} src test | tar -x -C ${dir}`, { stdio: 'pipe' })
  } else {
    execSync(`cp -R ${ROOT}/src ${ROOT}/test ${dir}/`, { stdio: 'pipe' })
  }
  // 临时目录里没有 node_modules，react 解析不到 —— 软链一份过去
  try { fs.symlinkSync(`${ROOT}/node_modules`, `${dir}/node_modules`, 'dir') } catch {}
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
      resolveDir: dir,
    },
    bundle: true, write: false, format: 'iife',
  })
  return outputFiles[0].text
}

const HOST = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><style>
  :root{--dsw-alias-bg-layer-1:#1a1a1c;--dsw-alias-bg-layer-2:#242426;--dsw-alias-bg-base:#121214;
    --dsw-alias-label-primary:#ededed;--dsw-alias-label-secondary:#999;--dsw-alias-label-tertiary:#666;}
  body{margin:0;font-family:-apple-system,"Segoe UI",sans-serif;height:100vh;display:flex;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);}
  aside{width:280px;border-right:1px solid rgba(255,255,255,.06);padding:16px;box-sizing:border-box;}
  main{flex:1;display:flex;flex-direction:column;position:relative;}
  .sesshead{height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;}
</style></head><body data-ds-dark-theme="true" data-bloom-variant="mist">
  <aside><div style="font-size:13px">插件</div><div style="font-size:13px">自动化任务</div></aside>
  <main><div class="sesshead"><span>会话标题</span><span data-anchor></span></div></main>
</body></html>`

async function measure(code, tag) {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.route('https://r.test/', r => r.fulfill({ contentType: 'text/html', body: HOST }))
  await page.goto('https://r.test/')
  await page.addScriptTag({ content: code })
  await page.evaluate(() => window.initDemo())
  await page.waitForTimeout(400)
  const trig = page.locator('.dsh-bloom-trigger')
  const t = await trig.evaluate(el => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
    return { w: r.width, h: r.height, radius: cs.borderRadius, pad: cs.padding, nameVisible: !!el.querySelector('.dsh-bloom-trigger__name')?.offsetParent, chevronVisible: !!el.querySelector('.dsh-bloom-chevron')?.offsetParent }
  })
  await trig.click()
  await page.waitForTimeout(400)
  const m = await page.evaluate(() => {
    const menu = document.querySelector('.dsh-bloom-menu')
    const r = menu.getBoundingClientRect(); const cs = getComputedStyle(menu)
    const opt = menu.querySelector('.dsh-bloom-option')
    const or_ = opt.getBoundingClientRect(); const ocs = getComputedStyle(opt)
    const sections = [...menu.querySelectorAll('.dsh-bloom-section')].map(s => s.textContent.trim())
    return {
      menuW: +r.width.toFixed(2), menuH: +r.height.toFixed(2), radius: cs.borderRadius,
      padding: cs.padding, bg: cs.backgroundColor,
      optionH: +or_.height.toFixed(2), optionW: +or_.width.toFixed(2),
      optionRows: menu.querySelectorAll('.dsh-bloom-option').length,
      sections,
      inViewport: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight,
    }
  })
  await page.screenshot({ path: `/tmp/panel-reg-${tag}.png` })
  await browser.close()
  return { trigger: t, menu: m }
}

const base = await measure(await bundleAt('777e0d5'), 'v027')
const cur = await measure(await bundleAt(null), 'current')
fs.writeFileSync('/tmp/panel-regression.json', JSON.stringify({ base, cur }, null, 2))

const fmt = o => JSON.stringify(o, null, 2)
console.log('=== v0.27.0 基线 ===\n' + fmt(base))
console.log('=== 当前版本 ===\n' + fmt(cur))
console.log('\n=== 差异 ===')
const d = (k, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) console.log(`  ${k}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`) }
d('触发器尺寸', base.trigger, cur.trigger)
d('菜单几何/样式', base.menu, cur.menu)
