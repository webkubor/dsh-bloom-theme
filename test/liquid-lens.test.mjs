import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({
  stdin: { contents: `import {buildLiquidLens} from './src/liquid-lens.ts'; window.makeLens=buildLiquidLens`, resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
  bundle: true, write: false, format: 'iife', platform: 'browser',
})

test('the live lens bends backdrop pixels at edges without obscuring the centre', async t => {
  const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
  t.after(() => browser.close())
  const page = await browser.newPage({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 1 })
  await page.setContent(`<style>body{margin:0;background:repeating-linear-gradient(90deg,#eef 0 9px,#245 9px 11px,#eef 11px 20px)}.pane{position:absolute;left:40px;top:40px;width:560px;height:320px;backdrop-filter:blur(0px)}</style><div class="pane"></div>`)
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(() => document.body.append(window.makeLens(document)))
  const clip = { x: 40, y: 65, width: 24, height: 240 }
  const edgeBefore = await page.screenshot({ clip })
  const centreBefore = await page.screenshot({ clip: { x: 220, y: 130, width: 200, height: 140 } })
  await page.evaluate(() => { document.querySelector('.pane').style.backdropFilter = 'url("#dsh-bloom-liquid-lens")' })
  await page.waitForTimeout(100)
  const edgeAfter = await page.screenshot({ clip })
  const centreAfter = await page.screenshot({ clip: { x: 220, y: 130, width: 200, height: 140 } })
  const difference = async (before, after) => page.evaluate(async ([a, b]) => {
    const read = async text => {
      const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${text}`)).blob())
      const canvas = new OffscreenCanvas(image.width, image.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      return ctx.getImageData(0, 0, image.width, image.height).data
    }
    const [x, y] = await Promise.all([read(a), read(b)])
    let total = 0
    for (let i = 0; i < x.length; i++) if (i % 4 !== 3) total += Math.abs(x[i] - y[i])
    return total / (x.length * .75)
  }, [before.toString('base64'), after.toString('base64')])
  const edgeError = await difference(edgeBefore, edgeAfter)
  const centreError = await difference(centreBefore, centreAfter)
  t.diagnostic(JSON.stringify({edgeError, centreError}))
  assert.ok(edgeError > 5, 'edge refraction must move visible backdrop pixels')
  assert.ok(centreError < 1, 'centre must preserve detail within one RGB level of rasterisation error')
  await page.evaluate(() => document.querySelector('#dsh-bloom-liquid-lens').ownerSVGElement.remove())
  assert.equal(await page.locator('#dsh-bloom-liquid-lens').count(), 0)
})
