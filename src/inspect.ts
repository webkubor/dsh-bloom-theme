import { PLUGIN_VERSION } from './meta.js'
import { readGlassMode } from './glass.js'
import { readAmbience } from './ambience.js'
import { readRotationMinutes } from './rotation.js'
import { hasThemeSupport, readStoredMode } from './appearance.js'

const SURFACES = {
  sidebar: '[class*="_sidebarCol"]',
  header: 'header[class*="_header"]',
  composer: 'div[class*="_composer"] div[class*="_card"]',
  composerSeat: '[class*="_composerSeat"]',
  composerDock: '[class*="_composerSeat"] [class*="_dock"] > [class*="_bar"]',
  sendButton: 'div[class*="_composer"] button[class*="_primary"]',
  menu: '.dsh-bloom-menu',
}
const STYLES = ['position', 'background-color', 'background-image', 'backdrop-filter', 'border-top-width', 'border-top-color', 'box-shadow', 'outline-style', 'outline-width', 'outline-color', 'animation-name', 'opacity', 'overflow-x', 'mask-image']
const SCOPES = ['summary', 'tables', 'surfaces', 'canvas', 'all']
const PAGE_ID = globalThis.crypto?.randomUUID?.() ?? `bloom-${Date.now()}-${Math.random().toString(36).slice(2)}`

function rect(element: Element | null) {
  if (!element) return null
  const r = element.getBoundingClientRect()
  return Object.fromEntries(['x', 'y', 'width', 'height', 'right', 'bottom'].map(key => [key, Math.round(r[key] * 100) / 100]))
}
function safeCSS(value: string): string {
  return value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g, (_match, _quote, resource: string) => {
    const fragment = resource.match(/#(dsh-bloom-[a-z0-9-]+)$/i)
    return fragment ? `url("#${fragment[1]}")` : 'url("[resource]")'
  })
}
function styles(element: Element, pseudo?: string) {
  const cs = getComputedStyle(element, pseudo)
  return Object.fromEntries(STYLES.map(key => [key, safeCSS(cs.getPropertyValue(key))]))
}
function backgroundCascade(element: Element | null) {
  if (!element) return []
  const found: Array<{ sheet: number; selector: string; declarations: Array<{ property: string; value: string; priority: string }> }> = []
  function visit(rules: CSSRuleList, sheet: number) {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        let matches = false
        try { matches = element!.matches(rule.selectorText) } catch {}
        if (!matches) continue
        const declarations = ['background', 'background-color', 'background-image'].map(property => ({ property, value: safeCSS(rule.style.getPropertyValue(property)).slice(0, 400), priority: rule.style.getPropertyPriority(property) })).filter(item => item.value)
        if (declarations.length) found.push({ sheet, selector: rule.selectorText.includes('_sidebarCol') ? 'sidebar-specific' : 'generic', declarations })
      } else if (rule instanceof CSSMediaRule) {
        if (matchMedia(rule.conditionText).matches) visit(rule.cssRules, sheet)
      } else if (rule instanceof CSSSupportsRule) {
        if (CSS.supports(rule.conditionText)) visit(rule.cssRules, sheet)
      } else if ('cssRules' in rule) {
        visit((rule as CSSGroupingRule).cssRules, sheet)
      }
    }
  }
  Array.from(document.styleSheets).forEach((sheet, i) => { try { visit(sheet.cssRules, i) } catch {} })
  const important = found.filter(rule => rule.declarations.some(item => item.priority === 'important'))
  return [...important, ...found.filter(rule => !rule.declarations.some(item => item.priority === 'important')).slice(-20)].slice(-40)
}
function scrollerFor(element: Element): HTMLElement | null {
  let parent = element.parentElement
  while (parent && parent !== document.body) {
    const cs = getComputedStyle(parent)
    if (['auto', 'scroll'].includes(cs.overflowX) && parent.scrollWidth > parent.clientWidth + 1) return parent
    parent = parent.parentElement
  }
  return null
}
function tableMetrics(table: HTMLTableElement, index: number) {
  const scroller = scrollerFor(table)
  const row = table.rows[1] || table.rows[0]
  const lastCell = row?.cells[row.cells.length - 1]
  const range = lastCell ? document.createRange() : null
  if (range && lastCell) range.selectNodeContents(lastCell)
  const content = range?.getBoundingClientRect()
  const bounds = scroller?.getBoundingClientRect()
  const maxScroll = scroller ? scroller.scrollWidth - scroller.clientWidth : 0
  return {
    index, rows: table.rows.length, columns: row?.cells.length ?? 0,
    rect: rect(table), hasWideContainer: !!table.closest('.md-table-wide'),
    scroller: scroller ? {
      rect: rect(scroller), clientWidth: scroller.clientWidth, scrollWidth: scroller.scrollWidth,
      scrollLeft: scroller.scrollLeft, maxScrollLeft: maxScroll,
      atRightEdge: scroller.scrollLeft >= maxScroll - 1,
    } : null,
    lastCell: lastCell ? { rect: rect(lastCell), clientWidth: lastCell.clientWidth, scrollWidth: lastCell.scrollWidth, styles: styles(lastCell) } : null,
    lastContentRect: content ? { left: content.left, right: content.right, width: content.width } : null,
    lastContentWithinScroller: content && bounds ? content.left >= bounds.left - 1 && content.right <= bounds.right + 1 : null,
  }
}

