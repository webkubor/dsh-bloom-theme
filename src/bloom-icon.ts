/**
 * Bloom 五瓣花 —— 设置页左导航的图标。
 *
 * 与仓库根的 icon.svg 同形（白五瓣 + 米色花心），但改成描边版：
 * 导航图标在浅色/深色两套主题下都要看得清，描边 + currentColor 比实心白更稳。
 * SVG 用 innerHTML 注入：宿主给的 createElement 没有 children 参数，
 * 塞不进子节点（见 src/ui.ts 的 HostReact 定义）。
 */
export function bloomIconSVG(): string {
  return `<svg class="dsh-bloom-settings-icon__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
    <g>
      <ellipse cx="12" cy="7.4" rx="2.6" ry="4.6"/>
      <ellipse cx="12" cy="7.4" rx="2.6" ry="4.6" transform="rotate(72 12 12)"/>
      <ellipse cx="12" cy="7.4" rx="2.6" ry="4.6" transform="rotate(144 12 12)"/>
      <ellipse cx="12" cy="7.4" rx="2.6" ry="4.6" transform="rotate(216 12 12)"/>
      <ellipse cx="12" cy="7.4" rx="2.6" ry="4.6" transform="rotate(288 12 12)"/>
      <circle cx="12" cy="12" r="1.9" fill="currentColor" stroke="none"/>
    </g>
  </svg>`
}
