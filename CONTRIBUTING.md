# 贡献指南

欢迎提 issue 和 PR。版本与 CHANGELOG 由 release-please 维护，贡献者使用 Conventional Commits 描述改动。

## 本地构建

```bash
git clone git@github.com:webkubor/dsh-bloom-theme
cd dsh-bloom-theme
npm ci
npm run typecheck
npm run build
npm run dev          # 首次完整构建后监听浏览器源码，只更新本仓 lib/
```

`dev` 不安装插件，也不刷新宿主。浏览器源码变更会重新打包；修改 Host 入口、版本号或 CHANGELOG 后，停止监听并重新运行 `npm run build`。

## 在 DSH 中安装与验证

使用正在运行的 DSH 的插件管理界面，或让该 DSH 会话调用官方 `plugin_manager`：先 `list_bundles` 核对已有包，再用 `install_bundle`，`target` 为构建完成的仓库绝对路径；正式版使用明确的 `dsh-bloom-theme@版本`。安装由宿主管理，禁止通过 shell 复制、rsync 或直接改写 profile 的依赖和 `node_modules`。

安装返回值中的 `application` / `nextStep` 决定后续动作。替换已安装的包可能需要重启宿主才能加载新模块；按返回提示完成重启后重新核对。页面刷新、相同 Slot ID 或本地构建成功都不能证明更新已经应用。若 DSH 版本要求阻止安装，先使用兼容宿主，不绕过版本检查。

使用运行时提供的 GUI URL，不写死端口。先确认实际加载版本与插件状态，再验证菜单、语言、配色切换与更新提示；截图和浏览器 console 共同作为证据。需要还原正式版时，也通过插件管理安装已发布的精确版本。

## 官方扩展点

浏览器插件通过 `dsh.client.inject` 声明能力，用 `window.__ModuleLoader__.load()` 注册。根 `conversation.header.leading` Slot 提供本插件自己的顶栏定位锚点；完整切换器与其菜单、星光和更新提示都挂载在根 `shell.overlay` Slot，避免被宿主顶栏裁剪。定位只测量自己的锚点，不通过宿主选择器寻找位置。Slot 由 apply 通过 `ctx.slots.inject` 注册，副作用由上下文 effect/React effect 清理。

更改能力或挂载位置前，先用 `cordis_inspect_list`，再用 Provider 声明的查询读取确切 Service 契约、Slot 树与 props。Inspect 方法是只读发现接口，不是插件可调用的业务 Service。不要扫描宿主 DOM 来寻找工具栏，不要手动重挂节点、追加第二个应用根或恢复悬浮拖拽兜底。

主题样式调整沿用官方 theme token。已有兼容选择器仍需验证命中范围，禁止新增依赖构建 hash 的选择器；也不要通过匹配其它插件的 DOM/CSS 推测布局。

## 源码与产物

`src/` 按职责拆分，Host 入口为 `src/index.ts`，Client 入口为 `src/client.ts`。`lib/` 是构建产物，不手改。

| 产物 | 编译器 | 格式 |
|---|---|---|
| `lib/index.js` | `tsc` | ESM，供 Cordis Host loader 加载 |
| `lib/client.js` | `esbuild` | IIFE 单文件，供浏览器 classic script 加载 |

浏览器源码可拆模块，产物必须自包含。`scripts/bundle.mjs` 检查产物不存在顶层 `import` / `export` / `require()`，并包含 ModuleLoader 注册。

`package.json`、`.release-please-manifest.json`、`src/meta.ts` 的版本必须一致。移动 `PLUGIN_VERSION` 时同步核对 `release-please-config.json` 的 `extra-files` 与版本检查脚本。`sync-version` 只按现有包版本同步源码，不决定下一版本。

## 验证命令

```bash
npm run build
npm run check
npm run test:browser
npm pack --dry-run
npm run preflight    # 发布候选完成后联网核对远端真源
```

`check` 覆盖打包契约、版本真源、选择器与范围边界、脚本测试和配色对比度；不等于运行时验证。`test:browser` 使用临时隔离的浏览器测试夹具验证交互，也不能代替真实宿主安装验收。`preflight` 会联网检查 npm、GitHub、版本、工作树及收录状态；记录失败项的实际原因，不把未提交的开发分支称为已发布。

CI 在 PR 和 main push 上执行 `npm ci`、现有产物语法检查、check、test:browser 和 dry-run 包内容检查；它不自动构建普通 PR 的产物，因此提交前必须完成 build。提交前确认包含 `lib/index.js`、`lib/client.js`、`cordis.patch.yml`、README 与 LICENSE，且没有无关改动。

