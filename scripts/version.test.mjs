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
const versionModule = await import(`${pathToFileURL(outputPath).href}?t=${Date.now()}`)
const {
  cmpVersion,
  selectDshDistTag,
  setVersionUpdatesActive,
  checkDshLatest,
  renderDshUpdate,
} = versionModule

function createMockElement() {
  const listeners = {}
  return {
    textContent: '',
    dataset: {},
    hidden: false,
    disabled: false,
    title: '',
    setAttribute(k, v) { this[k] = v },
    getAttribute(k) { return this[k] },
    removeAttribute(k) { delete this[k] },
    addEventListener(event, fn) {
      listeners[event] = fn
    },
    dispatchEvent(event) {
      listeners[event.type]?.(event)
    },
    classList: {
      add() {},
      remove() {},
    },
  }
}

const originalWindow = globalThis.window
const originalDocument = globalThis.document
const originalFetch = globalThis.fetch
const originalSessionStorage = globalThis.sessionStorage

function setupMockEnvironment(elements = {}) {
  const root = elements.root ?? createMockElement()
  const curEl = elements.curEl ?? createMockElement()
  const latEl = elements.latEl ?? createMockElement()
  const stEl = elements.stEl ?? createMockElement()
  const hintEl = elements.hintEl ?? createMockElement()
  const platEl = elements.platEl ?? createMockElement()
  const refreshBtn = elements.refreshBtn ?? createMockElement()
  const copyBtn = elements.copyBtn ?? createMockElement()

  globalThis.window = globalThis
  globalThis.document = {
    documentElement: { dataset: {} },
    body: { dataset: {} },
    querySelector(sel) {
      if (sel.includes('.dsh-bloom-dsh-update')) return root
      if (sel.includes('[data-dsh-current]')) return curEl
      if (sel.includes('[data-dsh-latest]')) return latEl
      if (sel.includes('[data-dsh-state]')) return stEl
      if (sel.includes('[data-dsh-hint]')) return hintEl
      if (sel.includes('[data-dsh-platform]')) return platEl
      if (sel.includes('[data-act="refresh"]')) return refreshBtn
      if (sel.includes('[data-act="copy"]')) return copyBtn
      return null
    },
    querySelectorAll() { return [] },
  }
  globalThis.sessionStorage = {
    getItem() { return null },
    setItem() {},
    removeItem() {},
  }
}

function cleanupMockEnvironment() {
  setVersionUpdatesActive(false)
  if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow
  if (originalDocument === undefined) delete globalThis.document; else globalThis.document = originalDocument
  if (originalFetch === undefined) delete globalThis.fetch; else globalThis.fetch = originalFetch
  if (originalSessionStorage === undefined) delete globalThis.sessionStorage; else globalThis.sessionStorage = originalSessionStorage
  delete globalThis.dshDesktop
}

