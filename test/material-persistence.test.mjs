import assert from 'node:assert/strict'
import test from 'node:test'
import { Script } from 'node:vm'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const KEY = ['dsh-bloom-variant', 'glass-mode'].join('-')
const REDUCED = '(prefers-reduced-transparency: reduce)'
const MATERIALS = ['frosted', 'matte', 'liquid']
const { outputFiles } = await build({
  stdin: {
    contents: `export * from './src/glass.ts'; export { bindHostTheme } from './src/appearance.ts';`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  },
  bundle: true, write: false, format: 'iife', globalName: 'fixture', platform: 'browser', target: 'es2020',
})
const script = new Script(outputFiles[0].text)

function setup({ saved, store = new Map(), dark = false, failures = {}, noMedia = false } = {}) {
  if (saved !== undefined) store.set(KEY, saved)
  const writes = []
  const attributes = new Map(dark ? [['data-ds-dark-theme', '']] : [])
  const attributeWrites = []
  const mediaQueries = new Map()
  const media = query => {
    if (!mediaQueries.has(query)) {
      const listeners = new Set()
      mediaQueries.set(query, {
        matches: false, listeners,
        addEventListener(type, fn) { assert.equal(type, 'change'); listeners.add(fn) },
        removeEventListener(type, fn) { assert.equal(type, 'change'); listeners.delete(fn) },
      })
    }
    return mediaQueries.get(query)
  }
  const sandbox = {
    document: { body: {
      hasAttribute: name => attributes.has(name),
      setAttribute(name, value) { attributes.set(name, value); attributeWrites.push([name, value]) },
      removeAttribute(name) { attributes.delete(name); attributeWrites.push([name, null]) },
    } },
    window: { matchMedia(query) {
      if (noMedia) throw new Error('matchMedia unavailable')
      return media(query)
    } },
  }
  Object.defineProperty(sandbox, 'localStorage', { get() {
    if (failures.access) throw new Error('Storage access denied')
    return {
      getItem(key) {
        assert.equal(key, KEY)
        if (failures.read) throw new Error('Storage read denied')
        return store.get(key) ?? null
      },
      setItem(key, value) {
        assert.equal(key, KEY)
        writes.push([key, value])
        if (failures.write) throw new Error('Storage write denied')
        store.set(key, value)
      },
    }
  } })
  script.runInNewContext(sandbox)
  return {
    api: sandbox.fixture, store, writes, attributes, attributeWrites, media,
    setMedia(query, matches) {
      const mq = media(query)
      mq.matches = matches
      for (const listener of [...mq.listeners]) listener({ matches, media: query })
    },
  }
}

test('only the three canonical materials are user choices', () => {
  const { api } = setup()
  assert.deepEqual(Array.from(api.GLASS_MODES), MATERIALS)
})

for (const [legacy, canonical] of [['glass', 'liquid'], ['soft', 'matte'], ['solid', 'frosted']]) {
  test(`legacy ${legacy} reads as ${canonical} and migrates only at initialization`, () => {
    const f = setup({ saved: legacy })
    assert.equal(f.api.readGlassMode(), canonical)
    f.api.applyGlassMode()
    assert.equal(f.attributes.get('data-bloom-glass'), canonical)
    assert.equal(f.store.get(KEY), legacy)
    assert.deepEqual(f.writes, [])

    const release = f.api.initGlassMode()
    assert.equal(f.store.get(KEY), canonical)
    assert.deepEqual(f.writes, [[KEY, canonical]])
    const releaseAgain = f.api.initGlassMode()
    assert.deepEqual(f.writes, [[KEY, canonical]])
    release()
    releaseAgain()

    const reload = setup({ store: f.store })
    const releaseReload = reload.api.initGlassMode()
    assert.equal(reload.api.readGlassMode(), canonical)
    assert.equal(reload.attributes.get('data-bloom-glass'), canonical)
    assert.deepEqual(reload.writes, [])
    releaseReload()
  })
}

for (const mode of ['auto', ...MATERIALS]) {
  test(`${mode} persists under the stable key and survives a fresh module`, () => {
    const store = new Map([['dsh-bloom-variant', 'petal'], ['unrelated', 'keep']])
    const f = setup({ saved: 'soft', store })
    f.api.writeGlassMode(mode)
    assert.equal(f.api.readGlassMode(), mode)
    assert.equal(store.get(KEY), mode)
    assert.deepEqual(f.writes, [[KEY, mode]])
    assert.equal(store.get('dsh-bloom-variant'), 'petal')
    assert.equal(store.get('unrelated'), 'keep')

    const reload = setup({ store })
    const release = reload.api.initGlassMode()
    assert.equal(reload.api.readGlassMode(), mode)
    assert.equal(reload.attributes.get('data-bloom-glass'), mode === 'auto' ? undefined : mode)
    assert.deepEqual(reload.writes, [])
    release()
  })
}

