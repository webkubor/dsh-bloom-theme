---
name: bloom-desktop-ui
description: Bloom UI 调试：默认用干净隔离的 DSH Web 会话逐帧截图、量测布局和核验配色材质；桌面端只作为兼容验收。成功路径入 skill，失败原因入统一台账。
---

# Bloom UI 调试

先读 AGENTS.md、CONTRIBUTING.md、docs/lessons.md。复用有效 CS Run 和工作树；**Web 优先，桌面只做兼容验证**。Agent 自己完成视觉验收，不用阻塞式 UI 确认门替代验收。

## Web 优先的三条硬约束

1. **干净环境取材**：演示、截图、视频只能在隔离 `DSH_HOME` 的 Web 会话中制作；会话标题、正文、工作区名、侧栏记录必须是中性示例，公开素材不得出现真实面板、项目、会话、消息、终端、路径或凭据。私有验收截图也只存用户私有持久目录，不提交仓库。
2. **逐帧目视验收**：布局修复不能以测试 exit 0 代替。至少逐帧查看正常菜单、打开/关闭、滚动到底、hover/focus、明暗两种模式和 1280/1024/390 三种宽度；截图中若出现宿主 tooltip、裁切、错位或 sticky 遮挡就继续修。录屏检查要抽帧网格看，不能只看封面。
3. **引用前回读真实文件**：写 README、release note、PR/Issue、skill 或交接前，当场读取目标文件和发布 URL 的真实内容；不凭上一轮摘要、记忆或旧截图复述版本号、链接、Issue/PR 状态和素材内容。

## Web 快速流程

```sh
npm run build
DSH_HOME=/path/to/clean-dsh-home dsh plugin --profile web add "$PWD"
DSH_HOME=/path/to/clean-dsh-home dsh --profile web --port 3081 --no-open
```

日常本地 Web 使用默认 `~/.dsh` 时只需一条命令：`npm run install:web`。Web 插件由服务端注入，安装后必须重启 Web 进程；刷新浏览器不能证明新版本生效。不要拿真实工作台录公开演示。

Playwright 量测固定记录 viewport、菜单与 head/body/foot rect、body `scrollHeight/clientHeight`、`menu.style.left/top/right`、`offsetParent` 和祖先 `transform/contain/zoom`。宽度发生变化时重新开菜单，因为定位只在 resize/scroll 时更新。aria 文本若已被可见文本覆盖，不额外制造宿主 tooltip。

## 桌面兼容路径：真实菜单与窗口

原生菜单和截图无需另开浏览器，也不读取 Cookie 或凭据。不要改 body 属性冒充用户选择。

```sh
swiftc scripts/ui/native-ui.swift -o /tmp/bloom-native-ui
osascript -e 'tell application "DeepSeek Harness" to activate'
/tmp/bloom-native-ui window
/tmp/bloom-native-ui list 'Bloom 主题'
/tmp/bloom-native-ui press 'Bloom 主题 ·*' AXPopUpButton
/tmp/bloom-native-ui list
```

- `window` 返回当前活动窗口的 id、bounds、onscreen。检查窗口自身时可按实时 id 用 `screencapture -x -l <id> <file>`；它不证明屏幕合成效果。确需 `-R` 截取合成画面时，截图前后均核对目标窗口与前台应用，焦点或窗口变化就删除该截图而不打开，以免误采其他应用。不要复用旧 id 或坐标。重要证据存用户私有的持久目录，不依赖 `/tmp`。
- 触发器为 AXPopUpButton；help 是 `Bloom 主题 · vX`，label 是当前配色，expanded 是菜单可见性。先查状态再切换。
- 配色项为 AXStaticText，help 是「配色 · 诗句」。按下后菜单关闭，应读回触发器 label。
- 深浅和「毛玻璃 / 磨砂玻璃 / 液态玻璃」为 AXCheckBox；背景为 AXRadioButton。按下后等待并核对选中值，不能只看命令 exit 0。
- 用 `cordis_inspect_list` 发现 `BloomDiagnostics.snapshot`，以 JSON **对象**传 `target: desktop`、`foreground: true`；取得原生 AX 编辑器的位置和宽度，将窗口相对坐标作为 `editorLeft` / `editorWidth` 一并传入。只有原生编辑器与 DOM 坐标匹配，才能把该 `page.id`、样式和截图归属为同一窗口。诊断只读，不提供业务操作。
- 用户正在其他应用工作时不要抢占焦点；不发送测试消息、不停止任务、不覆盖草稿。输入检查前确认当前编辑器为空且窗口/焦点正确；只允许一个执行者输入自己的测试文字，不按 Enter，确认内容归属后再清除。

