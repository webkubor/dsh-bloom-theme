import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: { contents: "import { buildSurfaceCSS } from './src/surfaces.ts'; window.surfaceCSS = buildSurfaceCSS();", resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
  bundle: true, write: false, format: 'iife', platform: 'browser',
})

test('light surface configuration does not change dark modes or unconfigured themes', async () => {
  const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined })
  try {
    const page = await browser.newPage()
    await page.setContent(`<style>body{--dsw-alias-bg-base:#eee}aside{background:#456}.x_card{background:#567;box-shadow:none}</style>
      <aside class="x_sidebarCol">Sidebar</aside><div class="x_composer"><div class="x_card">Composer</div></div>`)
    await page.addScriptTag({ content: outputFiles[0].text })
    const results = await page.evaluate(() => {
      const pick = () => ['aside', '.x_card'].map(q => {
        const c = getComputedStyle(document.querySelector(q))
        return [c.backgroundColor, c.boxShadow, c.backdropFilter]
      })
      const result = []
      const sheet = document.createElement('style'); document.head.append(sheet)
      for (const [variant, dark] of [['ripple', true], ['mint', true], ['mint', false], ['ripple', false]]) {
        document.body.dataset.bloomVariant = variant
        document.body.toggleAttribute('data-ds-dark-theme', dark)
        sheet.textContent = ''
        const before = pick()
        sheet.textContent = window.surfaceCSS
        result.push({ variant, dark, before, after: pick() })
      }
      return result
    })
    for (const row of results) {
      if (row.variant === 'ripple' && !row.dark) {
        assert.notDeepEqual(row.before, row.after)
        assert.equal(row.after[1][0], 'rgb(255, 255, 255)', 'light composer has an opaque surface')
      } else assert.deepEqual(row.before, row.after, `${row.variant} ${row.dark ? 'dark' : 'light'} is isolated`)
    }
  } finally { await browser.close() }
})