test('missing or invalid values default to auto without changing the stored data', () => {
  for (const saved of [undefined, '', 'unknown', 'AUTO', 'soft ', '__proto__']) {
    const f = setup({ saved })
    assert.equal(f.api.readGlassMode(), 'auto')
    const release = f.api.initGlassMode()
    assert.equal(f.api.effectiveGlassMode(), 'liquid')
    assert.equal(f.attributes.has('data-bloom-glass'), false)
    assert.equal(f.store.get(KEY), saved)
    assert.deepEqual(f.writes, [])
    release()
  }
})

test('legacy values passed by untyped callers still persist canonical IDs', () => {
  const f = setup()
  for (const [legacy, canonical] of [['glass', 'liquid'], ['soft', 'matte'], ['solid', 'frosted']]) {
    f.api.writeGlassMode(legacy)
    assert.equal(f.api.readGlassMode(), canonical)
    assert.equal(f.store.get(KEY), canonical)
    assert.equal(f.attributes.get('data-bloom-glass'), canonical)
  }
})

test('blocked storage access or reads do not prevent a session choice', () => {
  for (const failures of [{ access: true }, { read: true }]) {
    const f = setup({ saved: 'liquid', failures })
    assert.equal(f.api.readGlassMode(), 'auto')
    const release = f.api.initGlassMode()
    assert.equal(f.api.effectiveGlassMode(), 'liquid')
    f.api.writeGlassMode('matte')
    assert.equal(f.api.readGlassMode(), 'matte')
    assert.equal(f.api.effectiveGlassMode(), 'matte')
    assert.equal(f.attributes.get('data-bloom-glass'), 'matte')
    release()
  }
})

test('denied writes retain the live selection even when storage has an older value', () => {
  const f = setup({ saved: 'liquid', failures: { write: true } })
  assert.equal(f.api.readGlassMode(), 'liquid')
  f.api.writeGlassMode('frosted')
  const release = f.api.initGlassMode()
  assert.equal(f.api.readGlassMode(), 'frosted')
  assert.equal(f.api.effectiveGlassMode(), 'frosted')
  assert.equal(f.attributes.get('data-bloom-glass'), 'frosted')
  assert.equal(f.store.get(KEY), 'liquid')
  release()
})

test('a failed migration is safe and cannot replace a later session selection', () => {
  const f = setup({ saved: 'soft', failures: { write: true } })
  const release = f.api.initGlassMode()
  assert.equal(f.api.readGlassMode(), 'matte')
  assert.equal(f.attributes.get('data-bloom-glass'), 'matte')
  assert.equal(f.store.get(KEY), 'soft')
  f.api.writeGlassMode('liquid')
  const releaseAgain = f.api.initGlassMode()
  assert.equal(f.api.readGlassMode(), 'liquid')
  assert.equal(f.attributes.get('data-bloom-glass'), 'liquid')
  assert.deepEqual(f.writes, [[KEY, 'matte'], [KEY, 'liquid']])
  release()
  releaseAgain()
})

test('auto resolves to liquid in both light and dark without persisting either', () => {
  const f = setup()
  const release = f.api.initGlassMode()
  assert.equal(f.api.effectiveGlassMode(), 'liquid')
  f.attributes.set('data-ds-dark-theme', '')
  assert.equal(f.api.effectiveGlassMode(), 'liquid')
  f.attributes.delete('data-ds-dark-theme')
  assert.equal(f.api.effectiveGlassMode(), 'liquid')
  assert.equal(f.api.readGlassMode(), 'auto')
  assert.equal(f.attributes.has('data-bloom-glass'), false)
  assert.deepEqual(f.writes, [])
  release()
})

test('auto ignores both the host scheme snapshot and the legacy body marker', () => {
  const f = setup({ dark: true })
  let scheme = 'light'
  const release = f.api.bindHostTheme({
    setTheme() {},
    getTheme: () => ({ preference: 'system', active: { colorScheme: scheme } }),
  })
  assert.equal(f.api.effectiveGlassMode(), 'liquid')
  f.attributes.delete('data-ds-dark-theme')
  scheme = 'dark'
  assert.equal(f.api.effectiveGlassMode(), 'liquid')
  release()
  assert.equal(f.api.effectiveGlassMode(), 'liquid')
})

