<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/banner.svg" alt="Bloom for DSH" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@kubor/dsh-bloom-theme"><img src="https://img.shields.io/npm/v/@kubor/dsh-bloom-theme?style=flat-square&color=A873C4&logo=npm" alt="npm" /></a>
  <a href="https://www.npmjs.com/package/@kubor/dsh-bloom-theme"><img src="https://img.shields.io/npm/dm/@kubor/dsh-bloom-theme?style=flat-square&color=92a8b3" alt="downloads" /></a>
  <img src="https://img.shields.io/github/stars/webkubor/dsh-bloom-theme?style=flat-square&color=cc584d" alt="Stars" />
  <img src="https://img.shields.io/github/license/webkubor/dsh-bloom-theme?style=flat-square&color=5fa8b2" alt="License" />
</p>

<p align="center">
  <a href="https://github.com/deepseek-ai/deepseek-harness"><img src="https://img.shields.io/badge/DeepSeek_Harness-Plugin-4d6bfe?style=flat-square" alt="DSH Plugin" /></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/topic-dsh--plugin-4d6bfe?style=flat-square" alt="dsh-plugin" /></a>
  <img src="https://img.shields.io/badge/WCAG-AA-6a9955?style=flat-square" alt="WCAG AA" />
  <img src="https://img.shields.io/badge/OKLCH-color-A873C4?style=flat-square" alt="OKLCH" />
  <img src="https://img.shields.io/badge/dependencies-0-92a8b3?style=flat-square" alt="zero dependency" />
</p>

<p align="center">
  <a href="README.md">中文</a> | <b>English</b>
</p>

<p align="center">
  Bringing the Morandi feel of <a href="https://github.com/webkubor/typora-Bloom-theme">Bloom</a> (a 90★ Typora theme)
  to <a href="https://github.com/deepseek-ai/deepseek-harness">DeepSeek Harness</a>.
  <br />
  Four palettes, light &amp; dark, one-click switching from the top bar.
</p>

## What Bloom is

Bloom started as a Typora theme. Its point was never "swap the colors" — it is a complete
**Morandi design language**: low-saturation ambient gradients, cool-toned hairlines,
long soft shadows, restrained radii and spacing.

This plugin ports that language to DSH — including the half of it that is easiest to miss:

> The Morandi character does not live in `--accent`. It lives in `--accent-rgb`.

