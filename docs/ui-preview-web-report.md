# Web UI preview report — r5 baseline and r6 targeted follow-up (2026-11-07)

Current vex preview: **r6, still version 0.26.0**. The r5 sections retain their original evidence; the final section records only the new r6 checks.

Scope: Web UI on the authorized vex test host only. The native desktop matrix is run separately. This report does not approve how the UI looks; the owner's UI confirmation gate still applies.

## Package and install

| Item | Value |
|---|---|
| Local package | `/tmp/bloom-preview-r5/dsh-bloom-theme-0.26.0.tgz`, `dsh-bloom-theme@0.26.0`, 60 entries, gzip OK |
| Package sha256 | `c96e2ade9be6ee9f4d2584b4a8e4ed539371efdcc8e0cce8167677988c31db26` |
| Remote copy | `vex:/home/ubuntu/dsh-server-test/bloom-preview.tgz`, sha256 matches |
| Install | `dsh plugin --profile web add file:/home/ubuntu/dsh-server-test/bloom-preview.tgz` (DSH 0.2.2-rc.1, pnpm reports +1 package) |
| Loaded copy | `/home/ubuntu/.dsh/profiles/web/node_modules/dsh-bloom-theme`, version 0.26.0, `lib/client.js` sha256 `bde192a6…82597`, same as the package |
| Restart | Old server process stopped, restarted with the existing `run.sh`; the new process serves `https://dsh.webkubor.online/` (unauthenticated `/` returns 401, as expected). The access token rotated and is stored only in a 0600 temp file, not printed |
| Trigger title in page | `Bloom theme · v0.26.0` |

## Method

Headless Chromium (Playwright) at 1440×900 with deviceScaleFactor 2 against the public URL. Screenshots and `probe.json` are in `/tmp/bloom-ui/web-r5/`. I did not send any messages or sign in.

On a fresh visit the host shows a "Get started" sign-in modal. While that modal covers the switcher, Bloom keeps it at `visibility: hidden`, which is the intended behaviour. After the modal was dismissed with Escape, the switcher became visible.

## Results

| Check | Result | Evidence |
|---|---|---|
| Page/console errors | Pass: 0 | probe.json `errors` |
| Menu opens, positioned and readable | Pass: `position: absolute`, not hidden, rect 410×848 at (300,48), bottom 896 < 900 viewport | `10-light-menu.png`, `10-dark-menu.png` |
| Light/dark mode switch via menu | Pass: `data-ds-dark-theme` follows the selected mode | probe.json `matrix` |
| Ambience presets (light: stream/wash/clear/off; dark: corner/diagonal/galaxy/off) | Pass: each preset clicked and screenshotted | `11-*` |
| Material tiers glass/soft/solid in both modes | Pass: `body[data-bloom-glass]` takes each value | `12-*` |
| Lens filter definition | Present: `#dsh-bloom-liquid-lens` = feImage×2, feComposite, feComponentTransfer, feDisplacementMap | probe.json `lens` |
| Lens use (light + clear) | Only on decorative `::before` layers of sidebarCol, header, workspace card: `blur(3px) url(#dsh-bloom-liquid-lens) saturate(1.2)` | probe.json `matrix.light.glass-glass.lensUsers` |
| Hosts not filtered / not static | Pass: sidebar and composer card are `position: relative` with `backdrop-filter: none`; `::before` layers are `position: absolute` in every tier | probe.json |
| Light soft / solid | Soft = `blur(8px) saturate(1.05)`, solid = `none`; no lens in either | probe.json |
| Dark clear | `blur(22px) saturate(1.3/1.35)`, no lens, so dark keeps its own treatment | probe.json |
| Table overflow | **Pass in real host Markdown file preview**: 12-column table scrolls locally to its last column; document stays 1440px wide. Chat-message renderer remains untested. | Follow-up below; `web-r5-live/typing-probe.json` |
| Typing glow | **Pass with enabled composer** after choosing the existing test workspace: light breath, dark sweep, idle clears typing state, reduced motion disables animation. No messages sent. | Follow-up below; `web-r5-live/typing-probe.json` |
| Refractive highlight visible to the eye | **Unconfirmed**: on the empty landing page the light panes read as soft, pale glass; the empty background has too little detail behind the panes to show any refraction from the displacement map | `12-light-glass-glass.png` |

## Observations, no verdict

- In `10-light-menu.png` the composer card shows a dashed outline while the menu is open. I did not find the cause; it may come from host focus or drop-zone state. It needs a look on desktop before anyone calls it a Bloom defect.
- With an 848px menu in a 900px viewport the footer only just fits; shorter Web viewports will need to scroll the menu.

## State after run

- Host mode restored to the initial value (dark) through the menu.
- Bloom palette/glass/ambience preferences live in localStorage. They changed only inside the disposable headless browser context, so the user's own browsers are unaffected.
- At the end of this original run, vex was running r5 0.26.0. Task-12 subsequently replaced it with r6; see below.

## Follow-up: enabled composer and real Markdown preview (task-11)

Normal UI path: dismiss Get started → Choose workspace → choose the existing `/home/ubuntu/dsh-server-test/` directory → Open. This enables the contenteditable composer without signing in or selecting a model. Earlier disabled-composer coverage was a workspace-selection gap, not an authentication blocker.

Evidence directory: `/tmp/bloom-ui/web-r5-live/`; measurements: `typing-probe.json`. Package/source/materials were unchanged.

