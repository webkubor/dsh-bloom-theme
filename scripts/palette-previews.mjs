#!/usr/bin/env node
// Reproducible, privacy-safe color studies from the shipping palette tokens.
// These are palette previews, not screenshots of the DSH application.
import { build } from 'esbuild'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(process.argv[2] || '/tmp/bloom-palette-previews')
const { outputFiles } = await build({
  entryPoints: [resolve(root, 'src/palette.ts')], bundle: true, write: false,
  platform: 'node', format: 'esm',
})
const { PALETTE, FEATURED_VARIANTS, VARIANT_LABELS } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`,
)
const pkg = JSON.parse(await (await import('node:fs/promises')).readFile(resolve(root, 'package.json'), 'utf8'))
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
await mkdir(output, { recursive: true })
for (const mode of ['light', 'dark']) {
  const dark = mode === 'dark'
  const cards = FEATURED_VARIANTS.map((key, i) => {
    const p = PALETTE[key], l = VARIANT_LABELS[key], suffix = dark ? 'D' : 'L'
    return `<article style="--accent:${p[`accent${suffix}`]};--canvas:${p[`bg${suffix}`]};--ink:${p[`tx${suffix}`]};--rgb:${p.morandi}">
      <header><span class="number">${String(i + 1).padStart(2, '0')}</span><h2>${escape(l.zh)} <small>${escape(l.en)}</small></h2><i></i></header>
      <p class="poem">${escape(l.poem)}</p>
      <div class="study"><nav><span></span><span class="active"></span><span></span></nav><main><b>Room to think.</b><p>A little color. A quieter canvas.</p><div class="composer">Ask anything <button aria-label="Send">↑</button></div></main></div>
      <footer><span class="dot"></span> ${dark ? '暗色 · Dark' : '浅色 · Light'}<span class="key">${key}</span></footer>
    </article>`
  }).join('\n')
  const html = `<!doctype html><html lang="zh"><meta charset="utf-8"><title>Bloom ${pkg.version} · ${mode} palette previews</title><style>
*{box-sizing:border-box}body{margin:0;padding:42px 42px 26px;background:${dark ? '#111418' : '#f4f3f0'};color:${dark ? '#e7e8ed' : '#292c35'};font:16px -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}body>header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}h1{font-size:36px;letter-spacing:-1px;margin:0 0 9px;font-weight:650}body>header p{margin:0;opacity:.65;font-size:15px}.edition{border:1px solid ${dark ? '#3b404a' : '#d3d4d8'};border-radius:999px;padding:10px 16px;font-size:14px}section{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}article{color:var(--ink);background:var(--canvas);border:1px solid rgba(var(--rgb),.25);border-radius:20px;padding:18px 20px 13px;overflow:hidden;box-shadow:0 8px 24px #00000005}article header{display:flex;align-items:center;gap:10px}h2{font-size:21px;font-weight:620;display:flex;gap:10px;align-items:baseline;margin:0}h2 small{font-weight:400;font-size:13px;opacity:.72}.number{font-size:11px;opacity:.5}i{margin-left:auto;width:16px;height:16px;background:var(--accent);border-radius:50%}.poem{margin:10px 0 14px;font-size:14px;letter-spacing:1px;opacity:.75}.study{display:flex;border:1px solid rgba(var(--rgb),.22);border-radius:12px;height:120px;overflow:hidden;background:linear-gradient(140deg,rgba(var(--rgb),.14),transparent)}nav{width:56px;background:rgba(var(--rgb),.10);padding:17px 9px;display:flex;flex-direction:column;gap:12px}nav span{height:6px;border-radius:4px;background:rgba(var(--rgb),.22)}nav .active{background:var(--accent);opacity:.8}main{flex:1;padding:13px 12px}main b{font-weight:580;font-size:15px}main p{font-size:10px;margin:5px 0 12px;opacity:.7}.composer{display:flex;align-items:center;justify-content:space-between;font-size:10px;padding:6px 7px;border:1px solid rgba(var(--rgb),.35);border-radius:8px;background:${dark ? '#ffffff08' : '#ffffff5e'};backdrop-filter:blur(8px)}button{border:0;background:var(--accent);color:var(--canvas);border-radius:6px;width:22px;height:22px;font-size:16px}article footer{display:flex;align-items:center;gap:6px;margin-top:12px;font-size:10px;opacity:.72}.dot{width:5px;height:5px;border-radius:50%;background:var(--accent)}.key{margin-left:auto}body>footer{margin-top:20px;font-size:12px;opacity:.6;text-align:center}
</style><body><header><div><h1>Bloom · ${dark ? '夜色' : '日光'}</h1><p>${FEATURED_VARIANTS.length} 套精选配色 · ${FEATURED_VARIANTS.length} featured palettes · Glass + Morandi</p></div><span class="edition">v${escape(pkg.version)} / ${dark ? 'DARK' : 'LIGHT'}</span></header><section>${cards}</section><footer>配色示意，基于本版真实色板 · Palette studies using release tokens, not application screenshots.</footer></body></html>`
  await writeFile(resolve(output, `palettes-${mode}.html`), html)
}
console.log(`Generated ${FEATURED_VARIANTS.length} featured palettes in light/dark: ${output}`)