test('an explicit material survives a scheme change untouched', () => {
  for (const mode of MATERIALS) {
    const f = setup({ saved: mode })
    const release = f.api.initGlassMode()
    assert.equal(f.api.effectiveGlassMode(), mode)
    const applied = f.attributeWrites.length
    // 深浅切换不碰材质：属性不重写，偏好不重写。
    f.attributes.set('data-ds-dark-theme', '')
    assert.equal(f.api.effectiveGlassMode(), mode)
    f.attributes.delete('data-ds-dark-theme')
    assert.equal(f.api.effectiveGlassMode(), mode)
    assert.equal(f.attributes.get('data-bloom-glass'), mode)
    assert.equal(f.attributeWrites.length, applied)
    assert.deepEqual(f.writes, [])
    release()
  }
})

test('reduced transparency falls back only for auto and recovers the same material', () => {
  for (const dark of [false, true]) {
    const f = setup({ dark })
    const release = f.api.initGlassMode()
    f.setMedia(REDUCED, true)
    assert.equal(f.api.systemPrefersReducedTransparency(), true)
    assert.equal(f.api.effectiveGlassMode(), 'solid')
    assert.equal(f.api.readGlassMode(), 'auto')
    assert.equal(f.attributes.has('data-bloom-glass'), false)
    f.setMedia(REDUCED, false)
    assert.equal(f.api.effectiveGlassMode(), 'liquid')
    assert.deepEqual(f.writes, [])
    release()
  }
})

for (const mode of MATERIALS) {
  test(`explicit ${mode} applies in both schemes despite reduced transparency`, () => {
    for (const dark of [false, true]) {
      const f = setup({ saved: mode, dark })
      const release = f.api.initGlassMode()
      assert.equal(f.api.effectiveGlassMode(), mode)
      const applied = f.attributeWrites.length
      f.setMedia(REDUCED, true)
      assert.equal(f.api.effectiveGlassMode(), mode)
      assert.equal(f.attributes.get('data-bloom-glass'), mode)
      assert.equal(f.attributeWrites.length, applied)
      assert.deepEqual(f.writes, [])
      release()
    }
  })
}

for (const query of ['(forced-colors: active)', '(prefers-contrast: more)']) {
  test(`${query} protects every preference in both schemes without overwriting it`, () => {
    for (const dark of [false, true]) {
      for (const mode of ['auto', ...MATERIALS]) {
        const f = setup({ saved: mode, dark })
        const release = f.api.initGlassMode()
        f.setMedia(query, true)
        assert.equal(f.api.effectiveGlassMode(), 'solid')
        assert.equal(f.api.readGlassMode(), mode)
        assert.equal(f.store.get(KEY), mode)
        assert.equal(f.attributes.get('data-bloom-glass'), mode === 'auto' ? undefined : mode)
        f.setMedia(query, false)
        assert.equal(f.api.effectiveGlassMode(), mode === 'auto' ? 'liquid' : mode)
        assert.deepEqual(f.writes, [])
        release()
      }
    }
  })
}

test('unavailable media APIs keep defaults and provide safe disposal', () => {
  const f = setup({ noMedia: true, dark: true })
  const release = f.api.initGlassMode()
  assert.equal(f.api.systemPrefersReducedTransparency(), false)
  assert.equal(f.api.effectiveGlassMode(), 'liquid')
  f.api.writeGlassMode('liquid')
  assert.equal(f.api.effectiveGlassMode(), 'liquid')
  release()
})

test('each initialization releases its own listener and disposed listeners stay inactive', () => {
  const f = setup()
  const first = f.api.initGlassMode()
  const second = f.api.initGlassMode()
  assert.equal(f.media(REDUCED).listeners.size, 2)
  first()
  assert.equal(f.media(REDUCED).listeners.size, 1)
  const before = f.attributeWrites.length
  f.setMedia(REDUCED, true)
  assert.equal(f.attributeWrites.length, before + 1)
  second()
  second()
  assert.equal(f.media(REDUCED).listeners.size, 0)
  f.setMedia(REDUCED, false)
  assert.equal(f.attributeWrites.length, before + 1)
})
