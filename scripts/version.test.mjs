import assert from 'node:assert/strict'
import test from 'node:test'

// version.ts belongs to the browser bundle, so compile a tiny test-only ESM copy
// without adding a runtime dependency or changing Bloom's production bundle.
import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const sourceURL = new URL('../src/version.ts', import.meta.url)
const testDirectory = await mkdtemp(join(tmpdir(), 'bloom-version-test-'))
const outputPath = join(testDirectory, 'version.mjs')
await build({
  entryPoints: [fileURLToPath(sourceURL)],
  outfile: outputPath,
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: 'es2020',
})
const { cmpVersion, selectDshDistTag } = await import(`${pathToFileURL(outputPath).href}?t=${Date.now()}`)

test.after(async () => {
  await rm(testDirectory, { recursive: true, force: true })
})

test('compares prerelease versions using SemVer precedence', () => {
  assert.equal(cmpVersion('0.1.2-alpha.4', '0.1.2-alpha.3'), 1)
  assert.equal(cmpVersion('0.1.2-alpha.4', '0.1.2-alpha.4'), 0)
  assert.equal(cmpVersion('0.1.2', '0.1.2-rc.2'), 1)
  assert.equal(cmpVersion('0.1.2-alpha.1', '0.1.2-rc.1'), -1)
})

test('selects the current prerelease channel instead of latest', () => {
  const tags = {
    latest: '0.1.1-rc.2',
    next: '0.1.1-rc.2',
    alpha: '0.1.2-alpha.4',
  }
  assert.equal(selectDshDistTag(tags, '0.1.2-alpha.3'), 'alpha')
  assert.equal(selectDshDistTag(tags, '0.1.1-rc.2'), 'next')
  assert.equal(selectDshDistTag(tags, '0.1.2'), 'latest')
})
