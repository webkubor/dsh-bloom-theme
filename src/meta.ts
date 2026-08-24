/**
 * 插件身份与版本 —— 最底层模块，不 import 任何东西。
 *
 * PLUGIN_ID 必须与 package.json 的 name 完全一致，否则 DSH 报
 * `loaded without registering`（`npm run check` 第 1 组会校验）。
 *
 * 浏览器端拿不到 package.json（DSH 只 serve roster 里的 client.js，
 * `/plugins/<id>/package.json` 返回空），所以版本号只能内置。
 */

export const STORAGE_KEY = 'dsh-bloom-variant'

export const PLUGIN_ID = '@kubor/dsh-bloom-theme'

/** 当前装的版本 —— 由 release-please 在 release PR 里连同 package.json 一起 bump
 *  （靠行尾的 x-release-please-version 标记，见 release-please-config.json 的
 *  extra-files）。本地 dev 另有 scripts/sync-version.mjs 做兜底同步。勿手改。 */
export const PLUGIN_VERSION = '0.8.0' // x-release-please-version
