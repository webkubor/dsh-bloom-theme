/** Anonymous UI counters. Never inspect conversation text or send credentials. */
import { getLang } from './lang.js'

const ENDPOINT = 'https://api.webkubor.online/v1/analytics/events'
const OPT_OUT_KEY = 'bloom-telemetry'
const EVENTS = ['vote', 'feedback', 'share', 'changelog', 'version-open', 'diagnose'] as const
export type PanelEvent = typeof EVENTS[number]
let sessionEnabled: boolean | undefined

export function telemetryEnabled(): boolean {
  if (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return false
  if (sessionEnabled !== undefined) return sessionEnabled
  try { return localStorage.getItem(OPT_OUT_KEY) !== 'off' } catch { return false }
}

/** In-memory preference takes effect even if storage is denied or full. */
export function setTelemetryEnabled(enabled: boolean): void {
  sessionEnabled = enabled
  try { localStorage.setItem(OPT_OUT_KEY, enabled ? 'on' : 'off') } catch { /* session choice survives */ }
}

export function track(event: PanelEvent): void {
  if (!(EVENTS as readonly string[]).includes(event) || !telemetryEnabled()) return
  try {
    const body = JSON.stringify({ project: 'bloom', event_id: crypto.randomUUID(), event, properties: { lang: getLang() } })
    void fetch(ENDPOINT, {
      method: 'POST', body, keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer',
      headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(5000),
    }).catch(() => {})
  } catch { /* counters must never prevent a UI action */ }
}
