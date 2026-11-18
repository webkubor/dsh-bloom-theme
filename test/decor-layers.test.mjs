import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

const resolveDir = fileURLToPath(new URL('..', import.meta.url))

async function stylesFrom(moduleName, cssExpression) {
  const { outputFiles } = await build({
    stdin: {
      contents: `import * as cssModule from './src/css/${moduleName}.ts'; window.CSS_MODULE = ${cssExpression}`,
      resolveDir,
    },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
  })
  return outputFiles[0].text
}

test('starlight particles stay behind host tooltips (#116)', async () => {
  const styles = await stylesFrom('background', 'cssModule.BACKGROUND_CSS')
  assert.match(styles, /\.dsh-bloom-sparkles\s*\{[^}]*z-index:\s*-1;/, 'decorative sparkles must remain behind positioned host UI')
})

for (const cssModule of ['LIQUID', 'ADAPTIVE']) {
  test(`${cssModule.toLowerCase()} panels inherit host corner geometry (#125)`, async () => {
    const styles = await stylesFrom(
      cssModule === 'LIQUID' ? 'liquid' : 'adaptive',
      cssModule === 'LIQUID' ? "cssModule.liquidSurfaces('', false)" : 'cssModule.ADAPTIVE_CSS',
    )
    assert.match(
      styles,
      /#125:/,
      `${cssModule}: must preserve the #125 geometry contract`,
    )
    assert.match(
      styles,
      /inset:\s*0;[\s\S]{0,300}border-radius:\s*inherit;/,
      `${cssModule}: panel must touch the host edge and inherit its radius`,
    )
  })
}