test.after(async () => {
  cleanupMockEnvironment()
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

test('teardown clears desktopStatus and pending dshCheckPromise so re-enable starts clean', async (t) => {
  const root = createMockElement()
  const curEl = createMockElement()
  const latEl = createMockElement()
  const stEl = createMockElement()
  const hintEl = createMockElement()
  setupMockEnvironment({ root, curEl, latEl, stEl, hintEl })
  t.after(cleanupMockEnvironment)

  globalThis.dshDesktop = {
    updates: {
      status: async () => ({ phase: 'available', version: '0.3.0' }),
      open: () => {},
    },
  }

  setVersionUpdatesActive(true)
  renderDshUpdate()
  await new Promise((r) => setTimeout(r, 20))

  assert.equal(versionModule.desktopStatus?.version, '0.3.0')
  assert.equal(latEl.textContent, '0.3.0')
  assert.equal(stEl.getAttribute('data-state'), 'update')

  // Teardown / disable
  setVersionUpdatesActive(false)
  assert.equal(versionModule.desktopStatus, null, 'desktopStatus must be cleared on teardown')

  // Re-enable
  setVersionUpdatesActive(true)
  assert.equal(versionModule.desktopStatus, null, 'desktopStatus remains null after re-enable until polled')

  // Calling renderDshUpdate immediately after re-enable must not show stale update
  globalThis.dshDesktop.updates.status = async () => null
  renderDshUpdate()
  assert.notEqual(latEl.textContent, '0.3.0', 'must not show stale desktopUpdate')
  assert.equal(stEl.getAttribute('data-state'), 'managed')
})

test('disable/re-enable clears dshCheckPromise so checkDshLatest does not return aborted previous promise', async (t) => {
  setupMockEnvironment({})
  t.after(cleanupMockEnvironment)

  delete globalThis.dshDesktop
  let fetchAborted = false
  globalThis.fetch = (_url, opts) => {
    return new Promise((_resolve, reject) => {
      opts?.signal?.addEventListener('abort', () => {
        fetchAborted = true
        reject(new DOMException('Aborted', 'AbortError'))
      })
    })
  }

  setVersionUpdatesActive(true)
  const p1 = checkDshLatest(true)
  const checkPromise1 = versionModule.dshCheckPromise
  assert.ok(checkPromise1, 'dshCheckPromise should hold running promise')

  setVersionUpdatesActive(false)
  assert.equal(fetchAborted, true, 'in-flight request signal should be aborted')
  assert.equal(versionModule.dshCheckPromise, null, 'teardown must clear dshCheckPromise')

  setVersionUpdatesActive(true)
  assert.equal(versionModule.dshCheckPromise, null, 'fresh generation starts with null promise')

  let resolveSecondFetch
  globalThis.fetch = () => new Promise((resolve) => { resolveSecondFetch = resolve })
  const p2 = checkDshLatest(true)
  const checkPromise2 = versionModule.dshCheckPromise
  assert.ok(checkPromise2, 'dshCheckPromise points to fresh promise')
  assert.notEqual(checkPromise2, checkPromise1, 'checkDshLatest must not return aborted previous promise')

  resolveSecondFetch({ ok: true, json: async () => ({ 'dist-tags': { latest: '0.2.3' } }) })
  await p2
  assert.equal(versionModule.dshCheckPromise, null)
  await p1.catch(() => {})
})

test('old in-flight request finishing after new generation does not clear fresh promise', async (t) => {
  setupMockEnvironment({})
  t.after(cleanupMockEnvironment)

  delete globalThis.dshDesktop
  let rejectOldFetch
  let resolveNewFetch

  // Step 1: Start check in generation 1
  setVersionUpdatesActive(true)
  globalThis.fetch = () => new Promise((_, reject) => { rejectOldFetch = reject })
  const p1 = checkDshLatest(true)
  const checkPromise1 = versionModule.dshCheckPromise
  assert.ok(checkPromise1)

  // Step 2: Teardown
  setVersionUpdatesActive(false)
  assert.equal(versionModule.dshCheckPromise, null)

  // Step 3: Re-enable and start check in generation 2
  setVersionUpdatesActive(true)
  globalThis.fetch = () => new Promise((resolve) => { resolveNewFetch = resolve })
  const p2 = checkDshLatest(true)
  const checkPromise2 = versionModule.dshCheckPromise
  assert.ok(checkPromise2)
  assert.notEqual(checkPromise2, checkPromise1)

  // Step 4: Old fetch from generation 1 finishes late and runs its finally block
  rejectOldFetch(new DOMException('Aborted', 'AbortError'))
  await p1.catch(() => {})

  // Regression assertion: old finally callback must not clear the fresh generation's promise
  assert.equal(versionModule.dshCheckPromise, checkPromise2, 'old finally callback must not clear fresh promise')

  // Step 5: Settle p2 and verify p2's finally properly clears promise
  resolveNewFetch({ ok: true, json: async () => ({ 'dist-tags': { latest: '0.2.3' } }) })
  await p2
  assert.equal(versionModule.dshCheckPromise, null, 'fresh finally properly clears promise')
})

test('late desktopStatus resolution from prior generation does not overwrite fresh state', async (t) => {
  const root = createMockElement()
  const curEl = createMockElement()
  const latEl = createMockElement()
  const stEl = createMockElement()
  const hintEl = createMockElement()
  setupMockEnvironment({ root, curEl, latEl, stEl, hintEl })
  t.after(cleanupMockEnvironment)

  let resolveOldStatus
  globalThis.dshDesktop = {
    updates: {
      status: () => new Promise((resolve) => { resolveOldStatus = resolve }),
      open: () => {},
    },
  }

  setVersionUpdatesActive(true)
  renderDshUpdate()

  // Teardown before status resolves
  setVersionUpdatesActive(false)
  assert.equal(versionModule.desktopStatus, null)

  // Re-enable
  setVersionUpdatesActive(true)

  // Late resolution of old status
  resolveOldStatus({ phase: 'available', version: '0.9.9' })
  await new Promise((r) => setTimeout(r, 20))

  assert.equal(versionModule.desktopStatus, null, 'stale status resolution from previous generation must be discarded')
})

test('synchronous throw during fetch does not hit TDZ ReferenceError and allows future retry', async (t) => {
  setupMockEnvironment({})
  t.after(cleanupMockEnvironment)

  delete globalThis.dshDesktop
  setVersionUpdatesActive(true)

  let calls = 0
  globalThis.fetch = () => {
    calls += 1
    if (calls === 1) {
      throw new TypeError('Synchronous network stack failure')
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ 'dist-tags': { latest: '0.2.6' } }),
    })
  }

  // 1. Initial call should not reject with ReferenceError
  await assert.doesNotReject(async () => {
    await checkDshLatest(true)
  })

  // Verify failure is captured in dshCheckError as TypeError, not ReferenceError
  assert.ok(versionModule.dshCheckError?.includes('Synchronous network stack failure'), 'captures actual error')
  assert.equal(versionModule.dshCheckError?.includes('ReferenceError'), false, 'must not hit TDZ ReferenceError')

  // 2. Microtask queue ensures dshCheckPromise is not pinned
  assert.equal(versionModule.dshCheckPromise, null, 'pointer must be cleared after sync failure')

  // 3. Future call retries cleanly and succeeds
  await assert.doesNotReject(async () => {
    await checkDshLatest(true)
  })
  assert.equal(calls, 2, 'second check executed as retry')
  assert.equal(versionModule.dshLatestVersion, '0.2.6')
  assert.equal(versionModule.dshCheckPromise, null)
})
