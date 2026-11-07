/**
 * Ambience dimension: background light and particles, chosen separately per colour scheme.
 *
 * Dark schemes use starlight presets; light schemes use themed glass presets.
 * Both choices are persisted and written to <body> at once; CSS selects the one
 * matching the host's current scheme, so this module never observes theme changes.
 * See [LES-12] in docs/lessons.md.
 */
import { STORAGE_KEY } from './meta.js'

export type Scheme = 'dark' | 'light'
export const AMBIENCE_PRESETS = {
  dark: ['corner', 'diagonal', 'galaxy', 'off'],
  light: ['stream', 'wash', 'clear', 'off'],
} as const
export type AmbiencePreset<S extends Scheme = Scheme> = typeof AMBIENCE_PRESETS[S][number]

const DEFAULTS: Record<Scheme, string> = { dark: 'corner', light: 'stream' }
const SCHEMES: Scheme[] = ['dark', 'light']
const memory: Partial<Record<Scheme, { value: AmbiencePreset; pending: boolean; baseline: string | null | undefined }>> = {}

export const AMBIENCE_ATTRS: Record<Scheme, string> = {
  dark: 'data-bloom-ambience-dark',
  light: 'data-bloom-ambience-light',
}

const storageKey = (scheme: Scheme) => `${STORAGE_KEY}-ambience-${scheme}`

function isPreset(scheme: Scheme, value: string | null): value is AmbiencePreset {
  return value !== null && (AMBIENCE_PRESETS[scheme] as readonly string[]).includes(value)
}

export function readAmbience(scheme: Scheme): AmbiencePreset {
  try {
    const saved = localStorage.getItem(storageKey(scheme))
    const cached = memory[scheme]
    // A rejected write must not be overwritten by the unchanged old stored value.
    if (cached?.pending && cached.baseline !== undefined && cached.baseline === saved) return cached.value
    const value = (isPreset(scheme, saved) ? saved : DEFAULTS[scheme]) as AmbiencePreset
    memory[scheme] = { value, pending: false, baseline: undefined }
    return value
  } catch {
    return memory[scheme]?.value ?? DEFAULTS[scheme] as AmbiencePreset
  }
}

function apply(scheme: Scheme, preset: string): void {
  document.body?.setAttribute(AMBIENCE_ATTRS[scheme], preset)
}

export function writeAmbience(scheme: Scheme, preset: string): boolean {
  if (!isPreset(scheme, preset)) return false
  let baseline: string | null | undefined
  try { baseline = localStorage.getItem(storageKey(scheme)) } catch { /* private mode */ }
  try {
    localStorage.setItem(storageKey(scheme), preset)
    memory[scheme] = { value: preset, pending: false, baseline: undefined }
  } catch {
    memory[scheme] = { value: preset, pending: true, baseline }
  }
  apply(scheme, preset)
  return true
}

export function initAmbience(): void {
  for (const scheme of SCHEMES) apply(scheme, readAmbience(scheme))
}

export function clearAmbience(): void {
  for (const scheme of SCHEMES) document.body?.removeAttribute(AMBIENCE_ATTRS[scheme])
}
