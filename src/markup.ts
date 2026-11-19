/**
 * 共享 HTML 构建块 —— 下拉菜单与设置页「Bloom 外观」共用。
 *
 * 从 switcher.ts 抽出，避免 switcher ↔ detail 循环依赖。
 */
import { getLang, tr } from './lang.js'
import { PLUGIN_VERSION } from './meta.js'

/* 「本版更新」内容在构建时由 scripts/bundle.mjs 注入（CHANGELOG.md 里当前版本那一节）；
   tsc 单独编译时该常量不存在，走兜底分支。 */
declare const __BLOOM_CHANGELOG__: { version: string; items: { kind: string; text: string }[] } | undefined
const CHANGELOG = typeof __BLOOM_CHANGELOG__ !== 'undefined' ? __BLOOM_CHANGELOG__ : { version: PLUGIN_VERSION, items: [] }

export function escapeHTML(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

/** 「本版更新」：最多 8 条，新功能 / 修复各一个小标签 */
export function changelogHTML(): string {
  const tag = (k: string) => k === 'feat' ? tr('新') : k === 'fix' ? tr('修') : tr('优')
  // CHANGELOG 只有中文：非中文界面不展示条目，只留「完整日志」链接，免得英文界面冒出一段中文
  const list = CHANGELOG.items.length && getLang() === 'zh'
    ? `<ul class="dsh-bloom-log__list">${CHANGELOG.items.map((it, i) =>
        `<li class="dsh-bloom-log__item" style="--i:${i}"><span class="dsh-bloom-log__tag" data-kind="${it.kind}">${tag(it.kind)}</span><span>${escapeHTML(it.text)}</span></li>`).join('')}</ul>`
    : ''
  return `<div class="dsh-bloom-log">
        <div class="dsh-bloom-log__head">
          <span class="dsh-bloom-log__title">${tr('本版更新')} · v${CHANGELOG.version}</span>
          <a class="dsh-bloom-log__all" data-track="changelog" href="https://github.com/webkubor/dsh-bloom-theme/releases" target="_blank" rel="noopener">${tr('完整日志')} ›</a>
        </div>
        ${list}
      </div>`
}

/* 底栏图标：emoji 各家字体形状/基线都不一样，三个挤一排像贴纸（owner 2026-09-15
   「图片位置优化下」）。换成同一套描边 SVG —— 1.4 线宽、13px、currentColor，
   跟面板里的 chevron 同一种语言，颜色也跟着 hover 一起变。 */
const icon = (body: string) =>
  `<svg class="dsh-bloom-foot__icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
export const ICON_STAR = icon('<path d="m7 1.3 1.7 3.5 3.8.6-2.8 2.7.7 3.9L7 10.2l-3.4 1.8.7-3.9L1.5 5.4l3.8-.6z"/>')
export const ICON_CHAT = icon('<path d="M12.1 8.1a1.8 1.8 0 0 1-1.8 1.8H5.6L2.9 12.1V3.7a1.8 1.8 0 0 1 1.8-1.8h5.6a1.8 1.8 0 0 1 1.8 1.8z"/>')
export const ICON_DIAGNOSE = icon('<rect x="2.8" y="2.5" width="8.4" height="9.5" rx="1.6"/><path d="M5 2.5V1.5a.8.8 0 0 1 .8-.8h1.6a.8.8 0 0 1 .8.8v1M5 6h4M5 8.5h2.5"/>')
export const ICON_SHARE = icon('<circle cx="10.5" cy="3.3" r="1.6"/><circle cx="3.5" cy="7" r="1.6"/><circle cx="10.5" cy="10.7" r="1.6"/><path d="M4.9 6.2l4.2-2.2M4.9 7.8l4.2 2.2"/>')
