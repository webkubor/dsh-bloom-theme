export const SWITCHER_CSS = `
.dsh-bloom-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  font: 12px/1.2 -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
}
/* 兜底形态：挂不进 DSH header 时才浮起来。位置放在 header 下方，
   避开右上角原生控件（Session log 等）—— 决不能再压住它们。 */
.dsh-bloom-switcher[data-floating="true"] {
  position: fixed;
  top: 84px;
  right: 16px;
  z-index: 9999;
}

.dsh-bloom-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 9px;
  border-radius: 9px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,0.08));
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff), transparent 30%);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  color: var(--dsw-alias-label-secondary, #555);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.dsh-bloom-trigger:hover {
  border-color: var(--bloom-hairline-strong);
  box-shadow: 0 0 14px -6px var(--bloom-glow);
}
.dsh-bloom-trigger:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4a90e2);
  outline-offset: 2px;
}
.dsh-bloom-trigger__name {
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #222);
}
.dsh-bloom-chevron {
  opacity: 0.55;
  transition: transform 0.2s ease;
}
.dsh-bloom-trigger[aria-expanded="true"] .dsh-bloom-chevron { transform: rotate(180deg); }

.dsh-bloom-dot {
  width: 12px; height: 12px;
  border-radius: 999px;
  flex: none;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
}

.dsh-bloom-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  /* v0.6.0 patch: 提到 99999，确保 Bloom 下拉菜单覆盖在 DSH 原生顶栏 tabs
     （"对话 / 轨迹"，z-index 更高）之上，不被截断 */
  z-index: 99999;
  min-width: 168px;
  padding: 5px;
  border-radius: 12px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,0.08));
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff), transparent 12%);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  box-shadow:
    inset 0 1px 0 rgba(var(--bloom-morandi), 0.14),
    var(--bloom-shadow);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dsh-bloom-menu[hidden] { display: none; }
/* 菜单入场：从右上角 scale+fade 打开（hidden 移除触发；只在打开时播放一次） */
.dsh-bloom-menu { transform-origin: top right; }
@keyframes bloom-menu-in {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: none; }
}
.dsh-bloom-menu:not([hidden]) {
  animation: bloom-menu-in var(--bloom-dur-slow, 280ms) var(--bloom-ease, cubic-bezier(0.2,0.8,0.2,1));
}

.dsh-bloom-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 9px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #222);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}
.dsh-bloom-option:hover { background: rgba(var(--bloom-morandi), 0.14); }
.dsh-bloom-option:focus,
.dsh-bloom-option:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4a90e2);
  outline-offset: -2px;
  background: rgba(var(--bloom-morandi), 0.14);
}
.dsh-bloom-option[data-active="true"] { background: rgba(var(--bloom-morandi), 0.2); }
.dsh-bloom-option__name { font-weight: 500; }
.dsh-bloom-option__en {
  margin-left: auto;
  font-size: 11px;
  opacity: 0.5;
  letter-spacing: 0.02em;
}
.dsh-bloom-check {
  width: 12px;
  text-align: center;
  opacity: 0;
  color: var(--dsw-alias-brand-primary, #4a90e2);
  font-weight: 700;
}
.dsh-bloom-option[data-active="true"] .dsh-bloom-check { opacity: 1; }

/* v0.5.0：氛围区（壁纸 / 玻璃 toggle / 主题包控件）已移除，菜单只保留变体列表。 */

/* 版本 / 更新指示（菜单底部）：一眼看到当前版本，有新版亮「↑ vX」 chip */
.dsh-bloom-version {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 6px 9px 2px;
  border-top: 1px solid var(--bloom-hairline, rgba(0,0,0,0.08));
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-version__name {
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, #666);
  text-decoration: none;
}
.dsh-bloom-version__name:hover { color: var(--dsw-alias-brand-primary, #4a90e2); }
.dsh-bloom-version__current { font-variant-numeric: tabular-nums; }
.dsh-bloom-version__update {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 999px;
  background: color-mix(in oklch, var(--dsw-alias-brand-primary, #4a90e2), transparent 84%);
  color: var(--dsw-alias-brand-primary, #4a90e2);
  font-weight: 600;
  text-decoration: none;
}
.dsh-bloom-version__update:hover { color: color-mix(in oklch, var(--dsw-alias-brand-primary, #4a90e2), black 15%); }

/* ── DSH 升级检查区块（紧贴 Bloom 版本行下方）── */
.dsh-bloom-dsh-update {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  padding: 6px 9px 7px;
  border-top: 1px solid var(--bloom-hairline, rgba(0,0,0,.06));
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-dsh-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.dsh-bloom-dsh-label {
  flex: 0 0 28px;
  color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-dsh-ver {
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #555);
  font-family: ui-monospace, SFMono-Regular, 'Menlo', monospace;
  font-size: 10.5px;
}
.dsh-bloom-dsh-state {
  margin-left: auto;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in oklch, var(--dsw-alias-label-tertiary, #999), transparent 88%);
  color: var(--dsw-alias-label-secondary, #666);
}
.dsh-bloom-dsh-state[data-state="update"] {
  background: color-mix(in oklch, var(--bloom-accent, #c47b4a), transparent 78%);
  color: var(--bloom-accent, #c47b4a);
  font-weight: 600;
}
/* 状态 chip 的绿/红必须明暗分档 —— oklch(60%) 是「中间亮度」，两头都不够:
   亮底上实测 ≈2.9:1、暗底上 ≈3.4:1，10px 字号更需要对比度。
   亮色压暗到 45%/48%，暗色提亮到 78%/72%，两档都过 AA。 */
.dsh-bloom-dsh-state[data-state="latest"] {
  background: color-mix(in oklch, oklch(45% 0.13 150), transparent 88%);
  color: oklch(45% 0.13 150);
}
.dsh-bloom-dsh-state[data-state="managed"],
.dsh-bloom-dsh-state[data-state="ahead"] {
  background: color-mix(in oklch, var(--dsw-alias-brand-primary, #4a90e2), transparent 88%);
  color: var(--dsw-alias-brand-primary, #4a90e2);
}
.dsh-bloom-dsh-state[data-state="err"] {
  background: color-mix(in oklch, oklch(48% 0.17 28), transparent 88%);
  color: oklch(48% 0.17 28);
}
body[data-ds-dark-theme] .dsh-bloom-dsh-state[data-state="latest"] {
  background: color-mix(in oklch, oklch(78% 0.14 150), transparent 88%);
  color: oklch(78% 0.14 150);
}
body[data-ds-dark-theme] .dsh-bloom-dsh-state[data-state="err"] {
  background: color-mix(in oklch, oklch(72% 0.16 28), transparent 88%);
  color: oklch(72% 0.16 28);
}
.dsh-bloom-dsh-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}
/* 下拉只有 180px 宽,actions 区实际可用 150px。两个按钮原本都 flex:1 平分 73px,
   而「复制升级命令」6 字 × 10.5px + 左右 padding ≈ 79px —— 装不下就折成两行,
   加上 line-height:1 两行字直接贴在一起。修法三件套:
     · 文案缩到「复制命令」(完整说明进 title)
     · white-space: nowrap 兜底 —— 以后换文案/换字号也不会再折行
     · 宽度按内容分配:次要按钮取内容宽,主按钮吃掉剩余空间 */
.dsh-bloom-dsh-btn {
  flex: 0 0 auto;
  white-space: nowrap;
  padding: 4px 8px;
  font: 600 10.5px/1 -apple-system, sans-serif;
  border-radius: 6px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,.08));
  background: transparent;
  color: var(--dsw-alias-label-secondary, #666);
  cursor: pointer;
  transition: background .15s var(--bloom-ease), color .15s var(--bloom-ease), border-color .15s var(--bloom-ease);
}
.dsh-bloom-dsh-btn:hover {
  background: color-mix(in oklch, var(--bloom-accent, #c47b4a) 14%, transparent);
  border-color: color-mix(in oklch, var(--bloom-accent, #c47b4a) 40%, transparent);
  color: var(--dsw-alias-label-primary, #222);
}
/* 主操作按钮改实心 —— 原本是 accent 22% 底 + accent 文字,同色系互叠只有
   4.09:1(10.5px 字)。实心 accent 底 + 反色文字实测 ≈7:1,而且 PALETTE 的
   accent×bg 组合本来就由 contrast-guard 守着 ≥4.5,这条路天然达标。
   它也确实是主操作,视觉上该比「↻ 检查」重。 */
.dsh-bloom-dsh-btn--primary {
  flex: 1 1 auto;
  background: var(--bloom-accent, #c47b4a);
  border-color: var(--bloom-accent, #c47b4a);
  color: var(--dsw-alias-label-primary-foreground, #fff);
}
.dsh-bloom-dsh-btn--primary:hover {
  background: color-mix(in oklch, var(--bloom-accent, #c47b4a), black 10%);
  color: var(--dsw-alias-label-primary-foreground, #fff);
}
/* 复制成功/失败的就地反馈态。点击的是按钮,反馈就出现在按钮上 ——
   原先只在下方另起一行 10px 小字,而点击时视线在按钮上,极易整个错过。 */
.dsh-bloom-dsh-btn.is-done {
  background: oklch(45% 0.13 150);
  border-color: oklch(45% 0.13 150);
  color: #fff;
}
.dsh-bloom-dsh-btn.is-fail {
  background: oklch(45% 0.16 25);
  border-color: oklch(45% 0.16 25);
  color: #fff;
}
body[data-ds-dark-theme] .dsh-bloom-dsh-btn.is-done {
  background: oklch(72% 0.14 150);
  border-color: oklch(72% 0.14 150);
  color: oklch(18% 0.02 150);
}
body[data-ds-dark-theme] .dsh-bloom-dsh-btn.is-fail {
  background: oklch(72% 0.16 25);
  border-color: oklch(72% 0.16 25);
  color: oklch(18% 0.02 25);
}
/* 按压反馈 —— 之前点下去毫无变化,连「点到了」都要靠猜 */
.dsh-bloom-dsh-btn:active { transform: scale(0.97); }
.dsh-bloom-dsh-btn:disabled { opacity: 0.6; cursor: default; }

/* hint 的绿必须明暗分档:oklch(60%) 是「中间亮度」,实测在暗色菜单底上只有
   3.3:1(而且是 10px 字)。这与 state chip 那次是同一个硬编码色值,当时漏了这处。 */
.dsh-bloom-dsh-hint {
  margin-top: 4px;
  padding: 4px 6px;
  border-radius: 5px;
  background: color-mix(in oklch, oklch(45% 0.13 150), transparent 90%);
  color: oklch(45% 0.13 150);
  font-size: 10px;
  text-align: center;
}
body[data-ds-dark-theme] .dsh-bloom-dsh-hint {
  background: color-mix(in oklch, oklch(78% 0.14 150), transparent 88%);
  color: oklch(78% 0.14 150);
}

@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-trigger, .dsh-bloom-chevron, .dsh-bloom-option { transition: none !important; }
}

/* 窄屏降级：DSH 顶栏在 < 900px 时空间紧张，隐藏中文名只留色点+chevron，
   避免挤压 Session log 等原生控件。色点本身 12px 渐变辨识度足够。 */
@media (max-width: 900px) {
  .dsh-bloom-trigger__name { display: none; }
  .dsh-bloom-trigger { padding: 0 7px; gap: 4px; }
}
`