export function collectRuntimeSnapshot(scope = 'summary', cascade = false) {
  const body = document.body
  const composer = document.querySelector(SURFACES.composer)
  const editor = composer?.querySelector<HTMLTextAreaElement | HTMLElement>('textarea, [contenteditable="true"]')
  const draft = editor instanceof HTMLTextAreaElement ? editor.value : editor?.textContent ?? ''
  const result: Record<string, unknown> = {
    page: { id: PAGE_ID, origin: location.origin, pathname: location.pathname, visibility: document.visibilityState, focused: document.hasFocus() },
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio, documentScrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: body?.scrollWidth ?? 0 },
    bloom: {
      version: PLUGIN_VERSION, variant: body?.dataset.bloomVariant ?? null,
      appearance: body?.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light',
      appearancePreference: readStoredMode(), appearanceSource: hasThemeSupport() ? 'host' : 'legacy',
      glass: readGlassMode(), rotationMinutes: readRotationMinutes(), ambience: { light: readAmbience('light'), dark: readAmbience('dark') },
      typing: body?.dataset.bloomTyping === 'true',
      menuOpen: !!document.querySelector<HTMLElement>('.dsh-bloom-menu:not([hidden])'),
      lensPresent: !!document.getElementById('dsh-bloom-liquid-lens'),
      fogPresent: ['stream', 'wash', 'clear'].every(id => !!document.getElementById(`dsh-bloom-fog-${id}`)),
      captureCapabilities: {
        secureContext: globalThis.isSecureContext === true,
        displayMedia: typeof navigator.mediaDevices?.getDisplayMedia === 'function',
        mediaRecorder: typeof globalThis.MediaRecorder === 'function',
        fileShare: typeof navigator.share === 'function' && typeof navigator.canShare === 'function',
        clipboardText: typeof navigator.clipboard?.writeText === 'function',
      },
    },
    input: { found: !!editor, rect: rect(editor ?? null), empty: draft.trim().length === 0, length: draft.length, knownTestDraft: draft === 'BLOOM UI TEST', focused: !!editor && (document.activeElement === editor || editor.contains(document.activeElement)), typingAnimation: composer ? getComputedStyle(composer, '::after').animationName : null },
  }
  if (scope === 'canvas') {
    const seat = document.querySelector(SURFACES.composerSeat)
    const chain: Array<Record<string, unknown>> = []
    for (let element: Element | null = seat; element && chain.length < 16; element = element.parentElement) {
      const style = getComputedStyle(element)
      const known = ['composerSeat', 'scrollBody', 'centerCol', 'frame', 'root', 'body'].filter(name => element!.className && typeof element!.className === 'string' && element!.className.includes(`_${name}`))
      chain.push({ tag: element.tagName.toLowerCase(), kind: known, rect: rect(element), color: style.backgroundColor, image: safeCSS(style.backgroundImage), attachment: style.backgroundAttachment, position: style.position, zIndex: style.zIndex, opacity: style.opacity, transform: style.transform, isolation: style.isolation })
    }
    const state = (element: Element | null) => element ? { rect: rect(element), ...styles(element) } : null
    result.canvas = { chain, html: state(document.documentElement), body: state(body), bodyCascade: cascade ? backgroundCascade(body) : undefined, seatBefore: seat ? styles(seat, '::before') : null }
  }
  if (scope === 'tables' || scope === 'all') {
    const tables = Array.from(document.querySelectorAll('table'))
    result.tables = tables.slice(0, 24).map(tableMetrics)
    result.tableCount = tables.length
    result.tablesTruncated = tables.length > 24
  }
  if (scope === 'surfaces' || scope === 'all') {
    result.background = body ? { before: styles(body, '::before'), after: styles(body, '::after') } : { before: null, after: null }
    if (cascade) result.sidebarCascade = backgroundCascade(document.querySelector(SURFACES.sidebar))
    result.surfaces = Object.fromEntries(Object.entries(SURFACES).map(([key, selector]) => {
      const element = document.querySelector(selector)
      const inline = element instanceof HTMLElement ? Object.fromEntries(['background','background-color','background-image'].map(name => [name, { value: safeCSS(element.style.getPropertyValue(name)), priority: element.style.getPropertyPriority(name) }])) : null
      return [key, element ? { rect: rect(element), element: styles(element), before: styles(element, '::before'), after: styles(element, '::after'), inline } : null]
    }))
    result.glassSummary = Object.fromEntries(Object.entries(SURFACES).map(([key, selector]) => {
      const element = document.querySelector(selector)
      if (!element) return [key, null]
      const host = getComputedStyle(element)
      const before = getComputedStyle(element, '::before')
      const bounds = element.getBoundingClientRect()
      return [key, {
        filter: host.backdropFilter || 'none', fill: host.backgroundColor,
        hostBackgroundImage: host.backgroundImage === 'none' ? 'none' : 'image',
        beforeFilter: before.backdropFilter || 'none', beforeFill: before.backgroundColor,
        beforeImage: before.backgroundImage === 'none' ? 'none' : 'image',
        radius: before.borderTopLeftRadius, size: [Math.round(bounds.width), Math.round(bounds.height)],
      }]
    }))
  }
  return result
}

