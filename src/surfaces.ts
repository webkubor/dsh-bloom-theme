import type { PALETTE } from './palette.js'
type Variant = keyof typeof PALETTE

/** Surface design is separate from accent palettes. A palette can opt into either
 * mode independently; an absent mode preserves its existing design. */
export type SurfaceMode = 'light' | 'dark'
interface SurfaceDesign {
  canvas: string
  sidebar: string
  card: string
  bubble: string
  panel: string
  panelHeader: string
  border: string
  cardBorder: string
  secondary: string
  muted: string
  selected: string
  selectedText: string
  code: string
  ambience: string
  cardShadow: string
  bubbleShadow: string
  focusShadow: string
  typingGradient: string
}

export const SURFACE_DESIGNS: Partial<Record<Variant, Partial<Record<SurfaceMode, SurfaceDesign>>>> = {
  ripple: {
    light: {
      canvas: '#fcfdfd', sidebar: '#eaf2f1', card: '#ffffff', bubble: '#e6f1ef',
      panel: '#eef3f3', panelHeader: '#e3ebeb', border: '#d6e1e1', cardBorder: '#b8cccc',
      secondary: '#4c6062', muted: '#5e7072', selected: '#d4e8e3', selectedText: '#244b47', code: '#e7eeee',
      ambience: 'radial-gradient(420px circle at 100% 0%, rgba(85,161,155,.065), transparent 70%), radial-gradient(300px circle at 0% 100%, rgba(85,161,155,.04), transparent 70%)',
      cardShadow: '0 2px 5px rgba(35,68,65,.04), 0 10px 28px -16px rgba(35,68,65,.16)',
      bubbleShadow: 'inset 0 0 0 1px #d3e4e0, 0 2px 5px rgba(35,68,65,.05)',
      focusShadow: '0 0 0 2px color-mix(in oklch, var(--bloom-accent) 12%, transparent), 0 8px 24px -16px rgba(35,68,65,.18)',
      typingGradient: 'linear-gradient(100deg, transparent, rgba(67,154,146,.07) 42%, rgba(67,154,146,.03) 58%, transparent)',
    },
  },
}

function modeSelector(variant: string, mode: SurfaceMode): string {
  return `body[data-bloom-variant="${variant}"]${mode === 'light' ? ':not([data-ds-dark-theme])' : '[data-ds-dark-theme]'}`
}

/** One renderer for every configured surface; no duplicated per-theme selectors. */
function renderSurface(scope: string, d: SurfaceDesign): string {
  return `
${scope} {
  --bloom-surface-canvas: ${d.canvas};
  --bloom-surface-sidebar: ${d.sidebar};
  --bloom-surface-card: ${d.card};
  --bloom-surface-bubble: ${d.bubble};
  --bloom-surface-panel: ${d.panel};
  --bloom-surface-panel-header: ${d.panelHeader};
  --bloom-surface-border: ${d.border};
  --bloom-surface-card-border: ${d.cardBorder};
  --bloom-surface-selected: ${d.selected};
  --bloom-surface-selected-text: ${d.selectedText};
  --bloom-surface-card-shadow: ${d.cardShadow};
  --bloom-surface-bubble-shadow: ${d.bubbleShadow};
  --bloom-surface-focus-shadow: ${d.focusShadow};
  --bloom-surface-typing-gradient: ${d.typingGradient};
  --dsw-alias-bg-base: var(--bloom-surface-canvas);
  --dsw-alias-bg-layer-1: var(--bloom-surface-canvas);
  --dsw-alias-bg-layer-2: var(--bloom-surface-panel);
  --dsw-specific-sidebar-fill: var(--bloom-surface-sidebar);
  --dsw-alias-label-secondary: ${d.secondary};
  --dsw-alias-label-tertiary: ${d.muted};
  --dsw-alias-label-dimmed: ${d.muted};
  --dsw-alias-label-caption: ${d.muted};
  --dsw-alias-border-l1: var(--bloom-surface-border);
  --dsw-alias-border-l2: var(--bloom-surface-card-border);
  --dsw-alias-markdown-code-block: var(--bloom-surface-panel);
  --dsw-alias-markdown-code-block-banner: var(--bloom-surface-panel-header);
  --bloom-code-bg: ${d.code};
  --bloom-ambience: ${d.ambience};
}
${scope} [class*="_sidebarCol"] {
  background-color: var(--bloom-surface-sidebar);
  background-image: none;
  box-shadow: inset -1px 0 var(--bloom-surface-border);
}
${scope} [class*="_sidebarCol"]::before,
${scope} div[class*="_composer"] div[class*="_card"]::before {
  background: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
${scope} [class*="_root"] [class*="_composerSeat"]::before {
  background-color: var(--bloom-surface-canvas);
  background-image: none;
}
${scope} div[class*="_composer"] div[class*="_card"] {
  background-color: var(--bloom-surface-card);
  border-color: var(--bloom-surface-card-border);
  box-shadow: var(--bloom-surface-card-shadow);
}
${scope} div[class*="_composer"] div[class*="_card"]:focus-within {
  border-color: var(--bloom-accent);
  box-shadow: var(--bloom-surface-focus-shadow);
}
${scope} div[class*="_composer"] div[class*="_card"]::after {
  background-image: var(--bloom-surface-typing-gradient);
}
${scope} div[class*="_bubble"] {
  background-color: var(--bloom-surface-bubble);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: var(--bloom-surface-bubble-shadow);
}
${scope} .md-code-block,
${scope} [data-turn-trigger] {
  background-color: var(--bloom-surface-panel);
  border-color: var(--bloom-surface-border);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
${scope} [data-disclosure-header] { background-color: var(--bloom-surface-panel-header); }
${scope} :is(textarea, input)::placeholder { color: var(--dsw-alias-label-tertiary); opacity: 1; }
${scope} [class*="_sidebarCol"] [aria-selected="true"],
${scope} .dsh-bloom-option[data-active="true"] {
  background-color: var(--bloom-surface-selected);
  color: var(--bloom-surface-selected-text);
}
`
}

export function buildSurfaceCSS(): string {
  return Object.entries(SURFACE_DESIGNS).flatMap(([variant, modes]) =>
    Object.entries(modes).map(([mode, design]) => renderSurface(modeSelector(variant, mode as SurfaceMode), design)),
  ).join('\n')
}
