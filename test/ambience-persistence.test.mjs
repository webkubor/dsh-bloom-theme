import assert from 'node:assert/strict'
import test from 'node:test'
import { Script } from 'node:vm'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const { outputFiles } = await build({ stdin: { contents: `export * from './src/ambience.ts'`, resolveDir: fileURLToPath(new URL('..', import.meta.url)) }, bundle: true, write: false, format: 'iife', globalName: 'fixture', platform: 'browser' })
const script = new Script(outputFiles[0].text)
const key = scheme => `dsh-bloom-variant-ambience-${scheme}`

function setup(initial = {}) {
  const store = new Map(Object.entries(initial)), attrs = new Map()
  const blocked = { read: false, write: false }
  const sandbox = {
    localStorage: {
      getItem(key) { if (blocked.read) throw new Error('read blocked'); return store.get(key) ?? null },
      setItem(key, value) { if (blocked.write) throw new Error('write blocked'); store.set(key, value) },
    },
    document: { body: { setAttribute(name, value) { attrs.set(name, value) }, removeAttribute(name) { attrs.delete(name) } } },
  }
  script.runInNewContext(sandbox)
  return { api: sandbox.fixture, store, attrs, blocked }
}

test('normal storage is authoritative, including outside changes and invalid stored values', () => {
  const f = setup()
  assert.equal(f.api.readAmbience('light'), 'stream')
  assert.equal(f.api.writeAmbience('light', 'wash'), true)
  assert.equal(f.store.get(key('light')), 'wash')
  f.store.set(key('light'), 'clear')
  assert.equal(f.api.readAmbience('light'), 'clear')
  f.store.set(key('light'), 'invalid')
  assert.equal(f.api.readAmbience('light'), 'stream')
})

test('write denied keeps each session choice until storage changes externally', () => {
  const f = setup({ [key('light')]: 'stream', [key('dark')]: 'corner' })
  f.blocked.write = true
  f.api.writeAmbience('light', 'wash')
  f.api.writeAmbience('dark', 'galaxy')
  assert.equal(f.api.readAmbience('light'), 'wash')
  assert.equal(f.api.readAmbience('dark'), 'galaxy')
  assert.equal(f.store.get(key('light')), 'stream')
  f.store.set(key('light'), 'clear')
  assert.equal(f.api.readAmbience('light'), 'clear')
  assert.equal(f.api.readAmbience('dark'), 'galaxy')
})

test('read denied uses each scheme memory including successful writes', () => {
  const f = setup({ [key('dark')]: 'diagonal' })
  assert.equal(f.api.readAmbience('dark'), 'diagonal')
  f.blocked.read = true
  assert.equal(f.api.writeAmbience('light', 'clear'), true)
  assert.equal(f.api.readAmbience('light'), 'clear')
  assert.equal(f.api.readAmbience('dark'), 'diagonal')
  f.blocked.read = false
  f.store.set(key('light'), 'wash')
  assert.equal(f.api.readAmbience('light'), 'wash')
})

test('both storage operations denied preserves independent choices across cleanup and initialization', () => {
  const f = setup()
  f.blocked.read = true; f.blocked.write = true
  f.api.writeAmbience('light', 'wash'); f.api.writeAmbience('dark', 'off')
  f.api.clearAmbience()
  assert.equal(f.attrs.size, 0)
  f.api.initAmbience()
  assert.equal(f.attrs.get('data-bloom-ambience-light'), 'wash')
  assert.equal(f.attrs.get('data-bloom-ambience-dark'), 'off')
  assert.equal(f.api.readAmbience('light'), 'wash')
  assert.equal(f.api.readAmbience('dark'), 'off')
})

test('invalid writes preserve stored, in-memory and DOM values', () => {
  const f = setup()
  f.blocked.write = true
  f.api.writeAmbience('light', 'wash')
  assert.equal(f.api.writeAmbience('light', 'galaxy'), false)
  assert.equal(f.api.writeAmbience('dark', 'wash'), false)
  assert.equal(f.api.readAmbience('light'), 'wash')
  assert.equal(f.attrs.get('data-bloom-ambience-light'), 'wash')
  assert.equal(f.attrs.has('data-bloom-ambience-dark'), false)
})
