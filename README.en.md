<p align="center">
  <img src="https://img.webkubor.online/projects/dsh-bloom-theme/bloom-banner.png" alt="Bloom for DSH" width="100%" />
</p>

<!-- bloom-series-nav -->

<table align="center">
<tr>
<td align="center" width="33%"><a href="https://github.com/webkubor/typora-Bloom-theme">🌸 Bloom for Typora</a><br/><sub>24 themes</sub></td>
<td align="center" width="33%"><b>🌊 Bloom for DSH</b><br/><sub>15 supported · 12 featured</sub></td>
<td align="center" width="33%"><a href="https://github.com/webkubor/contrast-guard">🛡️ contrast-guard</a><br/><sub>color guardrail</sub></td>
</tr>
</table>

<p align="center">
  <sub>One Morandi design language — two themes, and the tool that keeps their colors honest.<br/>
  <i>同一套莫兰迪设计语言：两个宿主的主题，加一个守住它们配色的工具。</i></sub>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-bloom-theme"><img src="https://img.shields.io/npm/v/dsh-bloom-theme?style=flat-square&color=A873C4&logo=npm" alt="npm" /></a>
  <a href="https://www.npmjs.com/package/dsh-bloom-theme"><img src="https://img.shields.io/npm/dm/dsh-bloom-theme?style=flat-square&color=92a8b3" alt="downloads" /></a>
  <img src="https://img.shields.io/github/license/webkubor/dsh-bloom-theme?style=flat-square&color=5fa8b2" alt="License" />
</p>

<p align="center">
  <!-- Keep badges ≤ 6: works (version/downloads) · trusted (AA, listed) · clean (zero deps) -->
  <a href="https://awesome-dsh-plugin.com"><img src="https://awesome-dsh-plugin.com/badge.svg" alt="Awesome DSH Plugin" /></a>
  <img src="https://img.shields.io/badge/WCAG-AA-6a9955?style=flat-square" alt="WCAG AA" />
  <img src="https://img.shields.io/badge/dependencies-0-92a8b3?style=flat-square" alt="zero dependency" />
</p>

<p align="center">
  <a href="README.md">中文</a> | <b>English</b>
</p>

<p align="center">
  Bringing the Morandi feel of <a href="https://github.com/webkubor/typora-Bloom-theme">Bloom</a> (a 90★ Typora theme)
  to <a href="https://github.com/deepseek-ai/deepseek-harness">DeepSeek Harness</a>.
  <br />
  <b>Glass + Morandi</b>: 15 light/dark palettes, 12 featured in the menu, frosted-glass panels, one-click switching from the top bar —
  even the waiting state breathes with the theme.
</p>

## 📌 Desktop-first — a note about the DSH Web UI

**Short version: Bloom's next iterations target the DSH desktop app first. The Web UI is no longer
actively supported and will fade out.**

(0.16.0 and earlier were built against the DSH Web UI. **0.17.0 is the desktop-ready release** — it
brings the DSH 0.2.0 selector adaptation plus a drift gate that catches this class of breakage
automatically.) On desktop app 0.2.1-rc.5, the switcher's version display uses the desktop app version rather than an older bundled DSH package version; the drift gate also targets the locally installed desktop release.

DSH now ships a desktop app, and it is what I use every day. A theme's value lives on top of a UI —
when the host changes its interface, the palettes and the glass have to follow — so that is where
the work goes now.

What this means for you:

| You use | What happens |
|---|---|
| **Desktop app** | New palettes, new motion, visual fixes land here first. I use it daily, so when the UI moves, I move with it. |
| **Web UI** | Stays working as-is, but I no longer adapt it to new changes in the DSH web front-end. If DSH reshuffles its DOM and something looks off there, I may not catch it in time. |

Two clarifications, so you do not have to guess from the heading:

- **Installed versions keep working.** What stops is "growing with the new UI", not "breaking what you have".
- If the Web UI is your only option, please open an issue and describe your setup — real demand
  changes my judgement. That is not a formality.

