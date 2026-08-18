#!/usr/bin/env node
/**
 * dsh-bloom-theme 本地开发快捷方式。
 *
 * 用法：npm run dev
 *
 * - 启动时先部署一次，然后监听 lib/ 与 package.json，
 *   每次保存改动自动 rsync 部署到 web profile（零依赖，Node fs.watch）。
 * - 交互键：
 *     r  用 AppleScript 刷新默认浏览器当前标签页（Chrome → Safari → Arc 依次尝试）
 *     o  用系统 open 打开 GUI 页面
 *     q  退出
 *
 * 注意：皮肤是浏览器端注入的，部署完必须刷新页面才生效 —— 按 r 即可。
 */
import { watch } from 'node:fs'
import { execSync, exec } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEST = resolve(process.env.HOME, '.dsh/profiles/web/node_modules/@webkubor/dsh-bloom-theme')
const GUI_URL = process.env.DSH_BLOOM_GUI_URL ?? 'http://127.0.0.1:3080'

let deploying = false
let pending = false
// 保存即自动刷新浏览器。皮肤是浏览器端注入的，且 CSS 由 client.js 运行时生成 ——
// 换句话说没有"只热更 CSS"这条路，必须重新执行脚本，也就必须刷新页面。
// 设 DSH_BLOOM_NO_AUTORELOAD=1 可关掉，改回手动按 r。
let autoReload = process.env.DSH_BLOOM_NO_AUTORELOAD !== '1'

function deploy({ reload = true } = {}) {
  if (deploying) { pending = true; return }
  deploying = true
  try {
    execSync(
      `rsync -av --delete lib/ "${DEST}/lib/" && rsync -av package.json "${DEST}/"`,
      { cwd: root, stdio: 'pipe' },
    )
    const t = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    if (reload && autoReload) {
      console.log(`\n[${t}] ✅ 已部署 —— 自动刷新中…`)
      refreshBrowser()
    } else {
      console.log(`\n[${t}] ✅ 已部署到 web profile —— 按 r 刷新浏览器（或手动 Cmd+R）`)
    }
  } catch (e) {
    console.error('❌ 部署失败：', e.message)
  } finally {
    deploying = false
    if (pending) { pending = false; deploy() }
  }
}

const debouncedDeploy = (() => {
  let t
  return () => { clearTimeout(t); t = setTimeout(deploy, 200) }
})()

/** 刷新浏览器当前标签页（依次尝试 Chrome / Safari / Arc，命中即停） */
function refreshBrowser() {
  const scripts = [
    `tell application "Google Chrome" to reload active tab of front window`,
    `tell application "Safari" to set URL of front document to (URL of front document)`,
    `tell application "Arc" to tell front window to reload active tab`,
  ]
  let tried = 0
  const next = () => {
    if (tried >= scripts.length) {
      console.log('⚠️  没找到 Chrome / Safari / Arc，手动刷新页面吧（Cmd+R）')
      return
    }
    const s = scripts[tried++]
    exec(`osascript -e ${JSON.stringify(s)}`, (err) => {
      if (err) next()
      else console.log(`🔄 已刷新浏览器（${['Chrome', 'Safari', 'Arc'][tried - 1]}）`)
    })
  }
  next()
}

// 启动：先部署一次（不刷新，此时页面可能还没开）
console.log('👀 dsh-bloom-theme 开发模式')
console.log(`   监听: lib/ + package.json   目标: ${DEST}`)
console.log(`   自动刷新: ${autoReload ? '开（保存即刷新）' : '关（按 r 手动刷新）'}`)
console.log(`   按 r 刷新 | 按 a 切换自动刷新 | 按 o 打开页面 | 按 q 退出\n`)
deploy({ reload: false })

// 监听源码变化
watch(resolve(root, 'lib'), { persistent: true }, debouncedDeploy)
watch(resolve(root, 'package.json'), { persistent: true }, debouncedDeploy)

// 交互键
readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) process.stdin.setRawMode(true)
process.stdin.on('keypress', (_str, key) => {
  if (key.name === 'r') refreshBrowser()
  else if (key.name === 'a') {
    autoReload = !autoReload
    console.log(`🔁 自动刷新已${autoReload ? '开启' : '关闭'}`)
  }
  else if (key.name === 'o') exec(`open ${GUI_URL}`)
  else if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
    console.log('\n👋 已退出')
    process.exit(0)
  }
})
