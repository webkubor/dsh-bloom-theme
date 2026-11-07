export const BACKGROUND_CSS = `
/* [LES-04][LES-10][LES-12][LES-17][LES-27] */
body[data-bloom-variant] {
  
  --bloom-ambience:
    
    radial-gradient(1200px circle at 8% -6%, color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 86%), transparent 48%),
    
    radial-gradient(1000px circle at 95% -4%, color-mix(in oklch, var(--bloom-aurora-stream-2), transparent 88%), transparent 45%);
  background-attachment: fixed;
  background-image: var(--bloom-ambience);
  
}




body[data-bloom-variant]:not([data-ds-dark-theme]) {
  /* [LES-33] */
  --bloom-companion-3: var(--bloom-motion-3, var(--bloom-accent));
  --bloom-tint-1: color-mix(in oklch, var(--bloom-motion-1, var(--bloom-accent)) 22%, #fff);
  --bloom-tint-2: color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent)) 18%, #fff);
  --bloom-tint-3: color-mix(in oklch, var(--bloom-companion-3) 18%, #fff);
  --bloom-veil: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,.05) 28%, rgba(255,255,255,.30) 58%, rgba(255,255,255,.72) 84%, #fff 100%);
  --bloom-fog-mask: url("#dsh-bloom-fog-stream");
  --bloom-fog-glaze: linear-gradient(rgba(255,255,255,.92), rgba(255,255,255,.92));
  --bloom-ambience:
    var(--bloom-veil),
    linear-gradient(125deg,
      var(--bloom-tint-1) 0%,
      var(--bloom-tint-2) 48%,
      var(--bloom-tint-3) 100%);
}
@supports (color: oklch(from red l c h)) {
  body[data-bloom-variant]:not([data-ds-dark-theme]) {
    --bloom-companion-3: color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 50%, oklch(from var(--bloom-motion-1, var(--bloom-accent)) l c calc(h + 150)));
  }
}
body[data-bloom-variant]:not([data-ds-dark-theme])[data-bloom-ambience-light="wash"] {
  --bloom-fog-mask: url("#dsh-bloom-fog-wash");
  --bloom-veil: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,.06) 30%, rgba(255,255,255,.34) 60%, rgba(255,255,255,.76) 86%, #fff 100%);
  --bloom-ambience:
    var(--bloom-veil),
    radial-gradient(96% 78% at 50% 6%, var(--bloom-tint-1), transparent 68%),
    radial-gradient(86% 70% at 6% 22%, var(--bloom-tint-2), transparent 70%),
    radial-gradient(86% 70% at 94% 26%, var(--bloom-tint-3), transparent 70%);
}

body[data-bloom-variant]:not([data-ds-dark-theme])[data-bloom-ambience-light="clear"] {
  --bloom-fog-mask: url("#dsh-bloom-fog-clear");
  --bloom-veil: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,.10) 34%, rgba(255,255,255,.46) 66%, #fff 100%);
  --bloom-ambience:
    var(--bloom-veil),
    linear-gradient(180deg, var(--bloom-tint-1) 0%, var(--bloom-tint-2) 16%, var(--bloom-tint-3) 32%, rgba(255,255,255,0) 62%);
}
body[data-bloom-variant]:not([data-ds-dark-theme])[data-bloom-ambience-light="off"],
body[data-bloom-variant][data-ds-dark-theme][data-bloom-ambience-dark="off"] { --bloom-ambience: none; --bloom-fog-mask: none; --bloom-fog-glaze: none; }


body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  
  background-image: var(--bloom-ambience);
}
body[data-bloom-variant]:not([data-ds-dark-theme]):not([data-bloom-ambience-light="off"])::after {
  content: '';
  display: block;
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: var(--bloom-fog-glaze);
  -webkit-mask-image: var(--bloom-fog-mask);
  mask-image: var(--bloom-fog-mask);
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

body[data-bloom-variant] [class*="_root"] [class*="_composerSeat"] {
  background-image: none;
}
body[data-bloom-variant] [class*="_root"] [class*="_composerSeat"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: var(--dsw-alias-bg-layer-1, #101010);
  background-image: none;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 56px);
  mask-image: linear-gradient(to bottom, transparent 0, #000 56px);
}


body[data-bloom-variant]:not([data-ds-dark-theme]) [class*="_root"] [class*="_composerSeat"]::before {
  background: rgba(255, 255, 255, .28);
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000);
  mask-image: linear-gradient(to bottom, transparent, #000);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
}
@media (prefers-contrast: more), (forced-colors: active) {
  html body[data-bloom-variant]:is([data-ds-dark-theme],:not([data-ds-dark-theme])) [class*="_root"] [class*="_composerSeat"]::before {
    background: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    -webkit-mask-image: none;
    mask-image: none;
  }
}
@media (prefers-reduced-transparency: reduce) {
  html body[data-bloom-variant]:not([data-bloom-glass]):is([data-ds-dark-theme],:not([data-ds-dark-theme])) [class*="_root"] [class*="_composerSeat"]::before {
    background: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    -webkit-mask-image: none;
    mask-image: none;
  }
}
body[data-bloom-variant="aurora"][data-ds-dark-theme]:not([data-bloom-ambience-dark="off"])::before {
  content: '';
  position: fixed;
  inset: -40%;
  z-index: -1;
  pointer-events: none;
  background-image:
    linear-gradient(115deg,
      transparent 38%, var(--bloom-aurora-stream-1) 50%, transparent 62%),
    linear-gradient(70deg,
      transparent 32%, var(--bloom-aurora-stream-2) 46%, transparent 60%);
  background-size: 220% 220%, 260% 240%;
  background-position: 25% 30%, 80% 15%;
  background-repeat: no-repeat;
  
  filter: blur(76px);
  opacity: 0.2;
  transform: translate3d(0, 0, 0);
  animation: bloom-aurora-drift 28s ease-in-out infinite alternate;
  will-change: transform, background-position;
}
@keyframes bloom-aurora-drift {
  from { transform: translate3d(-2.5%, -1.5%, 0); background-position: 25% 30%, 80% 15%, 50% 50%; }
  to   { transform: translate3d(3%, 2%, 0);      background-position: 65% 55%, 35% 45%, 55% 45%; }
}
@media (prefers-reduced-motion: reduce) {
  body[data-bloom-variant="aurora"][data-ds-dark-theme]:not([data-bloom-ambience-dark="off"])::before {
    animation: none !important;
    transform: none !important;
    opacity: 0.4 !important;
  }
}
body[data-bloom-variant="aurora"]::after,
body[data-bloom-variant="cinnabar"]::after {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  body[data-bloom-variant="aurora"]::after,
  body[data-bloom-variant="cinnabar"]::after { display: none; }
}



.dsh-bloom-sparkles {
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  width: 360px;
  height: 220px;
  z-index: 0;
  opacity: 0.7;
  overflow: hidden;
  pointer-events: none;
  background: none;
}
body[data-ds-dark-theme] .dsh-bloom-sparkles { display: block; }
body[data-ds-dark-theme][data-bloom-ambience-dark="off"] .dsh-bloom-sparkles { display: none; }
body[data-ds-dark-theme][data-bloom-ambience-dark="diagonal"] .dsh-bloom-sparkles,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles {
  width: 100vw;
  height: 100vh;
  -webkit-mask-image: radial-gradient(ellipse 62% 52% at 50% 52%, transparent 38%, black 86%);
  mask-image: radial-gradient(ellipse 62% 52% at 50% 52%, transparent 38%, black 86%);
}
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles {
  opacity: 1;
  -webkit-mask-image: radial-gradient(ellipse 56% 46% at 50% 54%, rgba(0, 0, 0, 0.25) 30%, black 80%);
  mask-image: radial-gradient(ellipse 56% 46% at 50% 54%, rgba(0, 0, 0, 0.25) 30%, black 80%);
}

.dsh-bloom-sparkles > b.s-met { display: none; }
@media (prefers-reduced-motion: no-preference) {
  body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > b.s-met { display: block; }
}
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > b.s-met {
  position: absolute;
  border-radius: 999px;
  opacity: 0;
  transform-origin: 0 50%;
  --c: var(--meteor-color, var(--bloom-motion-1, var(--bloom-accent, #6b8f71)));
  background: linear-gradient(90deg, #fff 0%, color-mix(in oklch, var(--c) 70%, #fff) 6%, color-mix(in oklch, var(--c), transparent 35%) 30%, transparent 100%);
  filter: drop-shadow(0 0 3px color-mix(in oklch, var(--c) 80%, #fff)) drop-shadow(0 0 10px var(--c));
  animation: bloom-meteor linear infinite;
  will-change: transform, opacity;
}
.dsh-bloom-sparkles > b.s-met.m2 { --c: var(--meteor-color, var(--bloom-motion-2, var(--bloom-accent, #6b8f71))); }
.dsh-bloom-sparkles > b.s-met.m3 { --c: var(--meteor-color, var(--bloom-motion-3, var(--bloom-accent, #6b8f71))); }

body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-amb.t,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-bl.t {
  background: color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent, #6b8f71)) 55%, #fff);
  box-shadow: 0 0 calc(var(--glow, 3px) * 1.6) var(--bloom-motion-2, var(--bloom-accent, #6b8f71));
}
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-amb:not(.t) {
  background: color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent, #6b8f71)) 45%, #fff);
  box-shadow: 0 0 calc(var(--glow, 3px) * 1.6) var(--bloom-motion-3, var(--bloom-accent, #6b8f71));
}
@keyframes bloom-meteor {
  0%   { transform: rotate(var(--rot)) translateX(0); opacity: 0; }
  2%   { opacity: var(--peak); }
  18%  { opacity: var(--peak); }
  24%  { transform: rotate(var(--rot)) translateX(calc(var(--travel) * -1)); opacity: 0; }
  100% { transform: rotate(var(--rot)) translateX(calc(var(--travel) * -1)); opacity: 0; }
}

.dsh-bloom-sparkles > i.s-bl,
.dsh-bloom-sparkles > i.s-amb,
.dsh-bloom-sparkles > i.s-galaxy-edge { display: none; }
body[data-ds-dark-theme][data-bloom-ambience-dark="diagonal"] .dsh-bloom-sparkles > i.s-bl,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-bl,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-amb,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-galaxy-edge { display: block; }
.dsh-bloom-sparkles > i {
  display: block;
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  background: #fff;
  box-shadow: 0 0 var(--glow, 3px) rgba(255, 255, 255, 0.7);
  animation-name: bloom-spark-drift, bloom-spark-twinkle;
  animation-timing-function: cubic-bezier(.25, .6, .35, 1), ease-in-out;
  animation-iteration-count: infinite, infinite;
  will-change: transform, opacity;
}
.dsh-bloom-sparkles > i.t {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 40%, #fff);
  box-shadow: 0 0 var(--glow, 3px) color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 15%);
}

@keyframes bloom-spark-drift {
  0%   { transform: translate(0, 0) scale(.3); }
  25%  { transform: translate(calc(var(--dx) * .35), calc(var(--dy) * .35)) scale(.9); }
  100% { transform: translate(var(--dx), var(--dy)) scale(1); }
}

@keyframes bloom-spark-twinkle {
  0%   { opacity: 0; }
  20%  { opacity: var(--peak); }
  35%  { opacity: calc(var(--peak) * .3); }
  55%  { opacity: var(--peak); }
  75%  { opacity: calc(var(--peak) * .15); }
  100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-sparkles > i { animation: none; opacity: .4; }
}
`