See [the two-track palette](#design-the-two-track-palette).

## Why Bloom

| Feature | Notes |
| :-- | :-- |
| Two-track palette | One track guarantees contrast, the other carries the mood — never mixed |
| A real texture layer | Ambient gradients, cool hairlines, paper-like shadows, Markdown detailing — not just recolored variables |
| OKLCH throughout | Perceptually uniform, so light/dark switching doesn't jump in brightness |
| WCAG AA | All 8 accent/background pairs measured at ≥ 4.5:1 |
| Zero dependencies | Pure client-side injection, nothing added to your runtime |
| Respects native controls | The switcher mounts into the DSH top bar instead of floating over it |

## Palettes

Four palettes, each with a light and a dark version.

<table>
  <tr>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/ui-mist-dark.png" alt="mist" />
      <sub><code>mist</code> — quiet blue-grey</sub>
    </td>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/ui-cinnabar-dark.png" alt="cinnabar" />
      <sub><code>cinnabar</code> — warm terracotta</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/ui-petal-dark.png" alt="petal" />
      <sub><code>petal</code> — soft lotus pink</sub>
    </td>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/ui-ripple-dark.png" alt="ripple" />
      <sub><code>ripple</code> — crisp misty teal</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/ui-mist-light.png" alt="mist light" />
      <sub><code>mist</code> light</sub>
    </td>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/ui-petal-light.png" alt="petal light" />
      <sub><code>petal</code> light</sub>
    </td>
  </tr>
</table>

Switch from the top bar; your choice persists in `localStorage`:

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/ui-switcher.png" alt="theme switcher" width="760" />
</p>

## Install

```bash
dsh plugin --profile web add @kubor/dsh-bloom-theme
```

Then add the package to `bundles` in `~/.dsh/profiles/web/package.json`:

```json
{
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "@kubor/dsh-bloom-theme"
      ]
    }
  }
}
```

Restart DSH — the theme dropdown appears in the top bar.

The plugin ships its own `cordis.patch.yml` and declares it via `dsh.bundle`, so once listed
in `bundles` it inserts itself into the boot graph — **no need to hand-edit `cordis.patch.yml`**.

<details>
<summary>Manual insert (alternative)</summary>

If you'd rather not touch `bundles`, inserting it in `~/.dsh/profiles/web/cordis.patch.yml` works too:

```yaml
- insert:
    - id: bloom-theme
      name: '@kubor/dsh-bloom-theme'
```

</details>

Install from source: `dsh plugin --profile web add github:webkubor/dsh-bloom-theme`

## Design: the two-track palette

Every Bloom palette carries two colors. The original `root-mist.css` says it outright:

```css
/* --- Morandi Mist (Blue) - Deepened for better contrast --- */
--accent: oklch(50% 0.08 240);   /* readable track: deliberately darkened, to pass contrast */
--accent-rgb: 146, 168, 179;     /* mood track: the actual Morandi color — greyed, desaturated */
```

The two must not be mixed:

- **Readable track** → text, button fills, borders. It is the darkened version; painting large
  areas with it looks loud and muddy.
- **Mood track** → only for wide ambient gradients and glows at `rgba(morandi, 0.05~0.2)`.
  All 14 gradients in the original use it, and **never** the readable track.

Port only `--accent` — the natural assumption — and `petal` turns from lotus pink `#e8859b`
into fluorescent magenta `#e63f9f`. The hue is right; the Morandi character is gone.

| Palette | Mood track | Readable track (light / dark) | Light contrast |
| :-- | :-- | :-- | :-- |
| `mist` | `#92a8b3` | `oklch(50%)` / `oklch(72%)` | 5.28:1 |
| `cinnabar` | `#d74b4b` | `oklch(55%)` / `oklch(72%)` | 4.87:1 |
| `petal` | `#e8859b` | `oklch(58%)` / `oklch(75%)` | 4.55:1 |
| `ripple` | `#5fa8b2` | `oklch(51%)` / `oklch(75%)` | 4.61:1 |

The light readable track was calibrated by solving backwards from WCAG AA — and darkening it
actually brings it closer to Morandi, which is exactly what the original author did for `mist`.

## The texture layer

Port the palette alone and you get "the same UI in different colors". In the original,
`root-*.css` (palette) is 89 lines while `base-light/dark.css` (texture) is 2,968 — that gap
is the whole point.

| Technique | Implementation |
| :-- | :-- |
| Ambient gradients | Four stacked Morandi glows on `body`, `background-attachment: fixed` |
| Cool hairlines | Sidebar rule, card outlines, tab underline, inset top highlight |
| Paper feel | Three shadow tiers plus an `inset 0 1px 0` highlight |
| Markdown | Gradient heading rules, fading `hr`, accent-barred blockquotes, outlined code blocks |
| Sidebar | Ambient wash, cool hover states, accent marker on the active item |

## Architecture

```
lib/index.js    node half (cordis plugin) — empty; this is a pure client-side theme
lib/client.js   browser half, all logic lives here
  ├─ PALETTE          4 palettes × two tracks
  ├─ bloomTokens()    → --bloom-* tokens (single source of truth for the texture layer)
  ├─ mistLight/Dark() → mist fully takes over the DSH alias + specific variable system
  ├─ variantBlock()   → the other 3 override only accent and background; greys inherit mist
  ├─ COMPONENT_CSS    → texture layer (written once, adapts across 4 palettes × light/dark)
  └─ SWITCHER_CSS     → top-bar dropdown switcher
```

## Development

```bash
npm run dev      # watch lib/, deploy to the web profile, auto-reload the browser on save
npm run deploy   # deploy once
```

The skin is injected client-side and its CSS is generated at runtime by `client.js`, so there
is no "hot-reload the CSS only" path — the script must re-run, which means the page must
reload. `npm run dev` handles it (press `a` to toggle, or set `DSH_BLOOM_NO_AUTORELOAD=1`).

## Lessons learned

Full write-ups in **[DEV_NOTES.md](./DEV_NOTES.md)** — each with symptom → root cause → fix → takeaway.
The ones worth reading first:

- **A client factory must return an object with an `apply` method.** Returning a bare `{}`
  white-screens the whole of DSH. That error surfaces in the browser and has nothing to do
  with the ESM export style of `lib/index.js`.
- **Foreground tokens can't be used as backgrounds or shadows.** In dark mode the foreground
  is near-white, so a `color-mix` "shadow" renders as a white haze, and giving
  `markdown-inline-code` a text color yields a 1.2:1 pale-on-white block.
- **DSH uses CSS Modules** — class names look like `wSkVaW_root`. Match with
  `[class*="_semanticName"]`, always scope to `div` (or you'll hit SVG elements), and always
  count the matches (a bare `_card` hits 30+ message cards).
- **Only outline the layer that has a solid background.** Outlining an inner transparent
  element produces a box-in-a-box.

## License

[MIT](./LICENSE)

## Author

[@webkubor](https://github.com/webkubor) · See also: [Bloom for Typora](https://github.com/webkubor/typora-Bloom-theme)
