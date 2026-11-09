# Troubleshooting: theme not applied, unreadable buttons, plugin won't install

[中文](troubleshooting.md)

Common fixes for users. For developer details see [lessons.md](lessons.md) (host-compatibility log) and
[diagnostics.md](diagnostics.md) (diagnostics and export). Both are in Chinese.

## Installed the theme but nothing changed

1. **Confirm the version actually changed.** Open the theme button in the top bar; the bottom of the panel
   shows the active `Bloom v0.x.y`. That number comes from the plugin itself, not from a cache. If it is
   still the old version, see the next section.
2. **Quit completely and reopen.** Quit the app with Cmd+Q and start it again; closing the window is not
   quitting. Theme styles are injected at startup, and hot reload may not replace nodes that are already
   rendered.
3. **Make sure it is not disabled.** The theme may have been disabled or uninstalled: check in the
   Plugins list that Bloom is enabled.

## Still on the old version after an update

Separate two cases first:

- **No "update available" prompt**: Bloom checks for a new version once after the app starts and stays
  quiet if the check fails. If the last check found you up to date, it will not check again for 24 hours,
  so a just-released version may not be announced yet.
- **Updated, but the panel still shows the old version**: the version in the panel is the one bundled in
  the **currently loaded plugin package**. It does not depend on the check interval, and waiting will not
  change it. Either the new version was not installed into the profile you are using, or the app has not
  been fully restarted (Cmd+Q, then reopen).

Update through the entry you use:

- **Desktop app**: update in the sidebar Plugins manager, or click "Update now" in the update prompt. The
  desktop profile is managed by the app; the CLI rejects `dsh plugin --profile desktop`, so do not use
  terminal commands for it.
- **Web or self-hosted CLI profile**: look up the latest version, then install that exact version:

  ```sh
  npm view dsh-bloom-theme version
  dsh plugin --profile <your-profile> add dsh-bloom-theme@<version-from-above>
  ```

  An explicit version is more reliable than `@latest`: when a profile's lockfile already resolved an old
  version, `@latest` may not actually upgrade. `dsh plugin` passes the remaining arguments to pnpm in the
  profile directory.

### Check which profile you are looking at

**The desktop app, the Web UI and self-hosted profiles each install plugins independently.** On the same
machine the desktop app can be on the new version while the Web UI is still on the old one. Different
version numbers in the two interfaces do not mean either side is broken.

- Desktop: read `Bloom v0.x.y` at the bottom of the panel, or the version in the Plugins manager.
- Web or self-hosted CLI profile:

  ```sh
  dsh plugin --profile <your-profile> list
  ```

  The `dsh-bloom-theme@<version>` in the output is the version that profile actually has installed.

## Theme styling breaks after a DeepSeek Harness update

Bloom targets areas of the DeepSeek Harness interface by their style class names. If a host update renames them,
**some areas silently lose Bloom styling**: there is no error and the app still works, but a region falls back to the
default look or its colours no longer match. The minimum host version is declared in `engines.dsh` in `package.json`;
if the host does not meet it, the plugin may fail to install or activate.

Work through these steps in order:

1. **Update Bloom to the latest version** as described in "Still on the old version after an update" above. New
   releases usually follow host interface changes.
2. **Quit the app completely and reopen it** (Cmd+Q on macOS), then confirm the panel footer shows the new version.
3. If problems remain and get in your way, disable Bloom for now: in the desktop app, turn it off in the sidebar
   Plugins manager; for the Web app or a self-managed CLI profile, run
   `dsh plugin --profile <your-profile> remove dsh-bloom-theme`. The interface returns to the host default, and you can
   reinstall later.
4. Report it in [Issues](https://github.com/webkubor/dsh-bloom-theme/issues) with the Bloom version, host version,
   screenshots of the affected area and the block exported by "Diagnostics".

## Button text in another plugin is hard to read

If the primary button or selected tab in **another** plugin's panel turns into a solid block with nearly
invisible text, this is usually not a plugin "conflict": the theme changed one of the host's semantic
tokens. It happened once: the theme derived both the primary button fill (`fill`) and the text on it
(`dimmed`) from the accent color, so the two shared a hue.

What to do:

1. Update the theme to the latest version (that issue was fixed in 0.9.1).
2. After updating, quit completely and reopen as described above.
3. If it persists, report it in [issues](https://github.com/webkubor/dsh-bloom-theme/issues) with the Bloom
   version, host version, which plugin and screen, and light or dark mode.

When reporting, use the "Diagnostics" button in the panel. It produces a collapsible Markdown block you can
paste directly, which locates problems better than a screenshot.

## The plugin won't install

- **Check the package name.** The npm package is `dsh-bloom-theme`, with no scope. Early versions used
  `@kubor/dsh-bloom-theme`; that name **no longer exists** on npm and installing it returns 404. Some
  third-party directories still show the old name in stale snapshots. If you see an install command with
  `@kubor/`, replace it with `dsh-bloom-theme`.
- **Check you installed into the right profile.** Desktop, Web and self-hosted profiles are independent;
  installing into one does not affect another. See "Check which profile you are looking at" above.
- **No runtime dependencies.** The plugin has no extra dependencies and needs no special flags such as
  `--ignore-scripts`.

## Colors look different than expected

Each of the 12 palettes in the main menu has a light and a dark variant. "Appearance" in the panel lets you
choose light, dark or follow system separately. If switching does not change the interface, check whether
the current palette setting was remembered from last time, then switch manually again.

## Change the glass material

Open the Bloom theme button in the top bar. In the panel's "Material" group, choose frosted, matte or liquid glass. Use the "Theme" group to change the palette and the "Mode" group to select light, dark or follow system.

When the system requests reduced transparency, the automatic default uses a solid background. If you explicitly select one of the three materials, reduced transparency alone does not override that selection. Forced colors or high contrast take precedence and use a solid background. `glassMode` in diagnostics is the saved preference and may differ from the effective appearance.

## When reporting an issue, include

- The Bloom version (shown at the bottom of the panel) and the host version;
- The palette name and light/dark setting;
- Steps to reproduce;
- The block exported by the "Diagnostics" button.
