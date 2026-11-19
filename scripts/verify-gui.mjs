/**
 * 真实 GUI 验收：对运行中的 DSH web GUI 核验
 *   1) Bloom 下拉已瘦身（无质感/背景/流星/自动换色/动效行）
 *   2) 设置侧栏出现「Bloom 外观」入口，且点进去有细节行
 *
 * 用法：node scripts/verify-gui.mjs <token-url>
 */
import { chromium } from 'playwright'

const OUT = process.env.BLOOM_OUT ?? '/Users/webkubor/dsh-deliveries/bloom-settings-migration'
const tokenUrl = process.argv[2]
if (!tokenUrl) { console.error('用法：node scripts/verify-gui.mjs <token-url>'); process.exit(1) }
const log = (m) => console.log('[verify]', m)

const browser = await chromium.launch({ headless: false, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)) })

await page.goto(tokenUrl, { waitUntil: 'domcontentloaded' })
log('已用 token 打开 GUI，等待插件装载…')
try {
  await page.waitForSelector('.dsh-bloom-trigger', { timeout: 240000 })
} catch {
  const s = page.locator('text=继续').first()
  if (await s.count()) await s.click().catch(() => {})
  await page.waitForSelector('.dsh-bloom-trigger', { timeout: 120000 })
}
log('Bloom 触发器已出现（插件装载完成）')
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUT}/10-gui-booted.png` })

// ── 1) 下拉瘦身 ──
await page.click('.dsh-bloom-trigger')
await page.waitForFunction(() => { const m = document.querySelector('.dsh-bloom-menu'); return m && !m.hidden }, null, { timeout: 15000 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/11-dropdown-slim.png` })
const menuAudit = await page.evaluate(() => {
  const m = document.querySelector('.dsh-bloom-menu')
  const q = (s) => m.querySelectorAll(s).length
  return {
    themeRows: q('.dsh-bloom-option'),
    modeSeg: q('.dsh-bloom-appearance'),
    hint: m.querySelector('.dsh-bloom-settings-hint')?.textContent?.trim() ?? null,
    movedOut: {
      glass: q('[data-glass]'), ambience: q('.dsh-bloom-ambience'),
      meteor: q('[data-meteor-row]'), rotation: q('.dsh-bloom-rotation__select'),
      motion: q('[data-motion]'),
    },
    kept: { more: q('.dsh-bloom-more'), foot: q('.dsh-bloom-foot') },
    menuHeight: Math.round(m.getBoundingClientRect().height),
  }
})
log('MENU AUDIT ' + JSON.stringify(menuAudit))
await page.keyboard.press('Escape')
await page.waitForTimeout(300)

// ── 2) 设置侧栏「Bloom 外观」 ──
// 设置入口：先试快捷键 Command+,（shortcuts 目录里 settings.open 的键位）
let navHas = false
const tryShortcut = async (keys) => {
  await page.evaluate(() => document.body.focus?.())
  await page.keyboard.press(keys)
  await page.waitForTimeout(1200)
  return page.evaluate(() => document.body.innerText.includes('Bloom 外观'))
}
for (const keys of ['Meta+,', 'Control+,', 'Meta+Shift+,']) {
  navHas = await tryShortcut(keys)
  if (navHas) { log('设置面板由快捷键打开: ' + keys); break }
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(300)
}
if (!navHas) {
const candidates = [
  '[aria-label*="设置"]', '[title*="设置"]', 'button[aria-label*="Setting"]',
  '[data-testid*="settings"]', '[data-dsh-slot*="settings"]',
]
for (const sel of candidates) {
  const loc = page.locator(sel)
  const n = await loc.count()
  for (let i = 0; i < n; i++) {
    const el = loc.nth(i)
    if (!(await el.isVisible().catch(() => false))) continue
    await el.click({ timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(1200)
    navHas = await page.evaluate(() => document.body.innerText.includes('Bloom 外观'))
    if (navHas) { log('设置入口命中: ' + sel + ' #' + i); break }
    // 没命中就把可能开出的面板关掉
    await page.keyboard.press('Escape').catch(() => {})
    await page.waitForTimeout(400)
  }
  if (navHas) break
}
}
if (!navHas) {
  // 兜底：把页面上可见的按钮/菜单项打出来，便于定位设置入口
  const sc = await page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('button,[role="button"],[role="menuitem"]')) {
      const t = (el.getAttribute('aria-label') || el.title || el.textContent || '').trim()
      if (t && t.length < 20) out.push(t)
    }
    return [...new Set(out)].slice(0, 60)
  })
  log('页面上可见的按钮/菜单项: ' + JSON.stringify(sc))
}
log('设置面板已打开，侧栏含「Bloom 外观」: ' + navHas)
await page.screenshot({ path: `${OUT}/12-settings-panel.png` })

if (navHas) {
  await page.getByText('Bloom 外观', { exact: true }).first().click()
  await page.waitForSelector('.dsh-bloom-detail', { timeout: 15000 })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/13-settings-bloom.png` })
  const detailAudit = await page.evaluate(() => {
    const d = document.querySelector('.dsh-bloom-detail')
    const q = (s) => d.querySelectorAll(s).length
    return {
      glass: q('[data-glass]'), ambience: q('.dsh-bloom-ambience'),
      meteorRows: q('[data-meteor-row]'), rotation: q('.dsh-bloom-rotation__select'),
      motion: q('[data-motion]'),
      sections: [...d.querySelectorAll('.dsh-bloom-section')].map((e) => e.textContent?.trim()),
    }
  })
  log('DETAIL AUDIT ' + JSON.stringify(detailAudit))
} else {
  // 侧栏没有：把当前设置面板的文字打出来，便于定位
  const nav = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('nav span, nav button, [class*="navLabel"], [class*="nav"]')]
      .map((e) => e.textContent?.trim()).filter(Boolean)
    return [...new Set(labels)].slice(0, 40)
  })
  log('设置侧栏可见项: ' + JSON.stringify(nav))
}
if (errors.length) log('页面错误: ' + JSON.stringify(errors.slice(0, 5)))
await browser.close()
log('done')
