import { liquidSurfaces } from './liquid.js'

const scope = (prefix: string, rules: string[]) => rules.map(r => `${prefix} ${r}`).join(',\n')
const SHELLS = ['header[class*="_header"]', '[class*="_sidebarCol"]', 'div[class*="_composer"] div[class*="_card"]']
const PANES = SHELLS.map(s => `${s}::before`)
const FLOATING = ['.dsh-bloom-menu', '.dsh-bloom-trigger', '[class*="_menu"]:not([class*="_menuAnchor"])', '[class*="_selector"]']
const CONTENT = ['div[class*="_bubble"]', 'div[class*="_dock"]:has(> [class*="_preview"])', '.md-code-block']
const DOCK_PANES = ['[class*="_composerSeat"] [class*="_dock"] > [class*="_bar"]::before', '[class*="_composerSeat"] [class*="_dock"] > [class*="_preview"]::before']
const SURFACES = [...PANES, ...FLOATING, ...CONTENT, ...DOCK_PANES]
const DECOR = ['body[data-bloom-variant="aurora"]::before', 'body[data-bloom-variant="aurora"]::after', 'body[data-bloom-variant="cinnabar"]::after', '.dsh-bloom-sparkles']
const ROOT = 'html body[data-bloom-variant]'
const ROOT_ALL = ROOT + ':is([data-bloom-glass],:not([data-bloom-glass])):is([data-ds-dark-theme],:not([data-ds-dark-theme]))'
const LIGHT = ':not([data-ds-dark-theme])'
const DARK = '[data-ds-dark-theme]'

