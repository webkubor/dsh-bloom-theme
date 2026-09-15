# Banner 的可重生方式

`assets/bloom-banner.png`（README 首图）不是一次性交付物 —— **配色数量变了就得重出**，
所以把生成方式留在这里，而不是只留一张 PNG。

2026-09-15 重做的原因：旧图上印着「4 VARIANTS」，那时确实只有 4 套；等配色加到 10 套、
又全部改成中国风命名之后，README 首屏第一眼就是个错事实。

## 怎么重出

1. **底图**（抽象艺术，不含任何文字）——`bg-band.png`。它是用本机出图链路生成后裁成
   3.2:1 的：

   ```sh
   museav gen --ratio 16:9 --model gpt-image-2 --quality high -p "Abstract wide banner artwork, pure dark background. Left third is near-black void, empty. Toward the right, soft out-of-focus luminous blooms in muted Morandi colours — dusty slate blue, desaturated rose, warm mauve, faint amber — bleeding into each other like light through frosted glass. Thin luminous curved lines sweep across the right half, glass-edge highlights, very subtle. Fine film grain. Cinematic, calm, high-end, editorial. No text, no letters, no logo, no watermark, no people, no objects."
   ```

2. **文字与色点**——`banner.html`。**字不交给出图模型**：生成模型写不对字，而这张图上
   每个字都是事实（版本数、WCAG 档位），错一个就等于首屏在撒谎。所以排版走 HTML/CSS，
   色点直接取 `src/palette.ts` 里各变体的 `morandi` 值，改配色时一起改。

3. **出图**：3200×1000 截图后缩到同尺寸（浏览器按 2x 渲染，所以截出来是 6400×2000）。

   ```sh
   browser-harness <<'PY'
   new_tab("file://<绝对路径>/assets/banner/banner.html")
   wait_for_load()
   capture_screenshot("/tmp/banner-raw.png", full=True)
   PY
   python3 -c "from PIL import Image; Image.open('/tmp/banner-raw.png').convert('RGB').resize((3200,1000), Image.LANCZOS).save('assets/bloom-banner.png', optimize=True)"
   ```

4. **上传**：图床是 R2（`cs resource policy` 是真源）。**换图必须换文件名或确认 CDN 已刷新**
   —— 同名覆盖在 CDN 上不会立刻生效，会出现「本地改了、别人看到的还是旧图」。

   ```sh
   CF_ACCOUNT_ID=916ebb1b9f240bf4c8826021dd161692 \
     cs kyvault run --env CF_API_TOKEN=secret://cloudflare/api-token -- \
     cs image upload assets/bloom-banner.png --path projects/dsh-bloom-theme --target r2
   ```

   README.md / README.en.md 引用同一个稳定 URL。