快捷入口（自动编译辅助程序）：

```sh
node scripts/ui/desk.mjs /tmp/bloom-ui/current.png
node scripts/ui/desk.mjs /tmp/bloom-ui/menu.png --menu
node scripts/ui/matrix.mjs /tmp/bloom-ui/representatives representatives
node scripts/ui/matrix.mjs /tmp/bloom-ui/palettes palettes
node scripts/ui/matrix.mjs /tmp/bloom-ui/full full
node scripts/ui/matrix.mjs /tmp/bloom-ui/full full --resume
```

`desk` 用于原生截图。矩阵工具只有在能够完整记录和恢复偏好、检测自动轮换且校验每次读回后才能运行；`native-material-matrix.py` 当前对不具备这些条件的运行主动停止。不能把旧版材质的截图算作新版验收，也不能仅凭 AX 选中状态区分隐式 auto 和显式选择。

记录当前窗口、配色、外观、材质偏好、浅深背景和轮换间隔；确认还原能力后再操作。菜单和选中状态使用有上限的等待；截图用 `read_image` 逐张检查，并区分“已采集”和“已目视通过”。自动轮换发生时标记并重拍受影响组合。

## 官方开发者工具：用于 DOM/CSS 诊断

入口是桌面应用菜单「DeepSeek Harness → 开发者工具」，选择 Console。打开前检查是否已打开，不盲目 toggle。实际桌面 origin 为 `dsh-app://app`。

`native-console.swift` 是后备：确认 Console AX 焦点后才输入；找不到时 JSON 报错并退出。剪贴板在所有出口恢复。曾成功读出真实 origin/variant/material，但长脚本尚不稳定；最多尝试两次，转回 AX，不用它阻塞截图与菜单验证。

9230 是 DSH 跨运行时 Inspector，不等于 Electron renderer CDP。只看到 Host context 时，不能宣称控制了桌面。不能读取 Cookie 数据库另开 headless 副本来替代本机验收。

## 修改、安装与核验

1. Web 优先完成主体修复；需要兼容验证时，再按大区块（背景、侧栏、顶栏）→中区块（输入框、菜单、消息）→小区块（按钮、图标）检查桌面。每步看真实截图。
2. 先 build；本地 Web 用 `npm run install:web` 并重启 Web 进程。桌面通过官方 plugin_manager 安装本候选路径。按 application/nextStep 执行；若返回 already-installed 且要求 remove/install，顺序完成两步，不在卸载状态结束。
3. applied 证明管理操作完成；还要核对实际材质、菜单与选中状态。桌面不是普通浏览器，不要求用户用 ⌘R。
4. 对宽表/长会话、菜单溢出、hover/focus/typing/pending 做额外核验。动画至少连续帧，不拿单帧证明流星运动。
5. 检查降级：减少动效、减少透明度、高对比、强制颜色。折射像素测试只证明实现，不证明好看。

## 覆盖与视觉评审

原生显式组合为 12 配色 × 2 明暗 × 4 对应氛围 × 3 材质 = 288。自动档/系统媒体查询另测；不能把不存在的第四个材质按钮算进原生覆盖。记录实际数量、清单与失败，不把采样写成全覆盖。

多模型评审给相同真实截图、相同中性标准，保留原意见。可用 `cs look <image> --ask <question>` 本地视觉；另一模型只使用已配置工具。请求路由与实际模型分开记录，无法确认填 unknown。意见不一致就不宣称一致通过；修有证据的问题，复拍再评审，不追求措辞更好听的答案。

## 经验维护

成功路径更新本 skill；通用错误只更新 docs/lessons.md，代码仅留 LES 索引。失败的 Cookie/强改 dataset 脚本已撤出默认入口。未完成的视觉复核、组合覆盖或 Web 验证必须留在交接里。