export function createBloomInspectProvider() {
  return {
    manifest: {
      id: 'BloomDiagnostics',
      description: 'Read-only Bloom runtime state and layout metrics; no message content, draft content, URLs with query strings, or mutations.',
      methods: [{
        name: 'snapshot',
        description: 'Read current theme, viewport, input-state lengths, and optional table or surface geometry. Desktop target rejects other origins; verify the returned page identity.',
        inputSchema: {
          type: 'object', properties: {
            target: { type: 'string', enum: ['desktop', 'any'] },
            scope: { type: 'string', enum: SCOPES },
            pageId: { type: 'string', description: 'Optional diagnostic page id returned by a previous snapshot.' },
            foreground: { type: 'boolean', description: 'Require a visible, focused page when identifying the current window.' },
            editorLeft: { type: 'number', description: 'Optional native editor x coordinate relative to the selected window.' },
            editorWidth: { type: 'number', description: 'Optional native editor width for distinguishing pages.' },
            cascade: { type: 'boolean', description: 'Include sanitized sidebar or body background cascade for the selected diagnostic scope.' },
          }, additionalProperties: false,
        },
        outputSchema: {
          type: 'object', required: ['page', 'viewport', 'bloom', 'input'],
          properties: { page: { type: 'object' }, viewport: { type: 'object' }, bloom: { type: 'object' }, input: { type: 'object' }, tables: { type: 'array', items: { type: 'object' } }, tableCount: { type: 'integer' }, tablesTruncated: { type: 'boolean' }, surfaces: { type: 'object' }, canvas: { type: 'object' }, background: { type: 'object' }, glassSummary: { type: 'object' }, sidebarCascade: { type: 'array', items: { type: 'object' } } },
          additionalProperties: false,
        },
      }],
    },
    query(method: string, input?: { target?: string; scope?: string; pageId?: string; foreground?: boolean; editorLeft?: number; editorWidth?: number; cascade?: boolean }, context?: { signal?: AbortSignal }) {
      if (method !== 'snapshot') throw new Error('Unknown Bloom diagnostics method')
      if (context?.signal?.aborted) throw new Error('Bloom diagnostics query cancelled')
      const target = input?.target ?? 'desktop'
      const scope = input?.scope ?? 'summary'
      if (!['desktop', 'any'].includes(target) || !SCOPES.includes(scope)) throw new Error('Invalid Bloom diagnostics options')
      if (target === 'desktop' && location.origin !== 'dsh-app://app') throw new Error('This page is not the requested desktop origin')
      if (input?.pageId && input.pageId !== PAGE_ID) throw new Error('This is a different diagnostic page')
      if (input?.foreground && (document.visibilityState !== 'visible' || !document.hasFocus())) throw new Error('This page is not in the foreground')
      if (input?.editorLeft !== undefined || input?.editorWidth !== undefined) {
        const editor = document.querySelector(SURFACES.composer)?.querySelector('textarea, [contenteditable="true"]')
        if (!editor) throw new Error('This page has no matching editor')
        const bounds = editor.getBoundingClientRect()
        if ((input.editorLeft !== undefined && Math.abs(bounds.x - input.editorLeft) > 8) ||
            (input.editorWidth !== undefined && Math.abs(bounds.width - input.editorWidth) > 8)) {
          throw new Error('This is a different editor geometry')
        }
      }
      return collectRuntimeSnapshot(scope, input?.cascade === true)
    },
  }
}

export function bindBloomInspect(ctx) {
  if (typeof ctx?.inject !== 'function') return
  ctx.inject(['cordisInspect'], scope => {
    if (typeof scope.cordisInspect?.register !== 'function') return
    scope.effect(() => scope.cordisInspect.register(createBloomInspectProvider()), 'dsh-bloom-theme: read-only diagnostics')
  })
}
