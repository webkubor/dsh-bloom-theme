# r5 本机预览验证记录（2026-11-07）

结论：配置切换、布局回归与光学实现已验证；玻璃辨识度尚未通过两路视觉评审，不作为 UI 验收完成。没有提交、推送、版本提升或发布。

## 候选身份

- 分支：`bloom-desktop-ui-verify`；基线 `74b3d1feb6ed1869ce78b5967077f5451e69c942`。改动均未提交。
- 桌面通过官方 plugin_manager 安装当前工作树；remove/install 均按 nextStep 顺序执行，最终 application=applied。
- 包版本仍为 0.26.0（未发布候选）。包 SHA256：`c96e2ade9be6ee9f4d2584b4a8e4ed539371efdcc8e0cce8167677988c31db26`。
- 构建 JS SHA256：`bde192a6014b38bdd94a3d57c649aa04d2fb45991b4255cd790c1822bfa82597`。
- Run：`201f2936-e53b-4ddf-801d-b3205d611b49`；实际主模型为路由 `group/ui`，解析后的具体模型 unknown。

## 实现与门禁

- 浅色通透档由 24px 模糊改为 3px + SVG 边缘位移；中心位移为零。侧栏、顶栏、输入框共用填色和高光，滤镜不放到包含 fixed 后代的主容器。
- 修复菜单 `position: static`、伪元素定位、侧栏内容 mask、灰色分隔叠加、输入区底托重绘造成的横带。
- 输入区底托减轻滚动文字形成的模糊脏块，发送键增加方向性高光。深色触发器的实线感收淡，键盘焦点规则保留。
- 降级档位保留，深色不使用液态镜片；背景星辉和流星仍只在深色生效。

实际执行并通过：

```sh
npm run build
npm run check
npm run test:browser
node --test test/diagnostics.test.mjs test/liquid-layout.test.mjs test/liquid-lens.test.mjs
```

浏览器回归 111/111；单独诊断、布局和镜片测试 12/12。镜片截图像素比较：边缘平均 RGB 变化约 30.22，中央 0。此测试只证明位移正确，不证明视觉好看。

## 原生桌面组合

实际通过 macOS Accessibility 按下当前 DSH 桌面的菜单控件，不读 Cookie、不打开桌面副本、不改 body 属性。

| 维度 | 覆盖 |
|---|---|
| 配色 | 12 个当前菜单配色 |
| 明暗 | 浅色、深色 |
| 氛围 | 每种明暗对应的 4 档 |
| 显式材质 | 通透、柔和、实底 |
| 唯一组合 | 288/288 |
| 截图文件 | 288/288，逐条存在性核对 |
| 状态检查 | 每组核对原生控件 value=1 与配色触发器名称 |

初次执行在第六组读回菜单状态过早；增加有上限的状态等待后用 `--resume` 补齐，其余记录未重复计数。

证据：`/tmp/bloom-ui/r5-full/{candidate,manifest,summary}.json` 及同目录 PNG。首次六组采样在 `/tmp/bloom-ui/r5-rep/`。

恢复状态：粉霞／浅色／通透／水彩晕染；深色氛围恢复为组合测试前最后一次采样的角落微光。后续脚本已同时保存和恢复两种明暗的独立氛围。隐式 auto 与显式 glass 无法通过 AX 区分，不能声称精确恢复这个存储差异。

另采集真实深色漫天流星 8 帧，右侧空背景区域在所有连续帧中均有变化：`/tmp/bloom-ui/r5-motion/desktop-meteor.gif` 与 `motion.json`。采集后恢复上述设置。没有发送消息或修改用户草稿。

## 视觉复核与实验

同一 r5 桃夭实拍分别交给本地 MLX 视觉和 Codex CLI：

- 本地模型：玻璃统一性通过；对边界及任务条拥挤提出需修改。
- Codex 路由：边缘干净、正文清晰通过；均匀浅底上的玻璃辨识度需修改。
- 结论：均未给整体通过，不存在多模型一致批准。
- 来源：本地 CLI 回执为 mlx-vlm-kit；另一 CLI 回执为 `group/mian-model-group` / openai。两者解析后的具体模型均未从网关取得，记 unknown；来源证据已写入 Run。

原意见：`/tmp/bloom-ui/review-local-r5.txt`、`review-codex-r5.txt`；路由证据在相应日志。

A/B 软高光、C specularLighting、D 同色背景光团仅在隔离 Web 临时 DOM 试验，未进入候选。A 改善很小，B 更像描边；C 最大 RGB 变化只有 2/255；D 增加了透明参照但也增加灰蓝软斑。均不作为改进推广。证据与精确实验内容在 `/tmp/bloom-ui/glass-prototypes/`。

## 尚未完成

- 用户要求的可辨认、干净的液态玻璃观感仍未取得一致视觉评价；尤其平滑浅底下的侧栏与输入框仍可能被看成普通浅色板。
- 全组合记录证明选项切换与截图覆盖，不等于逐张人工审美通过，也不替代 hover/focus/typing/pending 的真实交互复核。
- Web 空白页面没有真实会话宽表或可用输入框，不能把其菜单验证写成这两项已实测。浏览器隔离回归已覆盖相关行为；Web 缺口见 `ui-preview-web-report.md`。
- 用户 UI 确认尚未取得。下一步仍是预览视觉和真实交互验证，不进入版本准备、提交、推送或发布。

## 可重复调试入口

`skills/bloom-desktop-ui/SKILL.md` 是维护源，AGENTS.md 与 .agents 技能入口都指向它。默认脚本已改为原生 UI 路径，旧 Cookie/强改 dataset 路径已撤出；失败经验统一记录在 `docs/lessons.md`，没有散入实现注释。
