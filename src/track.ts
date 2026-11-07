/** Anonymous UI counters. Never inspect conversation text or send credentials. */
import { PLUGIN_VERSION } from './meta.js'
import { getLang } from './lang.js'

const ENDPOINT = 'https://www.webkubor.online/api/event'
const OPT_OUT_KEY = 'bloom-telemetry'
const EVENTS = ['vote', 'feedback', 'share', 'changelog', 'version-open', 'diagnose'] as const
export type PanelEvent = typeof EVENTS[number]
let sessionEnabled: boolean | undefined

export function telemetryEnabled(): boolean {
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
    const body = JSON.stringify({ project: 'bloom', event, params: { v: PLUGIN_VERSION, lang: getLang() } })
    // sendBeacon cannot specify credentials; keepalive fetch can.
    void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, mode: 'no-cors', credentials: 'omit' }).catch(() => {})
  } catch { /* counters must never prevent a UI action */ }
}
