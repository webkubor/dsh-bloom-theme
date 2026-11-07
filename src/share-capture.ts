/** User-initiated, local-only display capture. Never starts capture at import. */
export type CaptureResult =
  | { kind: 'success'; file: File }
  | { kind: 'cancelled' | 'denied' | 'unsupported' | 'busy' | 'ended' | 'failed' }

type CaptureFailure = Exclude<CaptureResult, { kind: 'success' }>['kind']
class CaptureError extends Error {
  constructor(readonly kind: CaptureFailure) { super(kind) }
}

/** Every call to screenshot/record must happen directly in a trusted user gesture. */
export function createShareCapture(options: { durationMs?: number } = {}) {
  let disposed = false
  let active: AbortController | undefined
  const supported = () => !disposed && typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getDisplayMedia === 'function'
  const mimeType = () => {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return undefined
    return ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find(type => MediaRecorder.isTypeSupported(type))
  }
  const cancelled = () => new CaptureError('cancelled')

  function run(kind: 'screenshot' | 'record'): Promise<CaptureResult> {
    if (disposed) return Promise.resolve({ kind: 'cancelled' })
    if (active) return Promise.resolve({ kind: 'busy' })
    if (!supported() || (kind === 'record' && !mimeType())) return Promise.resolve({ kind: 'unsupported' })
    const controller = new AbortController()
    active = controller
    // Deliberately call synchronously, before any await or asynchronous callback.
    let picker: Promise<MediaStream>
    try {
      picker = navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
    } catch (error) {
      active = undefined
      return Promise.resolve({ kind: classify(error) })
    }
    const stopped = () => controller.signal.aborted
    const abortable = <T>(promise: Promise<T>): Promise<T> => new Promise((resolve, reject) => {
      if (stopped()) { reject(cancelled()); return }
      const onAbort = () => reject(cancelled())
      controller.signal.addEventListener('abort', onAbort, { once: true })
      promise.then(resolve, reject).finally(() => controller.signal.removeEventListener('abort', onAbort))
    })
    const work = async (): Promise<CaptureResult> => {
      let stream: MediaStream | undefined
      let video: HTMLVideoElement | undefined
      let recorder: MediaRecorder | undefined
      let timer: ReturnType<typeof setTimeout> | undefined
      let onEnded: (() => void) | undefined
      let onAbort: (() => void) | undefined
      try {
        // Do not race the picker: a late grant must be stopped even after dispose.
        stream = await picker
        if (stopped()) throw cancelled()
        const track = stream.getVideoTracks()[0]
        if (!track || track.readyState === 'ended') throw new CaptureError('ended')
        const ended = new Promise<never>((_, reject) => {
          onEnded = () => reject(new CaptureError('ended'))
          track.addEventListener('ended', onEnded, { once: true })
        })
        if (kind === 'screenshot') {
          video = document.createElement('video')
          video.muted = true
          video.playsInline = true
          video.srcObject = stream
          await abortable(Promise.race([video.play(), ended]))
          if (!video.videoWidth || !video.videoHeight) throw new CaptureError('failed')
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new CaptureError('failed')
          ctx.drawImage(video, 0, 0)
          const blob = await abortable(Promise.race([new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new CaptureError('failed')), 'image/png')), ended]))
          if (blob.type !== 'image/png' || !blob.size) throw new CaptureError('failed')
          return { kind: 'success', file: new File([blob], 'bloom-screenshot.png', { type: 'image/png' }) }
        }
        const type = mimeType()
        if (!type) throw new CaptureError('unsupported')
        recorder = new MediaRecorder(stream, { mimeType: type })
        const parts: Blob[] = []
        const result = new Promise<Blob>((resolve, reject) => {
          recorder!.ondataavailable = event => { if (event.data.size) parts.push(event.data) }
          recorder!.onerror = () => reject(new CaptureError('failed'))
          recorder!.onstop = () => resolve(new Blob(parts, { type: recorder!.mimeType || type }))
        })
        onAbort = () => { try { if (recorder && recorder.state !== 'inactive') recorder.stop() } catch {} }
        controller.signal.addEventListener('abort', onAbort, { once: true })
        recorder.start()
        timer = setTimeout(() => { if (recorder?.state === 'recording') recorder.stop() }, Math.max(0, options.durationMs ?? 5000))
        const blob = await abortable(Promise.race([result, ended]))
        if (!blob.size || !/^video\/(webm|mp4)(?:;|$)/i.test(blob.type)) throw new CaptureError('failed')
        const extension = blob.type.toLowerCase().startsWith('video/mp4') ? 'mp4' : 'webm'
        return { kind: 'success', file: new File([blob], `bloom-recording.${extension}`, { type: blob.type }) }
      } catch (error) {
        return { kind: stopped() ? 'cancelled' : classify(error) }
      } finally {
        if (timer !== undefined) clearTimeout(timer)
        if (onAbort) controller.signal.removeEventListener('abort', onAbort)
        if (onEnded && stream) stream.getVideoTracks()[0]?.removeEventListener('ended', onEnded)
        if (recorder) {
          recorder.ondataavailable = null; recorder.onerror = null; recorder.onstop = null
          if (recorder.state !== 'inactive') { try { recorder.stop() } catch {} }
        }
        if (video) { video.pause(); video.srcObject = null; video.remove() }
        stream?.getTracks().forEach(track => track.stop())
        if (active === controller) active = undefined
      }
    }
    // Return cancellation immediately, while work still cleans a later picker grant.
    return abortable(work()).catch(error => ({ kind: classify(error) }))
  }
  return {
    get supported() { return supported() },
    get canRecord() { return supported() && !!mimeType() },
    screenshot: () => run('screenshot'),
    record: () => run('record'),
    cancel: () => active?.abort(),
    dispose: () => { disposed = true; active?.abort() },
  }
}

function classify(error: unknown): CaptureFailure {
  if (error instanceof CaptureError) return error.kind
  if (error instanceof Error && error.name === 'NotAllowedError') return 'denied'
  if (error instanceof Error && error.name === 'AbortError') return 'cancelled'
  if (error instanceof Error && (error.name === 'NotSupportedError' || error.name === 'NotFoundError')) return 'unsupported'
  return 'failed'
}
