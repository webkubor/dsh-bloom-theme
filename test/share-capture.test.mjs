import assert from 'node:assert/strict'
import test from 'node:test'
import { Script } from 'node:vm'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const { outputFiles } = await build({ stdin: { contents: `export * from './src/share-capture.ts'`, resolveDir: fileURLToPath(new URL('..', import.meta.url)) }, bundle: true, write: false, format: 'iife', globalName: 'fixture', platform: 'browser' })
const script = new Script(outputFiles[0].text)
const tick = () => new Promise(resolve => setTimeout(resolve, 0))

function setup({ picker, format = 'video/webm', source = 'window', videoPlay, blob = new Blob(['png'], { type: 'image/png' }) } = {}) {
  const listeners = new Map()
  const track = {
    readyState: 'live', stops: 0, getSettings: () => ({ displaySurface: source }),
    addEventListener(type, fn) { listeners.set(type, fn) }, removeEventListener(type, fn) { if (listeners.get(type) === fn) listeners.delete(type) },
    stop() { this.readyState = 'ended'; this.stops++ },
    end() { this.readyState = 'ended'; listeners.get('ended')?.() },
  }
  const stream = { getVideoTracks: () => [track], getTracks: () => [track] }
  let requests = 0, video, recorder, drawn = false, args
  class FakeRecorder {
    static isTypeSupported(type) { return type === format }
    constructor(input, options) { assert.equal(input, stream); this.mimeType = options.mimeType; this.state = 'inactive'; recorder = this }
    start() { this.state = 'recording' }
    stop() { this.state = 'inactive'; queueMicrotask(() => { this.ondataavailable?.({ data: new Blob(['movie'], { type: this.mimeType }) }); this.onstop?.() }) }
  }
  const sandbox = {
    navigator: { mediaDevices: { getDisplayMedia(options) { requests++; args = options; return picker ? picker(stream) : Promise.resolve(stream) } } },
    document: { createElement(name) {
      if (name === 'video') return video = { srcObject: null, videoWidth: 300, videoHeight: 200, play: videoPlay || (() => Promise.resolve()), pause() { this.paused = true }, remove() { this.removed = true } }
      assert.equal(name, 'canvas')
      return { getContext() { return { drawImage() { drawn = true } } }, toBlob(callback, type) { assert.equal(type, 'image/png'); queueMicrotask(() => callback(blob)) } }
    } },
    MediaRecorder: FakeRecorder, Blob, File, AbortController, Error, setTimeout, clearTimeout, queueMicrotask,
  }
  script.runInNewContext(sandbox)
  return { api: sandbox.fixture, track, stream, listeners, sandbox, get requests() { return requests }, get args() { return args }, get video() { return video }, get recorder() { return recorder }, get drawn() { return drawn } }
}

test('screenshot requests picker synchronously and returns PNG without audio', async () => {
  const f = setup(), c = f.api.createShareCapture()
  assert.equal(c.supported, true); assert.equal(c.canRecord, true)
  const pending = c.screenshot()
  assert.equal(f.requests, 1, 'picker invoked before screenshot returns')
  assert.equal(f.args.video, true); assert.equal(f.args.audio, false)
  assert.equal((await c.screenshot()).kind, 'busy')
  const result = await pending
  assert.equal(result.kind, 'success'); assert.equal(result.file.type, 'image/png')
  assert.equal(await result.file.text(), 'png'); assert.equal(f.drawn, true)
  assert.equal(f.track.stops, 1); assert.equal(f.video.srcObject, null); assert.equal(f.video.removed, true); assert.equal(f.listeners.size, 0)
})

for (const type of ['video/webm', 'video/mp4']) test(`records ${type} until timer and cleans tracks`, async () => {
  const f = setup({ format: type }), c = f.api.createShareCapture({ durationMs: 1 })
  const pending = c.record()
  assert.equal(f.requests, 1)
  const result = await pending
  assert.equal(result.kind, 'success'); assert.equal(result.file.type, type)
  assert.equal(await result.file.text(), 'movie'); assert.match(result.file.name, type.endsWith('mp4') ? /\.mp4$/ : /\.webm$/)
  assert.equal(f.track.stops, 1); assert.equal(f.recorder.state, 'inactive'); assert.equal(f.listeners.size, 0)
})

test('denial and unsupported APIs return honest errors', async () => {
  const denied = setup({ picker: () => Promise.reject(Object.assign(new Error(), { name: 'NotAllowedError' })) })
  assert.equal((await denied.api.createShareCapture().screenshot()).kind, 'denied')
  const missing = setup({ format: 'unsupported' })
  assert.equal(missing.api.createShareCapture().canRecord, false)
  assert.equal((await missing.api.createShareCapture().record()).kind, 'unsupported')
  assert.equal(missing.requests, 0)
  delete missing.sandbox.navigator.mediaDevices
  assert.equal((await missing.api.createShareCapture().screenshot()).kind, 'unsupported')
})

for (const source of ['browser', null]) for (const method of ['screenshot', 'record']) {
  test(`${method} accepts ${source === null ? 'unreported' : source} display surface selected by the user`, async () => {
    const f = setup({ source }), c = f.api.createShareCapture({ durationMs: 1 })
    if (source === null) f.track.getSettings = () => ({})
    const pending = c[method]()
    assert.equal(f.requests, 1, 'user gesture synchronously opens picker')
    assert.equal(f.args.audio, false)
    const result = await pending
    assert.equal(result.kind, 'success')
    assert.equal(result.file.type, method === 'screenshot' ? 'image/png' : 'video/webm')
    assert.equal(f.track.stops, 1)
  })
}

test('failed PNG encoding never returns a success and releases the stream', async () => {
  const f = setup({ blob: new Blob(['bad'], { type: 'image/jpeg' }) })
  assert.equal((await f.api.createShareCapture().screenshot()).kind, 'failed')
  assert.equal(f.track.stops, 1); assert.equal(f.video.srcObject, null)
})

test('system stopping sharing early cannot produce a successful recording', async () => {
  const f = setup(), c = f.api.createShareCapture({ durationMs: 10000 })
  const pending = c.record(); await tick(); f.track.end()
  assert.equal((await pending).kind, 'ended')
  assert.equal(f.track.stops, 1); assert.equal(f.listeners.size, 0)
})

test('cancel during recording stops tracks and dispose blocks future captures', async () => {
  const f = setup(), c = f.api.createShareCapture({ durationMs: 10000 })
  const pending = c.record(); await tick(); c.cancel()
  assert.equal((await pending).kind, 'cancelled'); await tick()
  assert.equal(f.track.stops, 1); assert.equal(f.recorder.state, 'inactive')
  c.dispose(); assert.equal(c.supported, false); assert.equal((await c.screenshot()).kind, 'cancelled')
})

test('dispose during pending picker returns promptly and stops a later grant', async () => {
  let grant
  const f = setup({ picker: () => new Promise(resolve => { grant = resolve }) }), c = f.api.createShareCapture()
  const pending = c.screenshot(); c.dispose()
  assert.equal((await pending).kind, 'cancelled')
  grant(f.stream); await tick()
  assert.equal(f.track.stops, 1); assert.equal(f.video, undefined); assert.equal(f.requests, 1)
})
