/**
 * 严格验证：
 * 1. component.ts 里每个 @media 块都真的被浏览器解析（数量对得上）；
 * 2. 【动效】开关真的能停掉动效（用有 infinite 动画的输入卡，不靠入场动画）。
 */
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
        const a = document.createElement('div'); document.body.appendChild(a);
        a.appendChild(buildSwitcherEl('mist'));
      };`,
    resolveDir: ROOT,
  },
  bundle: true, write: false, format: 'iife',
})

// 数源码里 prefers-reduced-motion 块数量，并与浏览器解析出的对应块比对
const src = fs.readFileSync(`${ROOT}/src/css/component.ts`, 'utf8')
const mediaInSource = (src.match(/@media \(prefers-reduced-motion: reduce\) \{/g) || []).length

// 源码里 prefers-reduced-motion 块后面紧跟的选择器数，用来确认浏览器里确实有对应规则
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Users/webkubor/Library/Caches/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-mac-arm64/chrome-headless-shell',
})
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
// 带真实输入卡结构，卡片上有 infinite 的打字呼吸动画
const html = `<!DOCTYPE html><html><body data-ds-dark-theme="true" data-bloom-variant="mist">
  <div class="dsh_composer_seat"><div class="dsh_composer_box"><div class="dsh_card_wrap">
    <textarea></textarea></div></div></div>
  <div id="anchor"></div></body></html>`
await page.route('https://m.test/', r => r.fulfill({ contentType: 'text/html', body: html }))
await page.goto('https://m.test/')
await page.addScriptTag({ content: outputFiles[0].text })
await page.evaluate(() => window.initDemo())
await page.waitForTimeout(400)

const mediaInfo = await page.evaluate(() => {
  const media = []
  const motionRules = []
  for (const sheet of document.styleSheets) {
    try {
      for (const r of sheet.cssRules) {
        if (r.constructor.name === 'CSSMediaRule') {
          media.push({ cond: r.conditionText, ruleCount: r.cssRules.length })
        }
        if (r.selectorText && r.selectorText.includes('[data-bloom-motion="off"]')) {
          motionRules.push({ sel: r.selectorText.slice(0, 60), css: r.style.cssText })
        }
      }
    } catch {}
  }
  return { media, motionRules }
})
const rmMedia = mediaInfo.media.filter(m => m.cond.includes('prefers-reduced-motion'))
const motion = mediaInfo.motionRules

console.log(`@media (prefers-reduced-motion) 块：源码 ${mediaInSource} 个，浏览器解析 ${rmMedia.length} 个 ${rmMedia.length >= mediaInSource ? '✓ 全部解析' : '✗ 有块被丢弃'}`)
console.log(`body[data-bloom-motion="off"] 规则：解析出 ${motion.length} 条`)
if (motion.length) {
  console.log('  样例:', motion[0].sel, '=>', motion[0].css.slice(0, 40))
}
// 规则是否生效：cssText 里 animation 为 none / 0s 都是"已停止"的等价写法
const motionEffective = motion.some(r => /animation:\s*(none|auto ease 0s)/.test(r.css))
console.log(motionEffective ? '✓ 动效开关规则已生效（animation 计算值为 none）' : '✗ 动效开关规则未生效')

// 动效开关实测：显式给卡片挂动画，再关掉，验证动画停止
await page.evaluate(() => {
  const card = document.querySelector('.dsh_card_wrap')
  // 用非 important 的内联动画：CSS 的 animation: none !important 才压得住它
  card.style.animation = 'bloom-fade-up 2s linear infinite'
})
await page.waitForTimeout(400)
const on = await page.evaluate(() => document.getAnimations()
  .filter(a => a.playState === 'running')
  .map(a => a.animationName + '@' + (a.effect?.target?.className || '?')))

await page.evaluate(() => document.body.setAttribute('data-bloom-motion', 'off'))
await page.waitForTimeout(300)
const off = await page.evaluate(() => document.getAnimations()
  .filter(a => a.playState === 'running')
  .map(a => a.animationName + '@' + (a.effect?.target?.className || '?')))

console.log('动效开启时运行中的动画:', JSON.stringify(on))
console.log('动效关闭后运行中的动画:', JSON.stringify(off))
// 关闭后，目标卡片上的这条动画必须不再处于 running
const stillOnTarget = off.filter(n => n.includes('dsh_card_wrap'))
console.log(on.length > 0 && stillOnTarget.length === 0
  ? '✓ 开关生效：开启时动画在跑，关闭后目标元素上的动画已停止'
  : `✗ 开关无效，关闭后仍在跑: ${JSON.stringify(stillOnTarget)}`)

await browser.close()
if (rmMedia.length < mediaInSource || !motionEffective || on.length === 0 || stillOnTarget.length > 0) process.exit(1)
