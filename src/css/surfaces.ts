/** One material recipe for the four content-bearing shell surfaces. */
const ROOT = 'html body[data-bloom-variant]:is([data-bloom-glass],:not([data-bloom-glass])):is([data-ds-dark-theme],:not([data-ds-dark-theme]))'
const HOSTS = [
  '[class*="_sidebarCol"]',
  'header[class*="_header"]',
  'div[class*="_composer"] div[class*="_card"]',
  '[class*="_composerSeat"] [class*="_dock"] > [class*="_bar"]',
]
const scope = (suffix = '') => HOSTS.map(selector => `${ROOT} ${selector}${suffix}`).join(',\n')
const grain = (light: boolean) => {
  const color = light ? '0' : '1'
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 ' + color + ' 0 0 0 0 ' + color + ' 0 0 0 0 ' + color + ' 0 0 0 .05 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>'
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'
}

export const SURFACES_CSS = `
${ROOT} {
  --bloom-surface-filter: blur(3px) url("#dsh-bloom-liquid-lens") saturate(1.2);
  --bloom-surface-fill: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 25%, transparent);
  --bloom-surface-edge: inset 0 0 0 1px color-mix(in oklch, var(--dsw-alias-label-primary, #222) 12%, transparent);
  --bloom-surface-image: radial-gradient(120% 85% at 12% -28%, rgba(255,255,255,.28), transparent 65%), linear-gradient(150deg, rgba(255,255,255,.10), transparent 32%, transparent 75%, rgba(255,255,255,.06));
}
${ROOT}[data-ds-dark-theme] {
  --bloom-surface-image: radial-gradient(120% 85% at 12% -28%, rgba(255,255,255,.16), transparent 65%), linear-gradient(150deg, rgba(255,255,255,.06), transparent 32%, transparent 75%, rgba(255,255,255,.04));
}
${ROOT}[data-bloom-glass="frosted"] {
  --bloom-surface-filter: blur(24px) saturate(1.15);
  --bloom-surface-fill: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 58%, transparent);
  --bloom-surface-edge: inset 0 0 0 1px color-mix(in oklch, var(--dsw-alias-label-primary, #222) 16%, transparent);
  --bloom-surface-image: none;
}
${ROOT}[data-bloom-glass="matte"] {
  --bloom-surface-filter: blur(12px) saturate(1.02);
  --bloom-surface-fill: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 48%, transparent);
  --bloom-surface-edge: inset 0 0 0 1px color-mix(in oklch, var(--dsw-alias-label-primary, #222) 8%, transparent);
  --bloom-surface-image: ${grain(true)};
}
${ROOT}[data-bloom-glass="matte"][data-ds-dark-theme] { --bloom-surface-image: ${grain(false)}; }
${scope()} {
  position: relative;
  z-index: 0;
  background: transparent;
  background-image: none;
  border-color: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
${scope('::before')} {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border: 0;
  border-radius: inherit;
  background-color: var(--bloom-surface-fill);
  background-image: var(--bloom-surface-image);
  box-shadow: var(--bloom-surface-edge);
  backdrop-filter: var(--bloom-surface-filter);
  -webkit-backdrop-filter: var(--bloom-surface-filter);
}
${scope(':hover')},
${scope(':focus-within')} { border-color: transparent; box-shadow: none; }
${ROOT} div[class*="_bubble"] { backdrop-filter: none; -webkit-backdrop-filter: none; }
/* [LES-36] */
${scope()} {
  background-color: transparent;
  background-image: none;
}
${ROOT} [class*="_sidebarCol"],
${ROOT} [class*="_composerSeat"] {
  border-right-color: transparent;
  border-left-color: transparent;
}
/* [LES-36] */
html body[data-bloom-variant][data-ds-dark-theme] [class*="_frame"]:not([data-sidebar-drawer]) [class*="_sidebarCol"] {
  background: transparent;
}
@media (prefers-reduced-transparency: reduce) {
  ${ROOT}:not([data-bloom-glass]) {
    --bloom-surface-filter: none;
    --bloom-surface-fill: var(--dsw-alias-bg-layer-1, #fff);
    --bloom-surface-image: none;
  }
}
@media (prefers-contrast: more), (forced-colors: active), print {
  ${ROOT}:is([data-bloom-glass],:not([data-bloom-glass])):is([data-ds-dark-theme],:not([data-ds-dark-theme])) {
    --bloom-surface-filter: none;
    --bloom-surface-fill: var(--dsw-alias-bg-layer-1, #fff);
    --bloom-surface-image: none;
  }
}
`
