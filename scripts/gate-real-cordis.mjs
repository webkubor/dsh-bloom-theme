/**
 * 等价门禁（无桌面端 asar 时的替代）：用宿主同版本真 cordis 内核在 Chromium 里
 * 实跑 Bloom 产物 apply，并模拟 shell 渲染导航时对 label 的求值。
 *
 * 为什么需要它（2026-11-19 实测事故）：
 *   settings.section 的 label 闭包里读了 ctx.locale，而本模块
 *   exports.inject = ['slots']（locale 是可选依赖）。cordis 的 ctx 是 Proxy，
 *   读未声明的服务直接抛 "cannot get property 'locale' without inject"，
 *   shell 渲染导航时整条设置项就消失 —— 而单测替身比宿主宽松，一直是绿的。
 *   本脚本在真 cordis 下跑 apply 并求值 label，确保回归立刻炸出来。
 *
 * 与 ../scripts/dsh-dev.mjs 第 3 项同源同法（真 Context + Service 子类注入 +
 * root.plugin({inject, apply}) + fiber 状态判定），差别只是宿主源码来源：
 *   dsh-dev.mjs 从桌面端 app.asar 取 cordis；本脚本从 npm 装的
 *   @deepseek-ai/dsh 的 node_modules 取同版本 cordis。
 *
 * 用法：node scripts/gate-real-cordis.mjs
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { build } from 'esbuild'
import { chromium } from 'playwright'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))

const DSH_ROOT = process.env.DSH_ROOT
  ?? join(process.env.HOME ?? '', '.local/share/mise/installs/node/24.15.0/lib/node_modules/@deepseek-ai/dsh')
const cordisDir = join(DSH_ROOT, 'node_modules/@deepseek-ai/cordis')
if (!existsSync(join(cordisDir, 'lib/index.js'))) {
  console.error(`✘ 找不到宿主 cordis 内核：${cordisDir}（用 DSH_ROOT 指定）`)
  process.exit(1)
}
const cordisVersion = JSON.parse(readFileSync(join(cordisDir, 'package.json'), 'utf8')).version
console.log(`✔ 宿主 cordis 内核 ${cordisVersion}：${cordisDir}`)

// 宿主提供的服务名（来自宿主 package.json 的 dsh.client.inject + 常用别名）。
// 门禁用同一份清单；这里覆盖 Bloom 声明与常用项即可。
const allServiceNames = [
  'slots', 'locale', 'theme', 'layout', 'sessions', 'remote', 'remote.pluginManager',
  'remote.agentPresets', 'remote.settings', 'configForms', 'effects', 'logger',
]

// ── 把真 cordis 打成浏览器 IIFE ────────────────────────────────────────────
// 直接以绝对路径 import 宿主 cordis 入口，避免 node_modules 解析歧义。
const kernel = (await build({
  stdin: {
    contents: `import { Context, Service } from ${JSON.stringify(join(cordisDir, 'lib/index.js'))}\nwindow.__cordis = { Context, Service }\n`,
    resolveDir: root,
    loader: 'js',
  },
  bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022', logLevel: 'silent',
})).outputFiles[0].text

const src = readFileSync(join(root, 'lib/client.js'), 'utf8')
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage()
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  await page.setContent('<!doctype html><html><head></head><body><div id="root"></div></body></html>')
  // apply() 开头有 `if (typeof document === 'undefined') return` ——
  // 校验环境必须真有 DOM，否则 apply 静默早退，槽位一个都不注册。
  await page.addScriptTag({ content: kernel })
  const r = await page.evaluate(async ({ src, allServiceNames }) => {
    const { Context, Service } = window.__cordis
    let mod, id, loadError = null
    const registered = []
    window.__ModuleLoader__ = {
      load: (spec) => {
        id = spec.id
        try {
          mod = spec.factory(() => new Proxy({}, { get: (_, k) => (k === '__esModule' ? false : () => null) }))
        } catch (e) { loadError = e.message }
      },
    }
    try { (0, eval)(src) } catch (e) { return { evalError: e.message } }
    if (loadError) return { loadError }
    if (!mod || typeof mod.apply !== 'function') return { id, noApply: true }

    const stub = () => new Proxy(function () {}, {
      get: (_, k) => (k === Symbol.toPrimitive ? () => '' : (k === 'then' || typeof k === 'symbol') ? undefined : k === 'toString' ? () => '' : stub()),
      apply: () => stub(),
    })

    const root = new Context()
    const slotRegistrations = []
    const injectCalls = []
    // 宿主声明了哪些槽：register 进未声明的槽会抛
    // （slot-catalog.ts：「registering into an undeclared slot throws」）。
    // 真实 web 宿主声明了 settings.section（Agent 预设就在用）与 settings.section.icon
    // （dsh-client-ui-settings contract/slots.ts: 供插件定制导航图标，id 必须等于 section id），
    // 这里显式声明，保证校验环境与宿主一致。
    const declaredSlots = new Set([
      'settings.section', 'settings.section.icon', 'conversation.session.header.corner', 'shell.overlay',
      'conversation.chat.assistant-actions', 'contextMenu.content', 'contextMenu.icon',
    ])
    for (const name of allServiceNames) {
      if (name in root) continue
      const S = class extends Service {
        constructor (ctx) {
          super(ctx, name)
          if (name === 'slots') {
            // 真 slots：记录注册，label 在 shell 渲染时才求值
            // ⚠️ 必须挂到 ctx 上（ctx.slots），不是 this.slots ——
            //    插件读的是 ctx.slots.inject。
            ctx.slots = {
              inject: (n, setup) => {
                injectCalls.push(n)
                if (!declaredSlots.has(n)) throw new Error(`Slot "${n}" is not declared by the host`)
                const d = setup()
                return typeof d === 'function' ? d : () => {}
              },
              register: (options, Component) => {
                if (!declaredSlots.has(options?.name)) throw new Error(`Slot "${options?.name}" is not declared by the host`)
                slotRegistrations.push({ options, Component })
                return () => {}
              },
            }
          }
        }
      }
      const base = Object.getPrototypeOf(S.prototype)
      Object.setPrototypeOf(S.prototype, new Proxy(base, { get: (t, k, r) => (typeof k === 'symbol' || k in t || k === 'then') ? Reflect.get(t, k, r) : stub() }))
      root.plugin(S)
    }
    // 直接调一次 apply 拿真实异常（cordis 会把 apply 内的抛错吞成 fiber error）
    let applyError = null
    try { mod.apply(root) } catch (e) { applyError = e.message + ' | ' + (e.stack ?? '').split('\n').slice(1, 4).join(' <- ') }
    const fiber = root.plugin({ name: id, inject: mod.inject, apply: mod.apply })
    let thrown = null
    try { await Promise.race([fiber, new Promise((res) => setTimeout(res, 3000))]) } catch (e) { thrown = e.message }
    await new Promise((res) => setTimeout(res, 200))
    if (!thrown && fiber.error) thrown = fiber.error.message ?? String(fiber.error)

    // 模拟 shell 渲染导航：对每个注册项求值 label（闭包读未声明服务会在这里抛）
    const labelResults = []
    for (const reg of slotRegistrations) {
      let text = null, err = null
      try {
        text = typeof reg.options.label === 'function' ? reg.options.label() : (reg.options.label ?? null)
      } catch (e) { err = e.message }
      // 归一化成可序列化：label 必须是字符串，函数/对象都要暴露出来
      labelResults.push({ name: reg.options.name, id: reg.options.id,
        text: typeof text === 'string' ? text : (text === null ? null : `[${typeof text}]`),
        rawType: typeof text, err })
    }
    return {
      id, inject: mod.inject ?? null, state: fiber.state, thrown,
      slotRegistrations: slotRegistrations.map(r => ({ name: r.options.name, id: r.options.id, order: r.options.order })),
      injectCalls: injectCalls,
      applyError,
      labelResults,
      missing: (Array.isArray(mod.inject) ? mod.inject : Object.keys(mod.inject ?? {})).filter((n) => !allServiceNames.includes(n)),
    }
  }, { src, allServiceNames })

  if (r.evalError) { console.error(`✘ 执行产物时抛错：${r.evalError}`); process.exit(1) }
  if (r.loadError) { console.error(`✘ factory 抛错：${r.loadError}`); process.exit(1) }
  if (r.noApply) { console.error('✘ client 没有导出 apply'); process.exit(1) }

  const STATE = ['pending', 'loading', 'active', 'failed', 'disposed', 'unloading']
  console.log(`✔ 模块 id = ${r.id}`)
  console.log(`✔ exports.inject = ${JSON.stringify(r.inject)}`)
  if (r.missing?.length) { console.error(`✘ inject 里的服务宿主不提供：${r.missing.join(', ')}`); process.exit(1) }
  if (r.state !== 2) {
    console.error(`✘ fiber 状态 ${STATE[r.state] ?? r.state} —— 宿主会拒绝启动`)
    if (r.thrown) console.error(`      原因：${r.thrown}`)
    process.exit(1)
  }
  console.log(`✔ fiber 进入 active（真 cordis ${cordisVersion}）`)

  const section = r.labelResults.find(l => l.name === 'settings.section')
  if (!section) {
    console.error('✘ 没有注册 settings.section —— 设置侧栏不会出现「Bloom 外观」')
    console.error(`   已注册：${JSON.stringify(r.slotRegistrations)}`)
    console.error(`   inject 调用：${JSON.stringify(r.injectCalls)}`)
    console.error(`   fiber 状态：${STATE[r.state]} thrown=${r.thrown ?? 'none'}`)
    console.error(`   apply 异常：${r.applyError ?? 'none'}`)
    process.exit(1)
  }
  if (section.err) {
    console.error(`✘ 求值 settings.section 的 label 抛错（设置项会整条消失）：${section.err}`)
    process.exit(1)
  }
  console.log(`✔ settings.section 已注册：id=${section.id} label=${JSON.stringify(section.text)}`)
  const bad = r.labelResults.filter(l => l.err)
  if (bad.length) {
    console.error(`✘ ${bad.length} 个注册项的 label 求值抛错：${bad.map(b => b.name + ': ' + b.err).join(' | ')}`)
    process.exit(1)
  }
  if (pageErrors.length) console.log(`⚠ 页面有未捕获异常：${pageErrors[0]}`)
  console.log('PASS 真 cordis 内核实跑')
} finally {
  await browser.close()
}