| Real interaction | Observed result |
|---|---|
| Type draft in light mode | `bloomTyping=true`; pseudo animation `dsh-bloom-typing-breath`, opacity ~0.995; send button enabled, radial white highlight plus theme-coloured linear gradient |
| Stop typing for 1800ms | Typing attribute removed and opacity returns to 0; light animation name remains assigned but invisible |
| Type draft in dark mode | `dsh-bloom-typing-sweep`, opacity 1; enabled send button retains solid accent treatment (`background-image:none`) |
| Stop dark typing | Attribute removed, animation `none`, opacity 0 |
| Light + prefers-reduced-motion | Typing attribute set; animation `none`, static opacity 1 |
| Real file preview | Created one exclusive 721-byte temporary Markdown fixture with 12 wide columns in the test directory. Typed an `@` filename reference, selected the real file, clicked its reference chip, and the host rendered it in its Markdown file viewer. No DOM table injection. |
| Local horizontal overflow | Table wrapper maximum scrollLeft = 2626; scrolling reaches exactly 2626. Last cell right = 1424.625 within wrapper right = 1426. Document width remains 1440. Same local scroll position and document width verified in dark mode. |

Screenshots opened and inspected: `light-typing.png` shows the enabled highlighted send button and pale composer without the disabled dashed outline; `04-table-right-edge.png` shows columns 11–12 reachable in the actual host preview. Additional captures: `dark-typing.png`, `03-file-preview.png`, `05-table-dark.png`.

Cleanup: cleared typed draft and file reference; closed preview; restored the mode observed at the start of this follow-up (light) and default glass selection (no explicit data attribute). Removed only the newly added workspace association through the host's Delete workspace UI after its confirmation stated that the directory and session logs would be kept. Removed the exclusive task-created Markdown file after verifying its absolute path, type, heading and length; the parent directory remains. A fresh browser load confirms **No sessions yet**, **Choose workspace**, and no residual test workspace. Both isolated browsers and the terminal session are closed.

No chat message was sent; no model called; no credentials changed. Remaining boundary: this proves the real Markdown file-preview renderer, not a chat-message table. Visual approval of liquid-glass refraction remains unresolved; functional coverage does not imply approval.

## r6 targeted follow-up: menu readability, focus and labels (task-12)

Installed the exact `/tmp/bloom-preview-r6/dsh-bloom-theme-0.26.0.tgz` through the official `dsh plugin --profile web add file:…` route after listing installed plugins. Local and uploaded package SHA-256: `5ce312eb6231d821f48a4f75967e81a83cf98b5415b69f03cd375f8617a88beb`. Installed `lib/client.js` SHA-256: `4f87efb28aba66324544c7e4237429450b786c07f8963d967b5a476d61a63324`, identical to the supplied package. Restarted the existing test service via `run.sh`. New access URL is only in `/tmp/bloom-ui/web-r6/vex-url.txt` (0600); older URL files are stale. Version remains 0.26.0; hashes distinguish the candidate.

Scope was deliberately limited to r6 changes. Did not repeat the r5 material matrix, typing lifecycle or wide-table checks. No temporary CSS or DOM material changes were injected.

Used normal UI to select the test workspace, opened an exclusive real Markdown fixture in the host file preview, and entered a short multiline **unsent** draft into the actual composer. The draft genuinely overlaps the menu area; the nearby Markdown preview supplies additional real content. Switched language through host Settings, not through injected translation state.

| Check | Observed result |
|---|---|
| Menu background | Computed `linear-gradient(145deg, rgba(255,255,255,.9), rgba(255,255,255,.84))` confirms r6 loaded |
| Pointer opening | Host modality `pointer`; computed outline style is `none` (the sampled width value is 3px, so do not describe it as width zero); selection inset shadow remains. No painted pointer focus box |
| Keyboard opening via Enter on trigger | Host modality `keyboard`; selected row outline is 2px solid with offset -2px, `box-shadow:none`, border 0px. One visible focus outline, not doubled selection/focus frames |
| Chinese UI | Selected label 通透; description **通透 · 透色玻璃，边缘泛光** |
| English UI | Selected label Clear; description **Clear · translucent glass, luminous edges** |
| Readability over actual draft | English and Chinese labels remain legible. Faint blurred grey text is still visible through the menu; this is not a claim of zero background bleed or visual approval. |
| Runtime issue | Two console resource errors `net::ERR_HTTP2_PROTOCOL_ERROR` at `/plugins/events` during the run. Interaction and language changes continued working. No page exception observed; a fresh-load check also had no page exceptions. Reconnection durability was not separately tested. |

Evidence: `/tmp/bloom-ui/web-r6/probe.json`; opened and inspected `05-menu-zh-real-draft.png`, `06-menu-en-real-draft.png`, and `07-menu-en-real-draft-keyboard.png`. Other captures record pointer and keyboard state before the multiline draft. The corresponding `contentRects` measurements establish actual overlap rather than merely an adjacent text panel.

Cleanup: preview closed; split position restored; initial light mode and English language restored; newly added workspace association removed using the host confirmation that preserves the directory and logs. The editor clear operation did not persist across the subsequent UI rerender: the before-cleanup probe still contains the temporary unsent draft, so it is not evidence of a successful explicit clear. The temporary session/draft was then discarded by removing its workspace association and closing the disposable context; the fresh-context verification below shows no persisted session. Exclusive 2256-byte Markdown fixture removed only after path/content verification. A fresh isolated context shows **No sessions yet / Choose workspace**, `lang=en`, light mode. Browsers and terminal closed. Existing workspace files and user data were retained. Vex remains on r6 for review; no publish, source or Git changes were made.