> **What the previous version (0.16.0) changed**: running steps now take on the theme color (the sweep went from grey to the
> three Bloom tones); the round-status spectrum is wired back up (it vanished silently when DSH was
> renamed); the message-bubble glass edge that never drew in light mode is fixed; substring-selector
> self-overlap ("box inside a box", the square black chip) is fixed; the pill background on running
> steps is gone — state should not have to shout from a box.

## The gist

A **glass + Morandi** theme for DeepSeek Harness.
15 light/dark palettes (12 featured in the menu), adaptive by light/dark; panels are real frosted glass
(semi-transparent + backdrop blur + glass edges); colors are low-saturation Morandi
(OKLCH, WCAG AA); restrained, consistent micro-interactions; zero runtime deps; TypeScript front-end.

> The Morandi character does not live in `--accent`. It lives in `--accent-rgb`.

## Quick start

> The menu features 12 palettes, grouped by color family: Cinnabar, Dawn, Tangerine, Afterglow, Osmanthus, Mint, Ripple, Mist, Lapis, Lavender, Silver Rose, and Petal.
> All 15 palette keys remain valid; a selected legacy color remains visible until another is chosen.
> Optional auto rotation defaults to off, offers 5 / 15 / 30 / 60-minute intervals, and pauses in hidden tabs.

Install from DSH's in-app plugin manager and follow the returned application or restart instructions. The 「黛蓝 ▾」 header button provides 12 featured palettes, light/dark, and auto rotation. See [Install](#install) for the official `plugin_manager` path.

## Palette previews

The 12 featured colors are shown in menu order. The studies above use the **actual v0.23.0 light/dark palette values** to compare color families. They are **not screenshots of the DSH application**. The rejected opaque Ripple light experiment is not part of this release.

