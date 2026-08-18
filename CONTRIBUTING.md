# 贡献指南

欢迎提 issue 和 PR。

## 本地开发

```bash
git clone https://github.com/webkubor/dsh-bloom-theme
cd dsh-bloom-theme
npm run dev      # 监听 lib/，保存即部署到 web profile 并自动刷新浏览器
```

改完必须刷新页面——皮肤在浏览器端注入，且 CSS 由 `client.js` 运行时生成，
没有「只热更 CSS」这条路。`npm run dev` 已代劳（按 `a` 可关掉自动刷新）。

## 提交前

```bash
npm run check
```

这会校验三件事，都是踩过坑才加的：

1. **打包契约** —— `dsh.bundle.patch`、包名与 `cordis.patch.yml` 一致、`files` 白名单、
   以及 `client.js` 里 `PLUGIN_ID` 与包名一致（不一致会让 DSH 报
   `loaded without registering`）
2. **配色对比度** —— 直接从 `PALETTE` 解析色值算 WCAG，8 组必须 ≥ 4.5:1
3. **前景色 token 反模式** —— `markdown-inline-code` 不得写成裸色值（它是背景色），
   暗色阴影必须纯黑

## 改配色时注意

**双轨制不能退回单轨。** 每个变体有两套色：

- `accentL` / `accentD` 是**可读轨**，用于文字、按钮填充、边框，必须过 WCAG AA
- `morandi` 是**气质轨**，只用于 `rgba(morandi, 0.05~0.2)` 的大面积氛围渐变与冷光

拿可读轨去铺大面积，或者拿气质轨去做文字色，都会失去莫兰迪质感。
改完跑 `npm run check`，对比度不达标会直接失败。

## 改 CSS 选择器时注意

DSH 用 CSS Modules，类名形如 `wSkVaW_root`（`<hash>_<语义名>`）。hash 随 DSH 构建变化，
语义名相对稳定，所以一律用 `[class*="_语义名"]` 匹配，并且：

- **限定 `div`** —— 裸 `[class*="_panel"]` 会命中 SVG 元素
- **先数命中量** —— 裸 `[class*="_card"]` 会命中 30+ 个消息卡：

  ```js
  [...document.querySelectorAll('[class*="_card"]')].length
  ```

- **描边只给有实色背景的那一层** —— 加在内层透明元素上会形成「框中框」

## 提交信息

用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：
`feat` / `fix` / `docs` / `ci` / `chore` / `refactor`。

正文说清**为什么**这么改，不只是改了什么——本项目多数 bug 的根因都不在报错指向的地方，
完整复盘见 [DEV_NOTES.md](./DEV_NOTES.md)。

## 发版流程

1. 改完 `npm run deploy`，在真实 DSH 里验证
2. `npm run check` 通过
3. `npm version patch|minor` → `npm publish` → `git push` → 建 GitHub Release
4. 更新 `CHANGELOG.md`