## 配色与视觉审计

每套配色有两条轨道：

- `accentL` / `accentD` 用于文字、按钮和可读边框，必须通过 WCAG AA。
- `morandi` 用于低透明度氛围渐变和冷光，不用于可读文字。

改颜色后运行 `npm run check`，并在真实宿主中核对明暗主题、各变体、键盘焦点和 `prefers-reduced-motion`。`contrast-guard` 的静态计算不能替代半透明叠层的浏览器实测。

浏览器审计可使用 `scripts/visual-audit.browser.js`。调用方从当前 `src/palette.ts` 取得变体键，注入 `window.__bloomVariants` 后调用 `window.__bloomAudit()`；变体清单不可复制成过期常量。先检查审计结果的 `TRUSTWORTHY` 与 `sanity`，再看对比度和最终 verdict。运行时切换使用真实菜单与宿主设置，属性强切只用于纯 token 测量。

提交视觉改动时提供明暗截图、所测宿主版本、实际加载的插件版本、审计命令与结果。完整历史问题见 [DEV_NOTES.md](./DEV_NOTES.md)；其中旧部署命令和固定端口属于历史记录，当前操作以本指南为准。

### 对外截图脱敏

README、Release 或公开讨论使用的截图，必须先在当前页面注入 `scripts/redact-for-shot.js`，等待执行成功，再截图。通过浏览器工具读取并执行脚本全文；Playwright 中可用 `await page.evaluate(redactionSource)`，其中 `redactionSource` 为该文件的 UTF-8 内容。

脚本把项目名、会话标题和工作区名称替换为示例名称，并在结束前检查原名是否残留；自检抛错时停止截图，不捕获错误后继续。截图前还要核对正文、路径、命令、账号与凭据等未被脚本覆盖的内容，必要时使用专门的示例会话或裁剪安全区域。脱敏不写存储、不发请求，刷新即可恢复，但宿主重新渲染可能恢复真实文字，因此每次截图前重新注入并确认结果。

脱敏只服务对外展示图，不把替换后的内容当作功能验收证据；原始验收证据保留在受控范围内。脚本不随 npm 包分发，`npm run check` 会检查脚本、自校验和本流程引用是否在位。

## 发布流程

1. 在独立 worktree 完成源码、双语 README 和构建产物，运行上述验证及真实宿主验收。
2. 使用 `feat:` / `fix:` / `docs:` / `ci:` 等 Conventional Commits 提交，通过仓库交付流程合入 main。
3. Release Please 工作流在 main push、每日定时巡检或手动触发时创建或更新 Release PR；以该 PR 的提议为下一版本真源，不手工 bump 版本或 CHANGELOG。
4. Release Artifact Rebuild 工作流在 Release PR 上同步版本并重新构建产物；核对完整 diff 和当前 head SHA 的 CI 结果。
5. main push、每日定时巡检及默认的手动触发只准备 Release PR。`auto_merge_release` 默认 `false`，因此不会自动启用合并。候选版到此仍未正式发布。
6. 完成实际桌面安装验收、所发布 head SHA 的 CI 和独立代码评审，逐项处理所有评审发现，再运行 `npm run preflight`。发布负责人确认以上验收后，才可在本仓库显式执行：

   ```bash
   gh workflow run release-please.yml -f auto_merge_release=true
   ```

   该命令允许工作流在 GitHub 判定 Release PR 为 `clean` 后，使用刚核验的 head SHA 合并并触发正式发布；准备候选版时不要执行。工作流不自动解决评审线程；状态不满足、head 变化或合并被拒绝时只记录警告，交给负责人检查。
7. 合并 Release PR 后由 Release Please 创建 tag / GitHub Release，Publish 工作流通过 OIDC 发布 npm，并补充 release notes。分别核对 tag 指向、Publish 结果、npm 精确版本及 registry integrity，不能只看 GitHub Release 存在。

本仓使用 pre-1.0 版本策略：普通 `feat` 增 minor，`fix` 增 patch，破坏性变更的处理由 release-please 配置决定。最终版本以 Release PR 为准。需要特殊版本时使用 release-please 官方支持的配置或 Release-As 机制，重新审核提议；不要依赖未经验证的评论命令。

release-sync 负责当前版本在已登记文档或技能中的一致性，不代替 release-please 选版本。发版流程与版本同步入口只保留一套。