[![The 12 light palettes in v0.23.0](https://img.webkubor.online/projects/dsh-bloom-theme/v0.23.0/palettes-light.png)](https://img.webkubor.online/projects/dsh-bloom-theme/v0.23.0/palettes-light.png)

[![The 12 dark palettes in v0.23.0](https://img.webkubor.online/projects/dsh-bloom-theme/v0.23.0/palettes-dark.png)](https://img.webkubor.online/projects/dsh-bloom-theme/v0.23.0/palettes-dark.png)

**Real interface screenshots (v0.23.0, Mist)**:

| Dark | Light |
| :-- | :-- |
| ![DSH interface with Mist dark](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-mist-dark.png) | ![DSH interface with Mist light](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-mist-light.png) |

**Other featured palettes**:

| Ripple · light | Ripple · dark |
| :-- | :-- |
| ![DSH interface with Ripple light](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-ripple-light.png) | ![DSH interface with Ripple dark](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-ripple-dark.png) |

| Mint · dark | Lavender · light |
| :-- | :-- |
| ![DSH interface with Mint dark](https://img.webkubor.online/projects/dsh-bloom-theme/ui-mint-dark.png) | ![DSH interface with Lavender light](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-lavender-light.png) |

| Osmanthus · dark | Cinnabar · light |
| :-- | :-- |
| ![DSH interface with Osmanthus dark](https://img.webkubor.online/projects/dsh-bloom-theme/ui-osmanthus-dark.png) | ![DSH interface with Cinnabar light](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-cinnabar-light.png) |

## Install

Open Plugins in the running DSH application and install `dsh-bloom-theme`. Alternatively, ask the current DSH session to use the official `plugin_manager`: list existing bundles first, then use `install_bundle` with an explicit version, or the absolute path of a built checkout for local development.

Follow the installation result's `application` / `nextStep`. Replacing an installed package may require an application restart; refreshing the page cannot replace that step. DSH owns installation and updates, so no manual profile dependency edits or `node_modules` copies are needed.

Once installation has been applied, the theme button appears at the conversation header, positioned using its official Slot anchor. Click it to switch between
**12 featured palettes**; the current version sits at the bottom of the dropdown, and a `↑ vX` badge
lights up when a newer version is on npm (jump to the Releases page).

## Updates

When the host provides `remote.pluginManager.updateBundle`, the update banner offers **Update now** and delegates replacement and failure recovery to DSH. A restart-required result instructs an application restart; an applied result displays “Updated to v{version}” without a page reload button. Hosts without this API show Plugins guidance instead of an unusable update button. Desktop never offers a rejected terminal command; self-hosted CLI profiles retain the copy-command fallback.

## Features

| Feature | Description |
| :-- | :-- |
| **Frosted-glass panels (on by default)** | Semi-transparent fill + `backdrop-filter` blur + glass edges (top highlight / translucent stroke / soft outer glow), adaptive opacity per light/dark |
| **15 supported Morandi palettes** | 12 featured choices, one per hue family: Mist / Cinnabar / Tangerine / Afterglow / Osmanthus / Mint / Ripple / Lapis / Lavender / Silver Rose / Petal / Dawn; older saved colors stay supported, each with light and dark modes |
| **UI language** | Follows DSH's shared language setting (中文 / English) without adding languages. Text only — palettes and measured contrast are untouched |
| **Two-track colors** | A readable track for contrast (text/buttons) and a mood track for ambient gradients — never mixed |
| **Micro-interactions** | Menu entrance, selected-row bar slide-in, hover / press feedback; shared duration & easing tokens, consistent everywhere |
| **Theme-colored thinking animation** | `Deep diving…` flows through the current theme's three-color spectrum; auto-still under `prefers-reduced-motion` |
| **Version / update hints** | Current version at the bottom of the dropdown; `↑ vX` chip when npm is newer; update banner for very stale installs, with desktop guidance to update from Plugins in the sidebar |
| **In-panel changelog** | "What's new" lists the current release's changes right in the panel; "Full changelog ›" jumps to GitHub Releases |
| **Typing glow** | A theme-colored light sweeps across the composer card while you type and fades ~1s after you stop; static under `prefers-reduced-motion` |
| **Anonymous stats (optional)** | Only button event names + version + language are reported; one-click off in the panel — see Privacy |
| **OKLCH + WCAG AA** | Perceptually uniform color space, no jumps on light/dark switch; all accent/background pairs measured ≥ 4.5:1 |
| **Zero deps · CSS-variable driven** | Only CSS variables + a little switch logic; near-zero runtime cost |
| **Respects native controls** | Switcher mounts into the DSH header utilities area, side-by-side with native buttons |
| **TypeScript build** | `src/` modules → `tsc` (ESM) for node + `esbuild` (single-file IIFE) for browser; one-command `build / dev / check / preflight` |

## Design: two-track colors

Bloom's point was never "swap the colors" — it is a complete **Morandi design language**:
low-saturation ambient gradients, cool-toned hairlines, long soft shadows, restrained radii and spacing.

The easiest thing to get wrong (and most often done wrong) is the **two-track color**:

- **Readable track `--bloom-accent`** — deliberately deepened to pass WCAG; for text / buttons / selected states;
- **Mood track `--accent-rgb`** — the real Morandi color (low-saturation, grayed); used only for large ambient gradients and cool hairlines.

All 14 gradient usages in the original use the mood track, never the readable track. When you paint a
large area with the readable color, Petal goes from lotus pink to fluorescent magenta and the Morandi feel dies.
This plugin ports both tracks intact, and the sibling tool [contrast-guard](https://github.com/webkubor/contrast-guard)
keeps accent/background contrast honest.

## Develop / build (TypeScript)

```bash
npm ci
npm run typecheck    # tsc --noEmit, full type check
npm run build        # typecheck → tsc emits lib/index.js → esbuild emits lib/client.js
npm run dev          # full build, then watch browser source; writes only this checkout's lib/
npm run package      # one-click package (npm pack → .tgz)
npm run check        # 6 static gates + contrast-guard (runs on every commit)
npm run preflight    # pre-release: version consistency / git state / listing sync
```

`src/` is split by responsibility; DSH loads the artifacts in `lib/`. The watcher rebuilds browser source only. After changing the Host entry, version, or CHANGELOG, run a full build again. Install the built checkout through official plugin management, follow the returned restart instructions, and verify the loaded version. Development scripts do not deploy or trigger browser refresh shortcuts.

The root `conversation.header.leading` Slot provides Bloom's own positioning anchor. The complete switcher, menu, starlight, and update hints mount in the root `shell.overlay` Slot to avoid clipping by the host header. Positioning measures only Bloom's anchor. Host DOM discovery, node reparenting, and the floating drag fallback have been removed.

**The build is dual-track** — the two halves want opposite module formats:

| Artifact | Compiler | Format | Why |
|---|---|---|---|
| `lib/index.js` (node side) | `tsc` | **ESM** | cordis' plugin loader reads it as ESM |
| `lib/client.js` (browser side) | `esbuild` | **single-file IIFE** | DSH runs plugin client.js as a *classic script* — a top-level `import`/`export` is a syntax error |

So the browser-side source can be split freely, but the artifact must bundle back
into one self-contained file.

The version number is bumped by release-please inside the release PR, alongside
`package.json` (via the `x-release-please-version` marker at the end of the line in
`src/meta.ts`). `scripts/sync-version.mjs` only synchronizes source to the existing
package version for artifact rebuilds and prepublish checks; it does not select the next version.

Main pushes, scheduled runs, and default manual dispatches only prepare a Release PR; `auto_merge_release` defaults to false. After real desktop installation acceptance, CI on the reviewed head, independent review, and `preflight`, the release owner may run this command from this repository to allow Release PR merging and trigger publication:

```bash
gh workflow run release-please.yml -f auto_merge_release=true
```

Do not run it when only preparing a candidate. Merging follows GitHub branch protection, without automatically resolving review threads or falling back to direct merge. See [CONTRIBUTING](./CONTRIBUTING.md) for the full procedure.

## Privacy

The Vote / Feedback / Share buttons in the panel send **one anonymous click count** to the author's counter endpoint (`webkubor.online/api/event`). The payload is just: an event name (e.g. `share`), the plugin version, and the UI language. No conversation content, no page text, no cookies — the server only keeps per-day aggregates.

Prefer to send nothing: turn off "Send anonymous usage stats" in the panel's version section, or `localStorage.setItem('bloom-telemetry','off')`.

## FAQ

**Theme not applying?** Confirm that the bundle is enabled and inspect its installation result. If a restart is required, restart the application and verify the loaded version. For `Failed to load plugins`, check host compatibility and client registration errors, then restore a compatible version through official plugin management.

**Can I customize colors?** For now you pick a whole palette via variants; per-color customization is on the roadmap.

## Contribute / open source

- Add a new palette: add one entry to `PALETTE` / `VARIANTS` / `VARIANT_LABELS` in `src/palette.ts`
  — glass, motion, selected state and the contrast guardrail all follow automatically.
- Run `npm run build && npm run check` and make sure `contrast-guard` passes before opening a PR.
- Issues, PRs and ideas are all welcome.

## Support

If Bloom makes your DSH nicer to use, drop a ⭐ or buy me a coffee (sponsor link below and one entry in the panel menu).

## DSH plugin suite

<p align="center">
  <a href="https://github.com/webkubor/dsh-bloom-theme">🎨 Theme</a> ·
  <a href="https://github.com/webkubor/dsh-llm-hub">⚡ Model management</a>
</p>

Install `dsh-bloom-theme` and `@dsh-plugins/dsh-llm-hub` separately through DSH plugin management, then follow each installation result. DSH manages bundle registration and dependencies; no shell profile edits are needed.

---

## Star History

<a href="https://www.star-history.com/#webkubor/dsh-bloom-theme&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=webkubor/dsh-bloom-theme&amp;type=Date&amp;theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=webkubor/dsh-bloom-theme&amp;type=Date" />
    <img alt="Star History Chart for webkubor/dsh-bloom-theme" src="https://api.star-history.com/svg?repos=webkubor/dsh-bloom-theme&amp;type=Date" width="100%" />
  </picture>
</a>

## License

[MIT](LICENSE) — keep the copyright notice on borrow/modify. Palette inspiration from [typora-Bloom-theme](https://github.com/webkubor/typora-Bloom-theme).
