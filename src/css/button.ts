export const BUTTON_CSS = `
/* [LES-35] 仅输入框 trailing 内的发送/停止键是圆珠；审批卡也在 composer 内，不能命中它的文字主按钮。 */
body[data-bloom-variant]:not([data-ds-dark-theme]) div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"] {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  padding: 0;
  color: color-mix(in oklch, var(--bloom-accent, #666) 70%, #7b7b7b);
  background-color: transparent;
  background-image:
    radial-gradient(ellipse at 28% 13%, rgba(255,255,255,.98), rgba(255,255,255,.45) 28%, transparent 54%),
    radial-gradient(ellipse at 79% 82%, color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 20%, transparent), transparent 64%),
    linear-gradient(145deg, color-mix(in oklch, var(--bloom-motion-1, var(--bloom-accent)) 7%, rgba(255,255,255,.92)), color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent)) 14%, rgba(255,255,255,.78)));
  -webkit-backdrop-filter: blur(2px) url("#dsh-bloom-liquid-lens") saturate(1.15);
  backdrop-filter: blur(2px) url("#dsh-bloom-liquid-lens") saturate(1.15);
  box-shadow: inset 0 1px 2px rgba(255,255,255,.98), inset 0 -2px 3px color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent)) 18%, transparent), 0 7px 14px -6px color-mix(in oklch, var(--bloom-motion-1, var(--bloom-accent)) 26%, transparent), 0 2px 4px rgba(50,50,50,.10);
}
body[data-bloom-variant]:not([data-ds-dark-theme]) div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"]:not(:disabled):hover {
  background-image:
    radial-gradient(ellipse at 28% 13%, rgba(255,255,255,1), rgba(255,255,255,.56) 28%, transparent 54%),
    radial-gradient(ellipse at 79% 82%, color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 25%, transparent), transparent 64%),
    linear-gradient(145deg, color-mix(in oklch, var(--bloom-motion-1, var(--bloom-accent)) 8%, rgba(255,255,255,.95)), color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent)) 16%, rgba(255,255,255,.84)));
}
body[data-bloom-variant][data-ds-dark-theme] div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"] {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  padding: 0;
  color: var(--dsw-alias-label-primary, #eee);
  background-color: transparent;
  background-image:
    radial-gradient(ellipse at 28% 17%, rgba(255,255,255,.26), transparent 62%),
    radial-gradient(ellipse at 79% 82%, color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 16%, transparent), transparent 64%),
    linear-gradient(145deg, color-mix(in oklch, var(--dsw-alias-bg-layer-2, #343943) 88%, var(--bloom-motion-1)), color-mix(in oklch, var(--dsw-alias-bg-layer-1, #1b2028) 90%, var(--bloom-motion-2)));
  -webkit-backdrop-filter: blur(2px) url("#dsh-bloom-liquid-lens") saturate(1.15);
  backdrop-filter: blur(2px) url("#dsh-bloom-liquid-lens") saturate(1.15);
  box-shadow: inset 0 1px 1px rgba(255,255,255,.34), inset 0 -2px 3px rgba(0,0,0,.28), 0 6px 12px -6px rgba(0,0,0,.35);
}
body[data-bloom-variant][data-ds-dark-theme] div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"]:not(:disabled):hover {
  background-image:
    radial-gradient(ellipse at 28% 17%, rgba(255,255,255,.34), transparent 62%),
    radial-gradient(ellipse at 79% 82%, color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 22%, transparent), transparent 64%),
    linear-gradient(145deg, color-mix(in oklch, var(--dsw-alias-bg-layer-2, #343943) 84%, var(--bloom-motion-1)), color-mix(in oklch, var(--dsw-alias-bg-layer-1, #1b2028) 86%, var(--bloom-motion-2)));
}
@supports ((mask-composite: exclude) or (-webkit-mask-composite: xor)) {
  body[data-bloom-variant] div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"] { position: relative; }
  body[data-bloom-variant] div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"]::before {
    content: '';
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    border-radius: inherit;
    padding: 1px;
    pointer-events: none;
    background: conic-gradient(from -40deg, rgba(255,255,255,.88), color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent)) 22%, rgba(255,255,255,.50)), rgba(255,255,255,.16), color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 24%, rgba(255,255,255,.35)), rgba(255,255,255,.88));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
  }
}
body[data-bloom-variant] div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"]:disabled:not([data-sending]) { opacity: .68; }
@media (prefers-reduced-transparency: reduce) {
  html body[data-bloom-variant]:not([data-bloom-glass]) div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"]::before { display: none; }
  html body[data-bloom-variant]:not([data-bloom-glass]) div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"] {
    background: var(--dsw-alias-bg-layer-1, #fff);
    color: var(--dsw-alias-label-primary, #222);
    border: 1px solid currentColor;
    box-shadow: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
@media (prefers-contrast: more), (forced-colors: active) {
  html body[data-bloom-variant]:is([data-ds-dark-theme],:not([data-ds-dark-theme])) div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"]::before { display: none; }
  html body[data-bloom-variant]:is([data-ds-dark-theme],:not([data-ds-dark-theme])) div[class*="_composer"] div[class*="_trailing"] button[class*="_primary"] {
    background: var(--dsw-alias-bg-layer-1, Canvas);
    color: var(--dsw-alias-label-primary, CanvasText);
    border: 1px solid currentColor;
    box-shadow: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
`
