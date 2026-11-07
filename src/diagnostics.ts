/**
 * Diagnostic data collection for Bloom runtime and layout troubleshooting.
 * Gathers non-sensitive environment metrics and computed style samples for bug reports.
 */
import { PLUGIN_VERSION } from './meta.js'
import { readVariant } from './dom.js'
import { currentIsDark } from './appearance.js'
import { readGlassMode } from './glass.js'
import { AMBIENCE_PRESETS, readAmbience } from './ambience.js'
import { VARIANTS } from './palette.js'
import { readRotationMinutes } from './rotation.js'
import { tr } from './lang.js'

export interface BloomDiagnostics {
  timestamp: string
  bloom: {
    version: string
    variant: string
    appearance: 'light' | 'dark'
    glassMode: string
    ambience: { dark: string; light: string }
    rotationMinutes: number
    bodyDataset: Record<string, string>
    slots: {
      switcherAnchorMounted: boolean
      overlayMounted: boolean
    }
  }
  host: {
    platform: string
    userAgent: string
    devicePixelRatio: number
    viewport: { width: number; height: number } | null
    language: string
  }
  domAudit: {
    sidebar?: Record<string, string | boolean> | null
    header?: Record<string, string | boolean> | null
    plugins?: Record<string, string | boolean> | null
    body?: {
      backgroundColor?: string
      backgroundImage?: string
      color?: string
    } | null
  }
  tokens: Record<string, string>
}

/** Export only known Bloom values; even a known attribute may contain arbitrary host data. */
function safeBodyDataset(body: HTMLElement | null): Record<string, string> {
  const allowed: Record<string, readonly string[]> = {
    bloomVariant: VARIANTS,
    bloomGlass: ['frosted', 'matte', 'liquid', 'solid'],
    bloomAmbienceLight: AMBIENCE_PRESETS.light,
    bloomAmbienceDark: AMBIENCE_PRESETS.dark,
    bloomTyping: ['true', 'false'],
  }
  const result: Record<string, string> = {}
  for (const [key, values] of Object.entries(allowed)) {
    const value = body?.dataset[key]
    if (value !== undefined && values.includes(value)) result[key] = value
  }
  return result
}

/** Never export arbitrary custom properties or resource-bearing CSS values. */
function safeColor(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || /[\\"'?]/.test(trimmed) || /url|image-set|var\s*\(/i.test(trimmed)) return ''
  return typeof CSS !== 'undefined' && CSS.supports('color', trimmed) ? trimmed : ''
}

function safeBackgroundImage(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'none') return trimmed
  // A mixed gradient + URL is redacted in full; never truncate a URL into the report.
  if (/[\\"'?]/.test(trimmed) || /url|image-set|var\s*\(/i.test(trimmed)) return '[redacted]'
  if (!/^(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(trimmed)) return '[redacted]'
  return typeof CSS !== 'undefined' && CSS.supports('background-image', trimmed) ? trimmed : '[redacted]'
}

/** 采样关键 DOM 容器的计算样式，帮助排查行高撑大、背景截断等布局问题。 */
function sampleElement(selector: string, props: string[]): Record<string, string | boolean> | null {
  if (typeof document === 'undefined') return null
  try {
    const el = document.querySelector(selector)
    if (!el) return { found: false, selector }
    const cs = window.getComputedStyle(el)
    const sampled: Record<string, string | boolean> = { found: true, selector }
    for (const p of props) {
      const value = cs.getPropertyValue(p)
      sampled[p] = p.includes('color') ? safeColor(value) : value
    }
    return sampled
  } catch {
    return null
  }
}

export function collectDiagnostics(): BloomDiagnostics {
  const isDark = currentIsDark()
  const variant = readVariant()
  const body = typeof document !== 'undefined' ? document.body : null
  const bodyStyles = body && typeof window !== 'undefined' ? window.getComputedStyle(body) : null

  const sidebarAudit = sampleElement(
    '[role="treeitem"], div[class*="_workspace"] div[class*="_item"], div[class*="_sidebarCol"] div[class*="_groupSection"]',
    ['height', 'min-height', 'line-height', 'padding', 'margin', 'margin-top', 'display']
  )

  const headerAudit = sampleElement(
    'header[class*="_header"], div[class*="_header"]',
    ['height', 'background-color', 'overflow', 'contain']
  )

  const pluginsAudit = sampleElement(
    'div[class*="_plugin"], div[class*="_tabs"]',
    ['background-color', 'color']
  )

  const tokens: Record<string, string> = {}
  if (bodyStyles) {
    for (const key of ['--bloom-accent', '--bloom-morandi', '--dsw-alias-bg-layer-1', '--dsw-alias-label-primary']) {
      const val = safeColor(bodyStyles.getPropertyValue(key))
      if (val) tokens[key] = val
    }
  }

  return {
    timestamp: new Date().toISOString(),
    bloom: {
      version: PLUGIN_VERSION,
      variant,
      appearance: isDark ? 'dark' : 'light',
      glassMode: readGlassMode(),
      ambience: { dark: readAmbience('dark'), light: readAmbience('light') },
      rotationMinutes: readRotationMinutes(),
      bodyDataset: safeBodyDataset(body),
      slots: {
        switcherAnchorMounted: typeof document !== 'undefined' && !!document.querySelector('.dsh-bloom-slot[data-bloom-slot="switcher"]'),
        overlayMounted: typeof document !== 'undefined' && !!document.querySelector('.dsh-bloom-overlay[data-bloom-slot="decorations"]'),
      }
    },
    host: {
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      viewport: typeof window !== 'undefined' ? { width: window.innerWidth, height: window.innerHeight } : null,
      language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
    },
    domAudit: {
      sidebar: sidebarAudit,
      header: headerAudit,
      plugins: pluginsAudit,
      body: bodyStyles ? {
        backgroundColor: safeColor(bodyStyles.backgroundColor),
        backgroundImage: safeBackgroundImage(bodyStyles.backgroundImage),
        color: safeColor(bodyStyles.color),
      } : null
    },
    tokens
  }
}

export function formatDiagnosticsMarkdown(data?: BloomDiagnostics): string {
  const diag = data || collectDiagnostics()
  const summary = `Bloom v${diag.bloom.version} · ${diag.bloom.variant} · ${diag.bloom.appearance} · ${diag.host.platform}`

  return [
    `<details>`,
    `<summary>Bloom 诊断信息（${summary}）</summary>`,
    '',
    '```json',
    JSON.stringify(diag, null, 2),
    '```',
    '</details>'
  ].join('\n')
}

export async function copyDiagnostics(btn?: HTMLElement): Promise<boolean> {
  const text = formatDiagnosticsMarkdown()
  let ok = false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      ok = true
    }
  } catch {}

  if (!ok && typeof document !== 'undefined') {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try { ok = document.execCommand('copy') } catch {}
    ta.remove()
  }

  if (btn) {
    const slot = btn.querySelector('span') ?? btn
    const original = slot.textContent
    slot.textContent = ok ? tr('已复制') : tr('复制失败')
    setTimeout(() => { slot.textContent = original }, 1800)
  }

  return ok
}
