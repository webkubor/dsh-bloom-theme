/**
 * v0.30.0 本版媒体采集：在**隔离的 DSH Web** 实例里录制真实插件 UI。
 *
 * 与 shot-v029-media.mjs（slot-fixture 路线）的区别：那份不跑宿主，渲染的是
 * 组件夹具；这份跑的是真宿主 —— 真设置面板、真插件注入、真版本号。
 *
 * 前置条件（都在仓库之外，只读本机）：
 *   1. 隔离的 DSH_HOME（不含任何真实会话/工作区）+ 隔离 profile；
 *   2. profile 里装的是本版候选 tarball（`dsh plugin --profile <p> add <tgz>`）；
 *   3. `dsh --profile <p> --no-open --port 0 --host 127.0.0.1` 打印出带 token 的 URL。
 *
 * 用法：
 *   BLOOM_WEB_URL='http://127.0.0.1:<port>/?token=...' node scripts/shot-v030-media.mjs
 *
 * 产物：
 *   assets/showcase/v0.30.0/bloom-preview-v0.30.0.png   设置 › Bloom 外观全貌
 *   assets/showcase/v0.30.0/bloom-demo-v0.30.0.mp4     同一界面的实机操作录像
 *
 * 隐私：截图/录像前一律注入 scripts/redact-for-shot.js（它是闸门，漏网就抛错），
 * 画面里不得出现真实项目名、会话标题、路径或凭据。
 *
 * 宿主界面语言会随 profile 记住（中/英皆可），所以所有定位都用**双语**选择器，
 * 不假设上一次跑的时候界面是什么语言。
 */
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const WEB_URL = process.env.BLOOM_WEB_URL
if (!WEB_URL) throw new Error('BLOOM_WEB_URL is required (the authenticated URL printed by `dsh web`)')

const CHROME = process.env.BLOOM_CHROMIUM_PATH
  || '/Users/webkubor/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'

const OUT_DIR = `${ROOT}assets/showcase/v0.30.0`
const VIDEO_TMP = `${ROOT}.bloom-media-video-tmp`
const REDACT_SRC = readFileSync(`${ROOT}scripts/redact-for-shot.js`, 'utf8')

mkdirSync(OUT_DIR, { recursive: true })
rmSync(VIDEO_TMP, { recursive: true, force: true })

const browser = await chromium.launch({ headless: true, executablePath: CHROME })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: VIDEO_TMP, size: { width: 1440, height: 900 } },
})
const page = await context.newPage()

const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)))

/** 点第一个存在的双语选择器；都没有就返回 false。 */
async function clickAny(names) {
  for (const name of names) {
    const loc = page.getByRole('button', { name, exact: true })
    if (await loc.count()) {
      await loc.first().click()
      return true
    }
  }
  return false
}

/** 等到某个选择器出现。 */
async function waitFor(selector, ms = 20000) {
  await page.waitForSelector(selector, { timeout: ms })
}

/** 关掉宿主首次启动的预览提示条。 */
async function dismissPreviewNotice() {
  await clickAny(['Continue', '继续'])
  await page.waitForTimeout(1200)
}

/** 打开 设置（宿主全局设置面板）。 */
async function openHostSettings() {
  await clickAny(['Account menu', '账号菜单', '账户菜单'])
  await page.waitForTimeout(800)
  const item = page.getByRole('menuitem', { name: /^(Settings|设置)/ })
  await item.first().click()
  await page.waitForTimeout(2000)
}

/** 把界面语言切成中文，与既有展示图保持一致。 */
async function switchToChinese() {
  const langBtn = page.getByRole('button', { name: 'English', exact: true })
  if (!(await langBtn.count())) return 'already-zh'
  await langBtn.click()
  await page.waitForTimeout(800)
  const zh = page.getByRole('menuitem', { name: '中文' })
  if (!(await zh.count())) return 'no-zh-option'
  await zh.click()
  await page.waitForTimeout(1800)
  return 'switched'
}

/**
 * 打开设置面板里的 Bloom 分区。
 *
 * 宿主设置是一个 modal：打开之后它会盖住整个页面（遮罩层拦截点击），
 * 所以「开设置」和「切语言」必须共用**同一个** modal 实例 ——
 * 先开着设置切语言，再在同一个 modal 里点 Bloom 导航项。
 */
async function openBloomSettings() {
  await page.getByRole('button', { name: 'Bloom', exact: true }).click()
  await waitFor('.dsh-bloom-about__ver')
}

/** 注入脱敏脚本。它是闸门：页面里还有真名就直接抛错，不给截图机会。 */
async function redact() {
  return page.evaluate(REDACT_SRC)
}

/** 断言画面里渲染出来的就是本版版本号。 */
async function assertVersion() {
  const ver = await page.locator('.dsh-bloom-about__ver').first().innerText()
  if (!/0\.30\.0/.test(ver)) throw new Error(`expected Bloom v0.30.0 in the host, got ${ver}`)
  return ver.trim()
}

await page.goto(WEB_URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(5000)
await dismissPreviewNotice()

// 语言先定下来，后面的定位就稳定了。
await openHostSettings()
console.log('界面语言:', await switchToChinese())

// —— 开始录像：设置面板打开前一刻录起，覆盖真实操作全过程 ——

// 打开 设置 › Bloom 外观（设置 modal 此时已经开着）
await openBloomSettings()
const version = await assertVersion()
console.log(`宿主内 Bloom 版本: ${version}`)

// 脱敏（录像前，闸门）
console.log('脱敏结果:', JSON.stringify(await redact()))
await page.waitForTimeout(1500)

// —— 展示图：设置 › Bloom 外观全貌 ——
await page.screenshot({ path: `${OUT_DIR}/bloom-preview-v0.30.0.png` })
console.log(`已存 ${OUT_DIR}/bloom-preview-v0.30.0.png`)

// —— 演示视频：走一遍真实交互 ——
// 1) 切到深色外观（外观开关在宿主「通用设置」分区里）
await clickAny(['General', '通用设置'])
await page.waitForTimeout(1200)
await clickAny(['Dark', '深色'])
await page.waitForTimeout(2000)
await redact()
await page.waitForTimeout(1500)

// 2) 回到 Bloom 分区，深色下的 Bloom 外观全貌
await page.getByRole('button', { name: 'Bloom', exact: true }).click()
await waitFor('.dsh-bloom-about__ver')
await redact()
await page.waitForTimeout(1500)

// 3) 关闭设置，回到会话视图
if (!(await clickAny(['Close', '关闭']))) {
  await page.keyboard.press('Escape')
}
await page.waitForTimeout(2000)
await redact()
await page.waitForTimeout(2000)

if (pageErrors.length) throw new Error(`host page errors: ${pageErrors.join(' | ')}`)

await context.close()
await browser.close()

// Playwright 录的是 webm，转成 h264 mp4（门禁要可播放的 mp4）。
const raw = readdirSync(VIDEO_TMP).find((f) => f.endsWith('.webm'))
if (!raw) throw new Error(`no video produced in ${VIDEO_TMP}`)
const mp4 = `${OUT_DIR}/bloom-demo-v0.30.0.mp4`
execFileSync('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-i', `${VIDEO_TMP}/${raw}`,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', '23',
  '-r', '12',
  mp4,
])
rmSync(VIDEO_TMP, { recursive: true, force: true })
console.log(`已存 ${mp4}`)
