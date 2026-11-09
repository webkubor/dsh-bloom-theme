# Bloom 诊断与排障规范

本文档系统定义 Bloom 的运行态诊断数据采集标准、结构定义与排错流程。

---

## 1. 目标与设计原则

当用户在不同操作系统（Windows、macOS、Linux）、缩放比（100%、125%、150%）或 DSH 新旧版本中反馈界面异常时，仅凭肉眼截图难以判定具体的容器类名、CSS 优先级碰撞或父级继承属性。

诊断机制遵循以下原则：
1. **零隐私采集**：严禁读取会话消息内容、用户输入、路径详情或任何敏感业务数据。
2. **只读采样**：仅通过 `window.getComputedStyle` 采样关键布局容器的计算样式与环境指纹。
3. **结构化与一键交付**：通过菜单「诊断」按钮直接复制为 GitHub 兼容的 Markdown 折叠块，方便在 Issue 中直接粘贴。

---

## 2. 数据结构定义 (`BloomDiagnostics`)

```ts
export interface BloomDiagnostics {
  timestamp: string
  bloom: {
    version: string               // 插件当前版本（如 0.26.0）
    variant: string               // 当前激活配色（如 cinnabar / grass / ripple）
    appearance: 'light' | 'dark'  // 当前深浅模式
    glassMode: string             // 保存的质感偏好：auto / frosted / matte / liquid；系统降透明时实际效果可能不同
    rotationMinutes: number       // 自动换色周期（0 为关闭）
    bodyDataset: Record<string, string> // body 上的 data-bloom-* 属性状态
    slots: {
      switcherAnchorMounted: boolean // conversation.header.leading 锚点挂载状态
      overlayMounted: boolean        // shell.overlay 全局装饰层挂载状态
    }
  }
  host: {
    platform: string              // 操作系统平台（如 Win32 / MacIntel）
    userAgent: string             // 运行时 UserAgent（含 Electron/Chrome 版本）
    devicePixelRatio: number      // 屏幕像素缩放比（1 / 1.25 / 1.5 等）
    viewport: { width: number; height: number } | null // 当前窗口视口尺寸
    language: string              // 浏览器首选语言
  }
  domAudit: {
    sidebar?: Record<string, string | boolean> | null // 侧栏关键项目的计算样式
    header?: Record<string, string | boolean> | null  // 顶栏容器的高度与背景计算样式
    plugins?: Record<string, string | boolean> | null // 插件设置页面的背景与层级计算值
    body?: {
      backgroundColor?: string
      backgroundImage?: string
      color?: string
    } | null
  }
  tokens: Record<string, string>  // 核心 CSS 变量值（--bloom-accent、--bloom-morandi 等）
}
```

---

## 3. 常见排查场景对照

| 问题现象 | 重点查看诊断字段 | 典型根因与检查点 |
|---|---|---|
| **侧栏间距异常（如 #102）** | `domAudit.sidebar.margin` / `domAudit.sidebar.lineHeight` | 检查 `[class*="_groupSection"]` 或 `[role="treeitem"]` 是否被注入了过大的 `margin-top` 或未预期的 `min-height` |
| **背景色生硬断层 / 白块** | `domAudit.header.backgroundColor` / `domAudit.body` | 检查宿主特定面板（如 Plugins 或 Tabs）是否自带实色底（`#fff` / `#000`）覆盖了全局渐变 |
| **高 DPI 屏幕文字模糊或溢出** | `host.devicePixelRatio` / `host.viewport` | 检查是否在 Windows 125%/150% 缩放下触发了亚像素折行，或固定列宽 track 未留足缓冲 |
| **功能按钮无响应** | `bloom.slots` | 检查宿主 React Slot 是否正常挂载，排除 DOM 被重置或事件冒泡被拦截 |

---

## 4. 调试入口

除 UI 菜单底部的「诊断」按钮外，控制台提供全局只读挂载：

```js
// 导出完整诊断对象
window.__BLOOM_DEBUG__.dump()

// 直接复制格式化后的 Markdown 报告至剪贴板
await window.__BLOOM_DEBUG__.copy()
```