function grain(dark: boolean): string {
  const svg = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 ${dark ? 1 : 0} 0 0 0 0 ${dark ? 1 : 0} 0 0 0 0 ${dark ? 1 : 0} 0 0 0 .05 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function diffuseSurfaces(s: string, matte: boolean, dark: boolean): string {
  const layer = String.raw`var(--dsw-alias-bg-layer-1, ${dark ? '#17202b' : '#fff'})`
  const blur = matte ? 'blur(12px) saturate(1.02)' : 'blur(24px) saturate(1.15)'
  const tint = matte ? '38%' : '58%'
  const edge = matte
    ? 'inset 0 1px 0 color-mix(in oklch, var(--dsw-alias-label-primary, #222) 7%, transparent), 0 4px 14px -10px rgba(0,0,0,.18)'
    : `inset 0 1px 0 rgba(255,255,255,${dark ? '.16' : '.62'}), 0 8px 24px -18px rgba(0,0,0,.2)`
  return `
${s} { --bloom-glass-blur: ${matte ? '12px' : '24px'}; }
${scope(s, SHELLS)} {
  position: relative;
  background: transparent;
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}
${scope(s, PANES)} {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border: 0;
  border-radius: inherit;
  pointer-events: none;
}
${scope(s, SURFACES)} {
  background-color: color-mix(in oklch, ${layer} ${tint}, transparent);
  background-image: ${matte ? grain(dark) : 'none'};
  background-repeat: repeat;
  backdrop-filter: ${blur};
  -webkit-backdrop-filter: ${blur};
  border-color: transparent;
  box-shadow: ${edge};
}
${scope(s, FLOATING)} {
  background-color: color-mix(in oklch, ${layer} ${matte ? '78%' : '86%'}, transparent);
}
${s} .dsh-bloom-menu { position: absolute; }
${s} [class*="_sidebarCol"]::before,
${s} header[class*="_header"]::before {
  /* #125: 同 liquid —— 面板贴边、圆角继承宿主，不再做悬空卡片。 */
  inset: 0;
  border-radius: inherit;
}
${s} header[class*="_header"]::before { bottom: 0; }
${s} header[class*="_header"] > div[class*="_tabs"] {
  background: transparent; border-color: transparent; box-shadow: none;
  backdrop-filter: none; -webkit-backdrop-filter: none;
}
${s} [class*="_centerCol"] { border-left-color: transparent; }
${s} [class*="_sidebarCol"] [class*="_root"]:has(> [class*="_regionArea"]),
${s} [class*="_sidebarCol"] :is([class*="_regionArea"], [class*="_listArea"], [class*="_treeBody"], [class*="_list"], [class*="_fade"]) { background: none; }
${s} [class*="_sidebarCol"] [class*="_footerActions"],
${s} .dsh-bloom-head { box-shadow: none; }
${s} div[class*="_composer"] div[class*="_card"]:hover,
${s} div[class*="_composer"] div[class*="_card"]:focus-within { border-color: transparent; box-shadow: none; }
${s} div[class*="_composer"] div[class*="_card"]:has(:focus-visible) {
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--bloom-accent) 42%, transparent);
}
`
}

// Solid is an accessibility fallback, never a user-selectable material.
const solidSurfaces = (s: string) => `
${scope(s, [...SURFACES, ...SHELLS])} {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background-image: none !important;
}
${scope(s, SHELLS)} { box-shadow: none !important; }
${scope(s, [...PANES, ...CONTENT, ...DOCK_PANES])} {
  background-color: var(--dsw-alias-bg-layer-1, #fff) !important;
  box-shadow: inset 0 0 0 1px var(--bloom-hairline), 0 1px 3px -1px rgba(0,0,0,.16) !important;
}
${scope(s, FLOATING)} {
  background-color: var(--dsw-alias-bg-layer-2, #fff) !important;
}
`

export const ADAPTIVE_CSS = `
${diffuseSurfaces(ROOT + '[data-bloom-glass="frosted"]' + LIGHT, false, false)}
${diffuseSurfaces(ROOT + '[data-bloom-glass="frosted"]' + DARK, false, true)}
${diffuseSurfaces(ROOT + '[data-bloom-glass="matte"]' + LIGHT, true, false)}
${diffuseSurfaces(ROOT + '[data-bloom-glass="matte"]' + DARK, true, true)}
@media not (prefers-contrast: more) {
${liquidSurfaces(ROOT + '[data-bloom-glass="liquid"]' + LIGHT)}
${liquidSurfaces(ROOT + '[data-bloom-glass="liquid"]' + DARK, true)}
}
@media (prefers-reduced-transparency: no-preference) and (not (prefers-contrast: more)) {
${liquidSurfaces(ROOT + ':not([data-bloom-glass])' + LIGHT)}
${liquidSurfaces(ROOT + ':not([data-bloom-glass])' + DARK, true)}
}
@media (prefers-reduced-transparency: reduce) {
${solidSurfaces(ROOT + ':not([data-bloom-glass]):is([data-ds-dark-theme],:not([data-ds-dark-theme]))')}
}
@media (prefers-contrast: more), (forced-colors: active) {
${solidSurfaces(ROOT_ALL)}
  ${ROOT_ALL} {
    --bloom-ambience: none;
    --bloom-fog-glaze: none;
    --bloom-fog-mask: none;
    --bloom-hairline: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 45%, transparent);
    --bloom-hairline-strong: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 65%, transparent);
    background-image: none !important;
  }
  html ${DECOR.join(',\n  html ')} { display: none !important; }
  html :focus-visible { outline-width: 3px !important; }
}
@media (forced-colors: active) {
  html body[data-bloom-typing="true"] div[class*="_composer"] div[class*="_card"]::after { display: none !important; }
  .dsh-bloom-option[data-active="true"],
  .dsh-bloom-appearance__btn[data-active="true"] { outline: 2px solid Highlight; outline-offset: -2px; }
  .dsh-bloom-check { color: Highlight; }
  .dsh-bloom-telemetry__box-ui { forced-color-adjust: none; background: Canvas; border: 1px solid ButtonText; }
  .dsh-bloom-telemetry__box-ui::after { forced-color-adjust: none; background: ButtonText; }
  .dsh-bloom-telemetry__box:checked + .dsh-bloom-telemetry__box-ui { background: Highlight; border-color: Highlight; }
  .dsh-bloom-telemetry__box:checked + .dsh-bloom-telemetry__box-ui::after { background: HighlightText; }
  .dsh-bloom-dot { forced-color-adjust: none; }
  html :focus-visible { outline-color: Highlight !important; }
}
html[data-input-modality="pointer"] body :focus-visible:not(:read-write) {
  --dsw-focus-ring-color: transparent !important;
}
@media (pointer: coarse) {
  .dsh-bloom-option, .dsh-bloom-appearance__btn, .dsh-bloom-dsh-btn,
  .dsh-bloom-foot__link, .dsh-bloom-rotation__select { min-height: 44px; }
}
body[data-bloom-variant] {
  accent-color: var(--bloom-accent);
  --dsh-scrollbar-thumb: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 70%);
  --dsh-scrollbar-thumb-hover: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 45%);
}
.dsh-bloom-menu { overscroll-behavior: contain; }
@media print {
  ${ROOT_ALL} { --bloom-ambience: none; --bloom-fog-glaze: none; --bloom-fog-mask: none; background: none !important; }
  html ${DECOR.join(',\n  html ')} { display: none !important; }
  ${scope(ROOT, SURFACES)} { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
  html .dsh-bloom-trigger, html .dsh-bloom-menu { display: none !important; }
}
`
