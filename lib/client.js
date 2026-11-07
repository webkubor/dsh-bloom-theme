/* dsh-bloom-theme v0.26.0 —— 由 scripts/bundle.mjs 从 src/*.ts 打包生成，请勿直接编辑。
   源码入口 src/client.ts；改完跑 npm run build。 */
(() => {
  // <define:__BLOOM_CHANGELOG__>
  var define_BLOOM_CHANGELOG_default = { version: "0.26.0", items: [{ kind: "feat", text: "补齐插件管理器标题、简介与图标" }, { kind: "feat", text: "引入物理羽化微光星辉粒子层，沉静点缀深色莫兰迪夜空" }, { kind: "feat", text: "改为右上角滑出的闪烁光点，对齐 ModelGo BucketSparkles" }, { kind: "feat", text: "落地 A 方案全屏星辰，加入防扎堆间距与深邃三层景深" }, { kind: "feat", text: "补齐浅色星辉与背景层次，整理配色菜单并接入官方 Slot" }, { kind: "fix", text: "彻底清除底部光晕与鼠标光斑残留，保持暗色纯粹沉静" }, { kind: "fix", text: "撤销输入卡与侧栏浮夸的彩色环境投影，压暗底部大色斑" }, { kind: "fix", text: "提供「打开插件管理」一键跳转，消解桌面端更新交互断层" }] };

  // src/meta.ts
  var STORAGE_KEY = "dsh-bloom-variant";
  var PLUGIN_ID = "dsh-bloom-theme";
  var PLUGIN_VERSION = "0.26.0";

  // src/palette.ts
  var PALETTE_GROUPS = [
    { family: "red", variants: ["cinnabar", "dawn"] },
    { family: "orange", variants: ["tangerine", "aurora"] },
    { family: "yellow", variants: ["osmanthus"] },
    { family: "green", variants: ["mint"] },
    { family: "cyan", variants: ["ripple"] },
    { family: "blue", variants: ["mist", "lapis"] },
    { family: "purple", variants: ["lavender", "silverrose"] },
    { family: "pink", variants: ["petal"] }
  ];
  var FEATURED_VARIANTS = PALETTE_GROUPS.flatMap((group) => group.variants);
  var PALETTE_RELEASES = {
    "0.22": ["mint", "tangerine"],
    "0.23": ["silverrose", "dawn", "osmanthus"]
  };
  function isNewVariant(variant, version) {
    return (PALETTE_RELEASES[version.split(".").slice(0, 2).join(".")] || []).includes(variant);
  }
  var PALETTE = {
    mist: {
      accentL: "oklch(50% 0.08 240)",
      accentD: "oklch(72% 0.12 240)",
      morandi: "146, 168, 179",
      bgL: "oklch(96% 0.01 240)",
      bgD: "oklch(28% 0.02 240)",
      txL: "oklch(25% 0.02 240)",
      txD: "oklch(96% 0.01 240)",
      sfL: "oklch(94% 0.01 240)",
      sfD: "oklch(34% 0.02 240)",
      sf2L: "oklch(91% 0.01 240)",
      sf2D: "oklch(40% 0.02 240)",
      motionL: ["oklch(50% 0.08 240)", "oklch(50% 0.10 210)", "oklch(50% 0.09 275)"],
      motionD: ["oklch(72% 0.12 240)", "oklch(74% 0.13 210)", "oklch(74% 0.11 275)"]
    },
    cinnabar: {
      accentL: "oklch(55% 0.18 25)",
      accentD: "oklch(72% 0.12 25)",
      morandi: "215, 75, 75",
      bgL: "oklch(97% 0.005 25)",
      bgD: "oklch(28% 0.02 25)",
      txL: "oklch(25% 0.02 25)",
      txD: "oklch(96% 0.01 25)",
      sfL: "oklch(95% 0.005 25)",
      sfD: "oklch(34% 0.02 25)",
      sf2L: "oklch(92% 0.005 25)",
      sf2D: "oklch(40% 0.02 25)",
      motionL: ["oklch(55% 0.18 25)", "oklch(55% 0.16 65)", "oklch(55% 0.15 350)"],
      motionD: ["oklch(72% 0.12 25)", "oklch(74% 0.14 65)", "oklch(73% 0.13 350)"]
    },
    petal: {
      accentL: "oklch(58% 0.22 350)",
      accentD: "oklch(75% 0.18 350)",
      morandi: "232, 133, 155",
      bgL: "oklch(98% 0.01 350)",
      bgD: "oklch(28% 0.02 350)",
      txL: "oklch(25% 0.02 354)",
      txD: "oklch(98% 0.01 350)",
      sfL: "oklch(96% 0.015 350)",
      sfD: "oklch(34% 0.02 350)",
      sf2L: "oklch(94% 0.015 350)",
      sf2D: "oklch(40% 0.02 350)",
      motionL: ["oklch(56.7% 0.22 350)", "oklch(56.7% 0.17 310)", "oklch(56.7% 0.17 20)"],
      motionD: ["oklch(75% 0.18 350)", "oklch(75% 0.14 310)", "oklch(76% 0.14 20)"]
    },
    ripple: {
      accentL: "oklch(51% 0.12 195)",
      accentD: "oklch(75% 0.12 195)",
      morandi: "95, 168, 178",
      bgL: "oklch(96% 0.01 195)",
      bgD: "oklch(20% 0.02 195)",
      txL: "oklch(25% 0.02 195)",
      txD: "oklch(96% 0.01 195)",
      sfL: "oklch(94% 0.01 195)",
      sfD: "oklch(28% 0.02 195)",
      sf2L: "oklch(92% 0.01 195)",
      sf2D: "oklch(38% 0.02 195)",
      motionL: ["oklch(51% 0.12 195)", "oklch(51% 0.13 225)", "oklch(51% 0.11 165)"],
      motionD: ["oklch(75% 0.12 195)", "oklch(76% 0.14 225)", "oklch(77% 0.12 165)"]
    },
    /* v0.5.0 新增（源自 typora-Bloom-theme 成功变体）：
       色值由 Typora dist/*.css 的 accent/bg/surface/text 直接转 oklch，hue 对齐原版 */
    sage: {
      accentL: "oklch(54.1% 0.111 115)",
      accentD: "oklch(71.9% 0.120 115)",
      morandi: "138, 154, 91",
      bgL: "oklch(97% 0.011 112)",
      bgD: "oklch(20% 0.019 113)",
      txL: "oklch(25% 0.02 116)",
      txD: "oklch(96% 0.011 118)",
      sfL: "oklch(94.9% 0.009 113)",
      sfD: "oklch(27.9% 0.02 116)",
      sf2L: "oklch(91.9% 0.009 113)",
      sf2D: "oklch(34% 0.03 116)",
      motionL: ["oklch(54.1% 0.111 115)", "oklch(54.1% 0.12 83)", "oklch(53.1% 0.10 152)"],
      motionD: ["oklch(71.9% 0.120 115)", "oklch(71.9% 0.13 83)", "oklch(71.9% 0.11 152)"]
    },
    stone: {
      accentL: "oklch(49.9% 0.06 29)",
      accentD: "oklch(75% 0.12 30)",
      morandi: "180, 160, 155",
      bgL: "oklch(95.9% 0.01 25)",
      bgD: "oklch(20.1% 0.019 30)",
      txL: "oklch(25% 0.02 29)",
      txD: "oklch(95.9% 0.01 25)",
      sfL: "oklch(94.1% 0.01 33)",
      sfD: "oklch(27.9% 0.02 28)",
      sf2L: "oklch(91% 0.01 33)",
      sf2D: "oklch(33.9% 0.03 28)",
      motionL: ["oklch(49.9% 0.06 29)", "oklch(49.9% 0.075 0)", "oklch(49.9% 0.07 60)"],
      motionD: ["oklch(75% 0.12 30)", "oklch(75% 0.13 0)", "oklch(75% 0.11 62)"]
    },
    lapis: {
      accentL: "oklch(50% 0.13 258)",
      accentD: "oklch(74% 0.10 255)",
      morandi: "47, 98, 172",
      bgL: "oklch(97.4% 0.006 240)",
      bgD: "oklch(23.1% 0.019 249)",
      txL: "oklch(23% 0.02 249)",
      txD: "oklch(96.1% 0.008 237)",
      sfL: "oklch(95.6% 0.008 242)",
      sfD: "oklch(30.1% 0.022 251)",
      sf2L: "oklch(92.4% 0.013 244)",
      sf2D: "oklch(35.9% 0.025 251)",
      motionL: ["oklch(50% 0.13 258)", "oklch(50% 0.12 226)", "oklch(50% 0.11 295)"],
      motionD: ["oklch(74% 0.10 255)", "oklch(74% 0.11 225)", "oklch(74% 0.10 292)"]
    },
    /* v0.9.0：用户反馈暗色琥珀「过暗、发闷」。
       原版 bgD 21.9% / txD hue 75（暖白），全是 56~75 暖色相、没有冷色衬底，
       整图就「红橙棕一片」。把 bg/sf 提亮一档（保持暖度），让暗色琥珀呼吸出来；
       txD 改成中性微暖，让暖白 vs 暖棕之间还有一丝冷暖差可对比。 */
    amber: {
      accentL: "oklch(55.5% 0.12 70)",
      accentD: "oklch(78% 0.11 70)",
      morandi: "159, 100, 1",
      bgL: "oklch(97.5% 0.008 74)",
      bgD: "oklch(26% 0.018 60)",
      txL: "oklch(24% 0.02 74)",
      txD: "oklch(95% 0.008 70)",
      sfL: "oklch(95.6% 0.01 82)",
      sfD: "oklch(32% 0.020 60)",
      sf2L: "oklch(93% 0.014 78)",
      sf2D: "oklch(38% 0.022 60)",
      motionL: ["oklch(55.5% 0.12 70)", "oklch(55.5% 0.11 38)", "oklch(54.1% 0.12 100)"],
      motionD: ["oklch(78% 0.11 70)", "oklch(78% 0.12 38)", "oklch(78% 0.11 100)"]
    },
    /* v0.12.x：落霞（原「极光」，owner 2026-09-14 反馈「极光颜色不好看」）——
       青绿→蓝→紫的北极光谱整族换成**橙黄系**：明亮金橙（hue 78）为主，
       motion 三色取 78/55/35 的金→橙→珊瑚日落谱，「流线」背景随之变成晚霞。
       与琥珀的区分：琥珀是压暗的棕橙（morandi 159,100,1，C 0.11~0.12），
       落霞提亮一档、彩度更高（morandi 218,158,72，accent C 0.145），读作「金」而非「棕」。
       accent×bg 两档对比度由 contrast-guard 守着，改完必须跑 npm run check。 */
    aurora: {
      accentL: "oklch(55% 0.145 72)",
      accentD: "oklch(80% 0.13 72)",
      morandi: "218, 158, 72",
      /* v0.12.1：底色去黄（owner 2026-09-15 反馈「视觉不舒服、不高级、有点脏」）。
         原因是**背景自己带色**：bgL 彩度 0.012 @ hue 80 是全套最高，而 hue 80 正是
         芥末黄区，97.5% 亮度下大面积铺开就成了「发黄的旧纸」。同为金橙的琥珀只有
         0.008 @ hue 74，干净得多 —— 差别不在色相在彩度。
         改法：底色系彩度压到 0.004~0.006（回到近中性），色相 80→72 避开黄绿；
         暖色全部集中到 accent 与 motion 上。高级感来自「底色干净、强调克制」，
         不是把主色摊到整个背景上。 */
      bgL: "oklch(98% 0.004 72)",
      bgD: "oklch(24.5% 0.008 70)",
      txL: "oklch(24% 0.012 72)",
      txD: "oklch(95% 0.005 72)",
      sfL: "oklch(96.2% 0.005 72)",
      sfD: "oklch(30.5% 0.01 70)",
      sf2L: "oklch(93.4% 0.007 72)",
      sf2D: "oklch(36.5% 0.012 70)",
      motionL: ["oklch(55% 0.145 72)", "oklch(56% 0.15 50)", "oklch(56% 0.13 32)"],
      motionD: ["oklch(80% 0.13 72)", "oklch(80% 0.14 50)", "oklch(80% 0.12 32)"]
    },
    /* v0.12.0：薰衣草 —— 灰调紫。hue 295 卡在 mist(240) 与 petal(350) 中间，
       跟两边都拉得开；彩度压到 0.10~0.11（比 petal 的 0.22 低一半），
       紫一旦上彩度就变霓虹，莫兰迪的紫必须是"蒙了一层灰的紫"。
       motion 三色取 265/295/325，是同一束紫光偏冷偏暖的两侧。 */
    lavender: {
      accentL: "oklch(52% 0.11 295)",
      accentD: "oklch(75% 0.11 295)",
      morandi: "164, 148, 190",
      bgL: "oklch(97% 0.012 295)",
      bgD: "oklch(26% 0.02 295)",
      txL: "oklch(25% 0.02 295)",
      txD: "oklch(96% 0.012 295)",
      sfL: "oklch(95% 0.014 295)",
      sfD: "oklch(32% 0.022 295)",
      sf2L: "oklch(92.5% 0.016 295)",
      sf2D: "oklch(38% 0.024 295)",
      motionL: ["oklch(52% 0.11 295)", "oklch(52% 0.10 265)", "oklch(53% 0.12 325)"],
      motionD: ["oklch(75% 0.11 295)", "oklch(75% 0.11 265)", "oklch(76% 0.12 325)"]
    },
    /* v0.22：草色 —— 嫩绿薄荷（owner 2026-11-03 点名要）。hue 160 落在 sage(115, 偏黄的竹青)
       与 ripple(195, 偏蓝的天青) 正中，三者色相各差 35~45°，并排不会读成同一个绿。
       「嫩」靠的是暗色档的高亮度低彩度（L 82% C 0.12），不是堆彩度 —— 薄荷一上 0.15
       就成了荧光绿。亮色 accent 必须压到 L 51% 才过 4.5:1，它在浅底上读作「松针」，
       嫩感交给 morandi 氛围与暗色档去表达（双轨制，见文件头）。
       底色彩度照落霞的教训压到 0.006 以内：绿底大面积铺开最容易显脏。 */
    mint: {
      accentL: "oklch(51% 0.10 160)",
      accentD: "oklch(82% 0.12 160)",
      morandi: "128, 196, 166",
      bgL: "oklch(97.6% 0.006 160)",
      bgD: "oklch(24% 0.012 165)",
      txL: "oklch(24% 0.015 165)",
      txD: "oklch(96% 0.008 160)",
      sfL: "oklch(95.6% 0.008 160)",
      sfD: "oklch(30% 0.015 165)",
      sf2L: "oklch(92.8% 0.01 160)",
      sf2D: "oklch(36% 0.018 165)",
      motionL: ["oklch(51% 0.10 160)", "oklch(52% 0.10 135)", "oklch(51% 0.09 185)"],
      motionD: ["oklch(82% 0.12 160)", "oklch(84% 0.12 135)", "oklch(80% 0.10 185)"]
    },
    /* v0.22：橙黄 —— 爱马仕橙那一档的饱和橘（owner 2026-11-03 点名要）。key / 英文名
       不用品牌名（商标），只取色。hue 47：cinnabar 25 / stone 29 偏红，amber 70 /
       aurora 72 偏金，47 是唯一空着的「正橙」。
       这是全套彩度最高的暖色（暗色 C 0.17），所以底色反而要最中性（0.005），
       橙只出现在 accent / motion 上 —— 落霞 v0.12.1 已经证明暖底会显旧、显脏。
       亮色 accent L 55% 过 4.5:1，读作焦糖橘；鲜亮的爱马仕橙在暗色档 accentD。 */
    tangerine: {
      accentL: "oklch(55% 0.16 47)",
      accentD: "oklch(73% 0.17 50)",
      morandi: "226, 128, 64",
      bgL: "oklch(97.8% 0.005 60)",
      bgD: "oklch(24% 0.01 50)",
      txL: "oklch(24% 0.014 50)",
      txD: "oklch(96% 0.006 60)",
      sfL: "oklch(95.8% 0.006 60)",
      sfD: "oklch(30% 0.012 50)",
      sf2L: "oklch(93% 0.008 58)",
      sf2D: "oklch(36% 0.015 50)",
      motionL: ["oklch(55% 0.16 47)", "oklch(56% 0.15 30)", "oklch(57% 0.13 65)"],
      motionD: ["oklch(73% 0.17 50)", "oklch(74% 0.16 32)", "oklch(78% 0.14 66)"]
    },
    /* 银红：银灰底配低彩度玫红（hue 320），与高彩度藕粉桃夭(350)拉开 30°。
       「银」靠低彩度（C 0.10）与偏灰的底色表达，不靠提亮 ——
       一提亮就变成另一种粉了。 */
    silverrose: {
      accentL: "oklch(50% 0.10 320)",
      accentD: "oklch(78% 0.10 320)",
      morandi: "168, 145, 170",
      bgL: "oklch(97.5% 0.004 320)",
      bgD: "oklch(23% 0.010 320)",
      txL: "oklch(24% 0.012 320)",
      txD: "oklch(96% 0.006 320)",
      sfL: "oklch(95.3% 0.006 320)",
      sfD: "oklch(30% 0.015 320)",
      sf2L: "oklch(92% 0.008 320)",
      sf2D: "oklch(36% 0.018 320)",
      motionL: ["oklch(50% 0.10 320)", "oklch(51% 0.07 340)", "oklch(50% 0.07 24)"],
      motionD: ["oklch(78% 0.10 320)", "oklch(79% 0.08 340)", "oklch(78% 0.08 24)"]
    },
    /* 粉霞：暖珊瑚粉(20)，与桃夭(350)、橙黄(47/50)均拉开约 30°。
       草色与橙黄按用户已有色值原样保留。 */
    /* 2026-11-04：色相 20 → 8。原来和朱砂(25)只差 5°，OKLab ΔE 0.026，并排几乎是同一个红；
       朱砂回到菜单后粉霞往胭脂/玫瑰方向让开（ΔE ≈0.05），和桃夭(350)仍差 18°。 */
    dawn: {
      accentL: "oklch(51% 0.15 8)",
      accentD: "oklch(78% 0.13 8)",
      morandi: "219, 147, 151",
      bgL: "oklch(98% 0.006 8)",
      bgD: "oklch(24% 0.012 8)",
      txL: "oklch(24% 0.013 8)",
      txD: "oklch(96% 0.007 8)",
      sfL: "oklch(95.8% 0.009 8)",
      sfD: "oklch(30% 0.017 8)",
      sf2L: "oklch(93% 0.011 8)",
      sf2D: "oklch(36% 0.021 8)",
      motionL: ["oklch(51% 0.15 8)", "oklch(52% 0.12 8)", "oklch(52% 0.11 50)"],
      motionD: ["oklch(78% 0.13 8)", "oklch(79% 0.12 8)", "oklch(79% 0.11 50)"]
    },
    /* v0.23：轻黄 —— 补上「黄」这一档（owner 2026-11-04：赤橙黄绿青蓝紫每系一种）。
       hue 98：离落霞(72)26°、草色(160)62°，是金与绿之间唯一空着的正黄。
       黄色的硬伤：亮色 accent 要过 4.5:1 只能压到 L 50%，浅底上读作秋香/芥末；
       鲜亮的鹅黄交给暗色档（L 86%）。底色彩度压到 0.006/0.008 —— 黄底一铺开最显旧。 */
    osmanthus: {
      accentL: "oklch(50% 0.12 98)",
      accentD: "oklch(86% 0.14 98)",
      morandi: "214, 186, 92",
      bgL: "oklch(97.8% 0.006 95)",
      bgD: "oklch(24% 0.008 95)",
      txL: "oklch(24% 0.014 95)",
      txD: "oklch(96% 0.008 95)",
      sfL: "oklch(95.8% 0.008 95)",
      sfD: "oklch(30% 0.012 95)",
      sf2L: "oklch(93% 0.01 95)",
      sf2D: "oklch(36% 0.015 95)",
      motionL: ["oklch(50% 0.12 98)", "oklch(52% 0.11 80)", "oklch(51% 0.10 120)"],
      motionD: ["oklch(86% 0.14 98)", "oklch(84% 0.13 80)", "oklch(84% 0.12 120)"]
    }
  };
  var VARIANTS = Object.keys(PALETTE);
  var OTHER_VARIANTS = VARIANTS.filter((v) => v !== "mist");
  var VARIANT_LABELS = {
    // 中文名一律「两字 · 中国风 · 有出处」，且必须对得上实际色相（owner 2026-09-15 定）。
    // key 全部保持不动 —— key 写进了用户的本地偏好，改 key 等于把人家选好的主题弄丢。
    //
    // poem 是配色右侧那一列：原来放英文名（Mist/Cinnabar…），对中文用户没有信息量
    // （owner：「后面的英文没啥意义，不如一句诗词呢」）。换成该色的出处诗句后，
    // 中国风就从名字渗进了界面本身。en 保留给英文 locale。
    mist: { zh: "黛蓝", en: "Mist", poem: "山色有无中", poemEn: "Hills half there, half gone" },
    // hue 240 · 王维《汉江临泛》
    cinnabar: { zh: "朱砂", en: "Cinnabar", poem: "日出江花红胜火", poemEn: "Blooms redder than fire" },
    // hue 25  · 白居易《忆江南》
    petal: { zh: "桃夭", en: "Petal", poem: "灼灼其华", poemEn: "Its blossoms ablaze" },
    // hue 350 ·《诗经·周南·桃夭》
    ripple: { zh: "天青", en: "Ripple", poem: "雨过天青云破处", poemEn: "After rain, sky breaks blue" },
    // hue 195 · 宋徽宗品汝窑语
    sage: { zh: "竹青", en: "Sage", poem: "绿竹猗猗", poemEn: "Bamboo green, growing tall" },
    // hue 115 ·《诗经·卫风·淇奥》
    stone: { zh: "赭石", en: "Stone", poem: "秋山敛余照", poemEn: "Hills gather the last light" },
    // hue 29  · 王维《木兰柴》
    lapis: { zh: "青金", en: "Lapis", poem: "碧海青天夜夜心", poemEn: "Sea, sky, a heart each night" },
    // hue 258 · 李商隐《嫦娥》
    amber: { zh: "琥珀", en: "Amber", poem: "玉碗盛来琥珀光", poemEn: "A jade bowl of amber light" },
    // hue 70  · 李白《客中行》
    aurora: { zh: "落霞", en: "Afterglow", poem: "落霞与孤鹜齐飞", poemEn: "Sunset and a lonely flight" },
    // hue 72  · 王勃《滕王阁序》
    lavender: { zh: "青莲", en: "Lavender", poem: "清水出芙蓉", poemEn: "A lotus from clear water" },
    // hue 295 · 李白《经乱离后天恩流夜郎》
    mint: { zh: "草色", en: "Mint", poem: "草色遥看近却无", poemEn: "Green from afar, gone up close" },
    // hue 160 · 韩愈《早春呈水部张十八员外》
    tangerine: { zh: "橙黄", en: "Tangerine", poem: "最是橙黄橘绿时", poemEn: "Best when oranges turn gold" },
    // hue 47  · 苏轼《赠刘景文》
    silverrose: { zh: "银红", en: "Silver Rose", poem: "银烛秋光冷画屏", poemEn: "Silver candle, autumn glow" },
    // hue 320 · 杜牧《秋夕》
    dawn: { zh: "粉霞", en: "Dawn", poem: "晓看红湿处", poemEn: "At dawn, blossoms glow" },
    // hue 8  · 杜甫《春夜喜雨》
    osmanthus: { zh: "轻黄", en: "Osmanthus", poem: "暗淡轻黄体性柔", poemEn: "Pale gold, gentle by nature" }
    // hue 98 · 李清照《鹧鸪天·桂花》
  };
  var mix = (c, p) => `color-mix(in oklch, ${c}, transparent ${p}%)`;

  // src/tokens.ts
  var readableAccent = (p, dark) => dark ? p.accentD : `color-mix(in oklch, ${p.accentL} 88%, black)`;
  function bloomTokens(p, dark) {
    const tx = dark ? p.txD : p.txL;
    const m = p.morandi;
    const motion = dark ? p.motionD : p.motionL;
    return `
  --bloom-morandi: ${m};
  --bloom-accent: ${readableAccent(p, dark)};
  --bloom-motion-1: ${motion[0]};
  --bloom-motion-2: ${motion[1]};
  --bloom-motion-3: ${motion[2]};
  /* ── 「深度求索中，用时 15 分 26 秒」那行（DSh 0.2.0）─────────────────
   * DSH 把它从「跑完后那行」（button[data-turn-process]）拆成了独立的
   * RunningStatus（div[data-chat-running]），并**改用两个专属 token** 取色：
   *   color: var(--dsw-alias-label-deep-diving)
   *   --dsw-alias-label-shimmer: var(--dsw-alias-label-deep-diving-shimmer)
   * 而这两个 token 在 DSH 里硬绑 deepseek-500 混 blue-950 —— 品牌蓝。
   * 所以不管切哪个变体，那行永远是蓝的（owner 2026-10-08 反馈）。
   *
   * 为什么不加选择器去盖：.running 的 color 是 DSH 自己声明的，覆写要写
   * 组件规则 + !important（会撞 check.mjs 的 IMPORTANT_BUDGET 棘轮）。
   * 而这两个是**语义 token** —— 接管 token 正是本项目对 DSH 的既有做法
   * （见下面 sharedDswTokens 里几十个 --dsw-alias-* 覆盖），零 !important。
   *
   * 取色从 motion 谱来：它本来就是「随变体变的多色谱」，与渐变扫光同一套。
   * shimmer（伴生的高光层）用 motion[2] 压淡，两者都跟着变体走。
   * 透明度只压一点点 —— 原生那两个是 70% 混深蓝、底更暗；直接用 motion 谱
   * 的实色在浅色卡上更实，正文级可读性反而更好。 */
  --dsw-alias-label-deep-diving: color-mix(in oklch, ${motion[1]}, transparent ${dark ? 8 : 6}%);
  --dsw-alias-label-deep-diving-shimmer: color-mix(in oklch, ${motion[2]}, transparent ${dark ? 45 : 35}%);
  /* v0.9.0：落霞流线光带色（v0.12.x 前叫「极光」） —— 从 motion 谱取色，混透明度降饱和后做丝带渐变。
     透明度低是故意的：流线是大尺度、低饱和的氛围效果，不是主色块。
     aurora 变体 v0.12.x 换色后 motion 谱是 78/55/35 → 金→橙→珊瑚，
     「流线」随之变成晚霞色（owner 2026-09-14 反馈原青绿系不好看）。 */
  --bloom-aurora-stream-1: color-mix(in oklch, ${motion[0]}, transparent ${dark ? 55 : 72}%);
  --bloom-aurora-stream-2: color-mix(in oklch, ${motion[1]}, transparent ${dark ? 55 : 72}%);
  --bloom-aurora-stream-3: color-mix(in oklch, ${motion[2]}, transparent ${dark ? 55 : 72}%);
  /* ⚠️ 阴影在暗色下必须用纯黑，不能用前景色混透明度 ——
     暗色的 --text 是近白，mix 出来的"阴影"会变成一团白雾贴在深色背景上。
     原版 root-*-dark.css 同样是写死 rgba(0,0,0,.4~.6)，只有亮色才用 text 混。 */
  --bloom-shadow-sm: 0 2px 8px ${dark ? "rgba(0,0,0,0.4)" : mix(tx, 96)};
  --bloom-shadow: 0 10px 30px ${dark ? "rgba(0,0,0,0.5)" : mix(tx, 94)};
  --bloom-shadow-lg: 0 24px 60px ${dark ? "rgba(0,0,0,0.6)" : mix(tx, 90)};
  /* DSH 的品牌蓝 #679efe(--dsw-alias-state-business-primary)用在顶栏
     「对话 / 轨迹」tab 的选中文字与下划线等处。主题必须接管它,否则 8 套配色
     切来切去,那条选中下划线永远是蓝的、跟主色打架(用户实拍反馈)。
     注意只接管 alias 层 —— --dsw-static-deepseek-400 是 DSH 的品牌标识色,
     不属于主题可覆盖范围。 */
  --dsw-alias-state-business-primary: ${readableAccent(p, dark)};
  /* 玻璃模糊半径 —— glass.ts 里 10 处 backdrop-filter 都读它。
     之前只写了 var(--bloom-glass-blur, 24px) 却从未定义,fallback 一直生效所以
     视觉没问题,但这个变量是**死的**:想统一调玻璃质感根本改不到。定义出来之后
     它才真的是一个可调参数(暗色略薄一点,深色面板本就更"实"、不需要那么重的糊)。 */
  --bloom-glass-blur: ${dark ? "22px" : "24px"};
  /* 鼠标跟随光斑的归一化坐标（0..1） —— client.ts 的 watchCursorGlow 每帧写。
     静态值取中心 50% 是合理的「无光斑时退到画面正中」fallback，不写就静默吃掉，
     aurora/cinnabar 的 radial-gradient 会立刻漂到 0%/0% 角上。 */
  --bloom-cursor-x: 50%;
  --bloom-cursor-y: 50%;
  --bloom-hairline: rgba(${m}, ${dark ? 0.3 : 0.3});
  --bloom-hairline-strong: rgba(${m}, ${dark ? 0.55 : 0.5});
  --bloom-glow: rgba(${m}, ${dark ? 0.34 : 0.2});
  --bloom-code-bg: rgba(${m}, ${dark ? 0.16 : 0.13});
  --bloom-code-fg: ${dark ? p.txD : p.txL};`;
  }
  function borderStack(p, dark) {
    const m = p.morandi;
    const tx = dark ? p.txD : p.txL;
    return dark ? `  --dsw-alias-border-l1: rgba(${m}, 0.10);
  --dsw-alias-border-l2: rgba(${m}, 0.18);
  --dsw-alias-border-l3: rgba(${m}, 0.28);
  --dsw-alias-border-l4: rgba(${m}, 0.40);` : `  --dsw-alias-border-l1: ${mix(tx, 90)};
  --dsw-alias-border-l2: ${mix(tx, 80)};
  --dsw-alias-border-l3: ${mix(tx, 70)};
  --dsw-alias-border-l4: ${mix(tx, 60)};`;
  }
  function labelStack(p, dark) {
    const tx = dark ? p.txD : p.txL;
    return dark ? `  --dsw-alias-label-secondary: ${mix(tx, 30)};
  --dsw-alias-label-tertiary: ${mix(tx, 35)};
  --dsw-alias-label-caption: ${mix(tx, 40)};
  --dsw-alias-label-dimmed: ${mix(tx, 43)};` : `  --dsw-alias-label-secondary: ${mix(tx, 28)};
  --dsw-alias-label-tertiary: ${mix(tx, 32)};
  --dsw-alias-label-caption: ${mix(tx, 35)};
  --dsw-alias-label-dimmed: ${mix(tx, 37)};`;
  }
  function sharedDswTokens(p, dark) {
    const bg = dark ? p.bgD : p.bgL;
    const tx = dark ? p.txD : p.txL;
    const ok = dark ? "oklch(72% 0.12 150)" : "oklch(45% 0.14 150)";
    const err = dark ? "oklch(72% 0.16 25)" : "oklch(45% 0.16 25)";
    const warn = dark ? "oklch(80% 0.12 75)" : "oklch(45% 0.11 75)";
    const t = (c, pct) => `color-mix(in oklch, ${c}, ${bg} ${pct}%)`;
    return `
  /* 状态色（语义色相固定，明暗分档，两档都过 WCAG AA） */
  --dsw-alias-state-success-primary: ${ok};
  --dsw-alias-state-success-secondary: ${ok};
  --dsw-alias-state-success-tertiary: ${t(ok, dark ? 78 : 88)};
  --dsw-alias-state-error-primary: ${err};
  --dsw-alias-state-error-secondary: ${err};
  --dsw-alias-state-warn-primary: ${warn};
  --dsw-alias-state-warn-secondary: ${warn};
  --dsw-alias-state-warn-tertiary: ${t(warn, dark ? 78 : 88)};
  --dsw-alias-state-warn-label: ${dark ? "oklch(88% 0.1 75)" : "oklch(40% 0.09 75)"};
  /* interactive-bg-* 是明确的**背景**语义，保持 transparent 混 —— 它要叠在各种
     底色上（行 hover、按钮 hover），预混 bg 反而会在非 bg 底色上露出色块。 */
  --dsw-alias-interactive-bg-hover-danger: ${mix(err, dark ? 86 : 90)};
  /* business = 主题 accent（bloomTokens 里已接管，这里给 tertiary 配套） */
  --dsw-alias-state-business-tertiary: ${t(readableAccent(p, dark), dark ? 78 : 88)};
  /* 反色 / 浮层 —— 跟着变体的 bg / tx 走，不再是硬编码蓝灰 */
  --dsw-alias-border-inverted: ${mix(bg, dark ? 85 : 85)};
  --dsw-alias-border-inverted2: ${mix(bg, dark ? 70 : 70)};
  --dsw-alias-label-primary-inverted: ${bg};
  --dsw-alias-button-contrast-fill: ${tx};
  --dsw-alias-button-elevated-fill: ${bg};
  --dsw-alias-button-tool-bar-fill-invisible: transparent;
  --dsw-alias-markdown-code-block-banner: ${mix(tx, 96)};
  /* tooltip / toast 两档都要是「深底浅字」：亮色拿 tx 压深，暗色拿 bg 压更深 */
  --dsw-alias-tooltip-bg: color-mix(in oklch, ${dark ? bg : tx}, black ${dark ? 22 : 8}%);
  --dsw-alias-toast-bg: color-mix(in oklch, ${dark ? bg : tx}, black ${dark ? 22 : 8}%);
  --dsw-alias-bg-mask-photo: color-mix(in oklch, ${bg}, black ${dark ? 45 : 30}%);`;
  }
  function mistLight(p) {
    const { bgL, txL, sfL, sf2L } = p;
    const aL = readableAccent(p, false);
    return `
/* ─── Bloom · mist 雾蓝 亮色（默认 + body[data-bloom-variant=mist]）─────────── */
body, body[data-bloom-variant="mist"] {${bloomTokens(p, false)}${sharedDswTokens(p, false)}
  --dsw-alias-bg-base: ${bgL};
  --dsw-alias-bg-layer-1: ${bgL};
  --dsw-alias-bg-layer-2: ${sfL};
  --dsw-alias-bg-layer-3: ${sf2L};
  --dsw-alias-bg-overlay: ${sfL};
  --dsw-alias-bg-module-platform: ${sfL};
  --dsw-alias-bg-multi-select: ${sf2L};
  --dsw-alias-bg-skeleton: ${mix(txL, 96)};
  --dsw-alias-bg-mask-1: ${mix(txL, 97)};
  --dsw-alias-bg-mask-2: ${mix(txL, 95)};
  --dsw-alias-bg-mask-3: ${mix(txL, 93)};
  --dsw-alias-bg-mask-drop: ${mix(txL, 88)};
  --dsw-alias-label-primary: ${txL};
  --dsw-alias-label-primary-bluish: ${txL};
  --dsw-alias-label-primary-dimmed: ${mix(txL, 25)};
  --dsw-alias-label-primary-foreground: ${bgL};
${labelStack(p, false)}
  --dsw-alias-brand-primary: ${aL};
  --dsw-alias-brand-primary-invert: ${bgL};
  --dsw-alias-brand-text: ${bgL};
${borderStack(p, false)}
  --dsw-alias-button-primary-fill: ${aL};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${aL}, black 8%);
  /* dimmed 的官方语义是「主按钮填充上的文字色」，与 fill 反向——
     官方亮色 fill=neutral-bluish-1000(#0f1115) / dimmed=neutral-bluish-100(#ebeef2)，
     官方暗色 fill=neutral-bluish-50(#f9fafb) / dimmed=neutral-bluish-750(#43454a)。
     曾误当作「accent 淡化」写成 mix(accent, 85)，于是任何按官方语义把它用作
     文字色的插件（如 @opendsh/dsh-plugin-scheduled-tasks 的 .dshst-btn-primary
     与 .dshst-tab-active）都得到「accent 文字叠在 accent 填充上」→ 对比度趋 0，
     按钮字不可见（#16）。
     这里取 bg 而非 label 类 token 是刻意的：fill 是 accent，而 accent 与 bg 在
     明暗之间反向翻转（亮色 accent 中深 / bg 浅，暗色 accent 亮 / bg 深），
     两个主题都成立；bloom 内 label-primary-foreground 与 brand-primary-invert
     早已用同一个值表达「品牌色块上的前景」，此处复用，不新造颜色。 */
  --dsw-alias-button-primary-dimmed: ${bgL};
  --dsw-alias-button-tool-bar-fill: ${sfL};
  --dsw-alias-button-tool-bar-hover: ${mix(txL, 95)};
  --dsw-alias-button-floating-fill: ${sfL};
  --dsw-alias-button-floating-hover: ${sf2L};
  /* info 是**实心按钮**的填充：DSH 原生值是品牌色 deepseek-400/500（实心），
     composer 发送键的图标直接写死 color:#fff。曾经写成 mix(a,90) —— 那是
     10% 不透明度（palette.mix 的百分比给的是 transparent 那一份），于是实心
     按钮变成一层 10% 的淡染 + 白图标 = 1.24:1，整颗按钮消失在卡片里
     （2026-10-08 用户实拍：实测填充 rgb(232,232,215)，截图 rgb(231,233,218)）。
     另两处消费者（模型下拉选中行图标、提问卡 badge 文字）也拿它当实色用，
     同样被洗没了。语义就是实心色，这里改回实心，glyph 由 component.ts 补。 */
  --dsw-alias-button-info-fill: ${aL};
  --dsw-alias-button-info-hover: color-mix(in oklch, ${aL}, black 8%);
  --dsw-alias-button-ghost-active-fill: ${mix(aL, 92)};
  --dsw-alias-button-ghost-active-hover: ${mix(aL, 88)};
  --dsw-alias-button-ghost-active-border: ${mix(aL, 78)};
  --dsw-alias-interactive-bg-hover: ${mix(aL, 92)};
  --dsw-alias-interactive-bg-hover-accent: ${mix(aL, 85)};
  --dsw-alias-interactive-bg-hover-solid: ${mix(aL, 88)};
  --dsw-alias-interactive-bg-active: ${mix(aL, 88)};
  /* ⚠️ inline-code 是「背景色」不是文字色 —— DSH 把它 set 到 code 元素的 background。
     曾经按文字色给（亮色 L30% 深色 / 暗色 L88% 浅色），结果亮色深底深字、
     暗色浅底白字（实测 1.2:1，一块刺眼亮斑）。必须给背景值。 */
  --dsw-alias-markdown-inline-code: var(--bloom-code-bg);
  --dsw-alias-markdown-code-block: ${sfL};
  --dsw-alias-markdown-tag: ${mix(aL, 88)};
  --dsw-alias-markdown-placeholder: ${mix(txL, 50)};
  --dsw-alias-markdown-citation: ${mix(txL, 55)};
  --dsw-alias-scrollbar-bg-l1: ${mix(txL, 90)};
  --dsw-alias-scrollbar-bg-l2: ${mix(txL, 80)};
  --dsw-alias-scrollbar-hover-l1: ${mix(txL, 82)};
  --dsw-alias-scrollbar-hover-l2: ${mix(txL, 72)};
  /* specific：消息气泡 / 侧栏 / 输入区 / 菜单 —— 不接管就会回落到 DSH 蓝灰调 */
  --dsw-specific-bubble: color-mix(in oklch, ${bgL}, ${txL} 3%);
  --dsw-specific-bubble-highlight: ${mix(aL, 88)};
  --dsw-specific-input-major: ${bgL};
  --dsw-specific-login-input: ${sfL};
  --dsw-specific-menu: ${sf2L};
  --dsw-specific-selector: ${sfL};
  /* 5% 而不是 2%：2% 的色差在浅色模式下肉眼几乎分不出侧边栏和主区，
     侧边栏就显得没有存在感（配合下方 _sidebarCol 的右侧分界线一起看） */
  --dsw-specific-sidebar-fill: color-mix(in oklch, ${bgL}, ${txL} 5%);
  --dsw-specific-sidebar-nav-item-active-accent: ${mix(aL, 86)};
  --dsw-specific-sidebar-nav-item-active: ${mix(aL, 93)};
  --dsw-specific-sidebar-nav-item-hover: ${mix(txL, 95)};
  --dsw-specific-tip: ${mix(aL, 90)};
}
`;
  }
  function mistDark(p) {
    const { accentD: aD, bgD, txD, sfD, sf2D } = p;
    return `
/* ─── Bloom · mist 暗色 ─────────────────────────────────────────── */
body[data-ds-dark-theme], body[data-ds-dark-theme][data-bloom-variant="mist"] {${bloomTokens(p, true)}${sharedDswTokens(p, true)}
  --dsw-alias-bg-base: ${bgD};
  --dsw-alias-bg-layer-1: ${bgD};
  --dsw-alias-bg-layer-2: ${sfD};
  --dsw-alias-bg-layer-3: ${sf2D};
  --dsw-alias-bg-overlay: ${sfD};
  --dsw-alias-bg-module-platform: ${sfD};
  --dsw-alias-bg-multi-select: ${sf2D};
  --dsw-alias-bg-skeleton: ${mix(txD, 94)};
  --dsw-alias-bg-mask-1: ${mix(txD, 96)};
  --dsw-alias-bg-mask-2: ${mix(txD, 93)};
  --dsw-alias-bg-mask-3: ${mix(txD, 90)};
  --dsw-alias-bg-mask-drop: ${mix(txD, 84)};
  --dsw-alias-label-primary: ${txD};
  --dsw-alias-label-primary-bluish: ${txD};
  --dsw-alias-label-primary-dimmed: ${mix(txD, 30)};
  --dsw-alias-label-primary-foreground: ${bgD};
  /* 四档由 labelStack() 统一给（层级必须单调递减：
     secondary > tertiary > caption > dimmed）。曾经是 35/45/30/35 ——
     caption 比 secondary 还亮、dimmed 跟 secondary 相同，三档在暗色下塌成一档。 */
${labelStack(p, true)}
  --dsw-alias-brand-primary: ${aD};
  --dsw-alias-brand-primary-invert: ${bgD};
  --dsw-alias-brand-text: ${bgD};
${borderStack(p, true)}
  --dsw-alias-button-primary-fill: ${aD};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${aD}, white 8%);
  /* 见亮色段说明：fill 上的文字色，与 fill 反向（#16） */
  --dsw-alias-button-primary-dimmed: ${bgD};
  --dsw-alias-button-tool-bar-fill: ${sfD};
  --dsw-alias-button-tool-bar-hover: ${mix(txD, 92)};
  --dsw-alias-button-floating-fill: ${sfD};
  --dsw-alias-button-floating-hover: ${sf2D};
  /* 见亮色段说明：实心色，不是 10% 淡染 */
  --dsw-alias-button-info-fill: ${aD};
  --dsw-alias-button-info-hover: color-mix(in oklch, ${aD}, white 8%);
  --dsw-alias-button-ghost-active-fill: ${mix(aD, 88)};
  --dsw-alias-button-ghost-active-hover: ${mix(aD, 82)};
  --dsw-alias-button-ghost-active-border: ${mix(aD, 70)};
  --dsw-alias-interactive-bg-hover: ${mix(aD, 90)};
  --dsw-alias-interactive-bg-hover-accent: ${mix(aD, 84)};
  --dsw-alias-interactive-bg-hover-solid: ${mix(aD, 82)};
  --dsw-alias-interactive-bg-active: ${mix(aD, 86)};
  /* 见亮色块同名变量的说明：这是背景色。 */
  --dsw-alias-markdown-inline-code: var(--bloom-code-bg);
  --dsw-alias-markdown-code-block: oklch(24% 0.02 240);
  --dsw-alias-markdown-tag: ${mix(aD, 85)};
  --dsw-alias-markdown-placeholder: ${mix(txD, 40)};
  --dsw-alias-markdown-citation: ${mix(txD, 35)};
  --dsw-alias-scrollbar-bg-l1: ${mix(txD, 86)};
  --dsw-alias-scrollbar-bg-l2: ${mix(txD, 76)};
  --dsw-alias-scrollbar-hover-l1: ${mix(txD, 75)};
  --dsw-alias-scrollbar-hover-l2: ${mix(txD, 65)};
  --dsw-specific-bubble: color-mix(in oklch, ${bgD}, white 3%);
  --dsw-specific-bubble-highlight: ${mix(aD, 82)};
  --dsw-specific-input-major: ${bgD};
  --dsw-specific-login-input: ${sfD};
  --dsw-specific-menu: ${sf2D};
  --dsw-specific-selector: ${sfD};
  --dsw-specific-sidebar-fill: color-mix(in oklch, ${bgD}, black 7%);
  --dsw-specific-sidebar-nav-item-active-accent: ${mix(aD, 80)};
  --dsw-specific-sidebar-nav-item-active: ${mix(aD, 88)};
  --dsw-specific-sidebar-nav-item-hover: ${mix(txD, 95)};
  --dsw-specific-tip: ${mix(aD, 84)};
}
`;
  }
  function variantBlock(v, dark) {
    const p = PALETTE[v];
    const a = readableAccent(p, dark);
    const bg = dark ? p.bgD : p.bgL;
    const tx = dark ? p.txD : p.txL;
    const sf = dark ? p.sfD : p.sfL;
    const sf2 = dark ? p.sf2D : p.sf2L;
    const sel = dark ? `body[data-ds-dark-theme][data-bloom-variant="${v}"]` : `body[data-bloom-variant="${v}"]`;
    return `
/* ─── Bloom · ${v}${dark ? " 暗色" : ""}（仅覆盖主色 + 背景调，骨架继承 mist）─────────── */
${sel} {${bloomTokens(p, dark)}${sharedDswTokens(p, dark)}
  --dsw-alias-bg-base: ${bg};
  --dsw-alias-bg-layer-1: ${bg};
  --dsw-alias-bg-layer-2: ${sf};
  --dsw-alias-bg-layer-3: ${sf2};
  --dsw-alias-bg-overlay: ${sf};
  --dsw-alias-bg-module-platform: ${sf};
  --dsw-alias-bg-multi-select: ${sf2};
  --dsw-alias-bg-skeleton: ${mix(tx, 95)};
  --dsw-alias-bg-mask-1: ${mix(tx, 97)};
  --dsw-alias-bg-mask-2: ${mix(tx, 95)};
  --dsw-alias-bg-mask-3: ${mix(tx, 93)};
  --dsw-alias-bg-mask-drop: ${mix(tx, 88)};
  --dsw-alias-brand-primary: ${a};
  --dsw-alias-brand-primary-invert: ${bg};
  --dsw-alias-brand-text: ${bg};
  --dsw-alias-button-primary-fill: ${a};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${a}, ${dark ? "white" : "black"} 8%);
  /* 见亮色段说明：fill 上的文字色，与 fill 反向（#16） */
  --dsw-alias-button-primary-dimmed: ${bg};
  /* 实心按钮填充：使用 accent 主题色 */
  --dsw-alias-button-info-fill: ${a};
  --dsw-alias-button-info-hover: color-mix(in oklch, ${a}, ${dark ? "white" : "black"} 8%);
  --dsw-alias-button-ghost-active-fill: ${mix(a, dark ? 88 : 92)};
  --dsw-alias-button-ghost-active-hover: ${mix(a, dark ? 82 : 88)};
  --dsw-alias-button-ghost-active-border: ${mix(a, dark ? 70 : 78)};
  --dsw-alias-button-tool-bar-fill: ${sf};
  --dsw-alias-button-tool-bar-hover: ${mix(tx, dark ? 92 : 95)};
  --dsw-alias-button-floating-fill: ${sf};
  --dsw-alias-button-floating-hover: ${sf2};
  --dsw-alias-interactive-bg-hover: ${mix(a, dark ? 90 : 92)};
  --dsw-alias-interactive-bg-hover-accent: ${mix(a, dark ? 84 : 85)};
  --dsw-alias-interactive-bg-hover-solid: ${mix(a, dark ? 82 : 88)};
  --dsw-alias-interactive-bg-active: ${mix(a, dark ? 86 : 88)};
  --dsw-alias-markdown-tag: ${mix(a, dark ? 85 : 88)};
  /* 必须逐变体覆盖：否则继承 mist 的蓝灰 hue，ripple/petal 下代码块会跟主色打架 */
  --dsw-alias-markdown-inline-code: var(--bloom-code-bg);
  --dsw-alias-markdown-code-block: ${dark ? `color-mix(in oklch, ${bg}, black 12%)` : sf};
  --dsw-alias-scrollbar-bg-l1: ${mix(tx, dark ? 86 : 90)};
  --dsw-alias-scrollbar-bg-l2: ${mix(tx, dark ? 76 : 80)};
  --dsw-alias-scrollbar-hover-l1: ${mix(tx, dark ? 75 : 82)};
  --dsw-alias-scrollbar-hover-l2: ${mix(tx, dark ? 65 : 72)};
  --dsw-alias-label-primary: ${tx};
  --dsw-alias-label-primary-bluish: ${tx};
  --dsw-alias-label-primary-dimmed: ${mix(tx, dark ? 30 : 25)};
  --dsw-alias-label-primary-foreground: ${bg};
${labelStack(p, dark)}
${borderStack(p, dark)}
  --dsw-alias-markdown-placeholder: ${mix(tx, dark ? 40 : 50)};
  --dsw-alias-markdown-citation: ${mix(tx, dark ? 35 : 55)};
  --dsw-specific-bubble: color-mix(in oklch, ${bg}, ${tx} ${dark ? 4 : 3}%);
  --dsw-specific-bubble-highlight: ${mix(a, dark ? 82 : 88)};
  --dsw-specific-input-major: ${bg};
  --dsw-specific-login-input: ${sf};
  --dsw-specific-menu: ${sf2};
  --dsw-specific-selector: ${sf};
  /* 4/2% → 7/5%：原值色差太小，侧边栏和主区几乎同一片底色，缺少「面」的区分 */
  --dsw-specific-sidebar-fill: color-mix(in oklch, ${bg}, ${dark ? "black" : tx} ${dark ? 7 : 5}%);
  --dsw-specific-sidebar-nav-item-active-accent: ${mix(a, dark ? 80 : 86)};
  --dsw-specific-sidebar-nav-item-active: ${mix(a, dark ? 88 : 93)};
  --dsw-specific-sidebar-nav-item-hover: ${mix(tx, dark ? 95 : 95)};
  --dsw-specific-tip: ${mix(a, dark ? 84 : 90)};
}
`;
  }
  function buildBloomCSS() {
    const blocks = [mistLight(PALETTE.mist), mistDark(PALETTE.mist)];
    for (const v of OTHER_VARIANTS) {
      blocks.push(variantBlock(v, false), variantBlock(v, true));
    }
    return blocks.join("\n");
  }

  // src/css/component.ts
  var COMPONENT_CSS = `
/* [LES-10][LES-30] */
body[data-bloom-variant] { --dsw-focus-ring-color: var(--bloom-accent); background-color: var(--dsw-alias-bg-base) !important; }

/* 让 body 的氛围层透出来：DSH 这几个全屏容器自带不透明底色会盖住它。
   侧栏与卡片保留自己的 surface 色（原版同样保留），只做描边和光。 */
body[data-bloom-variant] [class*="_frame"],
body[data-bloom-variant] [class*="_centerCol"],
/* :has() 里不能加子组合器（\`> \`）：实测 DSH 的结构是 _root > _body > _scrollBody，
   scrollBody 是孙子。写成子选择器这条一直没命中 —— 会话区一直盖着
   oklch(0.28 0.02 240) 不透明底，body 的流线在中区完全看不见（这就是
   owner 说「没光感」的真正原因）。 */
body[data-bloom-variant] [class*="_root"]:has([class*="_scrollBody"]),
/* 2026-10-02：DSH 0.2.0 给会话滚动区发了语义属性 data-conversation-scroll
   （实测 0.2.0-rc.2 的 chat 包里有 \`[data-conversation-scroll] .EvIC1a_root{...}\`）。
   按本文件下面那条教训——**用宿主语义属性、不用 hash 类名**——把它一并挂上。
   老类名全部保留：Web UI / 旧构建回退时仍然靠它们。 */
body[data-bloom-variant] [data-conversation-scroll],
body[data-bloom-variant] [class*="_scrollBody"] {
  background-color: transparent;
  background-image: none;
}

/* ═══ 2. 冷光线条 ═════════════════════════════════════════════════
   细、冷、低透明度的莫兰迪描边 + 极弱外辉。深色下最出效果。 */

/* ═══ 侧栏 ════════════════════════════════════════════════════════
   之前只给了右侧一道竖线，内部还是一整块死板的纯色。补足：顶部氛围淡染、
   会话项冷光态、分组标题层级。 */
[class*="_sidebarCol"] {
  position: relative;
  /* v0.15 注：原本想加 inset 描边 + 顶部内高光（"莫兰迪纸边"感），但发现
     src/css/glass.ts 137 行已经有 v0.10.x 的 box-shadow 选择器 —— 它的 inset
     描边用 **纯白色 rgba(255,255,255, .22)**，是 owner 给 10 套变体做的"统一白色
     光带"，不是疏忽。我的 v0.15 想把描边换成 morandi 灰蓝（misty 蓝灰）会
     让 10 套变体的描边颜色不一致、踩 owner 跨变体一致的设计意图。

     在没有更高特异性选择器的情况下，"统一白色"是我的越权代价。故保留
     glass.ts 137 那条 v0.10.x 的设计、v0.15 在 sidebar 上**什么也不加**。
     等 owner 拍板要不要跨变体换色（这是个跨 10 个变体的设计决策）再动。
     密度补齐这一版的"质感"留给气泡纸感 + composer hover lift + 入场节奏。 */
  box-shadow: 1px 0 0 var(--bloom-hairline), 8px 0 32px -10px var(--bloom-glow);
  /* 顶部莫兰迪淡染，跟主区氛围同源，消除"两块拼起来"的割裂感 */
  background-image:
    linear-gradient(180deg, rgba(var(--bloom-morandi), 0.1), transparent 260px),
    radial-gradient(600px circle at 0% 0%, rgba(var(--bloom-morandi), 0.08), transparent 60%);
}

/* 会话条目：圆角 + 过渡。hover / 选中的着色统一在 §6「会话行」那一处，
   这里不再重复一遍（曾经两处各写一遍 6% 和 7%，靠 !important 决定谁赢，
   等于用 !important 压自己人）。 */
[class*="_sidebarCol"] [role="treeitem"],
[class*="_sidebarCol"] [class*="_sessionRow"] {
  border-radius: 8px;
  transition: background 0.15s ease;
}
[class*="_sidebarCol"] [role="treeitem"][aria-selected="true"] [class*="_title"],
[class*="_sidebarCol"] [class*="_selected"] [class*="_title"] {
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}
/* v0.10.x（owner 反馈「脏」）：左侧 3px 蓝竖条是脏点 —— 莫兰迪克制不应有这种色块。
   删掉 ::before。选中感靠 bg 的 8% 染色传达。 */

/* 新建会话按钮：极淡底色，无 border，文字与图标都用主文字色（owner 反馈「脏」——
   之前 accent 色的 svg + accent 染色 bg + hairline border 三层叠，跟莫兰迪"统一克制"冲突）。
   现在的按钮只靠 8% accent 染色跟会话行区分，没有色块、没有边框、没有彩色文字。
   ⚠️ 选择器必须写 button[class*="_newSession"]：类名是子串匹配，
   hHd-Xa_newSession 的**后代** hHd-Xa_newSessionLabelMask / _newSessionContent /
   _newSessionLabel / _newSessionShortcut 全都含 "_newSession"，裸写
   [class*="_newSession"] 会把同一份底色叠三层（1-(0.92³)≈22%），
   而 Content 比 LabelMask 宽 38px 且是直角 —— 于是按钮里套出一个硬边小条，
   看上去像「盒中盒」（2026-09-29 实拍）。详见 §去硬边框 那条的同款注解。 */
[class*="_sidebarCol"] button[class*="_newSession"] {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%);
  border: 0;
  border-radius: 10px;
  transition: background 180ms ease;
}
[class*="_sidebarCol"] button[class*="_newSession"]:hover {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 86%);
}
/* 图标和文字都用主色 —— 不让 accent 出现在按钮上，跟莫兰迪统一 */
[class*="_sidebarCol"] button[class*="_newSession"] svg {
  color: var(--dsw-alias-label-primary);
}

/* 分组标题（工作区 / 未分组）：拉开与条目的层级。
   _sectionLabel 是 DSH 实际用的类名片段（qDHVXG_sectionLabel），
   12px + 字距让它明显是「标签」而不是一行内容。 */
[class*="_sidebarCol"] [class*="_sectionLabel"] {
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--dsw-alias-label-caption);
}

/* 分区头右侧的搜索/动作图标：默认 60% 亮度降权，hover 才全亮 ——
   和「工作区」标题同排且全亮时，四个元素抢注意力，列表反而不突出。 */
[class*="_sidebarCol"] [class*="_sectionHeader"] [class*="_searchSlot"],
[class*="_sidebarCol"] [class*="_sectionHeader"] [class*="_headerActions"] {
  opacity: 0.6;
  transition: opacity 150ms ease;
}
[class*="_sidebarCol"] [class*="_sectionHeader"] [class*="_searchSlot"]:hover,
[class*="_sidebarCol"] [class*="_sectionHeader"] [class*="_headerActions"]:hover {
  opacity: 1;
}

/* 会话行元信息（时间戳/来源等 _slot）：DSH 默认 0.55 透明度，
   暗色氛围渐变上偏糊，统一提到主题的 secondary 档（明暗自适应）。 */
[class*="_sidebarCol"] [class*="_sessionRow"] [class*="_slot"] {
  color: var(--dsw-alias-label-secondary);
}

/* 会话列表细滚动条：4px、冷光 thumb、hover 才加强。
   系统默认滚动条在 280px 的窄栏里非常抢；DSH 自己只有全局 alias 变量，
   没有给侧栏列表单独收窄。 */
/* [LES-13] 会话列表只纵向滚动，横向溢出一律裁掉 */
[class*="_sidebarCol"] [class*="_list"] { overflow-x: hidden; }
[class*="_sidebarCol"] [class*="_list"]::-webkit-scrollbar { width: 4px; height: 0; }
[class*="_sidebarCol"] [class*="_list"]::-webkit-scrollbar-track { background: transparent; }
[class*="_sidebarCol"] [class*="_list"]::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--bloom-accent) 30%, transparent);
  border-radius: 999px;
}
[class*="_sidebarCol"] [class*="_list"]::-webkit-scrollbar-thumb:hover {
  background: color-mix(in oklch, var(--bloom-accent) 55%, transparent);
}

/* 侧边栏成「面」：右侧一道冷光分界 + 向内的极淡渐变。
   光靠 sidebar-fill 的底色差不足以让它跟消息区分开 —— 消息区有氛围渐变和气泡，
   侧边栏只有一列文字，不给边界就显得平。分界线用 hairline（比实色 border 轻），
   渐变只在顶部 120px 内，避免整列发灰。

   v0.10.x（owner 反馈「没层次感」）：之前光带 1px + 18% alpha 在截图里几乎
   看不见，侧栏和背景完全融成一片。这里两层：① 内部底色 4% accent 给容器
   自己的"色"，与 body 区分；② 顶部 120px 氛围染。右侧冷光线交给下面的
   ::after / ::before 双层（线 + 光晕），因为 box-shadow inset 会被 glass.ts
   的 _sidebarCol 规则覆盖掉（cascade 顺序），改用伪元素才不会被吃掉。 */
body[data-bloom-variant] [class*="_sidebarCol"] {
  /* 宿主那条 0.5px 实线优先级更高，不加 !important 关不掉（实测覆盖后仍是 0.5px） */
  border-right: 0;
  background-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 96%);
  background-image: linear-gradient(
    180deg,
    color-mix(in oklch, var(--bloom-accent) 6%, transparent),
    transparent 120px
  );
  background-repeat: no-repeat;
  background-position: left top;
  background-size: 100% 100%;
}
/* 侧栏右缘的冷光交给 glass.ts 的 box-shadow（向外投）——
   这里曾用 ::after 画一条 18px 渐变，但侧栏 overflow:hidden，伪元素只能落在
   容器内侧，看上去是「向内发光」，owner 反馈很奇怪。box-shadow 的外阴影不受
   自身 overflow 裁剪，是唯一能真正往外散的做法。 */

/* 底部设置区与会话列表之间补一道分隔，让「设置」不像是最后一条会话 */
[class*="_sidebarCol"] [class*="_footer"] {
  border-top: 1px solid var(--bloom-hairline);
}

/* 顶栏下沿冷光线 —— 标题区与消息流之间的分界，比实色 border 轻。
   只给 tabs 这一条真正的分界线：_header 会同时命中 headerActions /
   headerUtilities 等右上角子容器，给它们加投影会凭空多出几个浮块。 */
header[class*="_header"] > div[class*="_tabs"] {
  box-shadow: 0 1px 0 var(--bloom-hairline), 0 6px 20px -12px var(--bloom-glow);
}

/* 排队消息条（输入框上方那条待发送预览）。
   DSH 原样式是「完全透明容器 + 70% 不透明白字」—— 在它自己的纯色底上尚可读，
   但本主题给 body 铺了氛围渐变，背景不再均匀，这条就糊进背景里了。
   这是氛围层带来的副作用，必须由本主题自己补一个实体容器兜住。

   ⚠️ 必须用 :has(> [class*="_preview"]) 收窄，不能裸用 [class*="_dock"]：
   GoalBar（dsh-client-ui-goal）的外层类名也叫「*_dock」，但它是**全宽布局容器**
   （原生 width: calc(100% - 各种 inset)），真正该被看见的条是里面那个限宽居中的
   「*_bar」（max-width: var(--dsh-composer-card-max-width)）。
   裸选择器会把边框+毛玻璃画到那个全宽容器上——实测 dock 1810px 而 bar 只有 748px，
   于是「进行中的目标」左右各露出一大截空壳边框，跟下方输入框完全不对齐。
   QueueDock 一定有「_preview」子元素（就是下一条规则要上色的那个），拿它当判据最稳，
   比写死 QueueDock 的哈希类名（会随 DSH 构建变）可靠。 */
div[class*="_dock"]:has(> [class*="_preview"]) {
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff), transparent 22%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--bloom-hairline);
  border-radius: 12px;
}
div[class*="_dock"] [class*="_preview"] {
  color: var(--dsw-alias-label-secondary);
}

/* 消息卡 / 工具调用行：只给轻描边，不给阴影 —— 数量多（一次会话 30+ 个），
   加长距阴影会把整个消息流糊成一片。全部限定 div，否则会命中 SVG 元素。 */
/* 工具调用行：常态不描边，hover 才亮起。
   常驻边框有两个毛病：① 同为工具行，可展开的 Bash 有框、Read/Edit 没框，视觉不一致；
   ② 折叠行实测 748×26，画成圆角框又扁又长，且边框贴着内容区边缘而行内图标有内缩，
   看起来像个输入框。保留 transparent 占位是为了 hover 时不发生布局跳动。

   ⚠️ 2026-10-02：DSH 0.2.0 里 _toolRow 匹配 0 个元素（scripts/dsh-drift.mjs 报出来的），
   新名候选是 _toolChanges。用 :is() 并列，权重不变（:is 取最具体项，仍等于单个 [class*=]）。
   两个都写是因为旧构建（Web UI / 更早的桌面版）仍在用老名。 */
div[class*="_card"],
div:is([class*="_toolRow"], [class*="_toolChanges"]),
div[class*="_panel"] {
  border-radius: 10px;
  border: 1px solid transparent;
  transition: border-color 0.16s ease, background 0.16s ease;
}
div[class*="_card"]:hover,
div:is([class*="_toolRow"], [class*="_toolChanges"]):hover {
  border-color: var(--bloom-hairline);
  background: rgba(var(--bloom-morandi), 0.05);
}
/* 展开态：DSH 的终端区（_terminal）自带 1px 边框 + 12px 圆角，
   外层 card 再描一圈就是两个几乎同尺寸的圆角框相套（实测 439px 套 377px）＝框中框。
   展开后连 hover 边框也不要。 */
div[class*="_card"]:has([class*="_terminal"]),
div[class*="_card"]:has(pre),
div[class*="_card"]:has([class*="_terminal"]):hover,
div[class*="_card"]:has(pre):hover {
  border-color: transparent;
  background: transparent;
}


/* ── 输入时的呼吸光（打字中）─────────────────────────────────
   2026-11-04 owner：输入过程中要有一个渐变光效。
   实现：卡片伪元素上一层 accent 渐变；body[data-bloom-typing="true"] 时
   开启一道横向扫过的光带（background-position 从 120% 扫到 -20%），
   颜色用 color-mix 跟 --bloom-typing 联动，所以「渐变」既是位置渐变也是浓度渐变。
   reduced-motion 下光带停在中点，不做位移动画。 */
div[class*="_composer"] div[class*="_card"]::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit;
  pointer-events: none; opacity: 0;
  background: linear-gradient(
    100deg,
    transparent 0%,
    color-mix(in oklch, var(--bloom-accent, #6b8f71) 34%, transparent) 42%,
    color-mix(in oklch, var(--bloom-accent, #6b8f71) 16%, transparent) 58%,
    transparent 100%
  );
  background-size: 260% 100%;
  background-position: 120% 0;
  transition: opacity .35s ease;
}
body[data-bloom-typing="true"] div[class*="_composer"] div[class*="_card"]::after {
  opacity: 1;
  animation: dsh-bloom-typing-sweep 1.9s var(--bloom-ease, ease) infinite;
}
@keyframes dsh-bloom-typing-sweep {
  0%   { background-position: 120% 0; }
  55%  { background-position: -20% 0; }
  100% { background-position: -20% 0; }
}
/* [LES-21] 浅色打字光：左上角呼吸光晕，不做横向扫光（扫光带是深色的流星，浅色上是脏色块） */
body[data-bloom-variant]:not([data-ds-dark-theme]) div[class*="_composer"] div[class*="_card"]::after {
  background: radial-gradient(130% 150% at 16% 0%,
    color-mix(in oklch, var(--bloom-accent, #6b8f71) 9%, transparent) 0%,
    color-mix(in oklch, var(--bloom-accent, #6b8f71) 4%, transparent) 36%,
    transparent 70%);
  background-size: 100% 100%;
  animation: none;
}
body[data-bloom-variant]:not([data-ds-dark-theme])[data-bloom-typing="true"] div[class*="_composer"] div[class*="_card"]::after {
  animation: dsh-bloom-typing-breath 2.8s var(--bloom-ease, ease) infinite;
}
@keyframes dsh-bloom-typing-breath {
  0%, 100% { opacity: .5; }
  50%      { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  body[data-bloom-typing="true"] div[class*="_composer"] div[class*="_card"]::after {
    animation: none; background-position: 50% 0;
  }
}

/* 输入卡片：整个界面的视觉主角，给足纸感。
   必须限定在 composer 内 —— 裸的 [class*="_card"] 会命中 30+ 个消息卡片，
   把长距阴影糊得到处都是。 */
div[class*="_composer"] div[class*="_card"] {
  border: 1px solid var(--bloom-hairline);
  border-radius: 16px;
  /* 三层：顶部内高光（模拟光从上方打来）+ 长距柔影 + 外侧冷辉 */
  box-shadow:
    inset 0 1px 0 rgba(var(--bloom-morandi), 0.14),
    var(--bloom-shadow),
    0 0 24px -14px var(--bloom-glow);
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
div[class*="_composer"] div[class*="_card"]:focus-within {
  border-color: var(--bloom-hairline-strong);
  box-shadow:
    inset 0 1px 0 rgba(var(--bloom-morandi), 0.2),
    var(--bloom-shadow),
    0 0 0 2px var(--bloom-glow);
}

/* 消息气泡：柔和圆角 + 近距阴影，脱离"贴在背景上"的平面感。
   限定 div：DSH 的全局 Tooltip 是 span[class*="_bubble"]（见 glass.ts 同名注释），
   不能吃到气泡的圆角/阴影/入场动画 —— 尤其动画：带 !important 的 bloom-fade-up
   会在 420ms 里盖掉 tooltip 的定位 transform（[data-side=right] 的 translateY(-50%)），
   气泡先偏移再跳回，也是"提示看不清"的一部分。 */
div[class*="_bubble"] {
  border-radius: 14px;
  /* v0.15：纸感厚度——顶 1px 高光 + 已有短距阴影 = 上下对照。
     高光透明度刻意低于侧栏(0.16 vs 0.22)：气泡面积大、密集出现，
     高光过亮会变成「锡纸」反光，0.16 是「有光、不抢戏」的甜区。 */
  box-shadow:
    inset 0 1px 0 rgba(var(--bloom-morandi), 0.16),
    var(--bloom-shadow-sm);
}

/* TurnTriggerNodeView uses these aliases for its root and hover state.
   Resolve them from the active palette so a variant switch repaints the card. */
body[data-bloom-variant] [data-turn-trigger] {
  --dsw-alias-turn-trigger-bg: color-mix(in oklch, var(--bloom-accent) 6%, var(--dsw-alias-bg-layer-1));
  --dsw-alias-turn-trigger-bg-hover: color-mix(in oklch, var(--bloom-accent) 10%, var(--dsw-alias-bg-layer-1));
}
/* ReasoningRow's expanded sticky disclosure header uses bg-base natively.
   An opaque palette surface avoids both the default block (#66) and text
   showing through the sticky header while the reasoning body scrolls. */
body[data-bloom-variant] [data-variant="think"][data-expanded] [data-open] [data-disclosure-header] {
  background: color-mix(in oklch, var(--bloom-accent) 4%, var(--dsw-alias-bg-layer-1));
}

/* ═══ 3. Markdown 排版质感 ═════════════════════════════════════════
   照搬原版手法：标题渐变短横、hr 两端消隐、引用块左侧主色条。 */
[class*="_markdown"] h1,
[class*="_markdown"] h2,
[class*="_markdown"] h3 {
  position: relative;
}
[class*="_markdown"] h1::after,
[class*="_markdown"] h2::after,
[class*="_markdown"] h3::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.34em;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(var(--bloom-morandi), 0.45), transparent);
}
[class*="_markdown"] h1::after { width: 76px; height: 3px; }
[class*="_markdown"] h2::after { width: 56px; }
[class*="_markdown"] h3::after { width: 40px; background: linear-gradient(90deg, rgba(var(--bloom-morandi), 0.28), transparent); }

hr {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--bloom-hairline-strong), transparent);
}

blockquote {
  border-left: 3px solid rgba(var(--bloom-morandi), 0.55);
  border-radius: 12px;
  background: rgba(var(--bloom-morandi), 0.07);
  box-shadow: var(--bloom-shadow-sm);
}

/* 代码：内联块用莫兰迪淡底（变量已在 alias 层修正为背景色），
   块级代码加冷光描边 + 圆角，消除方角感 */
code {
  border-radius: 6px;
}

/* 代码块：描边/阴影只能给「有实色背景的那一层」——DSH 的结构是
     div.md-code-block（实色底 + 圆角）> div > pre.shiki（背景透明）
   曾经把 border/box-shadow 加在 pre 上：两层各画一个 12px 圆角框 = 框中框，
   而且 pre 背景透明，阴影直接投进容器内部形成一圈脏边。
   md-code-block 是 DSH 的全局类名（非 CSS Modules hash），可以稳定引用。 */
.md-code-block {
  border: 1px solid var(--bloom-hairline);
  box-shadow: var(--bloom-shadow-sm);
  overflow: hidden;
}
.md-code-block pre,
pre.shiki {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
/* 兜底：不在 md-code-block 里的裸 pre 才自己描边 */
pre:not(.shiki) {
  border-radius: 12px;
}
pre code {
  border-radius: 0;
  background: transparent;
}

/* 表格：严格限定在 [_tableScroll] 容器内，只动 markdown 渲染的聊天表格，
   不影响 DSH 会话列表（Y0dWHa_table）这类其他用途的 <table>。
   DSH 原生规则：th/td 各有一条 border-bottom，th:first-child 与 td:first-child
   的 padding-left:0（让首列对齐正文），空 cell 仍撑出 100px min-width。
   三个肉眼短板：① 表头只有加粗无底色，与主体混淆；② 无列分隔，像列表不像表；
   ③ 空 cell 100px 留白让残缺行（如 P1 状态列空）看着"半残废"。

   ⚠️ 2026-10-02：DSH 0.2.0 把容器名从 _tableScroll 改成了 _tablePane
   （scripts/dsh-drift.mjs 报出来的：这个语义名在 0.2.0 里匹配 0 个元素，
   也就是下面这一整块表格样式一直在静默失效）。用 :is() 并列新旧名 ——
   :is() 的权重取最具体的那一项，和单个 [class*=] 相同，所以这次改动
   没有动任何规则的权重。 */
:is([class*="_tableScroll"], [class*="_tablePane"]) {
  /* #76/#62: the scroll viewport may be wider than its table (native wide-table
     lead padding). Paint the table, otherwise this creates an empty framed tail. */
  border: 0;
  border-radius: 0;
  background: transparent;
  /* 2026-10-24 · #52/#48：容器被主题加了边框圆角，但 DSH 0.2.0 把 _tableScroll
     改名 _tablePane 后不再保证原生横向滚动 —— 宽表格直接戳穿聊天气泡边界（#52），
     多列表格越界后边框圆角失去裁切、格线在角部戳出读作「变形」（#48）。
     overflow-x:auto 同时给回「滚动能力」和「圆角裁切」（auto 会裁剪并尊重 radius，
     hidden 只裁不滚会废掉滚动，两个都不能用错）。
     注意：overflow-x 非 visible 时另一轴的 visible 会被强制成 auto，
     对纯展示表格无副作用。旧名 _tableScroll 原生已是滚动容器，重复声明无害。 */
  overflow-x: auto;
}

/* 上面那条会在层叠里输给 DSH 自己的 .md-table-wide 修饰类（实测 2026-10-24：
   ._tableScroll_哈希.md-table-wide => overflow-x:hidden，权重 (0,2,0) > 单属性选择器
   的 (0,1,0)，宽表被无声裁掉右半边）。双写属性选择器把权重抬到 (0,2,0) 打平，
   再靠注入序取胜 —— 插件 <style> 在 DSH <link> 之后注入，平权重时后者赢，
   这也是本主题其它同权重覆盖能生效的同一前提。hidden 改 auto 对「本就放得下」
   的表格零影响（无溢出就没有滚动条），只在内容实在放不下时把「裁掉」换成「可滚」。 */
[class*="_tableScroll"][class*="_tableScroll"],
[class*="_tablePane"][class*="_tablePane"] {
  overflow-x: auto;
}
/* DSH 0.2.1: >=4 columns uses md-table-wide, otherwise tableFill.
   Keep the wide branch intrinsic, including short four-column tables (#62).
   Match the native hover/focus specificity so its hidden/scroll + padding
   swap cannot change the viewport height or expose a bottom white band (#76). */
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]).md-table-wide,
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]).md-table-wide:is(:hover, :focus-visible) {
  overflow-x: auto;
  padding-bottom: 0;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}
/* [LES-08b] 会话 tab 轨迹区滚动条：几何保留，滑块平时全透明，悬停才显色 */
body[data-bloom-variant] main [class*="_scroll"]::-webkit-scrollbar-thumb,
body[data-bloom-variant] div[class*="_tableScroll"]::-webkit-scrollbar-thumb,
body[data-bloom-variant] div[class*="_tablePane"]::-webkit-scrollbar-thumb {
  background: transparent;
}
body[data-bloom-variant] main [class*="_scroll"]:hover::-webkit-scrollbar-thumb,
body[data-bloom-variant] div[class*="_tableScroll"]:hover::-webkit-scrollbar-thumb,
body[data-bloom-variant] div[class*="_tablePane"]:hover::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 55%);
}

/* [LES-08] 宽表滚动条：几何恒定，平时透明，悬停或聚焦才显色 */
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]).md-table-wide {
  scrollbar-color: transparent transparent;
}
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]).md-table-wide:is(:hover, :focus-visible) {
  scrollbar-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 62%) transparent;
}
:is([class*="_tableScroll"], [class*="_tablePane"]) > table {
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--bloom-hairline);
  border-radius: 10px;
  background: rgba(var(--bloom-morandi), 0.02);
  overflow: clip;
}
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]).md-table-wide > table {
  width: max-content;
  min-width: 0;
  max-width: none;
}
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]):not(.md-table-wide) > table {
  width: 100%;
  max-width: none;
}
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]) th,
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]) td {
  border-color: var(--bloom-hairline);
  border-right-width: 1px;
  border-right-style: solid;
  border-bottom-width: 1px;
}
:is([class*="_tableScroll"], [class*="_tablePane"]) th:last-child,
:is([class*="_tableScroll"], [class*="_tablePane"]) td:last-child { border-right: 0; }
:is([class*="_tableScroll"], [class*="_tablePane"]) tr:last-child th,
:is([class*="_tableScroll"], [class*="_tablePane"]) tr:last-child td { border-bottom: 0; }
:is([class*="_tableScroll"], [class*="_tablePane"]) th:first-child,
:is([class*="_tableScroll"], [class*="_tablePane"]) td:first-child { padding-left: 16px; }
:is([class*="_tableScroll"], [class*="_tablePane"]) thead th {
  background: rgba(var(--bloom-morandi), 0.10);
  font-weight: 600;
  border-bottom-width: 1px;
  border-bottom-color: var(--bloom-hairline-strong);
  color: var(--dsw-alias-label-secondary, currentColor);
}
:is([class*="_tableScroll"], [class*="_tablePane"]) tbody tr:hover { background: rgba(var(--bloom-morandi), 0.06); }
/* 空 cell 视觉降权：透明度 0.35，省得缺值列（P1 状态空）显得行"断了一截" */
:is([class*="_tableScroll"], [class*="_tablePane"]) td:empty { opacity: 0.35; }

/* 推理中的「深度求索中，用时 1分30秒」：DSH 原生 shimmer 直接使用 DeepSeek 静态蓝。
   Bloom 为每个变体提供主色及两种邻近色，做成克制的三色光谱流动：有 Gemini
   式的生命力，但色相始终属于当前主题。以语义后缀而非 CSS Module hash 匹配。

   ⚠️ 2026-09-29（用户「原来好看的渐变动效没了」）：老选择器 [class*="_turnStatus"]
   在当前 DSH 上**命中 0 个元素** —— DSH 把这个组件改名了，现在是
   <button data-turn-process> > span._label，跑完和跑着共用同一个元素。
   失配是静默的：不报错、门禁全绿，只是渐变没了（这正是本文件头部写的
   「失配时退回纯色」那条安全降级的代价）。
   新的钩子用 data-turn-process（宿主语义属性，不带 hash，比类名稳）；
   「跑完的不闪」由 dom.ts 的 markLiveTurn() 打 data-bloom-live-turn 解决 ——
   跑完和跑着是同一个元素，只有文本在变能区分。
   老选择器保留：DSH 回退到旧构建时它仍然生效。

   ⚠️ 两条分开写、!important 只留给老选择器：新钩子那条特异度已经是
   (0,4,2)（body + 属性 + button + 两个 data 属性 + 类名子串），实测压得过
   DSH 的 .l_V-RG_label (0,1,0)，不需要 !important；加了就撞 !important 预算棘轮
   （check.mjs 的 IMPORTANT_BUDGET），而那个预算的存在就是为了逼人回头想
   「有没有更省的办法」。 */
body[data-bloom-variant] button[data-turn-process][data-bloom-live-turn] [class*="_label"] {
  background-image: linear-gradient(
    110deg,
    var(--bloom-motion-1) 0%,
    var(--bloom-motion-2) 24%,
    var(--bloom-motion-3) 43%,
    var(--bloom-motion-1) 60%,
    var(--bloom-motion-2) 78%,
    var(--bloom-motion-3) 100%
  );
  background-size: 260% 100%;
  /* 新组件不再自带 text-fill 那套：实测 label 的 -webkit-text-fill-color 是
     实色（label 色），只给渐变不裁字的话，渐变整个看不见。所以三件套要一起写。 */
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: bloom-deep-dive-spectrum 3.6s ease-in-out infinite alternate;
}
/* 老组件：DSH 旧构建里这个 shimmer 自带 !important，只能跟着加 */
body[data-bloom-variant] [class*="_turnStatus"]:not([class*="_turnStatusClock"]) {
  background-image: linear-gradient(
    110deg,
    var(--bloom-motion-1) 0%,
    var(--bloom-motion-2) 24%,
    var(--bloom-motion-3) 43%,
    var(--bloom-motion-1) 60%,
    var(--bloom-motion-2) 78%,
    var(--bloom-motion-3) 100%
  );
  background-size: 260% 100% !important;
  animation: bloom-deep-dive-spectrum 3.6s ease-in-out infinite alternate !important;
}
[class*="_turnStatusClock"] {
  color: color-mix(in oklch, var(--bloom-motion-2) 58%, var(--dsw-alias-label-caption)) !important;
  -webkit-text-fill-color: color-mix(in oklch, var(--bloom-motion-2) 58%, var(--dsw-alias-label-caption)) !important;
}
@keyframes bloom-deep-dive-spectrum {
  from { background-position: 100% 0; }
  to { background-position: 0 0; }
}

/* ═══ 在跑的步骤文字（"准备运行命令…" / "运行命令" / 思考中的标题）═════════
 *
 * DSH 自己有一套 shimmer：span[data-text-shimmer]（在跑才挂这个属性），
 * 用 currentColor 画一条 50% 透明的横带扫过文字。效果本身是对的，问题是
 * **颜色是继承来的灰**（label-caption）—— 放在 Bloom 的暗底上就是一道灰影，
 * 主题色一点都进不去。
 *
 * 所以这里只换颜色、不换动作：几何、时长、缓动、keyframes 全部沿用 DSH 的
 * （background-size 250% / position 100%→0% / spread 变量），把 currentColor
 * 换成 Bloom 的 motion 三色 —— 暗色下是一道青→蓝→紫的高光扫过，亮色下自动
 * 换成对应的暗色档（motion-* 本身就随明暗翻转）。
 * 换动作等于和 DSH 的动画打架：它的 keyframes 名带 hash，改一次断一次。
 *
 * ⚠️ 钩子用 [data-text-shimmer] 而不是任何类名：这是宿主给的语义属性，
 * 不带 hash、不随版本改名（对照上面 [class*="_turnStatus"] 的教训）。
 * 实测它在跑的时候才出现，跑完就没了 —— 判断「在跑」不需要我们再写一套。 */
body[data-bloom-variant] [data-text-shimmer] {
  background-image: linear-gradient(
    90deg,
    color-mix(in oklch, var(--bloom-motion-1, #6b8f71) 62%, transparent) calc(50% - var(--dsh-text-shimmer-spread, 24px)),
    var(--bloom-motion-2, #6b8f71) 50%,
    color-mix(in oklch, var(--bloom-motion-3, #6b8f71) 62%, transparent) calc(50% + var(--dsh-text-shimmer-spread, 24px))
  );
  /* 文字被 background-clip:text 裁出来后没有阴影能力，用 filter 补一层外辉 ——
     现代做法（drop-shadow 跟随裁剪后的字形），比 text-shadow 干净。
     透明度压到 72%：这是「亮着」而不是「发烫」，亮色下会自动更淡。 */
  filter: drop-shadow(0 0 10px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 72%));
}
/* 正在跑的那一步：不加底色、不加描边。
   曾经给它加过「7% accent 底 + 一道发丝边」的胶囊，owner 一眼否掉
   （2026-09-29：「为啥你要加背景？」）—— 和本文件 §新建会话按钮 写的是同一条
   规矩：莫兰迪靠淡染色区分，不靠色块；状态靠颜色和动效说话，不靠盒子。
   盒子还会和消息流里其它圆角元素撞形，看着像另一个控件。
   真正的信号是这三样：文字的高光扫过 + 外辉、图标染成 accent 并呼吸。 */
body[data-bloom-variant] button:has(> [data-text-shimmer]) [data-step-process-icon] {
  color: var(--bloom-accent, #6b8f71);
  animation: bloom-live-breathe 1.8s ease-in-out infinite;
}
@keyframes bloom-live-breathe {
  0%, 100% { opacity: 0.72; }
  50%      { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  /* DSH 自己会把 shimmer 关掉，这里补齐：颜色保留（别让文字变成纯灰），动效归零。
     ⚠️ 这一段一条 !important 都不加：里面的选择器跟常态那几条完全相同
     （(0,2,0) / (0,3,1)），而本段在它们之后，天然压得住；
     DSH 那边的 (0,1,0) 也压得过。加了只会撞 IMPORTANT_BUDGET 棘轮。 */
  body[data-bloom-variant] [data-text-shimmer] {
    animation: none;
    background-position: 50% center;
    filter: none;
  }
  body[data-bloom-variant] button:has(> [data-text-shimmer]) [data-step-process-icon] {
    animation: none;
  }
  body[data-bloom-variant] button[data-turn-process][data-bloom-live-turn] [class*="_label"],
  [class*="_turnStatus"]:not([class*="_turnStatusClock"]) {
    animation: none !important;
    background-position: 50% 0 !important;
  }
}

/* 选中文本：原版用 accent 混 80%，比 DSH 默认的 85% 更实，能看清 */
::selection {
  background: color-mix(in oklch, var(--bloom-accent), transparent 78%);
}

/* ═══ 4. 裸露的 <think> 标签 ═══════════════════════════════════════
   由 markThinkTags() 打标（见该函数注释：这是 workaround，根因在 LLM 适配层）。
   标签行整行隐藏 —— 实测它们各自独占段落，隐藏不丢内容；
   标签之间的思考内容只降权、不隐藏，用冷光竖线标出，信息仍可读。 */
[data-bloom-think] {
  display: none !important;
}
/* 左侧冷光竖线 + 降低透明度。
   ⚠️ 竖线错位的坑：思考块是一串平铺的兄弟元素（p / ul / ol / h3 / div），各标签
   默认 margin-left 不同（实测 p 被置为 0、ul 为 2px），不强制归零就会让竖线
   错开 2px、连不成一条直线。所以 margin-left 必须 !important 压平。
   另：用背景色块代替竖线会让每段变成一张「卡片」，且色块边缘直接贴住文字，
   观感更差 —— 竖线 + 内边距才是对的做法。 */
[data-bloom-think-body] {
  opacity: 0.62;
  border-left: 2px solid var(--bloom-hairline);
  margin-left: 0 !important;
  padding-left: 14px;
  transition: opacity 0.2s ease, border-color 0.2s ease;
}
[data-bloom-think-body]:hover {
  opacity: 0.92;
  border-left-color: var(--bloom-hairline-strong);
}
/* 列表要保留编号/圆点的缩进，否则 padding 被覆盖后编号会贴到竖线上 */
ul[data-bloom-think-body],
ol[data-bloom-think-body] {
  padding-left: 38px;
}

/* ═══ 6. 微交互动效系统（v0.5.0）══════════════════════════════════
   原则（导师批注）：
   ① 只为「状态反馈」动：hover=可点、active=按下、选中=切换；
   ② 统一时长/缓动走 token（反馈 130ms、常规 200ms、大过渡 280ms；
      ease-out 入场、通用 ease），全站一致，否则就是「东一块西一块」；
   ③ 只动 transform/opacity（GPU 合成不动布局），backdrop-filter 很贵不放进 transition；
   ④ prefers-reduced-motion 一律降级成瞬间（无动画）。
   别加「为了炫而炫」的常驻动画——那个会回到「脏/四不像」。 */
body {
  --bloom-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --bloom-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  /* 回弹曲线：入场末端微微过冲再落回（.34,1.56,.64,1 是 Material 的经典回弹）。
     只给「有明确触发动作」的过渡用 —— 面板滑入、按钮按下。
     纯 hover 反馈仍走 --bloom-ease：回弹用在 hover 上会显得黏。 */
  --bloom-ease-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --bloom-dur-fast: 130ms;
  --bloom-dur: 200ms;
  --bloom-dur-slow: 280ms;
}

/* [LES-13] 侧栏会话行：只淡染与按下微缩，不做位移，避免撑出横向滚动条 */
[class*="_sidebarCol"] [role="treeitem"],
[class*="_sidebarCol"] [class*="_sessionRow"] {
  transition:
    background var(--bloom-dur-fast) var(--bloom-ease),
    transform var(--bloom-dur-fast) var(--bloom-ease);
}
[class*="_sidebarCol"] [role="treeitem"]:active { transform: scale(0.996); }

/* [LES-02] 侧栏分组：去硬边框，紧凑 6px 留白避免工作区列表过度稀疏 */
[class*="_sidebarCol"] [class*="_groupSection"] + [class*="_groupSection"] {
  margin-top: 6px;
}

/* 会话行：圆角 + hover 淡染，靠留白区分，不描边不画网格 */
[class*="_sidebarCol"] [class*="_sessionRow"] {
  position: relative;
  border-radius: 8px;
}
[class*="_sidebarCol"] [class*="_sessionRow"]:hover {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 93%);
}

/* [LES-02] 当前选中行：8% 极淡主色染色，不加生硬边框与高亮竖条 */
[class*="_sidebarCol"] [class*="_sessionRow"][class*="_selected"],
[class*="_sidebarCol"] [class*="_sessionRow"][aria-selected="true"],
[class*="_sidebarCol"] [role="treeitem"][aria-selected="true"] {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%);
}

/* 输入卡片 hover：只提描边，不抬、不换阴影。
   v0.15 曾在这里加 transform: translateY(-1px) + box-shadow: var(--bloom-shadow)
   想让卡片"浮起来"，实际两半都不对：
   ① box-shadow 从没生效 —— GLASS_CSS 的 body[data-bloom-variant] … _card
      特异性 (0,3,3) 高于这里的 :hover (0,3,2)，阴影永远是玻璃那套；
   ② transform 生效了，但它违反 glass.ts 侧栏注释里的判据：输入卡的
      conversation.input.overlay 槽会注入 fixed 元素（dsh-convmap，issue #15），
      transform 会让卡片成为它们的 containing block —— hover 时浮层跟着错位。
      而且输入框是打字的地方，不是按钮，光标停上去就抖一下只会分神。 */
div[class*="_composer"] div[class*="_card"] {
  transition:
    border-color var(--bloom-dur) var(--bloom-ease),
    box-shadow var(--bloom-dur) var(--bloom-ease);
}
div[class*="_composer"] div[class*="_card"]:hover {
  border-color: var(--bloom-hairline-strong);
}

/* 主题自己的按钮：按下微缩（明确「点到了」） */
.dsh-bloom-trigger:active,
.dsh-bloom-option:active,
[class*="_sidebarCol"] button:active { transform: scale(0.985); }

/* ═══ 焦点环兜底：统一成主题色 ═══
   DSH 有些控件（例如设置面板右上角的关闭按钮）没定义自己的 focus 样式，
   于是露出**浏览器默认**的 focus ring —— Chrome 暗色下是一圈亮蓝
   rgb(153,200,255)，跟 8 套莫兰迪配色全都打架（用户实拍反馈里那个蓝圈）。
   注意它不是 DSH 的 token，改 --dsw-* 改不到，只能靠这条兜底。

   用 :focus-visible 而不是 :focus —— 只在键盘导航时出现，鼠标点击不显示，
   这也是 WCAG 2.4.7「焦点可见」的正确做法：焦点依然清晰，只是跟着主题走。 */
:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color, var(--bloom-accent)) !important;
  outline-offset: 2px;
}

/* 重新截图/使用观察时可平滑淡入的低频面板入场（默认不绑到常驻元素上） */
@keyframes bloom-panel-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}

/* ═══ 6.5 空状态视觉锚点 (v0.10.x) ═══════════════════════════════════
 *
 * owner 反馈「没层次感」：空状态下「探索未至之境」一行字飘在苍白画布上，
 * 眼睛找不到着陆位置。这里在 scrollBody 没有气泡时（即空状态），在中央
 * 投一团主题色光晕 + 慢呼吸，给视觉一个焦点。光晕跟 message 流重叠的
 * 概率低（消息堆在顶部），不会污染正常态。
 *
 * selector 限制条件：\`:not(:has(div[class*="_bubble"]))\` 确保只在没消息时出现；
 * 有消息时这条规则不匹配，::before 不渲染。\`:has()\` Chrome 105+/Safari 15.4+。
 * 限定 div 同样是为了不把 tooltip（span）算进"有消息"。 */
[class*="_scrollBody"] { position: relative; }
[class*="_scrollBody"]:not(:has(div[class*="_bubble"]))::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    42% 32% at 50% 48%,
    color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 86%) 0%,
    color-mix(in oklch, var(--bloom-aurora-stream-2), transparent 92%) 35%,
    transparent 68%
  );
  animation: bloom-anchor-breathe 4.2s ease-in-out infinite;
}
/* 2026-09-27 修 #32「空状态下页面持续上下浮动」：
   原来 50% 帧是 transform: scale(1.05)。这块 ::before 用 inset:0 铺满整个
   消息区（实测 900px 高），scale 以中心为原点，垂直方向上下各动约 11px；
   4.2s infinite 且不依赖任何操作，视线读成「画布自己在抖」而不是呼吸。
   改成只动 opacity：零位移、只走合成器，呼吸感靠明暗传达。
   想找回一点尺寸脉动，scale 上限别超过 1.005（900px 上约 ±2px）。 */
@keyframes bloom-anchor-breathe {
  0%, 100% { opacity: 0.72; }
  50%      { opacity: 1; }
}

/* ═══ 7. 全站统一入场系统 (v0.10.x) ═════════════════════════════════
 *
 * owner 反馈：「除了深度求索中的文字有动效外，别的几乎是没有任何吸引到我的动画」
 * ——所以这一节专门把页面"活起来"：消息气泡/工具行/侧栏/顶栏首次入场都走
 * 同一条 keyframe，长度/缓动全走 §6 的 token；只动 opacity + transform，
 * prefers-reduced-motion 下由下方媒体查询清零。
 *
 * 为什么用 \`animation\` 而不是 transition + \`:not([hidden])\`：
 *   后者在 React 里反复 toggle hidden 时 transition 不会重新计算；
 *   且「元素插入」这件事 transition 表达不了。\`animation\` 在元素 mount 那一刻
 *   唯一一次触发，正好对应「第一次出现在视野中」的语义；React 重渲染复用
 *   DOM 节点时也不会重放，不会污染正常状态切换。
 */
@keyframes bloom-fade-up {
  /* v0.15：入场位移从 16 → 12px——320ms 配合 12px 是行业甜区，
     16px 配合 320ms 会"顿"一下才到位。形状不变，只是更轻。 */
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
@keyframes bloom-fade-down {
  /* v0.15：顶栏从顶部滑下，从 -12 → -8px，配合更短的 200ms 让"开页"更利落。 */
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: none; }
}

/* 消息气泡 / 工具调用行 / 滚动体内的卡片 —— 整页停留时间最长的地方。
   气泡限定 div（span 的 _bubble 是全局 Tooltip，动画会盖掉它的定位 transform，
   见 §3 气泡圆角处的注释）。
   \`:not(:has(...))\` 排除含终端 / 代码块的卡：它们是「展开后才有」的元素，
   跟着外层一起进，单独动会让代码块在父卡里飘。
   !important 必要：DSH 在这些元素上有自己的 \`animation\`（比如呼吸 loader），
   后注入的会赢；用 !important 让 Bloom 的入场动画压过它。 */
div[class*="_bubble"],
div:is([class*="_toolRow"], [class*="_toolChanges"]),
div[class*="_scrollBody"] > div[class*="_card"]:not(:has([class*="_terminal"])):not(:has(pre)) {
  animation: bloom-fade-up 240ms var(--bloom-ease-out) backwards !important;
}
/* 侧栏会话行：页面打开时整组淡入（一次性，不是循环） */
[class*="_sidebarCol"] [role="treeitem"] {
  animation: bloom-fade-up 200ms var(--bloom-ease-out) backwards !important;
}
/* 顶栏 —— 从顶部滑下比从下方滑上更贴「页面打开」的语义。
   :has(> _tabs) 是"真顶栏"的唯一判据，见下方 §去硬边框 里的说明。 */
header[class*="_header"] {
  animation: bloom-fade-down 240ms var(--bloom-ease-out) backwards !important;
}
/* 顶栏两按钮入场（newSession / Bloom trigger）：transform / box-shadow
   加到原 transition 里 —— 原来 WIP 只 transition 了 background，
   加 lift 不需要新 transition 字段，hover 时一并平滑。
   ⚠️ 原来还有一条 [class*="_sessionLogButton"]：2026-09-29 实测该语义名在
   DSH 全部包里 0 命中（顶栏现在只挂 Bloom 切换器），属于死规则，已删。 */
button[class*="_newSession"],
.dsh-bloom-trigger {
  animation: bloom-fade-down 200ms var(--bloom-ease-out) backwards !important;
}
button[class*="_newSession"]:hover,
.dsh-bloom-trigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px -6px var(--bloom-glow);
}

/* ═══ 输入卡三态 ═══════════════════════════════════════════════════
 * owner 要的是"输入框会说话"（2026-09-10）：
 *   静置   —— 光晕边框慢呼吸（还活着，在等你）
 *   聚焦   —— 同一条呼吸，节奏收紧一倍（跟手）
 *   执行中 —— 流光沿边框流转（它在跑）
 *
 * 两个 @property 是必需的：普通自定义属性在 keyframes 里只会**离散跳变**，
 * 声明了 syntax 浏览器才真正插值。--bloom-halo 推 glass.ts 里那圈主题色
 * 外晕的浓度（阴影本体写在那边，这里只给数值）；--bloom-spin 推 conic
 * 渐变的起始角。
 *
 * 「执行中」的判据是 :has([class*="_pending"])：uV2eYG_pending 是 DSH 自己的
 * 待处理指示点（8px 圆点 + 1s 脉冲），只在跑的时候渲染进输入卡 —— idle 态
 * 实测 DOM 里查不到。比按 aria-label="停止" 判稳（那个会随界面语言变）。 */
@property --bloom-halo { syntax: '<number>'; initial-value: 0.5; inherits: false; }
@property --bloom-spin { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

@keyframes bloom-halo-breathe {
  0%, 100% { --bloom-halo: 0.3; }
  50%      { --bloom-halo: 0.85; }
}
@keyframes bloom-ring-spin {
  to { --bloom-spin: 360deg; }
}

body[data-bloom-variant] div[class*="_composer"] div[class*="_card"] {
  animation: bloom-halo-breathe 5.2s ease-in-out infinite;
}
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"]:focus-within {
  animation-duration: 2.6s;
}

/* 执行中：1.5px 的一圈环，conic 起始角在转，看上去像一束光绕着卡边跑。
   mask 两层 + exclude 把实心圆角矩形挖成环，padding 就是环的粗细。
   角度停留在 52%~90% 这一段，所以任一时刻只有约三分之一圈是亮的 ——
   亮满一整圈就成了跑马灯，不是"流光"。 */
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"]:has([class*="_pending"])::after {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: 18px;
  padding: 1.5px;
  pointer-events: none;
  background: conic-gradient(
    from var(--bloom-spin),
    transparent 0 52%,
    color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 20%) 70%,
    color-mix(in oklch, var(--bloom-motion-2, #6b8f71), transparent 45%) 80%,
    transparent 90% 100%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  animation: bloom-ring-spin 2.6s linear infinite;
}
/* 跑起来时呼吸让位给流光 —— 两套动效同时在同一块边上跑会互相打架 */
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"]:has([class*="_pending"]) {
  --bloom-halo: 0.7;
  animation: none;
}

/* View Transition：主题切换时整页 cross-fade，让颜色"流过去"而不是瞬切。
   只有浏览器支持 \`document.startViewTransition\` 时才触发（switcher.ts 里
   调），这里只控动画时长 / 缓动；不支持和 reduced-motion 一起由下方兜底
   清零。 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* ④ 无障碍：动效全部降级为瞬间 */
@media (prefers-reduced-motion: reduce) {
  [class*="_sidebarCol"] [role="treeitem"],
  .dsh-bloom-switcher, .dsh-bloom-trigger, .dsh-bloom-option, .dsh-bloom-menu,
  [class*="_composer"] div[class*="_card"],
  [class*="_composer"] div[class*="_card"]::after,
  [class*="_composer"] div[class*="_card"]:has([class*="_pending"])::after,
  div[class*="_bubble"],
  div:is([class*="_toolRow"], [class*="_toolChanges"]),
  div[class*="_scrollBody"] > div[class*="_card"],
  button[class*="_newSession"],
  [class*="_scrollBody"]:not(:has(div[class*="_bubble"]))::before,
  ::view-transition-old(root), ::view-transition-new(root) {
    animation: none !important;
    transition: none !important;
  }
}

/* ══ 去硬边框：全站统一换成光带 / 浅底 / 阴影（owner 2026-09-10）══
 *
 * 原话：「现在已经不流行通过 border 去做切割了，要不然就是很淡的边框线加光感
 * 流动或者是阴影，比硬的边框好看得多」；以及「不能光靠我一个一个说」。
 *
 * 所以全页扫了一遍 border-width > 0 的元素（39 处 / 9 类），按类别统一处理。
 * 消息气泡与输入卡不在此列 —— 它们的边由 glass.ts 的玻璃体系管，动了会破相。
 */

/* [LES-03] 顶栏下沿辉光：使用外阴影自然衰减，避免伪元素裁剪硬边 */
body[data-bloom-variant] header[class*="_header"] {
  position: relative;
  border-bottom: 0;
  /* 强度实测定档：45% 时边界跳变 32 级、仍读成一条线；78% 跳变 10 级，
     只剩"上面比下面亮一点"的错觉，这才是分隔而不是分割。 */
  box-shadow: 0 28px 48px -28px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 78%);
}
body[data-bloom-variant] header[class*="_header"]::after {
  /* 宿主那条 0.5px 硬线关掉，交给上面的辉光 */
  display: none;
}

/* 描边按钮 → 浅底。新会话 / Session 日志 / 本主题切换器三个长得一样，
   一起处理，免得只改自己的显得突兀。

   ⚠️ 三条约束，都来自 2026-09-29 那次「怎么这么丑」：
   ① 一律写成 button[class*="_…"]。子串匹配会连后代一起命中 —— 侧栏新会话
      按钮的后代 hHd-Xa_newSessionLabelMask / _Content / _Label / _Shortcut
      全都含 "_newSession"，裸写 [class*="_newSession"] 时同一份 8% 底色被
      叠三层（≈22%），Content 还比 LabelMask 宽 38px 且是直角 ——
      按钮里套出一个硬边小条。
   ② 底色只在这里出现一次。侧栏那颗的底色由 §新建会话按钮 那条给（同样是
      transparent 92%），这里不再重复 —— 两处各写一遍、靠特异度决出胜负，
      正是这个仓库 0.10.x 清过一次的老毛病（见 §会话条目 的注解）。
   ③ 三个按钮用同一个值（92% / hover 86%），差一档就会看出"哪个重了一档"。 */
body[data-bloom-variant] button[class*="_newSession"],
body[data-bloom-variant] .dsh-bloom-trigger {
  border-color: transparent;
  /* transform + box-shadow 也进 transition：§7 hover 抬升要平滑，不能 snap。
     §7 那边只改属性，不重声明 transition —— 避免重复定义打架 */
  transition:
    background var(--bloom-dur-fast, .16s) var(--bloom-ease, ease),
    transform var(--bloom-dur-fast, .16s) var(--bloom-ease, ease),
    box-shadow var(--bloom-dur-fast, .16s) var(--bloom-ease, ease);
}
body[data-bloom-variant] .dsh-bloom-trigger {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%);
}
body[data-bloom-variant] .dsh-bloom-trigger:hover {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 86%);
}

/* 侧栏底部操作区：上边框 → 向上扩散的极淡阴影 */
body[data-bloom-variant] [class*="_footerActions"] {
  border-top: 0;
  box-shadow: 0 -6px 10px -8px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 78%);
}

/* ═══ composer 发送键（DSH .yhfFVG_primary）══
 * DSH 给这颗按钮写死了 color:#fff —— 不是 token，主题改不到。info-fill 修回
 * 实心 accent 之后，亮色是「浅底 + 白箭头」没问题，暗色就反了：accentD 是亮色，
 * 白箭头浮在亮底上约 1.6:1。glyph 改用 primary-dimmed —— 那一对（fill × dimmed）
 * 是色板按 WCAG 反推校准过的：亮色 dimmed=bgL 近白，暗色 dimmed=bgD 近黑。
 * 顺带说明：早先 info-fill 写成 mix(a,90)（10% 不透明度）时这条也救不了 ——
 * 实测填充 rgb(231,233,218) vs 白箭头 1.24:1，整颗按钮在卡片里看不见
 * （2026-10-08 用户实拍）。根因在 token，已在 tokens.ts 改回实心。 */
body[data-bloom-variant] button[class*="_primary"] {
  color: var(--dsw-alias-button-primary-dimmed);
}

/* ═══ 禁用主按钮的图标可读性（2026-09-14 用户实拍「浅色下看不清」）══
 * DSH 禁用主按钮（空输入时的发送键等）的做法是整体叠 opacity .4，图标仍是
 * 「fill 上的前景」label-primary-foreground —— 那个 token 亮色语义就是白
 * （static neutral-bluish-00）。禁用态的底已经被压成 40% 的淡染，白箭头浮在
 * 上面等于没有（禁用 bloom 样式实测原生同样如此，只是莫兰迪的淡底把它衬得更
 * 明显）。README 挂着 WCAG 徽章，这里修正：图标用正文字色（label-primary）
 * 才读得清，明暗自适应 —— 暗色下两者同为亮色，行为不变，只有亮色被纠正。
 * 特异度比上面那条高（多一个 :disabled），两条同时生效：启用态走 dimmed，
 * 禁用态走正文字色。 */
body[data-bloom-variant] button[class*="_primary"]:disabled {
  color: var(--dsw-alias-label-primary);
}
`;

  // src/css/glass.ts
  var GLASS_CSS = `
/* ═══ 顶栏 tab 条：不做玻璃,只留一条发丝底边 ═══════════════════
   这里曾和侧栏/排队条共用「面级玻璃」档位(半透底 + backdrop blur +
   inset 白描边)。但 tab 条只有 27px 高、1400px 宽 —— 那套玻璃在这个尺寸上
   读不出「一块玻璃」,只会变成一条自带底色和白边框的横带,跟下方内容区
   撞出一道突兀的色块边界(用户实拍反馈:「对话和轨迹这里」)。

   玻璃需要面积才成立。窄条带该做的是「分界」而不是「面」,所以只留一条
   morandi 发丝底边,底色完全交给 body 的氛围渐变。 */
body[data-bloom-variant] header[class*="_header"] > div[class*="_tabs"] {
  background-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: inset 0 -1px 0 var(--bloom-hairline, rgba(146,168,179,0.3));
}

/* ═══ 面级面板（排队条 / 预览 dock）═══════════════════════════════
   面积大，档位「略实」；顶部亮高光 + 深色外辉让它像一块立起来的玻璃。 */
body[data-bloom-variant] div[class*="_dock"]:has(> [class*="_preview"]) {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 82%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.10),
    0 14px 44px -16px rgba(0,0,0,0.22);
}
body[data-ds-dark-theme] div[class*="_dock"]:has(> [class*="_preview"]) {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 64%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    inset 0 0 0 1px rgba(255,255,255,0.05),
    0 16px 48px -18px rgba(0,0,0,0.5);
}

/* ═══ 侧栏玻璃：backdrop-filter 必须走 ::before，绝不能加在 _sidebarCol 自身 ═══
   ⚠️ 这是本项目踩过的最贵的坑，改这块前先读完。

   backdrop-filter（和 transform / filter / perspective / contain / will-change 一样）
   会让元素成为**其 position:fixed 后代的 containing block**。而 DSH 的**设置面板
   挂在侧栏子树里**（_sidebarCol > … > _footArea > _settingsArea > _overlay），
   它的 overlay 是 fixed + inset:0，本来相对视口铺满、panel 800px 居中。

   一旦 _sidebarCol 自己带 backdrop-filter，那个 fixed 就改为相对 280px 宽的侧栏定位：
   遮罩缩到侧栏那一条，panel 被挤成 279px，detail 区 flex 收缩到 18px ——
   于是中文变成逐字竖排。这个「DSH 的 layout bug」从来不是 DSH 的，是我们自己造的，
   而且为它写了 60 行 modal 改造 CSS、来回改了三轮（详见 DEV_NOTES 2026-08-24）。

   伪元素的 backdrop-filter 只作用于伪元素自己，不改变父元素的 containing block
   资格，所以玻璃观感一致、fixed 后代不受影响。

   ⚠️ 第二个坑（修第一个坑时当场踩的）：**不要给侧栏加 isolation: isolate。**
   它确实不创建 containing block，但会创建 **stacking context** —— overlay 的
   z-index:1000 会被困在侧栏内部，而侧栏自身是 z-index:auto，于是设置面板被
   主聊天区的 composer 画在了上面。两个属性伤的是两件不同的事：
     backdrop-filter → containing block（伤 fixed 的**定位基准**）
     isolation        → stacking context（伤 fixed 的**层叠顺序**）
   所以这里只用 position:relative + z-index:-1：伪元素落在 root 层叠上下文里、
   body 氛围渐变之上、所有正常流内容之下，玻璃该模糊的背景一点没变。

   判据（以后加玻璃时对每个目标问一遍）：
   「这个元素的子树里有 position:fixed 的东西吗？」有 → 玻璃必须走 ::before，
   且不得引入 isolation / transform / filter / contain / will-change。
   输入卡的 conversation.input.overlay 槽也会注入 fixed 元素（如 dsh-convmap），
   必须遵守同一判据，不能把滤镜放回卡片本体（issue #15）。 */
body[data-bloom-variant] [class*="_sidebarCol"] {
  position: relative;
  /* v0.10.x：之前 transparent !important 让侧栏和 body 完全同色，没有容器感。
     改成带 accent tint 的底色 —— 6% accent 混进 bg-layer-1，肉眼能看出
     "这块区域有自己的颜色"，但又不至于抢内容。 */
  background-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), var(--dsw-alias-bg-layer-1, #fff) 94%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.10),
    /* 右缘冷光必须走 box-shadow：侧栏 overflow:hidden，伪元素画的光带只能落在
       容器内侧，看上去是「向内发光」（owner 2026-09-10 反馈）；外阴影不受自身
       overflow 裁剪，是唯一真正往外散的做法。offset 与 spread 同量（24/-24），
       让光只出现在右侧，不糊到上下边。
       2026-11-03：原 transparent 45%（≈55% accent）在朱砂浅色截图里实测是一条
       ~45px 宽的玫红带（边缘 (219,183,181) vs 侧栏底 (236,232,231)），像渲染残影
       不像分界线。收窄到 16/-16 + 28px 模糊、浓度降到 ≈20%：仍能读出「侧栏有边」，
       但不再是左半屏最亮的东西。 */
    16px 0 28px -16px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 80%),
    0 14px 44px -16px rgba(0,0,0,0.22);
}
body[data-bloom-variant] [class*="_sidebarCol"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  /* 玻璃层也带一点 accent tint —— 和上面的底色呼应 */
  background-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), var(--dsw-alias-bg-layer-1, #fff) 88%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
}
body[data-ds-dark-theme] [class*="_sidebarCol"] {
  background-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), var(--dsw-alias-bg-layer-1, #101010) 92%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    inset 0 0 0 1px rgba(255,255,255,0.05),
    /* 暗色同步收：35%（≈65% accent）→ 72%（≈28%），深底上光更显眼，所以留得比浅色多一点 */
    16px 0 28px -16px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 72%),
    0 16px 48px -18px rgba(0,0,0,0.5);
}
body[data-ds-dark-theme] [class*="_sidebarCol"]::before {
  background-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), var(--dsw-alias-bg-layer-1, #101010) 82%);
}

/* v0.6.2: 「对话 / 轨迹」tab 字号上限保护 —— 用户在窄屏 / 浏览器 zoom>100% 下
   反馈 tab 视觉上被放大、撑得过宽。DSH 原生 tab 是 wSkVaW_tab（默认 13px），
   这里兜底 clamp 到 14px，避免任何状态下字号异常撑开。 */
header[class*="_header"] > div[class*="_tabs"] [class*="_tab"] {
  font-size: clamp(13px, 0.9vw, 14px) !important;
  font-weight: 500 !important;
  letter-spacing: normal !important;
  white-space: nowrap !important;
}

/* ═══ 输入卡片（主角）—— 最清晰的一块玻璃，focus 时玻璃边缘点亮 ═══
   v0.9.0: 用户反馈边框「粗粗的」——
     原因不是 1px hairline 本身粗，而是 COMPONENT_CSS 给的 border: 1px solid var(--bloom-hairline)
     又叠了 GLASS_CSS 的 inset 0 0 0 1px rgba(255,255,255,...) 内白圈，
     1px 外框 + 1px 内圈 = 视觉上等于 2px 的厚边框；focus-within 再加 3px 的
     --bloom-glow 光环就更肥。
   修复：去掉 inset 0 0 0 1px 那圈内白线，只保留顶部 1px 高光（玻璃边沿）
     和外阴影；focus 环 3px -> 2px，颜色用 accent x 25% 收敛到主题色相，
     远看像一根细线而不是一圈光晕。border 本身仍走 COMPONENT_CSS 的 hairline。 */
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"] {
  position: relative;
  background-color: transparent;
  /* v0.10.x（owner 反馈「没层次感」）：阴影只完成"功能"没完成"戏剧"。
     单层远影 + 顶部内高光只是让卡片不和背景撞色，不让卡片"提起来"。
     三层叠：① 顶部内高光（光从上方来）；② 紧贴的硬短影（贴着卡边的
     0.5px 影，像把卡片按下去一点弹回来的感觉）；③ 远散的长距柔影
     （把卡片安放在画布上）；④ 主题色 tint 外晕（"这张卡属于这里"——
     莫兰迪主题自己的颜色，不是死的灰黑阴影）。 */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.28),
    0 1px 2px -1px rgba(0, 0, 0, 0.18),
    0 18px 52px -20px rgba(0,0,0,0.26),
    /* 外晕浓度由 --bloom-halo 驱动（component.ts §7 的呼吸动画在推它）。
       这条只在**浅色**生效（暗色由下方 data-ds-dark-theme 规则整条覆盖）。
       原系数 ×30%：截图实测朱砂浅色卡片周围一圈粉晕 + 粉描边 (221,158,154) +
       红发送键，三层同色相，主角成了光晕（2026-11-03 评审）。降到 ×16%。 */
    0 0 48px -16px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent calc(100% - var(--bloom-halo, 0.73) * 16%));
}
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 84%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.35);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.35);
}
body[data-ds-dark-theme] div[class*="_composer"] div[class*="_card"] {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.12),
    0 1px 2px -1px rgba(0, 0, 0, 0.5),
    0 20px 56px -22px rgba(0,0,0,0.55),
    0 0 64px -20px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent calc(100% - var(--bloom-halo, 0.7) * 40%));
}
body[data-ds-dark-theme] div[class*="_composer"] div[class*="_card"]::before {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 66%);
}
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"]:focus-within {
  border-color: var(--bloom-hairline-strong);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.3),
    0 1px 2px -1px rgba(0, 0, 0, 0.18),
    0 0 0 2px color-mix(in oklch, var(--bloom-accent) 25%, transparent),
    0 18px 52px -20px rgba(0,0,0,0.26),
    /* 同上只在浅色生效：聚焦信号交给 2px accent 环，外晕不再跟着加浓（26% → 16%） */
    0 0 56px -16px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 84%);
}
/* 浅色输入卡描边走中性色。--bloom-hairline 是 rgba(morandi, .3)，浅底上读成主题色相
   的淡粉/淡绿边。浅色下主题色只留给「发送键 + 聚焦环」两个有语义的位置，描边改用
   正文字色的低比例混合（各变体 txL 都是近黑，跨变体是一致的灰）。暗色不动。
   特异性：base (0,4,3) 高于 COMPONENT_CSS 描边 (0,2,2)；:hover / :focus-within 版
   (0,5,3) 高于 COMPONENT_CSS :hover (0,3,2) 与上面玻璃 :focus-within (0,4,3)。 */
body[data-bloom-variant]:not([data-ds-dark-theme]) div[class*="_composer"] div[class*="_card"] {
  border-color: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 12%, transparent);
}
body[data-bloom-variant]:not([data-ds-dark-theme]) div[class*="_composer"] div[class*="_card"]:hover {
  border-color: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 20%, transparent);
}
body[data-bloom-variant]:not([data-ds-dark-theme]) div[class*="_composer"] div[class*="_card"]:focus-within {
  border-color: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 26%, transparent);
}
body[data-ds-dark-theme] div[class*="_composer"] div[class*="_card"]:focus-within {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.14),
    0 1px 2px -1px rgba(0, 0, 0, 0.5),
    0 0 0 2px color-mix(in oklch, var(--bloom-accent) 28%, transparent),
    0 20px 56px -22px rgba(0,0,0,0.55),
    0 0 72px -20px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 68%);
}

/* ═══ 消息气泡 —— 柔和玻璃，近距淡影，不压内容 ═══
   ⚠️ 必须限定 div（2026-09-14 用户实拍「浅色下提示看不清」）：
   DSH 的全局 Tooltip 与消息气泡共用「_bubble」语义类名（_bubble_1nw3t_1，span）。
   裸 [class*="_bubble"] 会把 tooltip 的深底 var(--dsw-alias-tooltip-bg) 盖成
   22% 透明度的近白玻璃，而 tooltip 文字是 static 白（--dsw-static-neutral-bluish-00）
   —— 白字白底，实测对比度 1.0。消息气泡是 div、tooltip 是 span，限定标签即分开；
   tooltip 的底色由 tokens.ts 接管的 --dsw-alias-tooltip-bg（深底）自动跟随主题。

   浅色为什么原来看着"很普通"（2026-09-29 owner 实拍，deepseek 对比最明显）：
   这套玻璃边原本三条全是白的 —— 顶部高光 0.16 白 + 1px 白环。暗色底下白高光
   抓得住顶边，浅色底（oklch 96%）上白高光没有更亮的亮度可抓，等于白写；
   真正定义边缘的 1px 白环同理，整条边只剩一个 0.14 的弱影撑着，气泡就"贴"
   在背景上而不是"浮"着。浅色模式的抬起感只能靠阴影扛，阴影一弱就彻底平掉。

   所以浅色改成：抬不透明度（78%→64%，与暗色的 62% 对齐，别让两个模式差一档）、
   白色顶高光加强（0.16→0.9，白底上确实有更亮处可抓）、**1px 环换成暗色发丝**
   （rgba(0,0,0,.05) 是白底上唯一能划出边界的东西）、影子拆成「接触 + 环境」
   两层（单层大 spread 在白底上会糊成一团，边就没了）。

   再调一轮（同日，对照深色截图逐像素比出来的）：浅色底是 oklch 96%，抬亮表面
   只剩 4% 余量 —— 「比背景更亮」这条路在浅色下基本走不通，气泡和背景的分离
   只能由影和边扛。所以环境影把负 spread 收小（-8px→-10px 配更小 blur 不行，
   负 spread 越大影子越缩进气泡底下、边反而糊掉），改成 14px/32px/-10px 并
   提到 0.14；发丝 0.05→0.07，接触影 0.06→0.08。改完浅色才和深色读得同样
   「浮」。 */
body[data-bloom-variant] div[class*="_bubble"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 64%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.25);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.25);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.9),
    inset 0 0 0 1px rgba(0,0,0,0.07),
    0 1px 3px rgba(0,0,0,0.08),
    0 14px 32px -10px rgba(0,0,0,0.14);
}
body[data-ds-dark-theme] div[class*="_bubble"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 62%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.08),
    inset 0 0 0 1px rgba(255,255,255,0.04),
    0 8px 28px -12px rgba(0,0,0,0.4);
}

/* ═══ 下拉/选择器（覆盖型）—— blur 在这里真正可见 ═══ */
/* v0.6.0 patch: 暗色版从 transparent 52% → 12%（48% → 88% 不透明）。
   v0.6.0 早期设到 22%（78% 不透明）已被 verify 证伪：青金/冷色调 + 亮色聊天内容
   透字仍明显（用户截图「字竖排的 layout bug」整段透出）。现在跟 Bloom 自己的
   下拉（transparent 12%）一致。*/
/* ⚠️ 「_menu」必须排除「_menuAnchor」（2026-09-29 实拍「怎么这么丑」）。
   [class*="_menu"] 是子串匹配，cubgiG_menuAnchor 里含 "_menu" → 一起命中。
   而 menuAnchor 是**触发器按钮的行内 wrapper**（span，撑在 chip 位置），
   不是覆盖型面板：给它铺底 + 两道白色 inset 光带 + blur，就得到输入区上方
   那个「标准模式」chip —— 直角、实心、比旁边的工作区 chip 重三倍的黑盒子。
   实测证据：标准模式 chip 的 span.cubgiG_menuAnchor 计算值
   background=oklch(0.34 0.02 240 / 0.88) radius=0px，而并排的
   button.pXSMma_workspace（工作区 chip）是透明底 + radius 8px。
   排除后两者同重，页面即刻恢复正常。
   真面板（_menuList / _menuPopover 之类）类名同样含 "_menu"，不受影响。 */
body[data-bloom-variant] [class*="_menu"]:not([class*="_menuAnchor"]),
body[data-bloom-variant] [class*="_selector"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff), transparent 20%);
  backdrop-filter: blur(28px) saturate(1.4);
  -webkit-backdrop-filter: blur(28px) saturate(1.4);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.12),
    0 20px 56px -18px rgba(0,0,0,0.3);
}
body[data-ds-dark-theme] [class*="_menu"]:not([class*="_menuAnchor"]),
body[data-ds-dark-theme] [class*="_selector"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #101010), transparent 12%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.1),
    inset 0 0 0 1px rgba(255,255,255,0.05),
    0 24px 64px -20px rgba(0,0,0,0.6);
}

/* ═══ 设置面板：无需任何覆盖 ═══
   这里曾经有 60 行把「279px 窄 drawer」改造成居中 modal 的 CSS，前后改了三轮
   （v0.6.0 修 → v0.6.1 以「不覆盖 DSH 原生 layout」回滚并记为「去官方提 issue」
   → 又改回来）。三轮都白做，因为**前提是错的**：

   实测（2026-08-24，摘掉 Bloom 样式后量的）DSH 原生设置面板本来就是
   800×800 的居中 modal，x=464=(1728-800)/2 精确居中，中文描述 383~398px 正常横排。
   **DSH 没有这个 bug。** 那个「窄 drawer + 中文逐字竖排」是 Bloom 自己造成的回归 ——
   见上方 _sidebarCol 的 ::before 注释：侧栏的 backdrop-filter 把设置面板 overlay
   的 fixed containing block 从视口换成了 280px 的侧栏。

   修根因（玻璃移到伪元素）之后，**布局上**这里一行 CSS 都不需要。

   ── 唯一的例外是下面这条，它改的是颜色而不是布局 ── */

/* DSH 拿**前景色 token 当边框色**用的地方（第二例）。设置面板 Agent 预设的
   选中卡片写的是 border-color: var(--dsw-alias-label-primary) —— 那是正文文字色，
   Bloom 在暗色下给它 oklch(0.96 …) 近白，于是选中卡围了一圈刺眼白边。
   选中态本该是主题色。hover 态同样拿 label-dimmed 当边框，一并换成发丝线。 */
body[data-bloom-variant] [class*="_cardActive"] {
  border-color: var(--bloom-accent);
}
body[data-bloom-variant] [class*="_card"]:hover:not([class*="_cardActive"]) {
  border-color: var(--bloom-hairline-strong);
}

/* 「浅色 / 深色 / 跟随系统」选中态的边框：DSH 用 --dsw-static-neutral-bluish-400
   （#adb2b8）画它。那是 static 层的中性灰阶 —— 绕过了 alias 层，主题的
   --dsw-alias-border-* 改不到它，于是在莫兰迪暗底上留下一圈刺眼的灰白边
   （用户实拍反馈「白色边框很突兀」，而且只有选中那一个特别亮）。

   选中态本该是主题色，这里按 accent 接管。并且**不**整体覆盖
   --dsw-static-neutral-bluish-400 —— static 是 DSH 的基础色阶，全局改会波及
   大量无关组件；只在这个具体组件上纠正，影响面可控。 */
body[data-bloom-variant] button[class*="_themeCube"][class*="_selected"] {
  border-color: var(--bloom-accent);
}

body[data-bloom-variant] .md-code-block {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 70%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.2);
}
body[data-ds-dark-theme] .md-code-block {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 56%);
}
body[data-bloom-variant] .md-code-block pre,
body[data-bloom-variant] .md-code-block code { background: transparent; }

/* #76: the viewport must stay unpainted. Avoid backdrop-filter on the
   scrolling wrapper: it turns fixed descendants into locally positioned ones. */
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]) > table {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1), transparent 70%);
}
body[data-bloom-variant][data-ds-dark-theme] :is([class*="_tableScroll"], [class*="_tablePane"]) > table {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1), transparent 56%);
}

/* Host HoverCard preview has BOTH card and preview classes. The general card
   hover wash made file/diff previews transparent (#57). Keep this overlay
   opaque in both states, without changing regular cards or queue previews. */
body[data-bloom-variant] div[class*="_card"][class*="_preview"],
body[data-bloom-variant] div[class*="_card"][class*="_preview"]:hover {
  background: var(--dsw-alias-bg-layer-1);
}

/* ═══ 表格内部分隔线加强（v0.9.0）用户截图反馈列线几乎不可见 ═══
   原 CSS 用 var(--bloom-hairline)（莫兰迪 30% alpha）做列分隔，
   在深色氛围渐变上几乎消失，看起来像没线的「列表」。提到
   hairline-strong（55% alpha）并给 thead 加一档淡底，列与行都立起来。 */
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]) th,
body[data-bloom-variant] :is([class*="_tableScroll"], [class*="_tablePane"]) td {
  border-color: var(--bloom-hairline-strong);
}
:is([class*="_tableScroll"], [class*="_tablePane"]) thead th {
  background: rgba(var(--bloom-morandi), 0.10);
}
body[data-ds-dark-theme] :is([class*="_tableScroll"], [class*="_tablePane"]) thead th {
  background: rgba(var(--bloom-morandi), 0.08);
}
:is([class*="_tableScroll"], [class*="_tablePane"]) tbody tr:nth-child(even) td {
  background: rgba(var(--bloom-morandi), 0.03);
}
body[data-ds-dark-theme] :is([class*="_tableScroll"], [class*="_tablePane"]) tbody tr:nth-child(even) td {
  background: rgba(var(--bloom-morandi), 0.04);
}


`;

  // src/css/background.ts
  var BACKGROUND_CSS = `
/* [LES-04][LES-10][LES-12][LES-17][LES-27] */
body[data-bloom-variant] {
  
  --bloom-ambience:
    
    radial-gradient(1200px circle at 8% -6%, color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 86%), transparent 48%),
    
    radial-gradient(1000px circle at 95% -4%, color-mix(in oklch, var(--bloom-aurora-stream-2), transparent 88%), transparent 45%);
}
/* The desktop host clears html[data-platform] body later in the cascade. */
html body[data-bloom-variant]:is([data-ds-dark-theme], :not([data-ds-dark-theme])) {
  background-attachment: fixed;
  background-image: var(--bloom-ambience);
}

/* Restore the four-corner colour distribution from the released visual reference. */
body[data-bloom-variant][data-ds-dark-theme] {
  --bloom-ambience:
    radial-gradient(1400px circle at 6% -4%, color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 80%), transparent 50%),
    radial-gradient(1100px circle at 100% 8%, color-mix(in oklch, var(--bloom-aurora-stream-2), transparent 50%), transparent 60%),
    radial-gradient(900px circle at 96% 100%, color-mix(in oklch, var(--bloom-aurora-stream-3), transparent 50%), transparent 62%),
    radial-gradient(1000px circle at 2% 96%, color-mix(in oklch, var(--bloom-aurora-stream-1), transparent 50%), transparent 60%);
}

body[data-bloom-variant]:not([data-ds-dark-theme]) {
  /* [LES-33] */
  --bloom-companion-3: var(--bloom-motion-3, var(--bloom-accent));
  --bloom-tint-1: color-mix(in oklch, var(--bloom-motion-1, var(--bloom-accent)) 22%, #fff);
  --bloom-tint-2: color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent)) 18%, #fff);
  --bloom-tint-3: color-mix(in oklch, var(--bloom-companion-3) 18%, #fff);
  --bloom-veil: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,.05) 28%, rgba(255,255,255,.30) 58%, rgba(255,255,255,.72) 84%, #fff 100%);
  --bloom-fog-mask: url("#dsh-bloom-fog-stream");
  --bloom-fog-glaze: linear-gradient(rgba(255,255,255,.92), rgba(255,255,255,.92));
  --bloom-ambience:
    var(--bloom-veil),
    linear-gradient(125deg,
      var(--bloom-tint-1) 0%,
      var(--bloom-tint-2) 48%,
      var(--bloom-tint-3) 100%);
}
@supports (color: oklch(from red l c h)) {
  body[data-bloom-variant]:not([data-ds-dark-theme]) {
    --bloom-companion-3: color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 50%, oklch(from var(--bloom-motion-1, var(--bloom-accent)) l c calc(h + 150)));
  }
}
body[data-bloom-variant]:not([data-ds-dark-theme])[data-bloom-ambience-light="wash"] {
  --bloom-fog-mask: url("#dsh-bloom-fog-wash");
  --bloom-veil: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,.06) 30%, rgba(255,255,255,.34) 60%, rgba(255,255,255,.76) 86%, #fff 100%);
  --bloom-ambience:
    var(--bloom-veil),
    radial-gradient(96% 78% at 50% 6%, var(--bloom-tint-1), transparent 68%),
    radial-gradient(86% 70% at 6% 22%, var(--bloom-tint-2), transparent 70%),
    radial-gradient(86% 70% at 94% 26%, var(--bloom-tint-3), transparent 70%);
}

body[data-bloom-variant]:not([data-ds-dark-theme])[data-bloom-ambience-light="clear"] {
  --bloom-fog-mask: url("#dsh-bloom-fog-clear");
  --bloom-veil: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,.10) 34%, rgba(255,255,255,.46) 66%, #fff 100%);
  --bloom-ambience:
    var(--bloom-veil),
    linear-gradient(180deg, var(--bloom-tint-1) 0%, var(--bloom-tint-2) 16%, var(--bloom-tint-3) 32%, rgba(255,255,255,0) 62%);
}
body[data-bloom-variant]:not([data-ds-dark-theme])[data-bloom-ambience-light="off"],
body[data-bloom-variant][data-ds-dark-theme][data-bloom-ambience-dark="off"] { --bloom-ambience: none; --bloom-fog-mask: none; --bloom-fog-glaze: none; }


body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  
  background-image: var(--bloom-ambience);
}
/* Dark colour is painted once on the body; the fixed seat repeats that same image. */
body[data-bloom-variant][data-ds-dark-theme]::before { background-image: none; }
body[data-bloom-variant]:not([data-ds-dark-theme]):not([data-bloom-ambience-light="off"])::after {
  content: '';
  display: block;
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: var(--bloom-fog-glaze);
  -webkit-mask-image: var(--bloom-fog-mask);
  mask-image: var(--bloom-fog-mask);
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

body[data-bloom-variant] [class*="_root"] [class*="_composerSeat"] {
  background-image: none;
  /* Keep the fixed backdrop aligned to the viewport. */
  will-change: auto;
}
body[data-bloom-variant] [class*="_root"] [class*="_composerSeat"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: var(--dsw-alias-bg-layer-1, #101010);
  background-image: var(--bloom-ambience);
  background-attachment: fixed;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 56px);
  mask-image: linear-gradient(to bottom, transparent 0, #000 56px);
}


body[data-bloom-variant]:not([data-ds-dark-theme]) [class*="_root"] [class*="_composerSeat"]::before {
  background: rgba(255, 255, 255, .28);
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000);
  mask-image: linear-gradient(to bottom, transparent, #000);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
}
@media (prefers-contrast: more), (forced-colors: active) {
  html body[data-bloom-variant]:is([data-ds-dark-theme],:not([data-ds-dark-theme])) [class*="_root"] [class*="_composerSeat"]::before {
    background: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    -webkit-mask-image: none;
    mask-image: none;
  }
}
@media (prefers-reduced-transparency: reduce) {
  html body[data-bloom-variant]:not([data-bloom-glass]):is([data-ds-dark-theme],:not([data-ds-dark-theme])) [class*="_root"] [class*="_composerSeat"]::before {
    background: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    -webkit-mask-image: none;
    mask-image: none;
  }
}
body[data-bloom-variant="aurora"]::after,
body[data-bloom-variant="cinnabar"]::after { display: none; }
@media (prefers-reduced-motion: reduce) {
  body[data-bloom-variant="aurora"]::after,
  body[data-bloom-variant="cinnabar"]::after { display: none; }
}
.dsh-bloom-sparkles {
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  width: 360px;
  height: 220px;
  z-index: 0;
  opacity: 0.7;
  overflow: hidden;
  pointer-events: none;
  background: none;
}
body[data-ds-dark-theme] .dsh-bloom-sparkles { display: block; }
body[data-ds-dark-theme][data-bloom-ambience-dark="off"] .dsh-bloom-sparkles { display: none; }
body[data-ds-dark-theme][data-bloom-ambience-dark="diagonal"] .dsh-bloom-sparkles,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles {
  width: 100vw;
  height: 100vh;
  -webkit-mask-image: radial-gradient(ellipse 62% 52% at 50% 52%, transparent 38%, black 86%);
  mask-image: radial-gradient(ellipse 62% 52% at 50% 52%, transparent 38%, black 86%);
}
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles {
  opacity: 1;
  -webkit-mask-image: radial-gradient(ellipse 56% 46% at 50% 54%, rgba(0, 0, 0, 0.25) 30%, black 80%);
  mask-image: radial-gradient(ellipse 56% 46% at 50% 54%, rgba(0, 0, 0, 0.25) 30%, black 80%);
}

.dsh-bloom-sparkles > b.s-met { display: none; }
@media (prefers-reduced-motion: no-preference) {
  body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > b.s-met { display: block; }
}
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > b.s-met {
  position: absolute;
  border-radius: 999px;
  opacity: 0;
  transform-origin: 0 50%;
  --c: var(--meteor-color, var(--bloom-motion-1, var(--bloom-accent, #6b8f71)));
  background: linear-gradient(90deg, #fff 0%, color-mix(in oklch, var(--c) 70%, #fff) 6%, color-mix(in oklch, var(--c), transparent 35%) 30%, transparent 100%);
  filter: drop-shadow(0 0 3px color-mix(in oklch, var(--c) 80%, #fff)) drop-shadow(0 0 10px var(--c));
  animation: bloom-meteor linear infinite;
  will-change: transform, opacity;
}
.dsh-bloom-sparkles > b.s-met.m2 { --c: var(--meteor-color, var(--bloom-motion-2, var(--bloom-accent, #6b8f71))); }
.dsh-bloom-sparkles > b.s-met.m3 { --c: var(--meteor-color, var(--bloom-motion-3, var(--bloom-accent, #6b8f71))); }

body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-amb.t,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-bl.t {
  background: color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent, #6b8f71)) 55%, #fff);
  box-shadow: 0 0 calc(var(--glow, 3px) * 1.6) var(--bloom-motion-2, var(--bloom-accent, #6b8f71));
}
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-amb:not(.t) {
  background: color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent, #6b8f71)) 45%, #fff);
  box-shadow: 0 0 calc(var(--glow, 3px) * 1.6) var(--bloom-motion-3, var(--bloom-accent, #6b8f71));
}
@keyframes bloom-meteor {
  0%   { transform: rotate(var(--rot)) translateX(0); opacity: 0; }
  2%   { opacity: var(--peak); }
  18%  { opacity: var(--peak); }
  24%  { transform: rotate(var(--rot)) translateX(calc(var(--travel) * -1)); opacity: 0; }
  100% { transform: rotate(var(--rot)) translateX(calc(var(--travel) * -1)); opacity: 0; }
}

.dsh-bloom-sparkles > i.s-bl,
.dsh-bloom-sparkles > i.s-amb,
.dsh-bloom-sparkles > i.s-galaxy-edge { display: none; }
body[data-ds-dark-theme][data-bloom-ambience-dark="diagonal"] .dsh-bloom-sparkles > i.s-bl,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-bl,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-amb,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-galaxy-edge { display: block; }
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-amb,
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-galaxy-edge {
  animation-name: bloom-spark-drift, bloom-galaxy-firefly;
}
@keyframes bloom-galaxy-firefly {
  0%, 100% { opacity: calc(var(--peak) * .24); }
  22% { opacity: var(--peak); }
  42% { opacity: calc(var(--peak) * .4); }
  66% { opacity: calc(var(--peak) * .9); }
  84% { opacity: calc(var(--peak) * .3); }
}
.dsh-bloom-sparkles > i {
  display: block;
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  background: #fff;
  box-shadow: 0 0 var(--glow, 3px) rgba(255, 255, 255, 0.7);
  animation-name: bloom-spark-drift, bloom-spark-twinkle;
  animation-timing-function: cubic-bezier(.25, .6, .35, 1), ease-in-out;
  animation-iteration-count: infinite, infinite;
  will-change: transform, opacity;
}
.dsh-bloom-sparkles > i.t {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 40%, #fff);
  box-shadow: 0 0 var(--glow, 3px) color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 15%);
}

@keyframes bloom-spark-drift {
  0%   { transform: translate(0, 0) scale(.3); }
  25%  { transform: translate(calc(var(--dx) * .35), calc(var(--dy) * .35)) scale(.9); }
  100% { transform: translate(var(--dx), var(--dy)) scale(1); }
}

@keyframes bloom-spark-twinkle {
  0%   { opacity: 0; }
  20%  { opacity: var(--peak); }
  35%  { opacity: calc(var(--peak) * .3); }
  55%  { opacity: var(--peak); }
  75%  { opacity: calc(var(--peak) * .15); }
  100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-sparkles > i,
  body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-amb,
  body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-sparkles > i.s-galaxy-edge { animation: none; opacity: .4; }
}
`;

  // src/css/button.ts
  var BUTTON_CSS = `
/* [LES-35] */
body[data-bloom-variant]:not([data-ds-dark-theme]) div[class*="_composer"] button[class*="_primary"] {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  padding: 0;
  color: color-mix(in oklch, var(--bloom-accent, #666) 70%, #7b7b7b);
  background-color: transparent;
  background-image:
    radial-gradient(ellipse at 28% 13%, rgba(255,255,255,.98), rgba(255,255,255,.45) 28%, transparent 54%),
    radial-gradient(ellipse at 79% 82%, color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 20%, transparent), transparent 64%),
    linear-gradient(145deg, color-mix(in oklch, var(--bloom-motion-1, var(--bloom-accent)) 7%, rgba(255,255,255,.92)), color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent)) 14%, rgba(255,255,255,.78)));
  -webkit-backdrop-filter: blur(2px) url("#dsh-bloom-liquid-lens") saturate(1.15);
  backdrop-filter: blur(2px) url("#dsh-bloom-liquid-lens") saturate(1.15);
  box-shadow: inset 0 1px 2px rgba(255,255,255,.98), inset 0 -2px 3px color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent)) 18%, transparent), 0 7px 14px -6px color-mix(in oklch, var(--bloom-motion-1, var(--bloom-accent)) 26%, transparent), 0 2px 4px rgba(50,50,50,.10);
}
body[data-bloom-variant]:not([data-ds-dark-theme]) div[class*="_composer"] button[class*="_primary"]:not(:disabled):hover {
  background-image:
    radial-gradient(ellipse at 28% 13%, rgba(255,255,255,1), rgba(255,255,255,.56) 28%, transparent 54%),
    radial-gradient(ellipse at 79% 82%, color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 25%, transparent), transparent 64%),
    linear-gradient(145deg, color-mix(in oklch, var(--bloom-motion-1, var(--bloom-accent)) 8%, rgba(255,255,255,.95)), color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent)) 16%, rgba(255,255,255,.84)));
}
body[data-bloom-variant][data-ds-dark-theme] div[class*="_composer"] button[class*="_primary"] {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  padding: 0;
  color: var(--dsw-alias-label-primary, #eee);
  background-color: transparent;
  background-image:
    radial-gradient(ellipse at 28% 17%, rgba(255,255,255,.26), transparent 62%),
    radial-gradient(ellipse at 79% 82%, color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 16%, transparent), transparent 64%),
    linear-gradient(145deg, color-mix(in oklch, var(--dsw-alias-bg-layer-2, #343943) 88%, var(--bloom-motion-1)), color-mix(in oklch, var(--dsw-alias-bg-layer-1, #1b2028) 90%, var(--bloom-motion-2)));
  -webkit-backdrop-filter: blur(2px) url("#dsh-bloom-liquid-lens") saturate(1.15);
  backdrop-filter: blur(2px) url("#dsh-bloom-liquid-lens") saturate(1.15);
  box-shadow: inset 0 1px 1px rgba(255,255,255,.34), inset 0 -2px 3px rgba(0,0,0,.28), 0 6px 12px -6px rgba(0,0,0,.35);
}
body[data-bloom-variant][data-ds-dark-theme] div[class*="_composer"] button[class*="_primary"]:not(:disabled):hover {
  background-image:
    radial-gradient(ellipse at 28% 17%, rgba(255,255,255,.34), transparent 62%),
    radial-gradient(ellipse at 79% 82%, color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 22%, transparent), transparent 64%),
    linear-gradient(145deg, color-mix(in oklch, var(--dsw-alias-bg-layer-2, #343943) 84%, var(--bloom-motion-1)), color-mix(in oklch, var(--dsw-alias-bg-layer-1, #1b2028) 86%, var(--bloom-motion-2)));
}
@supports ((mask-composite: exclude) or (-webkit-mask-composite: xor)) {
  body[data-bloom-variant] div[class*="_composer"] button[class*="_primary"] { position: relative; }
  body[data-bloom-variant] div[class*="_composer"] button[class*="_primary"]::before {
    content: '';
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    border-radius: inherit;
    padding: 1px;
    pointer-events: none;
    background: conic-gradient(from -40deg, rgba(255,255,255,.88), color-mix(in oklch, var(--bloom-motion-2, var(--bloom-accent)) 22%, rgba(255,255,255,.50)), rgba(255,255,255,.16), color-mix(in oklch, var(--bloom-motion-3, var(--bloom-accent)) 24%, rgba(255,255,255,.35)), rgba(255,255,255,.88));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
  }
}
body[data-bloom-variant] div[class*="_composer"] button[class*="_primary"]:disabled:not([data-sending]) { opacity: .68; }
@media (prefers-reduced-transparency: reduce) {
  html body[data-bloom-variant]:not([data-bloom-glass]) div[class*="_composer"] button[class*="_primary"]::before { display: none; }
  html body[data-bloom-variant]:not([data-bloom-glass]) div[class*="_composer"] button[class*="_primary"] {
    background: var(--dsw-alias-bg-layer-1, #fff);
    color: var(--dsw-alias-label-primary, #222);
    border: 1px solid currentColor;
    box-shadow: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
@media (prefers-contrast: more), (forced-colors: active) {
  html body[data-bloom-variant]:is([data-ds-dark-theme],:not([data-ds-dark-theme])) div[class*="_composer"] button[class*="_primary"]::before { display: none; }
  html body[data-bloom-variant]:is([data-ds-dark-theme],:not([data-ds-dark-theme])) div[class*="_composer"] button[class*="_primary"] {
    background: var(--dsw-alias-bg-layer-1, Canvas);
    color: var(--dsw-alias-label-primary, CanvasText);
    border: 1px solid currentColor;
    box-shadow: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
`;

  // src/css/liquid.ts
  var ACC = "var(--bloom-accent, #6b8f71)";
  var FLOAT = "0 2px 4px -2px rgba(24,38,54,.14), 0 12px 28px -20px rgba(24,38,54,.22)";
  var BLUR = 'blur(3px) url("#dsh-bloom-liquid-lens") saturate(1.2)';
  function liquidSurfaces(s, dark = false) {
    const base = "var(--dsw-alias-bg-layer-1, #17202b)";
    const PANE = dark ? `linear-gradient(145deg, color-mix(in oklch, ${base} 52%, transparent), color-mix(in oklch, ${base} 18%, transparent) 42%, color-mix(in oklch, ${base} 34%, transparent))` : "linear-gradient(145deg, rgba(255,255,255,.46), rgba(255,255,255,.08) 42%, rgba(255,255,255,.22))";
    const MENU = dark ? `linear-gradient(145deg, color-mix(in oklch, ${base} 94%, transparent), color-mix(in oklch, ${base} 90%, transparent))` : "linear-gradient(145deg, rgba(255,255,255,.90), rgba(255,255,255,.84))";
    const RIM = dark ? "inset 0 1px 0 rgba(255,255,255,.24), inset 1px 0 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(0,0,0,.24), inset -1px 0 0 rgba(0,0,0,.12), inset 0 4px 5px -4px rgba(255,255,255,.3)" : "inset 0 1px 0 rgba(255,255,255,.98), inset 1px 0 0 rgba(255,255,255,.72), inset 0 -1px 0 rgba(60,75,90,.10), inset -1px 0 0 rgba(60,75,90,.06), inset 0 4px 5px -4px #fff";
    const highlight = dark ? "rgba(255,255,255,.20)" : "rgba(255,255,255,.8)";
    const css = `
/* [LES-27] */
${s} header[class*="_header"],
${s} [class*="_sidebarCol"],
${s} div[class*="_composer"] div[class*="_card"] {
  position: relative;
  background: transparent;
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: ${RIM}, ${FLOAT};
}
${s} header[class*="_header"]::before,
${s} [class*="_sidebarCol"]::before,
${s} div[class*="_composer"] div[class*="_card"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border: 0;
  border-radius: inherit;
  pointer-events: none;
  background: ${PANE};
  backdrop-filter: ${BLUR};
  -webkit-backdrop-filter: ${BLUR};
  box-shadow: none;
}
${s} [class*="_sidebarCol"],
${s} header[class*="_header"] {
  box-shadow: none;
}
${s} [class*="_centerCol"] {
  border-left-color: transparent;
}
${s} [class*="_sidebarCol"]::before,
${s} header[class*="_header"]::before {
  inset: 6px;
  border-radius: 14px;
  box-shadow: ${RIM}, ${FLOAT};
}
${s} [class*="_sidebarCol"] [class*="_root"]:has(> [class*="_regionArea"]),
${s} [class*="_sidebarCol"] :is([class*="_regionArea"], [class*="_listArea"], [class*="_treeBody"], [class*="_list"]) {
  background: none;
}
${s} [class*="_sidebarCol"] [class*="_fade"] {
  background: none;
}
${s} [class*="_sidebarCol"] [class*="_footerActions"] {
  box-shadow: none;
}

/* [LES-25] */
${s} header[class*="_header"]::before {
  bottom: 0;
}
${s} header[class*="_header"] > div[class*="_tabs"] {
  background: transparent;
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}
${s} .dsh-bloom-menu {
  position: absolute;
  background: ${MENU};
  border-color: transparent;
  backdrop-filter: ${BLUR};
  -webkit-backdrop-filter: ${BLUR};
  box-shadow: ${RIM}, 0 12px 32px -14px rgba(24,38,54,.2);
}
${s} .dsh-bloom-head { box-shadow: none; }
${s} div[class*="_bubble"],
${s} div[class*="_dock"]:has(> [class*="_preview"]),
${s} [class*="_menu"]:not([class*="_menuAnchor"]),
${s} [class*="_selector"],
${s} .md-code-block {
  background: ${PANE};
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: ${RIM};
}

${s} [class*="_composerSeat"] [class*="_dock"] > [class*="_bar"],
${s} [class*="_composerSeat"] [class*="_dock"] > [class*="_preview"] {
  background: transparent;
  border-color: transparent;
  box-shadow: inset 0 1px 0 ${highlight};
}
${s} [class*="_composerSeat"] [class*="_dock"] > [class*="_bar"]::before,
${s} [class*="_composerSeat"] [class*="_dock"] > [class*="_preview"]::before {
  background: ${PANE};
  backdrop-filter: ${BLUR};
  -webkit-backdrop-filter: ${BLUR};
  box-shadow: none;
}

/* [LES-21] */
${s} div[class*="_composer"] div[class*="_card"]:hover,
${s} div[class*="_composer"] div[class*="_card"]:focus-within {
  border-color: transparent;
  box-shadow: ${RIM}, ${FLOAT};
}
${s} div[class*="_composer"] div[class*="_card"]:has(:focus-visible) {
  box-shadow: inset 0 0 0 1px color-mix(in oklch, ${ACC} 42%, #fff), ${FLOAT};
}

${s} .dsh-bloom-trigger,
${s} :is(.dsh-bloom-appearance__btn, .dsh-bloom-ambience__btn, .dsh-bloom-glass__choice)[data-active="true"] {
  background: ${dark ? PANE : "linear-gradient(150deg, rgba(255,255,255,.8), rgba(255,255,255,.36))"};
  border-color: transparent;
  box-shadow: ${RIM}, 0 2px 6px -4px rgba(24,38,54,.2);
}
`;
    return css;
  }

  // src/css/adaptive.ts
  var scope = (prefix, rules) => rules.map((r) => `${prefix} ${r}`).join(",\n");
  var SHELLS = ['header[class*="_header"]', '[class*="_sidebarCol"]', 'div[class*="_composer"] div[class*="_card"]'];
  var PANES = SHELLS.map((s) => `${s}::before`);
  var FLOATING = [".dsh-bloom-menu", ".dsh-bloom-trigger", '[class*="_menu"]:not([class*="_menuAnchor"])', '[class*="_selector"]'];
  var CONTENT = ['div[class*="_bubble"]', 'div[class*="_dock"]:has(> [class*="_preview"])', ".md-code-block"];
  var DOCK_PANES = ['[class*="_composerSeat"] [class*="_dock"] > [class*="_bar"]::before', '[class*="_composerSeat"] [class*="_dock"] > [class*="_preview"]::before'];
  var SURFACES = [...PANES, ...FLOATING, ...CONTENT, ...DOCK_PANES];
  var DECOR = ['body[data-bloom-variant="aurora"]::before', 'body[data-bloom-variant="aurora"]::after', 'body[data-bloom-variant="cinnabar"]::after', ".dsh-bloom-sparkles"];
  var ROOT = "html body[data-bloom-variant]";
  var ROOT_ALL = ROOT + ":is([data-bloom-glass],:not([data-bloom-glass])):is([data-ds-dark-theme],:not([data-ds-dark-theme]))";
  var LIGHT = ":not([data-ds-dark-theme])";
  var DARK = "[data-ds-dark-theme]";
  function grain(dark) {
    const svg = String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 ${dark ? 1 : 0} 0 0 0 0 ${dark ? 1 : 0} 0 0 0 0 ${dark ? 1 : 0} 0 0 0 .05 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  function diffuseSurfaces(s, matte, dark) {
    const layer = String.raw`var(--dsw-alias-bg-layer-1, ${dark ? "#17202b" : "#fff"})`;
    const blur = matte ? "blur(12px) saturate(1.02)" : "blur(24px) saturate(1.15)";
    const tint = matte ? "38%" : "58%";
    const edge = matte ? "inset 0 1px 0 color-mix(in oklch, var(--dsw-alias-label-primary, #222) 7%, transparent), 0 4px 14px -10px rgba(0,0,0,.18)" : `inset 0 1px 0 rgba(255,255,255,${dark ? ".16" : ".62"}), 0 8px 24px -18px rgba(0,0,0,.2)`;
    return `
${s} { --bloom-glass-blur: ${matte ? "12px" : "24px"}; }
${scope(s, SHELLS)} {
  position: relative;
  background: transparent;
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}
${scope(s, PANES)} {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border: 0;
  border-radius: inherit;
  pointer-events: none;
}
${scope(s, SURFACES)} {
  background-color: color-mix(in oklch, ${layer} ${tint}, transparent);
  background-image: ${matte ? grain(dark) : "none"};
  background-repeat: repeat;
  backdrop-filter: ${blur};
  -webkit-backdrop-filter: ${blur};
  border-color: transparent;
  box-shadow: ${edge};
}
${scope(s, FLOATING)} {
  background-color: color-mix(in oklch, ${layer} ${matte ? "78%" : "86%"}, transparent);
}
${s} .dsh-bloom-menu { position: absolute; }
${s} [class*="_sidebarCol"]::before,
${s} header[class*="_header"]::before { inset: 6px; border-radius: 14px; }
${s} header[class*="_header"]::before { bottom: 0; }
${s} header[class*="_header"] > div[class*="_tabs"] {
  background: transparent; border-color: transparent; box-shadow: none;
  backdrop-filter: none; -webkit-backdrop-filter: none;
}
${s} [class*="_centerCol"] { border-left-color: transparent; }
${s} [class*="_sidebarCol"] [class*="_root"]:has(> [class*="_regionArea"]),
${s} [class*="_sidebarCol"] :is([class*="_regionArea"], [class*="_listArea"], [class*="_treeBody"], [class*="_list"], [class*="_fade"]) { background: none; }
${s} [class*="_sidebarCol"] [class*="_footerActions"],
${s} .dsh-bloom-head { box-shadow: none; }
${s} div[class*="_composer"] div[class*="_card"]:hover,
${s} div[class*="_composer"] div[class*="_card"]:focus-within { border-color: transparent; box-shadow: none; }
${s} div[class*="_composer"] div[class*="_card"]:has(:focus-visible) {
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--bloom-accent) 42%, transparent);
}
`;
  }
  var solidSurfaces = (s) => `
${scope(s, [...SURFACES, ...SHELLS])} {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background-image: none !important;
}
${scope(s, SHELLS)} { box-shadow: none !important; }
${scope(s, [...PANES, ...CONTENT, ...DOCK_PANES])} {
  background-color: var(--dsw-alias-bg-layer-1, #fff) !important;
  box-shadow: inset 0 0 0 1px var(--bloom-hairline), 0 1px 3px -1px rgba(0,0,0,.16) !important;
}
${scope(s, FLOATING)} {
  background-color: var(--dsw-alias-bg-layer-2, #fff) !important;
}
`;
  var ADAPTIVE_CSS = `
${diffuseSurfaces(ROOT + '[data-bloom-glass="frosted"]' + LIGHT, false, false)}
${diffuseSurfaces(ROOT + '[data-bloom-glass="frosted"]' + DARK, false, true)}
${diffuseSurfaces(ROOT + '[data-bloom-glass="matte"]' + LIGHT, true, false)}
${diffuseSurfaces(ROOT + '[data-bloom-glass="matte"]' + DARK, true, true)}
@media not (prefers-contrast: more) {
${liquidSurfaces(ROOT + '[data-bloom-glass="liquid"]' + LIGHT)}
${liquidSurfaces(ROOT + '[data-bloom-glass="liquid"]' + DARK, true)}
}
@media (prefers-reduced-transparency: no-preference) and (not (prefers-contrast: more)) {
${liquidSurfaces(ROOT + ":not([data-bloom-glass])" + LIGHT)}
${liquidSurfaces(ROOT + ":not([data-bloom-glass])" + DARK, true)}
}
@media (prefers-reduced-transparency: reduce) {
${solidSurfaces(ROOT + ":not([data-bloom-glass]):is([data-ds-dark-theme],:not([data-ds-dark-theme]))")}
}
@media (prefers-contrast: more), (forced-colors: active) {
${solidSurfaces(ROOT_ALL)}
  ${ROOT_ALL} {
    --bloom-ambience: none;
    --bloom-fog-glaze: none;
    --bloom-fog-mask: none;
    --bloom-hairline: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 45%, transparent);
    --bloom-hairline-strong: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 65%, transparent);
    background-image: none !important;
  }
  html ${DECOR.join(",\n  html ")} { display: none !important; }
  html :focus-visible { outline-width: 3px !important; }
}
@media (forced-colors: active) {
  html body[data-bloom-typing="true"] div[class*="_composer"] div[class*="_card"]::after { display: none !important; }
  .dsh-bloom-option[data-active="true"],
  .dsh-bloom-appearance__btn[data-active="true"] { outline: 2px solid Highlight; outline-offset: -2px; }
  .dsh-bloom-check { color: Highlight; }
  .dsh-bloom-telemetry__box-ui { forced-color-adjust: none; background: Canvas; border: 1px solid ButtonText; }
  .dsh-bloom-telemetry__box-ui::after { forced-color-adjust: none; background: ButtonText; }
  .dsh-bloom-telemetry__box:checked + .dsh-bloom-telemetry__box-ui { background: Highlight; border-color: Highlight; }
  .dsh-bloom-telemetry__box:checked + .dsh-bloom-telemetry__box-ui::after { background: HighlightText; }
  .dsh-bloom-dot { forced-color-adjust: none; }
  html :focus-visible { outline-color: Highlight !important; }
}
html[data-input-modality="pointer"] body :focus-visible:not(:read-write) {
  --dsw-focus-ring-color: transparent !important;
}
@media (pointer: coarse) {
  .dsh-bloom-option, .dsh-bloom-appearance__btn, .dsh-bloom-dsh-btn,
  .dsh-bloom-foot__link, .dsh-bloom-rotation__select { min-height: 44px; }
}
body[data-bloom-variant] {
  accent-color: var(--bloom-accent);
  --dsh-scrollbar-thumb: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 70%);
  --dsh-scrollbar-thumb-hover: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 45%);
}
.dsh-bloom-menu { overscroll-behavior: contain; }
@media print {
  ${ROOT_ALL} { --bloom-ambience: none; --bloom-fog-glaze: none; --bloom-fog-mask: none; background: none !important; }
  html ${DECOR.join(",\n  html ")} { display: none !important; }
  ${scope(ROOT, SURFACES)} { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
  html .dsh-bloom-trigger, html .dsh-bloom-menu { display: none !important; }
}
`;

  // src/css/surfaces.ts
  var ROOT2 = "html body[data-bloom-variant]:is([data-bloom-glass],:not([data-bloom-glass])):is([data-ds-dark-theme],:not([data-ds-dark-theme]))";
  var HOSTS = [
    '[class*="_sidebarCol"]',
    'header[class*="_header"]',
    'div[class*="_composer"] div[class*="_card"]',
    '[class*="_composerSeat"] [class*="_dock"] > [class*="_bar"]'
  ];
  var scope2 = (suffix = "") => HOSTS.map((selector) => `${ROOT2} ${selector}${suffix}`).join(",\n");
  var grain2 = (light) => {
    const color = light ? "0" : "1";
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 ' + color + " 0 0 0 0 " + color + " 0 0 0 0 " + color + ' 0 0 0 .05 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  };
  var SURFACES_CSS = `
${ROOT2} {
  --bloom-surface-filter: blur(3px) url("#dsh-bloom-liquid-lens") saturate(1.2);
  --bloom-surface-fill: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 25%, transparent);
  --bloom-surface-edge: inset 0 0 0 1px color-mix(in oklch, var(--dsw-alias-label-primary, #222) 12%, transparent);
  --bloom-surface-image: radial-gradient(120% 85% at 12% -28%, rgba(255,255,255,.28), transparent 65%), linear-gradient(150deg, rgba(255,255,255,.10), transparent 32%, transparent 75%, rgba(255,255,255,.06));
}
${ROOT2}[data-ds-dark-theme] {
  --bloom-surface-image: radial-gradient(120% 85% at 12% -28%, rgba(255,255,255,.16), transparent 65%), linear-gradient(150deg, rgba(255,255,255,.06), transparent 32%, transparent 75%, rgba(255,255,255,.04));
}
${ROOT2}[data-bloom-glass="frosted"] {
  --bloom-surface-filter: blur(24px) saturate(1.15);
  --bloom-surface-fill: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 58%, transparent);
  --bloom-surface-edge: inset 0 0 0 1px color-mix(in oklch, var(--dsw-alias-label-primary, #222) 16%, transparent);
  --bloom-surface-image: none;
}
${ROOT2}[data-bloom-glass="matte"] {
  --bloom-surface-filter: blur(12px) saturate(1.02);
  --bloom-surface-fill: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 48%, transparent);
  --bloom-surface-edge: inset 0 0 0 1px color-mix(in oklch, var(--dsw-alias-label-primary, #222) 8%, transparent);
  --bloom-surface-image: ${grain2(true)};
}
${ROOT2}[data-bloom-glass="matte"][data-ds-dark-theme] { --bloom-surface-image: ${grain2(false)}; }
${scope2()} {
  position: relative;
  z-index: 0;
  background: transparent;
  background-image: none;
  border-color: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
${scope2("::before")} {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border: 0;
  border-radius: inherit;
  background-color: var(--bloom-surface-fill);
  background-image: var(--bloom-surface-image);
  box-shadow: var(--bloom-surface-edge);
  backdrop-filter: var(--bloom-surface-filter);
  -webkit-backdrop-filter: var(--bloom-surface-filter);
}
${scope2(":hover")},
${scope2(":focus-within")} { border-color: transparent; box-shadow: none; }
${ROOT2} div[class*="_bubble"] { backdrop-filter: none; -webkit-backdrop-filter: none; }
/* [LES-36] */
${scope2()} {
  background-color: transparent;
  background-image: none;
}
${ROOT2} [class*="_sidebarCol"],
${ROOT2} [class*="_composerSeat"] {
  border-right-color: transparent;
  border-left-color: transparent;
}
/* [LES-36] */
html body[data-bloom-variant][data-ds-dark-theme] [class*="_frame"]:not([data-sidebar-drawer]) [class*="_sidebarCol"] {
  background: transparent;
}
@media (prefers-reduced-transparency: reduce) {
  ${ROOT2}:not([data-bloom-glass]) {
    --bloom-surface-filter: none;
    --bloom-surface-fill: var(--dsw-alias-bg-layer-1, #fff);
    --bloom-surface-image: none;
  }
}
@media (prefers-contrast: more), (forced-colors: active), print {
  ${ROOT2}:is([data-bloom-glass],:not([data-bloom-glass])):is([data-ds-dark-theme],:not([data-ds-dark-theme])) {
    --bloom-surface-filter: none;
    --bloom-surface-fill: var(--dsw-alias-bg-layer-1, #fff);
    --bloom-surface-image: none;
  }
}
`;

  // src/dom.ts
  var THINK_OPEN = "<think>";
  var THINK_CLOSE = "</think>";
  function markThinkTags() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const tags = [];
    let n;
    while (n = walker.nextNode()) {
      const t = (n.nodeValue || "").trim();
      if (t !== THINK_OPEN && t !== THINK_CLOSE) continue;
      const el = n.parentElement;
      if (!el || el.dataset.bloomThink) continue;
      el.dataset.bloomThink = t === THINK_OPEN ? "open" : "close";
      tags.push(el);
    }
    if (!tags.length) return;
    for (const el of tags) {
      if (el.dataset.bloomThink !== "open") continue;
      for (let sib = el.nextElementSibling; sib; sib = sib.nextElementSibling) {
        if (sib.dataset.bloomThink === "close") break;
        if (sib.dataset.bloomThink === "open") break;
        sib.dataset.bloomThinkBody = "true";
      }
    }
  }
  function watchThinkTags() {
    if (window.__dshBloomThinkObserver__) return;
    let timer2;
    let disposed = false;
    const schedule2 = () => {
      if (disposed) return;
      if (timer2) return;
      timer2 = setTimeout(() => {
        timer2 = void 0;
        if (!disposed) {
          markThinkTags();
          markLiveTurn();
        }
      }, 300);
    };
    const obs = new MutationObserver(schedule2);
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.__dshBloomThinkObserver__ = obs;
    window.__dshBloomThinkOff__ = () => {
      disposed = true;
      obs.disconnect();
      if (timer2 !== void 0) clearTimeout(timer2);
      if (liveTurnTimer !== void 0) clearTimeout(liveTurnTimer);
      liveTurnTimer = void 0;
      lastRowText = /* @__PURE__ */ new WeakMap();
      window.__dshBloomThinkObserver__ = void 0;
      window.__dshBloomThinkOff__ = void 0;
    };
    markThinkTags();
    markLiveTurn();
  }
  var LIVE_TURN_ATTR = "data-bloom-live-turn";
  var lastRowText = /* @__PURE__ */ new WeakMap();
  var liveTurnTimer;
  function markLiveTurn() {
    const rows = document.querySelectorAll("[data-turn-process]");
    if (!rows.length) return;
    const row = rows[rows.length - 1];
    const label = row.querySelector('[class*="_label"]') || row;
    const text = (label.textContent || "").trim();
    if (!text) return;
    const prev = lastRowText.get(row);
    lastRowText.set(row, text);
    if (prev === void 0 || text === prev) return;
    row.setAttribute(LIVE_TURN_ATTR, "");
    if (liveTurnTimer) clearTimeout(liveTurnTimer);
    liveTurnTimer = setTimeout(() => {
      if (lastRowText.get(row) === text) row.removeAttribute(LIVE_TURN_ATTR);
    }, 2500);
  }
  function readVariant() {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      return VARIANTS.includes(v) ? v : "mist";
    } catch {
      return "mist";
    }
  }
  function injectCSS(css, idSuffix) {
    const tagId = PLUGIN_ID + "/" + idSuffix;
    if (document.querySelector('style[data-plugin-css="' + tagId + '"]')) return;
    const tag = document.createElement("style");
    tag.dataset.plugin = PLUGIN_ID;
    tag.dataset.pluginCss = tagId;
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // src/appearance.ts
  var LEGACY_MODE_KEY = "bloom-appearance-mode";
  var hostTheme = null;
  function bindHostTheme(service) {
    hostTheme = service ?? null;
    return () => {
      if (hostTheme === service) hostTheme = null;
    };
  }
  function hasHostTheme() {
    return !!(hostTheme && typeof hostTheme.setTheme === "function");
  }
  var legacyOwnsScheme = false;
  function hostBootOwnsScheme() {
    return !!document.documentElement.dataset.dsThemeSource;
  }
  function applyModeLegacy(mode) {
    legacyOwnsScheme = true;
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.toggleAttribute("data-ds-dark-theme", prefersDark);
    } else {
      document.body.toggleAttribute("data-ds-dark-theme", mode === "dark");
    }
  }
  function readLegacyMode() {
    try {
      const stored = localStorage.getItem(LEGACY_MODE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") return stored;
    } catch {
    }
    return "system";
  }
  function readStoredMode() {
    if (hasHostTheme()) {
      try {
        const pref = hostTheme?.getTheme?.()?.preference;
        if (pref === "light" || pref === "dark" || pref === "system") return pref;
      } catch {
      }
      return "system";
    }
    return readLegacyMode();
  }
  function setMode(mode) {
    if (hasHostTheme()) {
      try {
        hostTheme?.setTheme?.(mode);
        return;
      } catch {
      }
    }
    applyModeLegacy(mode);
    try {
      localStorage.setItem(LEGACY_MODE_KEY, mode);
    } catch {
    }
  }
  var legacyMq = null;
  var legacyMqHandler = null;
  function clearAppearanceSync() {
    if (legacyMq && legacyMqHandler) {
      legacyMq.removeEventListener("change", legacyMqHandler);
      legacyMq = null;
      legacyMqHandler = null;
    }
  }
  function initAppearanceSync() {
    if (hasHostTheme()) {
      clearAppearanceSync();
      syncHostScheme();
      return;
    }
    clearAppearanceSync();
    if (hostBootOwnsScheme()) return;
    applyModeLegacy(readLegacyMode());
    legacyMq = window.matchMedia("(prefers-color-scheme: dark)");
    legacyMqHandler = () => {
      if (readLegacyMode() === "system") applyModeLegacy("system");
    };
    legacyMq.addEventListener("change", legacyMqHandler);
  }
  function syncHostScheme() {
    try {
      const snapshot = hostTheme?.getTheme?.();
      const scheme = snapshot?.active?.colorScheme;
      if (scheme === "dark" && !document.body.hasAttribute("data-ds-dark-theme")) {
        document.body.setAttribute("data-ds-dark-theme", "");
      } else if (scheme === "light" && legacyOwnsScheme) {
        document.body.removeAttribute("data-ds-dark-theme");
      }
      if (scheme === "dark" || scheme === "light") legacyOwnsScheme = false;
    } catch {
    }
  }
  function currentIsDark() {
    if (hasHostTheme()) {
      try {
        const scheme = hostTheme?.getTheme?.()?.active?.colorScheme;
        if (scheme === "dark" || scheme === "light") return scheme === "dark";
      } catch {
      }
    }
    return document.body.hasAttribute("data-ds-dark-theme");
  }
  function hasThemeSupport() {
    return hasHostTheme();
  }

  // src/ambience.ts
  var AMBIENCE_PRESETS = {
    dark: ["corner", "diagonal", "galaxy", "off"],
    light: ["stream", "wash", "clear", "off"]
  };
  var DEFAULTS = { dark: "corner", light: "stream" };
  var SCHEMES = ["dark", "light"];
  var memory = {};
  var AMBIENCE_ATTRS = {
    dark: "data-bloom-ambience-dark",
    light: "data-bloom-ambience-light"
  };
  var storageKey = (scheme) => `${STORAGE_KEY}-ambience-${scheme}`;
  function isPreset(scheme, value) {
    return value !== null && AMBIENCE_PRESETS[scheme].includes(value);
  }
  function readAmbience(scheme) {
    let saved = null;
    let readable = true;
    try {
      saved = localStorage.getItem(storageKey(scheme));
    } catch {
      readable = false;
    }
    const cached2 = memory[scheme];
    if (cached2?.pending && cached2.baseline !== void 0 && cached2.baseline === saved) return cached2.value;
    if (!readable && cached2?.value) return cached2.value;
    const value = isPreset(scheme, saved) ? saved : DEFAULTS[scheme];
    memory[scheme] = { value, pending: false, baseline: void 0 };
    return value;
  }
  function apply(scheme, preset) {
    document.body?.setAttribute(AMBIENCE_ATTRS[scheme], preset);
  }
  function writeAmbience(scheme, preset) {
    if (!isPreset(scheme, preset)) return false;
    let baseline;
    try {
      baseline = localStorage.getItem(storageKey(scheme));
    } catch {
    }
    try {
      localStorage.setItem(storageKey(scheme), preset);
      memory[scheme] = { value: preset, pending: false, baseline: void 0 };
    } catch {
      memory[scheme] = { value: preset, pending: true, baseline };
    }
    apply(scheme, preset);
    return true;
  }
  function initAmbience() {
    for (const scheme of SCHEMES) apply(scheme, readAmbience(scheme));
  }

  // src/glass.ts
  var KEY = `${STORAGE_KEY}-glass-mode`;
  var cached;
  var needsMigration = false;
  function normalizeGlassMode(value) {
    switch (value) {
      case "frosted":
      case "matte":
      case "liquid":
        return value;
      case "glass":
        return "liquid";
      case "soft":
        return "matte";
      case "solid":
        return "frosted";
      default:
        return "auto";
    }
  }
  function readGlassMode() {
    if (cached !== void 0) return cached;
    let value = null;
    try {
      value = localStorage.getItem(KEY);
    } catch {
    }
    cached = normalizeGlassMode(value);
    needsMigration = value === "glass" || value === "soft" || value === "solid";
    return cached;
  }
  function writeGlassMode(mode) {
    cached = normalizeGlassMode(mode);
    needsMigration = false;
    try {
      localStorage.setItem(KEY, cached);
    } catch {
    }
    applyGlassMode();
  }
  function applyGlassMode() {
    const mode = readGlassMode();
    if (mode === "auto") {
      document.body.removeAttribute("data-bloom-glass");
    } else {
      document.body.setAttribute("data-bloom-glass", mode);
    }
  }
  function matchesMedia(query) {
    try {
      return window.matchMedia(query).matches;
    } catch {
      return false;
    }
  }
  function effectiveGlassMode() {
    if (matchesMedia("(forced-colors: active)") || matchesMedia("(prefers-contrast: more)")) return "solid";
    const mode = readGlassMode();
    if (mode !== "auto") return mode;
    if (systemPrefersReducedTransparency()) return "solid";
    return "liquid";
  }
  function systemPrefersReducedTransparency() {
    return matchesMedia("(prefers-reduced-transparency: reduce)");
  }
  function initGlassMode() {
    const mode = readGlassMode();
    if (needsMigration) {
      try {
        localStorage.setItem(KEY, mode);
        needsMigration = false;
      } catch {
      }
    }
    applyGlassMode();
    let mq = null;
    try {
      mq = window.matchMedia("(prefers-reduced-transparency: reduce)");
    } catch {
    }
    if (!mq) return () => {
    };
    const onChange = () => {
      if (readGlassMode() === "auto") applyGlassMode();
    };
    mq.addEventListener("change", onChange);
    return () => mq?.removeEventListener("change", onChange);
  }

  // src/rotation.ts
  var KEY2 = `${STORAGE_KEY}-rotation-minutes`;
  var ROTATION_MINUTES = [0, 5, 15, 30, 60];
  var timer;
  var started = false;
  var applyNext;
  var selectedMinutes;
  function readRotationMinutes() {
    if (selectedMinutes !== void 0) return selectedMinutes;
    try {
      const value = Number(window.localStorage.getItem(KEY2));
      selectedMinutes = ROTATION_MINUTES.includes(value) ? value : 0;
    } catch {
      selectedMinutes = 0;
    }
    return selectedMinutes;
  }
  function schedule() {
    if (timer) clearTimeout(timer);
    timer = void 0;
    const minutes = readRotationMinutes();
    if (!minutes || document.hidden || !applyNext) return;
    timer = setTimeout(() => {
      timer = void 0;
      const current = document.body.dataset.bloomVariant || readVariant();
      const choices = FEATURED_VARIANTS.filter((v) => v !== current);
      if (choices.length) applyNext?.(choices[Math.floor(Math.random() * choices.length)]);
      else schedule();
    }, minutes * 6e4);
  }
  function startRotation(apply2) {
    applyNext = apply2;
    if (!started) {
      document.addEventListener("visibilitychange", schedule);
      started = true;
      schedule();
    }
  }
  function setRotationMinutes(minutes) {
    if (!ROTATION_MINUTES.includes(minutes)) return;
    selectedMinutes = minutes;
    try {
      window.localStorage.setItem(KEY2, String(minutes));
    } catch {
    }
    schedule();
  }
  function stopRotation() {
    if (timer) clearTimeout(timer);
    timer = void 0;
    if (started) document.removeEventListener("visibilitychange", schedule);
    started = false;
    applyNext = void 0;
    selectedMinutes = void 0;
  }
  function resetRotationTimer() {
    if (started) schedule();
  }

  // src/lang-dicts.ts
  var DICT_EN = {
    "我在用 Bloom：诗意配色与玻璃质感，欢迎试试，也欢迎到仓库点个 Star。": "I use Bloom for its poetic palettes and glass surfaces. Try it, and give the project a star if you like it.",
    "请帮我安装并启用 DeepSeek Harness 的 Bloom 主题（dsh-bloom-theme）。": "Please install and enable the Bloom theme (dsh-bloom-theme) for DeepSeek Harness.",
    "请先使用官方 plugin_manager 的 list_bundles 查询，再用 install_bundle 安装 dsh-bloom-theme，并按返回的 application / nextStep 完成和验证。": "Use the official plugin_manager to list_bundles, install_bundle dsh-bloom-theme, then follow application / nextStep and verify it is enabled.",
    "如果使用自建 CLI profile，请先确认 profile 名称，再运行：": "For a custom CLI profile, first confirm its name, then run:",
    "填写反馈，自动附上基础诊断": "Open feedback with basic diagnostics included",
    "喜欢 Bloom？欢迎去 GitHub 点个 Star": "Enjoy Bloom? Give it a star on GitHub",
    "点个星": "Star",
    "分享 Bloom": "Share Bloom",
    "喜欢 Bloom？欢迎分享，也欢迎到仓库点个 Star。": "Enjoy Bloom? Share it or give the project a star.",
    "复制安装提示词": "Copy install prompt",
    "发给 Agent，帮你安装": "Send it to your Agent for installation",
    "截图分享": "Share a screenshot",
    "选择要展示的屏幕、窗口或标签页": "Choose a screen, window, or tab",
    "录制 5 秒": "Record 5 seconds",
    "记录动态界面，不录制声音": "Capture your interface without audio",
    "安装提示词": "Installation prompt",
    "复制诊断": "Copy diagnostics",
    "分享文件": "Share file",
    "保存文件": "Save file",
    "无法准备文件，请检查浏览器权限": "Could not prepare the file; check browser permissions",
    "文件已准备好，可分享或保存": "File ready to share or save",
    "文件已准备好，保存后即可分享": "File ready; save it to share",
    "请选择屏幕、窗口或标签页，将录制 5 秒且不录音": "Choose a screen, window, or tab for a five-second recording without audio",
    "请选择要截图的屏幕、窗口或标签页": "Choose a screen, window, or tab to capture",
    "已取消": "Cancelled",
    "取消": "Cancel",
    "未获得屏幕共享权限或已取消": "Screen sharing was denied or cancelled",
    "无法打开屏幕选择器或完成捕获，可能是宿主不支持、系统权限受限或已取消；可使用系统截图或录屏工具": "Could not open the screen picker or complete the capture. The host may not support it, system permissions may restrict it, or it may have been cancelled. You can use your system screenshot or screen recording tools.",
    "当前环境不支持直接截图或录屏": "Screen capture is not supported here",
    "请先结束当前操作": "Finish the current capture first",
    "屏幕共享已结束": "Screen sharing ended",
    "未能完成，请检查系统权限": "Could not finish; check system permissions",
    "复制失败，请手动复制": "Copy failed; please copy manually",
    "无法分享，请先保存文件": "Could not share; please save the file first",
    "打开插件管理": "Open Plugins",
    "当前宿主不支持一键更新，请在侧栏「插件」管理中查看": "This version of DSH does not support direct updates; check Plugins on the sidebar",
    "在应用内点「立即更新」即可，无需终端命令": "Click “Update now” right here — no terminal needed",
    "立即更新": "Update now",
    "更新中…": "Updating…",
    "已更新到 v{0}": "Updated to v{0}",
    "已更新到 v{0}，需要重启 DSH 才生效": "Updated to v{0} — restart DSH to apply",
    "立即重载": "Reload now",
    "稍后": "Later",
    "应用内更新失败：{0}": "In-app update failed: {0}",
    "重试": "Retry",
    "宿主未返回有效的更新结果": "DSH did not return a valid update result",
    "当前环境不支持直接更新，请在「插件」管理中更新": "Direct updates are unavailable here; update from Plugins",
    "更新已取消，当前版本保持不变": "Update cancelled; the current version is unchanged",
    "安装配置被覆盖，请在「插件」管理中检查": "Installation settings were overridden; check Plugins",
    "宿主未确认更新成功": "DSH did not confirm a successful update",
    "请在侧栏「插件」管理中检查更新；桌面端无需执行终端命令": "Check updates in Plugins on the sidebar; the desktop app does not need terminal commands",
    '    然后确认 "dsh-bloom-theme" 在该 profile 的 package.json 的 dsh.profile.bundles 里（plugin add 会自动加），重启 DSH': `    then make sure "dsh-bloom-theme" is in dsh.profile.bundles of that profile's package.json (plugin add puts it there), and restart DSH`,
    "  · 自建 CLI profile：dsh plugin --profile <你的profile名> add dsh-bloom-theme": "  · Your own CLI profile: dsh plugin --profile <profile-name> add dsh-bloom-theme",
    "    （app 独占托管 desktop profile，CLI 的 dsh plugin --profile desktop 会被拒）": "    (the app owns the desktop profile; `dsh plugin --profile desktop` is rejected)",
    "Bloom —— DSH 的中国风配色主题：{0} 套诗词命名的莫兰迪配色，深浅色自适应，顶栏一键切换。": "Bloom — a Chinese-flavoured colour theme for DSH: {0} Morandi palettes named after classical poems, light/dark aware, one click in the top bar.",
    "桌面端 app：在侧栏「插件」管理中直接更新，无需终端命令": 'Desktop app: update directly in sidebar "Plugins" manager — no terminal command needed',
    "仅自建 CLI profile 需执行此命令；桌面端无需终端命令": "Only for custom CLI profiles; desktop app needs no terminal command",
    "帮我把 DSH 升级到 {0}，执行：npm i -g @deepseek-ai/dsh@{1}": "Upgrade DSH to {0} for me — run: npm i -g @deepseek-ai/dsh@{1}",
    "仓库：https://github.com/webkubor/dsh-bloom-theme": "Repo: https://github.com/webkubor/dsh-bloom-theme",
    "  · 桌面端 app：在应用内的「插件管理」里搜 dsh-bloom-theme 直接装": "  · Desktop app: search dsh-bloom-theme in the in-app Plugin manager and install it there",
    "复制升级命令到剪贴板：npm i -g @deepseek-ai/dsh@{0}": "Copy the upgrade command: npm i -g @deepseek-ai/dsh@{0}",
    "dsh plugin --profile <你的profile名> add ": "dsh plugin --profile <profile-name> add ",
    "复制一段话，对方贴进自己的 DSH 就能装上 Bloom": "Copies a blurb — paste it into your own DSH and Bloom installs",
    "registry 无可用通道（tags: {0}）": "No usable channel in the registry (tags: {0})",
    "检查到可用版本后，把升级命令直接填进下方输入框": "Once an update is found, this drops the exact upgrade command into the box below",
    "为你喜欢的配色点赞投票，或提议新色": "Vote for a palette you like, or propose a new one",
    "检查到可用版本后复制精确升级命令": "Copies the exact upgrade command once a newer version is found",
    "Bloom 主题 · v{0}": "Bloom theme · v{0}",
    "复制失败，请手动执行：{0}": "Copy failed, run it manually: {0}",
    "Bloom 主题 · v": "Bloom theme · v",
    "Bloom 主题有新版本": "A new Bloom version is out",
    "打开 {0} 的更新面板": "Open {0}’s update panel",
    "请在 {0} 中检查更新": "Please check for updates in {0}",
    "重新检查 DSH 最新版": "Re-check for the latest DSH",
    "关闭（此版本不再提醒）": "Dismiss (no reminders for this version)",
    "Bloom 外观设置": "Bloom appearance",
    "点「检查更新」看详情": 'Click "Check updates" for details',
    "✓ 已复制：{0}": "✓ Copied: {0}",
    "报问题 / 提建议": "Report an issue / suggest something",
    "装到你的 DSH：": "Install Bloom into your DSH:",
    "{0} 管理更新": "Updates managed by {0}",
    "桌面端有可用更新": "A DSH update is available",
    "本地版本读不到": "Local version unreadable",
    "桌面端检查失败": "Update check failed",
    "点击 ↻ 检查": "press ↻ to check",
    "超时 {0}s": "Timed out after {0}s",
    "（可更新到 v": " (updatable to v",
    "✓ 已是最新": "✓ up to date",
    "可更新到 v": "update available: v",
    "复制更新命令": "Copy the upgrade command",
    "当前版本较新": "you are ahead",
    "由桌面端检查": "checked by the app",
    "↑ 可更新": "↑ update available",
    "✓ 已填入": "✓ inserted",
    "✓ 已复制": "✓ Copied",
    "版本与更新": "Version & updates",
    "↻ 检查": "↻ Check",
    "✗ 失败": "✗ failed",
    "复制失败": "Copy failed",
    "更新日志": "Changelog",
    "检查中…": "Checking…",
    "检查失败": "Check failed",
    "检查更新": "Check for updates",
    "深浅模式": "Light or dark",
    "质感": "Material",
    "毛玻璃": "Frosted glass",
    "磨砂玻璃": "Matte glass",
    "液态玻璃": "Liquid glass",
    "背景": "Background",
    "深色背景": "Dark background",
    "浅色背景": "Light background",
    "斜光流转": "Light stream",
    "水彩晕染": "Watercolor",
    "清透留白": "Clear",
    "对角漫染": "Diagonal",
    "漫天星辰": "Starry sky",
    "流星颜色": "Meteor colours",
    "纯色": "Single colour",
    "彩色": "Multicolour",
    "角落微光": "Corner",
    "不显示": "Off",
    "毛玻璃 · 柔化背景，透光不透细节": "Frosted glass · soft light, blurred detail",
    "磨砂玻璃 · 细腻颗粒，低反光": "Matte glass · fine grain, restrained reflections",
    "液态玻璃 · 清透中心，边缘折光": "Liquid glass · clear centre, refracted edges",
    "系统设置已降低透明效果；已保留你的质感选择。": "System settings reduce transparency; your material choice is preserved.",
    "界面语言": "Interface language",
    "跟随系统": "System",
    "配色投票": "Vote",
    "已复制": "Copied",
    "有新版": "new version",
    "桌面端": "the desktop app",
    "Web": "Web",
    "检查中": "checking",
    "主题": "Theme",
    "关闭": "Close",
    "分享": "Share",
    "新": "New",
    "只上报按钮点击的事件名和版本，不含对话内容": "Only button names and version — never your conversations",
    "发送匿名使用统计": "Send anonymous usage stats",
    "本版更新": "What's new",
    "反馈": "Feedback",
    "诊断": "Diagnostics",
    "复制排错诊断信息（在 GitHub 提交 Issue 时粘贴）": "Copy diagnostic report for GitHub issues",
    "可用": "available",
    "填入": "Insert",
    "外观": "Appearance",
    "当前": "current",
    "最新": "latest",
    "模式": "Mode",
    "浅色": "Light",
    "深色": "Dark",
    "语言": "Language",
    "配色": "Palette",
    "自动换色": "Auto change",
    "关闭自动换色": "Off",
    "{0} 分钟": "{0} min",
    "恢复浮窗位置": "Reset floating position",
    "无": "none",
    "）": ")"
  };

  // src/lang.ts
  var LOCALE_NS = "dsh-bloom-theme";
  var LANG_CHANGE_EVENT = "dsh-bloom-lang-change";
  var LEGACY_LANG_KEY = "dsh-bloom-lang";
  var runtime = null;
  var translate = null;
  var DICT_ZH = Object.fromEntries(
    Object.keys(DICT_EN).map((k) => [k, k])
  );
  var DICTS = {
    zh: DICT_ZH,
    en: DICT_EN
  };
  function bindLocale(locale) {
    runtime = locale;
    translate = locale.bind(LOCALE_NS);
    try {
      window.localStorage?.removeItem(LEGACY_LANG_KEY);
    } catch {
    }
    try {
      window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
    } catch {
    }
    return () => {
      if (runtime === locale) {
        runtime = null;
        translate = null;
      }
    };
  }
  function getLang() {
    const active = runtime?.getSnapshot?.().active;
    return active === "zh" ? "zh" : "en";
  }
  var skeleton = (parts) => parts.map((s, i) => i ? "{" + (i - 1) + "}" + s : s).join("");
  function tr(input, ...vals) {
    const plain = typeof input === "string";
    const key = plain ? input : skeleton(input);
    let out = key;
    if (translate) {
      out = translate(key);
    } else if (getLang() === "en") {
      out = DICT_EN[key] || key;
    }
    if (!vals.length) return out;
    let dropped = "";
    vals.forEach((v, i) => {
      const hole = "{" + i + "}";
      if (out.includes(hole)) out = out.split(hole).join(String(v));
      else dropped += (dropped ? " " : "") + String(v);
    });
    return dropped ? out + " " + dropped : out;
  }
  var variantName = (v) => {
    const l = VARIANT_LABELS[v];
    if (!l) return v;
    return getLang() === "en" ? l.en || l.zh : l.zh;
  };
  var variantPoem = (v) => {
    const l = VARIANT_LABELS[v];
    if (!l) return "";
    return getLang() === "en" ? l.poemEn || l.poem : l.poem;
  };

  // src/version.ts
  async function fillMainComposer(text) {
    const ce = document.querySelector('[contenteditable]:not([contenteditable="false"])');
    if (ce) {
      const selectAll = () => {
        const range = document.createRange();
        range.selectNodeContents(ce);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      };
      ce.focus({ preventScroll: true });
      await new Promise((r) => setTimeout(r, 0));
      selectAll();
      await new Promise((r) => setTimeout(r, 0));
      if (!document.execCommand("insertText", false, text)) {
        selectAll();
        await new Promise((r) => setTimeout(r, 0));
        const dt = new DataTransfer();
        dt.setData("text/plain", text);
        ce.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
      }
      return true;
    }
    const ta = Array.from(
      document.querySelectorAll("textarea")
    ).find((el) => el.offsetParent !== null);
    if (ta) {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      if (!setter) return false;
      setter.call(ta, text);
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      ta.focus();
      ta.setSelectionRange(text.length, text.length);
      return true;
    }
    return false;
  }
  var latestVersion = null;
  async function checkUpdate(signal) {
    try {
      const r = await fetch("https://registry.npmjs.org/dsh-bloom-theme/latest", { cache: "no-store", signal });
      if (!r.ok || signal?.aborted) return;
      const d = await r.json();
      if (signal?.aborted) return;
      latestVersion = d && d.version || null;
    } catch {
    }
    if (!signal?.aborted) refreshUpdateBadge();
  }
  var dshLatestVersion = null;
  var dshCheckError = null;
  var localizedCheckError = null;
  var desktopStatus = null;
  var desktopStatusAsked = false;
  var desktopStatusPolls = 0;
  var pendingPollTimers = /* @__PURE__ */ new Set();
  var versionUpdatesActive = true;
  var versionGeneration = 0;
  var versionRequests = /* @__PURE__ */ new Set();
  function setVersionUpdatesActive(active) {
    versionUpdatesActive = active;
    versionGeneration += 1;
    if (active) return;
    for (const timer2 of pendingPollTimers) clearTimeout(timer2);
    pendingPollTimers.clear();
    for (const controller of versionRequests) controller.abort();
    versionRequests.clear();
    desktopStatus = null;
    dshCheckPromise = null;
    desktopStatusAsked = false;
    desktopStatusPolls = 0;
  }
  var DESKTOP_STATUS_POLL_MS = 1500;
  var DESKTOP_STATUS_POLLS = 4;
  var dshCheckPromise = null;
  var DSH_CACHE_KEY = "bloom-dsh-check-v2";
  var DSH_CACHE_TTL_MS = 6 * 60 * 60 * 1e3;
  var DSH_CHECK_TIMEOUT_MS = 8 * 1e3;
  function parseSemver(value) {
    const match = String(value ?? "").trim().match(
      /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/
    );
    if (!match) return null;
    return {
      core: [Number(match[1]), Number(match[2]), Number(match[3])],
      prerelease: match[4] ? match[4].split(".") : []
    };
  }
  function isSemver(value) {
    return parseSemver(value) !== null;
  }
  function normalizeSemver(value) {
    if (!isSemver(value)) return null;
    return String(value).trim().replace(/^v/, "");
  }
  var dshVersionFromHost = null;
  var dshVersionRequest = null;
  var dshVersionAnswered = false;
  var dshPlatformFromHost = null;
  async function fetchDshVersionFromHost() {
    if (dshVersionRequest) return dshVersionRequest;
    if (dshVersionAnswered) return dshVersionFromHost;
    dshVersionRequest = (async () => {
      try {
        const res = await fetch("/api/bloom/dsh-version", { headers: { accept: "application/json" } });
        const body = await res.json();
        if (body?.platform === "desktop" || body?.platform === "web") {
          dshPlatformFromHost = body.platform;
        }
        dshVersionAnswered = true;
        if (body?.ok === true && typeof body.version === "string") {
          dshVersionFromHost = body.version;
          return dshVersionFromHost;
        }
      } catch {
      }
      return null;
    })();
    try {
      return await dshVersionRequest;
    } finally {
      dshVersionRequest = null;
    }
  }
  function readHostPlatform() {
    if (dshPlatformFromHost) return dshPlatformFromHost;
    try {
      const hostWindow = window;
      if (hostWindow.dshDesktop || hostWindow.dshDesktopBoot) return "desktop";
    } catch {
    }
    return null;
  }
  function readDshRuntimeInfo() {
    try {
      const hostWindow = window;
      const bridge = hostWindow.__DSH_LOCAL__ || {};
      const desktop = hostWindow.dshDesktop || {};
      const updates = desktop.updates;
      const boot = hostWindow.__DSH_BOOT__ || {};
      const dataVersion = document.documentElement?.dataset?.dshRuntimeVersion;
      const currentVersion = [dshVersionFromHost, bridge.runtimeVersion, dataVersion, boot.version, boot.rev].map(normalizeSemver).find(Boolean) || null;
      const buildRev = typeof boot.rev === "string" && /^[0-9a-f]{7,40}$/i.test(boot.rev) ? boot.rev.slice(0, 7) : null;
      const hasDesktopUpdater = typeof updates?.open === "function";
      const updateManagedBy = typeof bridge.updateManagedBy === "string" && bridge.updateManagedBy.trim() ? bridge.updateManagedBy.trim() : hasDesktopUpdater ? tr("桌面端") : null;
      return {
        currentVersion,
        buildRev,
        updateManagedBy,
        updateMode: typeof bridge.updateMode === "string" ? bridge.updateMode : null,
        requestUpdateCheck: typeof bridge.requestUpdateCheck === "function" ? bridge.requestUpdateCheck.bind(bridge) : hasDesktopUpdater ? () => {
          void updates?.open?.();
        } : null
      };
    } catch {
      return {
        currentVersion: null,
        buildRev: null,
        updateManagedBy: null,
        updateMode: null,
        requestUpdateCheck: null
      };
    }
  }
  async function readDesktopUpdateStatus() {
    try {
      const desktop = window.dshDesktop;
      const status = desktop?.updates?.status;
      if (typeof status !== "function") return null;
      const raw = await status();
      const phase = typeof raw?.phase === "string" ? raw.phase : "";
      if (phase !== "available" && phase !== "error") return null;
      return { phase, version: typeof raw?.version === "string" ? raw.version : null };
    } catch {
      return null;
    }
  }
  function selectDshDistTag(distTags, currentVersion) {
    const parsed = parseSemver(currentVersion);
    const prereleaseChannel = parsed?.prerelease[0];
    if (prereleaseChannel && typeof distTags[prereleaseChannel] === "string") return prereleaseChannel;
    if (prereleaseChannel && typeof distTags.next === "string") return "next";
    return typeof distTags.latest === "string" ? "latest" : null;
  }
  async function checkDshLatest(force = false) {
    if (!versionUpdatesActive) return;
    const generation = versionGeneration;
    const runtime2 = readDshRuntimeInfo();
    if (runtime2.updateManagedBy) {
      dshLatestVersion = null;
      renderDshUpdate();
      return;
    }
    if (!force) {
      try {
        const raw = sessionStorage.getItem(DSH_CACHE_KEY);
        if (raw) {
          const cached2 = JSON.parse(raw);
          if (cached2?.at && Date.now() - cached2.at < DSH_CACHE_TTL_MS && cached2.latest && cached2.currentVersion === runtime2.currentVersion) {
            dshLatestVersion = cached2.latest;
            renderDshUpdate();
            return;
          }
        }
      } catch {
      }
    }
    if (dshCheckPromise) return dshCheckPromise;
    let promise = null;
    promise = (async () => {
      dshCheckError = null;
      localizedCheckError = null;
      const controller = new AbortController();
      versionRequests.add(controller);
      const timer2 = setTimeout(() => controller.abort(), DSH_CHECK_TIMEOUT_MS);
      try {
        const r = await fetch(
          // ⚠️ 不能用 registry 的 /-/package/<pkg>/dist-tags 端点：它**不带 CORS 头**，
          // 浏览器里直接 `Failed to fetch`（2026-09-10 在 DSH 页面实测；同域下
          // /<pkg>/latest 与 /<pkg> 都正常）。
          // 改用简版 packument：同一条能过 CORS 的路径，加 install-v1 的 Accept
          // 头把响应从 119KB 压到 94KB，dist-tags 就在里面。
          "https://registry.npmjs.org/@deepseek-ai/dsh",
          { cache: "no-store", signal: controller.signal, headers: { Accept: "application/vnd.npm.install-v1+json" } }
        );
        if (r.ok) {
          const packument = await r.json();
          if (!versionUpdatesActive || generation !== versionGeneration) return;
          const distTags = packument && packument["dist-tags"] || {};
          const tag = selectDshDistTag(distTags, runtime2.currentVersion);
          const selected = tag ? distTags?.[tag] : null;
          dshLatestVersion = typeof selected === "string" ? selected : null;
          if (dshLatestVersion === null) {
            const tags = Object.keys(distTags).join(",");
            localizedCheckError = () => tr`registry 无可用通道（tags: ${tags || tr("无")}）`;
            dshCheckError = localizedCheckError();
          }
          try {
            sessionStorage.setItem(DSH_CACHE_KEY, JSON.stringify({
              at: Date.now(),
              latest: dshLatestVersion,
              currentVersion: runtime2.currentVersion,
              tag
            }));
          } catch {
          }
        } else {
          if (!versionUpdatesActive || generation !== versionGeneration) return;
          dshLatestVersion = null;
          dshCheckError = `HTTP ${r.status} ${r.statusText}`.trim();
        }
      } catch (err) {
        if (!versionUpdatesActive || generation !== versionGeneration) return;
        dshLatestVersion = null;
        if (err instanceof Error && err.name === "AbortError") {
          localizedCheckError = () => tr`超时 ${DSH_CHECK_TIMEOUT_MS / 1e3}s`;
        }
        dshCheckError = err instanceof Error ? localizedCheckError ? localizedCheckError() : `${err.name}: ${err.message}` : String(err);
      } finally {
        clearTimeout(timer2);
        versionRequests.delete(controller);
        queueMicrotask(() => {
          if (dshCheckPromise === promise) {
            dshCheckPromise = null;
          }
        });
      }
      if (!versionUpdatesActive || generation !== versionGeneration) return;
      renderDshUpdate();
    })();
    dshCheckPromise = promise;
    return dshCheckPromise;
  }
  function renderDshUpdate() {
    if (!versionUpdatesActive) return;
    const generation = versionGeneration;
    const root = document.querySelector(".dsh-bloom-dsh-update");
    const curEl = document.querySelector("[data-dsh-current]");
    const latEl = document.querySelector("[data-dsh-latest]");
    const stEl = document.querySelector("[data-dsh-state]");
    const hintEl = document.querySelector("[data-dsh-hint]");
    const platEl = document.querySelector("[data-dsh-platform]");
    if (!root || !curEl || !latEl || !stEl || !hintEl) return;
    const runtime2 = readDshRuntimeInfo();
    const cur = runtime2.currentVersion || runtime2.buildRev || "?";
    curEl.textContent = cur;
    if (!dshVersionAnswered) {
      void fetchDshVersionFromHost().then((v) => {
        if (v || dshPlatformFromHost) renderDshUpdate();
      });
    }
    if (platEl) {
      const platform = readHostPlatform();
      if (platform) {
        platEl.hidden = false;
        platEl.textContent = platform === "desktop" ? tr("桌面端") : tr("Web");
        platEl.dataset.platform = platform;
      } else {
        platEl.hidden = true;
      }
    }
    const btnRefresh = document.querySelector('[data-act="refresh"]');
    const btnCopy = document.querySelector('[data-act="copy"]');
    if (runtime2.updateManagedBy) {
      root.dataset.updateManagedBy = runtime2.updateManagedBy;
      if (!desktopStatusAsked) {
        desktopStatusAsked = true;
        void readDesktopUpdateStatus().then((s) => {
          if (!versionUpdatesActive || generation !== versionGeneration) return;
          if (s) {
            desktopStatus = s;
            for (const timer2 of pendingPollTimers) clearTimeout(timer2);
            pendingPollTimers.clear();
            renderDshUpdate();
          } else {
            desktopStatusAsked = false;
          }
        });
      }
      if (desktopStatus === null && pendingPollTimers.size === 0 && desktopStatusPolls < DESKTOP_STATUS_POLLS) {
        const timer2 = setTimeout(() => {
          pendingPollTimers.delete(timer2);
          desktopStatusPolls += 1;
          desktopStatusAsked = false;
          renderDshUpdate();
        }, DESKTOP_STATUS_POLL_MS);
        pendingPollTimers.add(timer2);
      }
      if (desktopStatus?.phase === "available") {
        latEl.textContent = desktopStatus.version || tr("有新版");
        stEl.textContent = tr("桌面端有可用更新");
        stEl.setAttribute("data-state", "update");
      } else if (desktopStatus?.phase === "error") {
        latEl.textContent = tr("桌面端检查失败");
        stEl.textContent = tr("点「检查更新」看详情");
        stEl.setAttribute("data-state", "err");
      } else {
        latEl.textContent = tr("由桌面端检查");
        stEl.textContent = tr`${runtime2.updateManagedBy} 管理更新`;
        stEl.setAttribute("data-state", "managed");
      }
      hintEl.hidden = true;
      hintEl.textContent = "";
      if (btnRefresh) {
        btnRefresh.hidden = false;
        btnRefresh.disabled = runtime2.requestUpdateCheck == null;
        btnRefresh.textContent = tr("检查更新");
        btnRefresh.title = runtime2.requestUpdateCheck ? tr`打开 ${runtime2.updateManagedBy} 的更新面板` : tr`请在 ${runtime2.updateManagedBy} 中检查更新`;
      }
      if (btnCopy) {
        btnCopy.hidden = true;
        btnCopy.disabled = true;
      }
    } else {
      delete root.dataset.updateManagedBy;
      if (btnRefresh) {
        btnRefresh.hidden = false;
        btnRefresh.disabled = false;
        btnRefresh.textContent = tr("↻ 检查");
        btnRefresh.title = tr("重新检查 DSH 最新版");
      }
      if (btnCopy) {
        btnCopy.hidden = false;
        btnCopy.disabled = dshLatestVersion == null;
        btnCopy.title = dshLatestVersion ? tr`复制升级命令到剪贴板：npm i -g @deepseek-ai/dsh@${dshLatestVersion}` : tr("检查到可用版本后复制精确升级命令");
      }
      if (dshLatestVersion == null) {
        const error = localizedCheckError?.() || dshCheckError;
        if (error) {
          latEl.textContent = tr("检查失败");
          stEl.textContent = error.length > 22 ? `${error.slice(0, 22)}…` : error;
          stEl.title = error;
          stEl.setAttribute("data-state", "err");
        } else {
          latEl.textContent = tr("点击 ↻ 检查");
          stEl.removeAttribute("data-state");
          stEl.removeAttribute("title");
          stEl.textContent = "";
        }
      } else if (!runtime2.currentVersion) {
        latEl.textContent = dshLatestVersion;
        stEl.textContent = tr("本地版本读不到");
        stEl.setAttribute("data-state", "warn");
      } else {
        stEl.removeAttribute("title");
        latEl.textContent = dshLatestVersion;
        const comparison = cmpVersion(dshLatestVersion, runtime2.currentVersion);
        if (comparison > 0) {
          stEl.textContent = tr("↑ 可更新");
          stEl.setAttribute("data-state", "update");
        } else if (comparison < 0) {
          stEl.textContent = tr("当前版本较新");
          stEl.setAttribute("data-state", "ahead");
        } else {
          stEl.textContent = tr("✓ 已是最新");
          stEl.setAttribute("data-state", "latest");
        }
      }
      hintEl.hidden = true;
      hintEl.textContent = "";
    }
    if (btnRefresh && !btnRefresh.dataset.bloomBound) {
      btnRefresh.dataset.bloomBound = "1";
      btnRefresh.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const label = btnRefresh.textContent;
        btnRefresh.textContent = tr("检查中");
        btnRefresh.disabled = true;
        stEl.textContent = tr("检查中…");
        stEl.removeAttribute("data-state");
        const liveRuntime = readDshRuntimeInfo();
        if (liveRuntime.updateManagedBy) {
          liveRuntime.requestUpdateCheck?.();
          btnRefresh.disabled = liveRuntime.requestUpdateCheck == null;
          btnRefresh.textContent = tr("检查更新");
          for (const timer2 of pendingPollTimers) clearTimeout(timer2);
          pendingPollTimers.clear();
          desktopStatus = null;
          desktopStatusAsked = false;
          desktopStatusPolls = 0;
          renderDshUpdate();
          return;
        }
        try {
          await checkDshLatest(true);
        } finally {
          dshVersionAnswered = false;
          void fetchDshVersionFromHost().then((v) => {
            if (v || dshPlatformFromHost) renderDshUpdate();
          });
          btnRefresh.disabled = false;
          btnRefresh.textContent = label;
        }
      });
    }
    if (btnCopy && !btnCopy.dataset.bloomBound) {
      btnCopy.dataset.bloomBound = "1";
      btnCopy.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const liveRuntime = readDshRuntimeInfo();
        if (liveRuntime.updateManagedBy) {
          liveRuntime.requestUpdateCheck?.();
          return;
        }
        if (!dshLatestVersion) return;
        const cmd = tr`帮我把 DSH 升级到 ${dshLatestVersion}，执行：npm i -g @deepseek-ai/dsh@${dshLatestVersion}`;
        let ok = await fillMainComposer(cmd);
        if (!ok) {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(cmd);
              ok = true;
            }
          } catch {
          }
          if (!ok) {
            const ta = document.createElement("textarea");
            ta.value = cmd;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try {
              ok = document.execCommand("copy");
            } catch {
            }
            ta.remove();
          }
        }
        const label = btnCopy.dataset.bloomLabel || btnCopy.textContent;
        btnCopy.dataset.bloomLabel = label;
        btnCopy.textContent = ok ? tr("✓ 已填入") : tr("✗ 失败");
        btnCopy.classList.add(ok ? "is-done" : "is-fail");
        clearTimeout(+(btnCopy.dataset.bloomTimer || 0));
        const t = setTimeout(() => {
          btnCopy.textContent = label;
          btnCopy.classList.remove("is-done", "is-fail");
          hintEl.hidden = true;
        }, 1800);
        btnCopy.dataset.bloomTimer = String(t);
        hintEl.hidden = false;
        hintEl.textContent = ok ? tr`✓ 已复制：${cmd}` : tr`复制失败，请手动执行：${cmd}`;
      });
    }
  }
  function cmpVersion(a, b) {
    const pa = parseSemver(a);
    const pb = parseSemver(b);
    if (!pa || !pb) return 0;
    for (let i = 0; i < 3; i++) {
      const na = pa.core[i], nb = pb.core[i];
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    if (pa.prerelease.length === 0 && pb.prerelease.length === 0) return 0;
    if (pa.prerelease.length === 0) return 1;
    if (pb.prerelease.length === 0) return -1;
    const length = Math.max(pa.prerelease.length, pb.prerelease.length);
    for (let i = 0; i < length; i++) {
      const left = pa.prerelease[i];
      const right = pb.prerelease[i];
      if (left == null) return -1;
      if (right == null) return 1;
      if (left === right) continue;
      const leftNumeric = /^\d+$/.test(left);
      const rightNumeric = /^\d+$/.test(right);
      if (leftNumeric && rightNumeric) return Number(left) > Number(right) ? 1 : -1;
      if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
      return left > right ? 1 : -1;
    }
    return 0;
  }
  function refreshUpdateBadge() {
    if (!latestVersion || cmpVersion(latestVersion, PLUGIN_VERSION) <= 0) return;
    const el = document.querySelector(".dsh-bloom-version__update");
    if (!el) return;
    el.hidden = false;
    el.setAttribute("title", tr("可更新到 v") + latestVersion);
    el.textContent = "↑ v" + latestVersion;
    const root = document.querySelector(".dsh-bloom-switcher");
    if (root) root.dataset.bloomUpdate = latestVersion;
    const trigger = document.querySelector(".dsh-bloom-trigger");
    if (trigger) trigger.title = tr("Bloom 主题 · v") + PLUGIN_VERSION + tr("（可更新到 v") + latestVersion + tr("）");
  }

  // src/css/switcher.ts
  var SWITCHER_CSS = `
/* Move only the empty Slot anchor into the host's existing leading clearance. */
.dsh-bloom-slot { display: inline-block; flex: none; transform: translateX(max(0px, calc(var(--dsh-frame-leading-clearance, 0px) - 20px))); }
.dsh-bloom-slot:dir(rtl) { transform: translateX(calc(-1 * max(0px, calc(var(--dsh-frame-leading-clearance, 0px) - 20px)))); }
.dsh-bloom-overlay { pointer-events: none; }
.dsh-bloom-overlay #dsh-bloom-update-banner { pointer-events: auto; }
.dsh-bloom-switcher[data-slotted="true"] { --bloom-menu-max-h: calc(100vh - 80px); position: fixed; pointer-events: auto; z-index: 80; }
.dsh-bloom-switcher[data-slotted="true"] .dsh-bloom-menu { left: 0; right: auto; max-width: calc(100vw - 96px); max-height: var(--bloom-menu-max-h, calc(100vh - 80px)); overflow-y: auto; overscroll-behavior: contain; }
.dsh-bloom-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  font: 12px/1.2 -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
  /* The macOS/Windows frameless header must let its own controls receive clicks. */
  -webkit-app-region: no-drag;
}
.dsh-bloom-switcher * { -webkit-app-region: no-drag; }

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
  width: 14px; height: 14px;
  border-radius: 999px;
  flex: none;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
}
/* 色点是这身皮肤的「配色样本」，不能只是一块平涂 —— 它是用户判断「这个配色长什么样」
   的唯一依据。给它玻璃质感：顶部一道内高光（球面反光）+ 底部柔光晕（离开发光面）。
   跟整套皮肤的玻璃语言一致，而不是十个平涂小方块。
 *
 * ⚠️ 不要在这里用 color-mix 配 var(--bloom-morandi)：
 * --bloom-morandi 存的是 RGB 三元组（"146, 168, 179"，供 rgba(var(...)) 用），
 * 不是色值 —— 塞进 oklch 语法非法，**整条 box-shadow 一起失效**（computed 变 none）。
 * 实测踩过：规则命中、优先级也对，但画面上一点影子都没有。
 * （--bloom-accent 才是色值，可以用 color-mix。） */
.dsh-bloom-option .dsh-bloom-dot {
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.38),
    inset 0 -1px 1px rgba(0, 0, 0, 0.14),
    0 0 0 1px rgba(146, 168, 179, 0.22),
    0 1px 4px rgba(0, 0, 0, 0.22);
  transition: box-shadow var(--bloom-dur-fast, 130ms) var(--bloom-ease, cubic-bezier(0.2,0.8,0.2,1));
}
.dsh-bloom-option:hover .dsh-bloom-dot,
.dsh-bloom-option[data-active="true"] .dsh-bloom-dot {
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.45),
    inset 0 -1px 1px rgba(0, 0, 0, 0.14),
    0 0 0 1px rgba(146, 168, 179, 0.38),
    0 2px 7px rgba(0, 0, 0, 0.28);
}

/* 面板头部：标题、配色胶囊与关闭按钮 */
.dsh-bloom-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px 10px;
  /* 使用柔和微阴影替代硬边框分割，形成平滑过渡 */
  box-shadow: 0 6px 10px -8px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 78%);
}
/* 有新版时的小红点：徽标本体在「版本与更新」折叠区里，默认看不见，
   所以在触发器和那一行入口各点一个 6px 圆点。用 accent 而不是红色 ——
   这是"有更新"不是"出错了"，莫兰迪主题里一点纯红会非常突兀。 */
.dsh-bloom-switcher[data-bloom-update] .dsh-bloom-trigger::after,
.dsh-bloom-switcher[data-bloom-update] .dsh-bloom-more::after {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--bloom-accent, #6b8f71);
  box-shadow: 0 0 6px -1px var(--bloom-glow);
  flex: 0 0 auto;
}
.dsh-bloom-switcher[data-bloom-update] .dsh-bloom-trigger::after {
  margin-left: 1px;
}
.dsh-bloom-switcher[data-bloom-update] .dsh-bloom-more::after {
  margin-left: 4px;
}

.dsh-bloom-head__title { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary, #222); }
.dsh-bloom-head__current {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: auto;
  padding: 3px 10px;
  border-radius: 999px;
  /* 浅色底代替描边：一圈线在头部会和标题争视觉重量 */
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%);
  font-size: 12px;
}
.dsh-bloom-close {
  appearance: none; border: 0; background: transparent; cursor: pointer;
  color: var(--dsw-alias-label-tertiary, #999);
  font-size: 13px; line-height: 1; padding: 4px; border-radius: 6px;
}
.dsh-bloom-close:hover { background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 90%); }

/* 分组标题：「主题」「模式」—— 弱化的小标题，把长列表切成两块 */
.dsh-bloom-section {
  padding: 10px 14px 4px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-section[hidden] { display: none; }

/* 底栏：版本信息与快捷功能区保持单行布局 */
.dsh-bloom-more {
  display: inline-flex; align-items: center; gap: 5px;
  appearance: none; border: 0; background: transparent; cursor: pointer;
  padding: 0;
  font: inherit; font-size: 11px; line-height: 1;
  color: var(--dsw-alias-label-tertiary, #999);
  transition: color .15s ease;
}
.dsh-bloom-more__name { font-weight: 600; color: var(--dsw-alias-label-secondary, #777); }
.dsh-bloom-more__ver { font-variant-numeric: tabular-nums; }
.dsh-bloom-more:hover, .dsh-bloom-more:hover .dsh-bloom-more__name { color: var(--dsw-alias-label-primary, #222); }
.dsh-bloom-more:focus-visible {
  outline: 2px solid var(--bloom-accent, #6b8f71);
  outline-offset: 2px;
  border-radius: 4px;
}
.dsh-bloom-more[aria-expanded="true"] .dsh-bloom-more__arrow { transform: rotate(-90deg); }
.dsh-bloom-more__arrow { transition: transform .16s ease; }
.dsh-bloom-more-body[hidden] { display: none; }

.dsh-bloom-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  /* v0.6.0 patch: 提到 99999，确保 Bloom 下拉菜单覆盖在 DSH 原生顶栏 tabs
     （"对话 / 轨迹"，z-index 更高）之上，不被截断 */
  z-index: 99999;
  /* v0.12.x: 236 → 312。最宽的是「版本与更新」里的 DSH 检查行：
     label 28 + 版本号 63 + 状态 chip 62 + 两个按钮 92 + 5×gap 30 = 275，
     加左右 padding 28 ≈ 303 —— 236px 时 flex 把没有 nowrap 的状态 chip
     压到 min-content（1 字宽），「版本未知」被折成竖排字（owner 2026-09-14
     实拍反馈「下面怎么就变窄了」）。宽度按最宽内容实算留出余量。 */
  min-width: 312px;
  padding: 0 0 6px;
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
/* 菜单入场：从右上角 scale+fade 打开。
 *
 * ⚠️ 重播靠的是 JS 里的 playEnter()（见 switcher.ts）：先摘掉 .is-entering、
 * 读一次 offsetWidth 强制重排、再加回来。只靠 :not([hidden]) 这个选择器不行 ——
 * 同一个元素第二次显示时，animation 已经处于结束态，浏览器不会重播，
 * 表现就是「第一次打开有动画，后面几次都是硬弹出来」。 */
.dsh-bloom-menu { transform-origin: top right; }
/* 面板入场动画：12px 弹性位移与微缩放回弹 */
@keyframes bloom-menu-in {
  from { opacity: 0; transform: translateY(-12px) scale(0.96); }
  to { opacity: 1; transform: none; }
}
.dsh-bloom-menu.is-entering {
  animation: bloom-menu-in 320ms var(--bloom-ease-back, cubic-bezier(0.34,1.56,0.64,1));
}

/* 逐行错峰滑入 —— whale-widget / wallpaper-engine 那种「有产品感」的关键手法：
   不是整块一起淡入，而是条列依次落位，观感上是一次有节奏的展开而不是一次闪烁。
   纯 CSS 实现（nth-child 给延迟），不需要 rAF、不需要 JS 量高度。

   animation-fill-mode: backwards 是必须的：延迟期间元素要先停在起始态（透明），
   否则会出现「先整块亮一下、再逐行重播」的鬼影。 */
@keyframes bloom-row-in {
  from { opacity: 0; transform: translateY(-7px); }
  to { opacity: 1; transform: none; }
}
.dsh-bloom-menu.is-entering .dsh-bloom-option,
.dsh-bloom-menu.is-entering .dsh-bloom-section,
.dsh-bloom-menu.is-entering .dsh-bloom-appearance {
  animation: bloom-row-in 240ms var(--bloom-ease-out, cubic-bezier(0.22,1,0.36,1)) backwards;
}
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(1) { animation-delay: 30ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(2) { animation-delay: 42ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(3) { animation-delay: 54ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(4) { animation-delay: 66ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(5) { animation-delay: 78ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(6) { animation-delay: 90ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(7) { animation-delay: 102ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(8) { animation-delay: 114ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(9) { animation-delay: 126ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(10) { animation-delay: 138ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(11) { animation-delay: 150ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(12) { animation-delay: 162ms; }
/* 色块之后的区段跟着最后一档走，形成「一行一行落下来、再整体收尾」的节奏 */
.dsh-bloom-menu.is-entering .dsh-bloom-section,
.dsh-bloom-menu.is-entering .dsh-bloom-appearance { animation-delay: 174ms; }

/* 「版本与更新」展开：同框上下滑动（对齐 whale-widget 的做法）。
 * 不用 display:none 硬切 —— 高度用 grid-template-rows 0fr→1fr 过渡，
 * 容器高度自然撑开，内部内容整块 translateY 滑入，末段带一点回弹。 */
.dsh-bloom-more-body {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    grid-template-rows var(--bloom-dur-slow, 280ms) var(--bloom-ease-back, cubic-bezier(0.34,1.56,0.64,1)),
    opacity var(--bloom-dur, 200ms) var(--bloom-ease-out, cubic-bezier(0.22,1,0.36,1)),
    transform var(--bloom-dur-slow, 280ms) var(--bloom-ease-back, cubic-bezier(0.34,1.56,0.64,1));
}
.dsh-bloom-more-body > * { min-height: 0; overflow: hidden; }
.dsh-bloom-more-body[data-open="true"] {
  grid-template-rows: 1fr;
  opacity: 1;
  transform: none;
}
/* 首帧之前不能有过渡：否则初始渲染会从 0fr 播一次莫名其妙的展开 */
.dsh-bloom-more-body[data-instant="true"] { transition: none; }

.dsh-bloom-rotation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 14px;
  color: var(--dsw-alias-label-secondary, #555);
}
.dsh-bloom-rotation__select {
  font: inherit;
  color: var(--dsw-alias-label-primary, #222);
  background: var(--dsw-alias-bg-layer-2, #fff);
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,.15));
  border-radius: 6px;
  padding: 4px 6px;
}
.dsh-bloom-rotation__select:focus-visible {
  outline: 2px solid var(--bloom-accent, #34698c);
  outline-offset: 2px;
}

.dsh-bloom-options {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dsh-bloom-option {
  /* 稳妥的单行 Grid：button 不依赖 Chromium 的 subgrid，
     各列尺寸严格固定，诗句自适应占满中间，右侧勾选绝不折行。 */
  display: grid;
  grid-template-columns: 14px 44px minmax(0, 1fr) 14px;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 34px;
  padding: 0 12px;
  box-sizing: border-box;
}
.dsh-bloom-menu[lang="en"] .dsh-bloom-option {
  grid-template-columns: 14px 5.75em minmax(0, 1fr) 14px;
}
.dsh-bloom-option {
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
/* [LES-30] */
.dsh-bloom-option:focus-visible {
  --dsw-focus-ring-color: color-mix(in oklch, var(--bloom-accent, #34698c) 62%, transparent);
  outline: 2px solid var(--dsw-focus-ring-color);
  outline-offset: -2px;
  background: rgba(var(--bloom-morandi), 0.14);
}
/* 选中态：淡底 + 一道柔的内描边。之前只有 background，在玻璃面板上整行像被涂了
 * 一块颜色，和相邻行之间没有「这一行被选中」的边界感。 */
.dsh-bloom-option[data-active="true"] {
  background: rgba(var(--bloom-morandi), 0.2);
  box-shadow:
    inset 0 0 0 1px color-mix(in oklch, var(--bloom-accent, #34698c) 26%, transparent),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}
.dsh-bloom-option[data-active="true"]:focus-visible {
  --dsw-focus-ring-color: color-mix(in oklch, var(--bloom-accent, #34698c) 78%, transparent);
  box-shadow: none;
}
/* 「新」小标签（本版新上的配色）：只占一个字宽，贴在名字后面。
   用 accent 色不抢行焦点；悬停整行时不变化，它是个状态不是按钮。 */
.dsh-bloom-option__new {
  display: inline-block;
  vertical-align: 2px;
  margin-left: 5px;
  font-size: 9px;
  font-weight: 500;
  line-height: 1.5;
  padding: 0 3px;
  border-radius: 3px;
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 16%, transparent);
  color: color-mix(in oklch, var(--bloom-accent, #6b8f71) 78%, var(--dsw-alias-label-primary, #222));
}
.dsh-bloom-option__name {
  font-weight: 500;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 保留每一行诗句对应配色的渐变；起笔使用可读的次级正文色。
   不再整行叠透明度，避免原本达标的 accent 与背景再次混合后变淡。 */
.dsh-bloom-option__en {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12.5px;
  letter-spacing: 0.04em;
  font-family: 'Songti SC', 'STSong', 'Source Han Serif SC', 'Noto Serif SC', serif;
  background-image: linear-gradient(100deg, var(--dsw-alias-label-secondary, #666) 0%, color-mix(in oklab, var(--bloom-poem-b) 45%, var(--dsw-alias-label-secondary, #666)) 70%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 1;
  transition: opacity var(--bloom-dur-fast, 130ms) var(--bloom-ease, cubic-bezier(0.2,0.8,0.2,1));
}
/* 西文诗句：收一档字号、去字距、斜体，完整句在行 title 里。 */
.dsh-bloom-option__en:not(:lang(zh)) {
  font-size: 11.5px;
  letter-spacing: 0.01em;
  font-family: 'Iowan Old Style', 'Palatino', Georgia, serif;
  font-style: italic;
}
body[data-ds-dark-theme] .dsh-bloom-option__en {
  background-image: linear-gradient(100deg, var(--dsw-alias-label-secondary, #bbb) 0%, color-mix(in oklab, var(--bloom-poem-bd) 45%, var(--dsw-alias-label-primary, #eee)) 70%);
  opacity: 1;
}
.dsh-bloom-option:hover .dsh-bloom-option__en,
.dsh-bloom-option[data-active="true"] .dsh-bloom-option__en {
  opacity: 1;
}
/* 选中那一行让渐变缓缓流过，跟「深度求索中…」同一种语言 —— 只给一行，
   十行一起流会变成灯箱。 */
.dsh-bloom-option[data-active="true"] .dsh-bloom-option__en {
  background-size: 220% 100%;
  animation: dsh-bloom-poem-flow 4.2s ease-in-out infinite;
}
@keyframes dsh-bloom-poem-flow {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-option[data-active="true"] .dsh-bloom-option__en { animation: none; }
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
/* 外观切换（浅色/深色/跟随）——分段控件，跟变体列表用同一条分隔线语言 */
/* 模式分段控件：等宽三格，外面一圈细框（设计图的样子）。
   这里不再自带分隔线和标题 —— 标题由 .dsh-bloom-section 提供。 */
.dsh-bloom-appearance {
  padding: 0 14px;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #777);
}
.dsh-bloom-appearance[hidden] { display: none; }

/* 紧凑质感分段与模式控件保持一致。 */
.dsh-bloom-glass { padding: 0 14px 2px; font-size: 12px; color: var(--dsw-alias-label-secondary, #777); }
.dsh-bloom-glass__hint { margin: 7px 2px 2px; font-size: 11px; line-height: 1.55; color: var(--dsw-alias-label-tertiary, #999); }
.dsh-bloom-glass__hint[hidden] { display: none; }
.dsh-bloom-glass__choices { display: flex; width: 100%; box-sizing: border-box; padding: 3px; border-radius: 9px; background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 94%); }
.dsh-bloom-glass__choice { appearance: none; flex: 1; min-width: 0; min-height: 34px; border: 0; border-radius: 7px; padding: 7px 4px; background: transparent; color: inherit; font: inherit; line-height: 1.7; white-space: nowrap; cursor: pointer; transition: background-color .14s ease, color .14s ease; }
.dsh-bloom-glass__choice:hover { background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%); }
.dsh-bloom-glass__choice[data-active="true"] { background: var(--dsw-alias-bg-layer-1, #fff); color: var(--bloom-accent, #6b8f71); font-weight: 600; box-shadow: 0 1px 3px -1px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 70%); }
.dsh-bloom-glass__choice:focus-visible { outline: 2px solid var(--bloom-accent, #6b8f71); outline-offset: -2px; }
@media (prefers-reduced-motion: reduce) { .dsh-bloom-glass__choice { transition: none; } }
@media (forced-colors: active) { .dsh-bloom-glass__choice[data-active="true"] { outline: 2px solid Highlight; outline-offset: -2px; } }
.dsh-bloom-appearance__seg {
  display: flex;
  width: 100%;                 /* 撑满面板宽度，里面三个按钮才能真正三等分
                                  （inline-flex 时宽度被内容决定，"跟随系统"四个字
                                  把那格撑到别人的两倍） */
  /* 整条用一层浅底当容器，不描边；选中项靠更实的底色浮起来 —— 
     线框 + 格间竖线在小尺寸下线太多，显得脏 */
  padding: 3px;
  border-radius: 9px;
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 94%);
}
.dsh-bloom-appearance__btn {
  appearance: none;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  flex: 1;                     /* 三等分 */
  padding: 7px 4px;
  cursor: pointer;
  line-height: 1.7;
  white-space: nowrap;         /* 「浅色」被折成两行就是少了这一条 */
  text-align: center;
  transition: background-color .14s ease, color .14s ease;
}
.dsh-bloom-appearance__btn[hidden] { display: none; }
.dsh-bloom-appearance__btn { border-radius: 7px; }
.dsh-bloom-appearance__btn:hover {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%);
}
/* 选中态用主题强调色，和上方变体的选中打勾是同一套视觉权重 */
.dsh-bloom-appearance__btn[data-active="true"] {
  background: var(--dsw-alias-bg-layer-1, #fff);
  color: var(--bloom-accent, #6b8f71);
  font-weight: 600;
  box-shadow: 0 1px 3px -1px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 70%);
}
.dsh-bloom-appearance__btn:focus-visible {
  outline: 2px solid var(--bloom-accent, #6b8f71);
  outline-offset: -2px;
}

/* 氛围分段：深浅各一行，只显示与宿主当前深浅一致的那行 */
body[data-ds-dark-theme] .dsh-bloom-ambience[data-scheme="light"],
body:not([data-ds-dark-theme]) .dsh-bloom-ambience[data-scheme="dark"] { display: none; }
.dsh-bloom-ambience {
  display: flex;
  width: 100%;
  padding: 3px;
  border-radius: 9px;
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 94%);
  gap: 2px;
  margin-top: 6px;
  box-sizing: border-box;
}
.dsh-bloom-ambience__btn {
  appearance: none;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  flex: 1;
  padding: 5px 2px;
  cursor: pointer;
  line-height: 1.5;
  white-space: nowrap;
  text-align: center;
  font-size: 11.5px;
  border-radius: 7px;
  transition: background-color var(--bloom-dur-fast) var(--bloom-ease), color var(--bloom-dur-fast) var(--bloom-ease);
}
.dsh-bloom-ambience__btn:focus-visible {
  outline: 2px solid var(--bloom-accent, #6b8f71);
  outline-offset: -2px;
}
.dsh-bloom-ambience__btn:hover {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 90%);
}
.dsh-bloom-ambience__btn[data-active="true"] {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  color: var(--bloom-accent, inherit);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
body[data-ds-dark-theme] .dsh-bloom-ambience__btn[data-active="true"] {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 22%, #1a1a1c);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* The color choice belongs to the meteor background only. */
.dsh-bloom-meteor-color { display: none; align-items: center; gap: 6px; box-sizing: border-box; width: 100%; padding: 5px 14px; font-size: 12px; }
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-meteor-color { display: flex; }
.dsh-bloom-meteor-color > span { margin-right: auto; color: var(--dsw-alias-label-secondary, inherit); }
.dsh-bloom-meteor-color button { border: 0; border-radius: 7px; padding: 5px 10px; color: inherit; background: transparent; font: inherit; cursor: pointer; }
.dsh-bloom-meteor-color button[data-active="true"] { color: var(--bloom-accent, inherit); background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 22%, #1a1a1c); }
.dsh-bloom-meteor-color button:focus-visible { outline: 2px solid var(--bloom-accent, #6b8f71); outline-offset: -2px; }

.dsh-bloom-version {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 6px 14px 2px;
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
/* display:inline-flex 会压掉 [hidden] 的 display:none —— 没有新版时这里
   原本留着一颗空胶囊（截图里版本行右侧那条灰短线）。 */
.dsh-bloom-version__update[hidden] { display: none; }
/* 版本行现在只剩「↑ 可更新」徽标（名字和版本号已在底栏），没新版时整行不占位 */
.dsh-bloom-version:not(:has(.dsh-bloom-version__update:not([hidden]))) { display: none; }
.dsh-bloom-version__update:hover { color: color-mix(in oklch, var(--dsw-alias-brand-primary, #4a90e2), black 15%); }


/* ── 本版更新（CHANGELOG 注入）─────────────────────────────────
   展开体里的第一块。条目按 --i 错峰入场（每条 18ms），读起来像一行行落下，
   而不是一次全亮。 */
.dsh-bloom-log {
  /* 和 .dsh-bloom-version / DSH 行同一套 14px 左右内边距，不然贴边 */
  padding: 6px 14px 8px;
  border-bottom: 1px solid var(--bloom-hairline, rgba(0,0,0,.08));
  margin-bottom: 6px;
}
.dsh-bloom-log__head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 8px; margin-bottom: 6px;
}
.dsh-bloom-log__title {
  font-size: 11px; font-weight: 600; letter-spacing: .02em;
  color: var(--dsw-alias-label-secondary, #777);
}
.dsh-bloom-log__all {
  font-size: 10.5px; color: var(--dsw-alias-label-tertiary, #999);
  text-decoration: none; white-space: nowrap;
  transition: color .15s ease;
}
.dsh-bloom-log__all:hover { color: var(--bloom-accent, #6b8f71); text-decoration: underline; }
.dsh-bloom-log__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.dsh-bloom-log__item {
  display: flex; gap: 6px; align-items: flex-start;
  font-size: 11px; line-height: 1.45;
  color: var(--dsw-alias-label-secondary, #777);
  animation: dsh-bloom-log-in .26s var(--bloom-ease, ease) both;
  animation-delay: calc(var(--i, 0) * 18ms);
}
@keyframes dsh-bloom-log-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}
.dsh-bloom-log__tag {
  flex: 0 0 auto; margin-top: 1px;
  font-size: 9.5px; line-height: 1.5; padding: 0 4px; border-radius: 3px;
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 16%, transparent);
  color: color-mix(in oklch, var(--bloom-accent, #6b8f71) 78%, var(--dsw-alias-label-primary, #222));
}
.dsh-bloom-log__tag[data-kind="fix"] {
  background: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 9%, transparent);
  color: var(--dsw-alias-label-secondary, #777);
}
@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-log__item { animation: none; }
}

/* ── 遥测开关 ──────────────────────────────────────────────── */
.dsh-bloom-telemetry {
  display: flex; align-items: center; gap: 6px;
  margin-top: 8px; cursor: pointer; width: fit-content;
  font-size: 11px; color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-telemetry__box {
  position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;
}
.dsh-bloom-telemetry__box-ui {
  width: 22px; height: 12px; border-radius: 6px; flex: 0 0 auto;
  background: var(--dsw-alias-label-primary, #222);
  opacity: .16; position: relative;
  transition: opacity .18s ease, background .18s ease;
}
.dsh-bloom-telemetry__box-ui::after {
  content: ''; position: absolute; top: 2px; left: 2px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #fff;
  transition: transform .18s var(--bloom-ease, ease);
}
.dsh-bloom-telemetry__box:checked + .dsh-bloom-telemetry__box-ui {
  background: var(--bloom-accent, #6b8f71); opacity: .85;
}
.dsh-bloom-telemetry__box:checked + .dsh-bloom-telemetry__box-ui::after { transform: translateX(10px); }
.dsh-bloom-telemetry__box:focus-visible + .dsh-bloom-telemetry__box-ui {
  outline: 2px solid var(--bloom-accent, #6b8f71); outline-offset: 2px;
}
.dsh-bloom-telemetry:hover .dsh-bloom-telemetry__text { color: var(--dsw-alias-label-secondary, #777); }

/* ── DSH 升级检查区块（紧贴 Bloom 版本行下方）── */
/* 版本区：两行封顶（当前+按钮 / 最新），按钮收进第一行右侧。
   原来是三行——版本、最新、两个大按钮各占一行，菜单被撑得很长（owner 反馈"太拥挤"）。 */
.dsh-bloom-dsh-spacer { flex: 1; }
.dsh-bloom-dsh-row--latest { opacity: .72; }
.dsh-bloom-dsh-update {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
  padding: 2px 14px 6px;
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
  white-space: nowrap;
}
/* 状态 chip：绝不允许折行 —— 折行后 flex-shrink 会把它压到 1 字宽，
   「版本未知」变成竖排字。推右交给 .dsh-bloom-dsh-spacer（flex:1），
   不再用 margin-left:auto，两份「吃光自由空间」会互相抵消语义。 */
.dsh-bloom-dsh-state {
  /* 原来 flex:none —— 报错原文一长就不肯缩，把同一行的「检查 / 填入」挤出面板
     （2026-11-04 截图：中文下「填入」被裁掉一半）。改成可缩 + 省略号，全文在 title。 */
  flex: 0 1 auto;
  min-width: 0;
  max-width: 132px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in oklch, var(--dsw-alias-label-tertiary, #999), transparent 88%);
  color: var(--dsw-alias-label-secondary, #666);
}
/* 没有状态时（检查中）chip 只剩背景，截图里是「DSH —」后面一条灰短线 */
.dsh-bloom-dsh-state:empty { display: none; }
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
/* 宿主形态标签（桌面端 / Web）：与状态 chip 同风格，但用中性色 ——
   它不是「有更新」那种状态提示，只是告诉用户自己装的是哪一版宿主。
   对比度同状态 chip 的明暗分档：亮色 45%、暗色 78%，都过 AA。 */
.dsh-bloom-dsh-platform {
  flex: none;
  white-space: nowrap;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in oklch, oklch(45% 0.06 250), transparent 88%);
  color: oklch(45% 0.06 250);
}
.dsh-bloom-dsh-platform[data-platform="desktop"] {
  background: color-mix(in oklch, oklch(45% 0.13 150), transparent 88%);
  color: oklch(45% 0.13 150);
}
body[data-ds-dark-theme] .dsh-bloom-dsh-platform {
  background: color-mix(in oklch, oklch(78% 0.05 250), transparent 88%);
  color: oklch(78% 0.05 250);
}
body[data-ds-dark-theme] .dsh-bloom-dsh-platform[data-platform="desktop"] {
  background: color-mix(in oklch, oklch(78% 0.14 150), transparent 88%);
  color: oklch(78% 0.14 150);
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
/* 菜单 min-width 312px 时 actions 区实际可用 ≈ 284px。两个按钮原本都 flex:1
   平分,而「复制升级命令」6 字 × 10.5px + 左右 padding 装不下就折成两行,
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
/* 主按钮按内容宽度，不再吃满剩余空间：查到版本前它是禁用的，
   原来却是一大块实心 accent，比真正有用的信息还抢眼。禁用时退回描边样式。 */
.dsh-bloom-dsh-btn--primary { flex: 0 0 auto; }
.dsh-bloom-dsh-btn--primary:disabled {
  background: transparent;
  border-color: var(--bloom-hairline, rgba(0,0,0,.08));
  color: var(--dsw-alias-label-tertiary, #999);
}

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

/* 底栏作为分享面板的定位边界，使面板始终贴齐菜单右侧。 */
.dsh-bloom-foot {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 2px;
  padding: 7px 14px 9px;
  font-size: 11px;
  box-shadow: 0 -6px 10px -8px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 82%);
}
.dsh-bloom-foot__link {
  color: var(--dsw-alias-label-secondary, #777);
  text-decoration: none;
  transition: color .15s ease;
  /* 「分享」是 button（要跑复制逻辑），其余是 a —— 这里把 button 的默认样式抹平，
     两种标签在这一行必须长得一模一样。 */
  border: 0;
  padding: 0;
  background: none;
  font: inherit;
  cursor: pointer;
}
.dsh-bloom-foot__link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  line-height: 1;
}
.dsh-bloom-foot__icon {
  width: 13px;
  height: 13px;
  flex: 0 0 auto;
  opacity: .78;
}
.dsh-bloom-foot__link:hover { color: var(--bloom-accent, #6b8f71); }
.dsh-bloom-foot__link:hover .dsh-bloom-foot__icon { opacity: 1; }
.dsh-bloom-foot__link:focus-visible {
  outline: 2px solid var(--bloom-accent, #6b8f71);
  outline-offset: 2px;
  border-radius: 4px;
}
/* 底栏一行装「版本入口 + 三个快链」，任何语言都不许折行（英文原文案曾把投票挤成两行） */
.dsh-bloom-foot__links { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 4px 12px; min-width: 0; }
.dsh-bloom-more { white-space: nowrap; }
.dsh-bloom-foot__link { min-height: 28px; white-space: nowrap; }
.dsh-bloom-share-panel[hidden] { display: none; }
.dsh-bloom-share-panel {
  position: absolute;
  right: 14px;
  bottom: calc(100% + 4px);
  z-index: 2;
  box-sizing: border-box;
  width: min(280px, calc(100% - 28px));
  max-height: min(300px, calc(var(--bloom-menu-max-h, 100vh) - 56px));
  overflow-y: auto;
  padding: 5px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,.16));
  border-radius: 10px;
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 94%, transparent);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  color: var(--dsw-alias-label-primary, #222);
  box-shadow: var(--bloom-shadow, 0 8px 24px rgba(0,0,0,.18));
  white-space: normal;
}
body[data-ds-dark-theme] .dsh-bloom-share-panel {
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #252528) 94%, transparent);
  color: var(--dsw-alias-label-primary, #f2f2f2);
}
.dsh-bloom-share-action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  width: 100%;
  min-height: 44px;
  padding: 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-bloom-share-intro { display: block; padding: 7px 8px 5px; color: var(--dsw-alias-label-secondary, #666); font-size: 11px; line-height: 1.4; }
.dsh-bloom-share-action:hover:not(:disabled) { background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 88%); }
.dsh-bloom-share-action:disabled { opacity: .55; cursor: default; }
.dsh-bloom-share-action:focus-visible, .dsh-bloom-share-result button:focus-visible, .dsh-bloom-share-result a:focus-visible, .dsh-bloom-share-cancel:focus-visible, .dsh-bloom-share-manual:focus-visible {
  outline: 2px solid var(--bloom-accent, #6b8f71);
  outline-offset: -2px;
}
.dsh-bloom-share-action__title { font-size: 12px; font-weight: 600; }
.dsh-bloom-share-action__hint { font-size: 11px; line-height: 1.35; color: var(--dsw-alias-label-secondary, #555); overflow-wrap: anywhere; }
body[data-ds-dark-theme] .dsh-bloom-share-action__hint { color: var(--dsw-alias-label-secondary, #c3c3c3); }
.dsh-bloom-share-status { display: block; padding: 5px 8px; color: var(--dsw-alias-label-secondary, #666); font-size: 11px; line-height: 1.4; }
.dsh-bloom-share-status:empty { display: none; }
.dsh-bloom-share-cancel { display: inline-flex; align-items: center; min-height: 28px; margin: 0 8px 6px; padding: 0; border: 0; background: none; color: var(--bloom-accent, #6b8f71); font: inherit; cursor: pointer; }
.dsh-bloom-share-cancel[hidden] { display: none; }
.dsh-bloom-share-manual { box-sizing: border-box; width: 100%; min-height: 92px; padding: 7px; resize: vertical; color: var(--dsw-alias-label-primary, #222); background: var(--dsw-alias-bg-layer-1, #fff); border: 1px solid var(--bloom-hairline); border-radius: 6px; font: inherit; }
.dsh-bloom-share-manual[hidden] { display: none; }
.dsh-bloom-share-result { display: flex; align-items: center; gap: 8px; padding: 4px 8px 8px; font-size: 11px; line-height: 1.4; }
.dsh-bloom-share-result button, .dsh-bloom-share-result a { min-height: 28px; display: inline-flex; align-items: center; border: 0; padding: 0; background: none; color: var(--bloom-accent, #6b8f71); font: inherit; text-decoration: none; cursor: pointer; }
.dsh-bloom-share-result [hidden] { display: none; }
.dsh-bloom-share-result[hidden] { display: none; }
@media (prefers-contrast: more), (forced-colors: active) {
  html body .dsh-bloom-share-panel { background: Canvas; color: CanvasText; border-color: CanvasText; -webkit-backdrop-filter: none; backdrop-filter: none; }
}
@media (prefers-reduced-transparency: reduce) {
  html body:not([data-bloom-glass]) .dsh-bloom-share-panel { background: var(--dsw-alias-bg-layer-1, #fff); -webkit-backdrop-filter: none; backdrop-filter: none; }
}

@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-trigger, .dsh-bloom-chevron, .dsh-bloom-option { transition: none !important; }
  /* 设计约束④：减弱动效时一律瞬间到位，不留任何位移/回弹 */
  .dsh-bloom-menu.is-entering { animation: none; }
  .dsh-bloom-menu.is-entering .dsh-bloom-option,
  .dsh-bloom-menu.is-entering .dsh-bloom-section,
  .dsh-bloom-menu.is-entering .dsh-bloom-appearance { animation: none; }
  .dsh-bloom-more-body { transition: none; transform: none; }
}

/* 窄屏降级：DSH 顶栏在 < 900px 时空间紧张，隐藏中文名只留色点+chevron，
   避免挤压 Session log 等原生控件。色点本身 12px 渐变辨识度足够。 */
@media (max-width: 900px) {
  .dsh-bloom-trigger__name { display: none; }
  .dsh-bloom-trigger { padding: 0 7px; gap: 4px; }
}
`;

  // src/starlight.ts
  var COLOR_MODE_KEY = `${STORAGE_KEY}-meteor-color-mode`;
  var colorMode = "colorful";
  var pendingWrite = false;
  var priorValue;
  function readMeteorColorMode() {
    try {
      const stored = localStorage.getItem(COLOR_MODE_KEY);
      if (pendingWrite && priorValue !== void 0 && priorValue === stored) return colorMode;
      colorMode = stored === "solid" ? "solid" : "colorful";
      pendingWrite = false;
      priorValue = void 0;
    } catch {
    }
    return colorMode;
  }
  function writeMeteorColorMode(mode) {
    if (mode !== "colorful" && mode !== "solid") return false;
    let previous;
    try {
      previous = localStorage.getItem(COLOR_MODE_KEY);
    } catch {
    }
    colorMode = mode;
    try {
      localStorage.setItem(COLOR_MODE_KEY, mode);
      pendingWrite = false;
      priorValue = void 0;
    } catch {
      pendingWrite = true;
      priorValue = previous;
    }
    return true;
  }
  var LAYER_ID = "dsh-bloom-sparkles";
  var CORNER_COUNT = 64;
  var CORNER_W = 360;
  var CORNER_H = 220;
  var METEOR_COUNT = 40;
  var MOTION_VARS = ["--bloom-motion-1", "--bloom-motion-2", "--bloom-motion-3"];
  function rand(seed) {
    let s = seed >>> 0;
    return () => {
      s = s * 1664525 + 1013904223 >>> 0;
      return s / 4294967296;
    };
  }
  function sampleMotionColor(doc, streamIndex) {
    const view = doc.defaultView;
    if (!view || !doc.body) return "";
    const prop = readMeteorColorMode() === "solid" ? "--bloom-accent" : MOTION_VARS[streamIndex] ?? MOTION_VARS[0];
    return view.getComputedStyle(doc.body).getPropertyValue(prop).trim();
  }
  function buildSparkles(doc, seed = 7) {
    const layer = doc.createElement("div");
    layer.id = LAYER_ID;
    layer.className = "dsh-bloom-sparkles";
    layer.setAttribute("aria-hidden", "true");
    const r = rand(seed * 9973 + 17);
    for (let i = 0; i < CORNER_COUNT; i++) {
      const x = 88 + r() * 12;
      const y = -3 + r() * 10;
      const ang = (95 + r() * 90) * Math.PI / 180;
      const k = r();
      const dist = 50 + k * k * 560;
      const big = r() < 0.15;
      const size = big ? 1.8 + r() * 0.9 : 0.7 + r() * 1;
      const dot = makeDot(doc, r, "s-tr", size, Math.cos(ang) * dist, Math.sin(ang) * dist * 0.75, 6, 7, 1.1, 1.6, 0.55);
      dot.style.right = `${(CORNER_W - x / 100 * CORNER_W - size).toFixed(2)}px`;
      dot.style.top = `${(y / 100 * CORNER_H).toFixed(2)}px`;
      layer.appendChild(dot);
    }
    const q = rand(seed * 7919 + 3);
    for (let i = 0; i < 26; i++) {
      const x = 2 + q() * 24;
      const y = 74 + q() * 24;
      const ang = (275 + q() * 85) * Math.PI / 180;
      const dist = 30 + Math.pow(q(), 1.6) * 460;
      createParticle(doc, layer, q, x, y, ang, dist, "s-bl");
    }
    for (let i = 0; i < 28; i++) {
      const x = q() * 100;
      const y = q() * 100;
      const ang = q() * 360 * Math.PI / 180;
      const dist = 25 + q() * 160;
      createParticle(doc, layer, q, x, y, ang, dist, "s-amb");
    }
    for (let i = 0; i < 36; i++) {
      const x = 68 + q() * 31;
      const y = 58 + q() * 40;
      const ang = (150 + q() * 120) * Math.PI / 180;
      const dist = 35 + Math.pow(q(), 1.6) * 420;
      createParticle(doc, layer, q, x, y, ang, dist, "s-amb");
    }
    for (let i = 0; i < 44; i++) {
      const x = 4 + q() * 92;
      const y = 76 + q() * 23;
      const ang = (195 + q() * 150) * Math.PI / 180;
      const dist = 25 + Math.pow(q(), 1.6) * 320;
      createParticle(doc, layer, q, x, y, ang, dist, "s-amb");
    }
    const edge = rand(seed * 104729 + 11);
    for (let i = 0; i < 72; i++) {
      const side = i % 4;
      const along = 2 + edge() * 96;
      const inset = 1 + edge() * 16;
      const x = side === 0 || side === 1 ? along : side === 2 ? inset : 100 - inset;
      const y = side === 2 || side === 3 ? along : side === 0 ? inset : 100 - inset;
      const angle = edge() * 2 * Math.PI;
      const distance = 20 + edge() * 150;
      createParticle(doc, layer, edge, x, y, angle, distance, "s-galaxy-edge");
    }
    const m = rand(seed * 6151 + 29);
    for (let i = 0; i < METEOR_COUNT; i++) layer.appendChild(makeMeteor(doc, m, i));
    layer.addEventListener("animationiteration", (event) => {
      const el = event.target;
      if (!el || el.tagName !== "B") return;
      const match = /\bm([123])\b/.exec(el.className);
      const color = sampleMotionColor(doc, match ? Number(match[1]) - 1 : 0);
      if (color) el.style.setProperty("--meteor-color", color);
    });
    return layer;
  }
  function makeMeteor(doc, r, i) {
    const meteor = doc.createElement("b");
    meteor.className = `s-met m${i % 3 + 1}`;
    const fromTop = r() < 0.62;
    const left = fromTop ? 8 + r() * 100 : 70 + r() * 34;
    const top = fromTop ? -6 + r() * 10 : r() * 62;
    const len = 140 + r() * 200;
    const dur = 4.5 + r() * 7;
    const st = meteor.style;
    st.left = `${left.toFixed(2)}%`;
    st.top = `${top.toFixed(2)}%`;
    st.width = `${len.toFixed(0)}px`;
    st.height = `${(1.8 + r() * 1.4).toFixed(2)}px`;
    st.setProperty("--rot", `${(-28 - r() * 16).toFixed(1)}deg`);
    st.setProperty("--travel", `${(920 + r() * 980).toFixed(0)}px`);
    st.setProperty("--peak", (0.75 + r() * 0.25).toFixed(2));
    st.animationDuration = `${dur.toFixed(2)}s`;
    st.animationDelay = `${(-r() * dur).toFixed(2)}s`;
    const color = sampleMotionColor(doc, i % 3);
    if (color) st.setProperty("--meteor-color", color);
    return meteor;
  }
  function makeDot(doc, r, cluster, size, dx, dy, durBase, durSpan, twBase, twSpan, tintRatio) {
    const peak = 0.35 + r() * 0.65;
    const dur = durBase + r() * durSpan;
    const tw = twBase + r() * twSpan;
    const tint = r() < tintRatio;
    const dot = doc.createElement("i");
    dot.className = tint ? `${cluster} t` : cluster;
    const st = dot.style;
    st.width = `${size.toFixed(2)}px`;
    st.height = `${size.toFixed(2)}px`;
    st.setProperty("--dx", `${dx.toFixed(1)}px`);
    st.setProperty("--dy", `${dy.toFixed(1)}px`);
    st.setProperty("--peak", peak.toFixed(2));
    st.setProperty("--glow", `${(size * 2.4).toFixed(1)}px`);
    st.animationDuration = `${dur.toFixed(2)}s, ${tw.toFixed(2)}s`;
    st.animationDelay = `${(-r() * dur).toFixed(2)}s, ${(-r() * tw).toFixed(2)}s`;
    return dot;
  }
  function createParticle(doc, layer, r, x, y, ang, dist, cluster) {
    const galaxyOnly = cluster === "s-amb" || cluster === "s-galaxy-edge";
    const big = r() < (galaxyOnly ? 0.32 : 0.15);
    const size = big ? 1.8 + r() * 0.9 : 0.7 + r() * 1;
    const dot = makeDot(doc, r, cluster, size, Math.cos(ang) * dist, Math.sin(ang) * dist * 0.75, 6.5, 7.5, 1.2, 1.8, 0.55);
    if (galaxyOnly) {
      dot.style.setProperty("--peak", Math.max(0.55, Number(dot.style.getPropertyValue("--peak"))).toFixed(2));
      dot.style.setProperty("--glow", `${Math.max(3, size * 2.4).toFixed(1)}px`);
    }
    dot.style.left = `${x.toFixed(2)}%`;
    dot.style.top = `${y.toFixed(2)}%`;
    layer.appendChild(dot);
  }

  // src/diagnostics.ts
  function safeBodyDataset(body) {
    const allowed = {
      bloomVariant: VARIANTS,
      bloomGlass: ["frosted", "matte", "liquid", "solid"],
      bloomAmbienceLight: AMBIENCE_PRESETS.light,
      bloomAmbienceDark: AMBIENCE_PRESETS.dark,
      bloomTyping: ["true", "false"]
    };
    const result = {};
    for (const [key, values] of Object.entries(allowed)) {
      const value = body?.dataset[key];
      if (value !== void 0 && values.includes(value)) result[key] = value;
    }
    return result;
  }
  function safeColor(value) {
    const trimmed = value.trim();
    if (!trimmed || /[\\"'?]/.test(trimmed) || /url|image-set|var\s*\(/i.test(trimmed)) return "";
    return typeof CSS !== "undefined" && CSS.supports("color", trimmed) ? trimmed : "";
  }
  function safeBackgroundImage(value) {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "none") return trimmed;
    if (/[\\"'?]/.test(trimmed) || /url|image-set|var\s*\(/i.test(trimmed)) return "[redacted]";
    if (!/^(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(trimmed)) return "[redacted]";
    return typeof CSS !== "undefined" && CSS.supports("background-image", trimmed) ? trimmed : "[redacted]";
  }
  function sampleElement(selector, props) {
    if (typeof document === "undefined") return null;
    try {
      const el = document.querySelector(selector);
      if (!el) return { found: false, selector };
      const cs = window.getComputedStyle(el);
      const sampled = { found: true, selector };
      for (const p of props) {
        const value = cs.getPropertyValue(p);
        sampled[p] = p.includes("color") ? safeColor(value) : value;
      }
      return sampled;
    } catch {
      return null;
    }
  }
  function collectDiagnostics() {
    const isDark = currentIsDark();
    const variant = readVariant();
    const body = typeof document !== "undefined" ? document.body : null;
    const bodyStyles = body && typeof window !== "undefined" ? window.getComputedStyle(body) : null;
    const sidebarAudit = sampleElement(
      '[role="treeitem"], div[class*="_workspace"] div[class*="_item"], div[class*="_sidebarCol"] div[class*="_groupSection"]',
      ["height", "min-height", "line-height", "padding", "margin", "margin-top", "display"]
    );
    const headerAudit = sampleElement(
      'header[class*="_header"], div[class*="_header"]',
      ["height", "background-color", "overflow", "contain"]
    );
    const pluginsAudit = sampleElement(
      'div[class*="_plugin"], div[class*="_tabs"]',
      ["background-color", "color"]
    );
    const tokens = {};
    if (bodyStyles) {
      for (const key of ["--bloom-accent", "--bloom-morandi", "--dsw-alias-bg-layer-1", "--dsw-alias-label-primary"]) {
        const val = safeColor(bodyStyles.getPropertyValue(key));
        if (val) tokens[key] = val;
      }
    }
    return {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      bloom: {
        version: PLUGIN_VERSION,
        variant,
        appearance: isDark ? "dark" : "light",
        glassMode: readGlassMode(),
        ambience: { dark: readAmbience("dark"), light: readAmbience("light") },
        rotationMinutes: readRotationMinutes(),
        bodyDataset: safeBodyDataset(body),
        slots: {
          switcherAnchorMounted: typeof document !== "undefined" && !!document.querySelector('.dsh-bloom-slot[data-bloom-slot="switcher"]'),
          overlayMounted: typeof document !== "undefined" && !!document.querySelector('.dsh-bloom-overlay[data-bloom-slot="decorations"]')
        }
      },
      host: {
        platform: typeof navigator !== "undefined" ? navigator.platform : "unknown",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        devicePixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1,
        viewport: typeof window !== "undefined" ? { width: window.innerWidth, height: window.innerHeight } : null,
        language: typeof navigator !== "undefined" ? navigator.language : "unknown"
      },
      domAudit: {
        sidebar: sidebarAudit,
        header: headerAudit,
        plugins: pluginsAudit,
        body: bodyStyles ? {
          backgroundColor: safeColor(bodyStyles.backgroundColor),
          backgroundImage: safeBackgroundImage(bodyStyles.backgroundImage),
          color: safeColor(bodyStyles.color)
        } : null
      },
      tokens
    };
  }
  function formatDiagnosticsMarkdown(data) {
    const diag = data || collectDiagnostics();
    const summary = `Bloom v${diag.bloom.version} · ${diag.bloom.variant} · ${diag.bloom.appearance} · ${diag.host.platform}`;
    return [
      `<details>`,
      `<summary>Bloom 诊断信息（${summary}）</summary>`,
      "",
      "```json",
      JSON.stringify(diag, null, 2),
      "```",
      "</details>"
    ].join("\n");
  }
  async function copyDiagnostics(btn) {
    const text = formatDiagnosticsMarkdown();
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
    }
    if (!ok && typeof document !== "undefined") {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
      }
      ta.remove();
    }
    if (btn) {
      const slot = btn.querySelector("span") ?? btn;
      const original = slot.textContent;
      slot.textContent = ok ? tr("已复制") : tr("复制失败");
      setTimeout(() => {
        slot.textContent = original;
      }, 1800);
    }
    return ok;
  }

  // src/feedback.ts
  var ISSUE_URL = "https://github.com/webkubor/dsh-bloom-theme/issues/new";
  function buildFeedbackUrl(diagnostics, language) {
    const zh = language === "zh";
    const body = zh ? `### 问题或建议

请在这里描述。

### 截图或录屏

如愿意分享，请将文件拖入此处。

### 基础诊断

${diagnostics}` : `### Issue or suggestion

Describe it here.

### Screenshot or recording

Drag a file here if you wish to share one.

### Basic diagnostics

${diagnostics}`;
    const url = new URL(ISSUE_URL);
    url.searchParams.set("body", body);
    return url.toString();
  }

  // src/share-capture.ts
  var CaptureError = class extends Error {
    constructor(kind) {
      super(kind);
      this.kind = kind;
    }
  };
  function createShareCapture(options = {}) {
    let disposed = false;
    let active;
    const supported = () => !disposed && typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getDisplayMedia === "function";
    const mimeType = () => {
      if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return void 0;
      return ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
    };
    const cancelled = () => new CaptureError("cancelled");
    function run(kind) {
      if (disposed) return Promise.resolve({ kind: "cancelled" });
      if (active) return Promise.resolve({ kind: "busy" });
      if (!supported() || kind === "record" && !mimeType()) return Promise.resolve({ kind: "unsupported" });
      const controller = new AbortController();
      active = controller;
      let picker;
      try {
        picker = navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      } catch (error) {
        active = void 0;
        return Promise.resolve({ kind: classify(error) });
      }
      const stopped = () => controller.signal.aborted;
      const abortable = (promise) => new Promise((resolve, reject) => {
        if (stopped()) {
          reject(cancelled());
          return;
        }
        const onAbort = () => reject(cancelled());
        controller.signal.addEventListener("abort", onAbort, { once: true });
        promise.then(resolve, reject).finally(() => controller.signal.removeEventListener("abort", onAbort));
      });
      const work = async () => {
        let stream;
        let video;
        let recorder;
        let timer2;
        let onEnded;
        let onAbort;
        try {
          stream = await picker;
          if (stopped()) throw cancelled();
          const track2 = stream.getVideoTracks()[0];
          if (!track2 || track2.readyState === "ended") throw new CaptureError("ended");
          const ended = new Promise((_, reject) => {
            onEnded = () => reject(new CaptureError("ended"));
            track2.addEventListener("ended", onEnded, { once: true });
          });
          if (kind === "screenshot") {
            video = document.createElement("video");
            video.muted = true;
            video.playsInline = true;
            video.srcObject = stream;
            await abortable(Promise.race([video.play(), ended]));
            if (!video.videoWidth || !video.videoHeight) throw new CaptureError("failed");
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new CaptureError("failed");
            ctx.drawImage(video, 0, 0);
            const blob2 = await abortable(Promise.race([new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new CaptureError("failed")), "image/png")), ended]));
            if (blob2.type !== "image/png" || !blob2.size) throw new CaptureError("failed");
            return { kind: "success", file: new File([blob2], "bloom-screenshot.png", { type: "image/png" }) };
          }
          const type = mimeType();
          if (!type) throw new CaptureError("unsupported");
          recorder = new MediaRecorder(stream, { mimeType: type });
          const parts = [];
          const result = new Promise((resolve, reject) => {
            recorder.ondataavailable = (event) => {
              if (event.data.size) parts.push(event.data);
            };
            recorder.onerror = () => reject(new CaptureError("failed"));
            recorder.onstop = () => resolve(new Blob(parts, { type: recorder.mimeType || type }));
          });
          onAbort = () => {
            try {
              if (recorder && recorder.state !== "inactive") recorder.stop();
            } catch {
            }
          };
          controller.signal.addEventListener("abort", onAbort, { once: true });
          recorder.start();
          timer2 = setTimeout(() => {
            if (recorder?.state === "recording") recorder.stop();
          }, Math.max(0, options.durationMs ?? 5e3));
          const blob = await abortable(Promise.race([result, ended]));
          if (!blob.size || !/^video\/(webm|mp4)(?:;|$)/i.test(blob.type)) throw new CaptureError("failed");
          const extension = blob.type.toLowerCase().startsWith("video/mp4") ? "mp4" : "webm";
          return { kind: "success", file: new File([blob], `bloom-recording.${extension}`, { type: blob.type }) };
        } catch (error) {
          return { kind: stopped() ? "cancelled" : classify(error) };
        } finally {
          if (timer2 !== void 0) clearTimeout(timer2);
          if (onAbort) controller.signal.removeEventListener("abort", onAbort);
          if (onEnded && stream) stream.getVideoTracks()[0]?.removeEventListener("ended", onEnded);
          if (recorder) {
            recorder.ondataavailable = null;
            recorder.onerror = null;
            recorder.onstop = null;
            if (recorder.state !== "inactive") {
              try {
                recorder.stop();
              } catch {
              }
            }
          }
          if (video) {
            video.pause();
            video.srcObject = null;
            video.remove();
          }
          stream?.getTracks().forEach((track2) => track2.stop());
          if (active === controller) active = void 0;
        }
      };
      return abortable(work()).catch((error) => ({ kind: classify(error) }));
    }
    return {
      get supported() {
        return supported();
      },
      get canRecord() {
        return supported() && !!mimeType();
      },
      screenshot: () => run("screenshot"),
      record: () => run("record"),
      cancel: () => active?.abort(),
      dispose: () => {
        disposed = true;
        active?.abort();
      }
    };
  }
  function classify(error) {
    if (error instanceof CaptureError) return error.kind;
    if (error instanceof Error && error.name === "NotAllowedError") return "denied";
    if (error instanceof Error && error.name === "AbortError") return "cancelled";
    if (error instanceof Error && (error.name === "NotSupportedError" || error.name === "NotFoundError")) return "unsupported";
    return "failed";
  }

  // src/track.ts
  var ENDPOINT = "https://www.webkubor.online/api/event";
  var OPT_OUT_KEY = "bloom-telemetry";
  var EVENTS = ["vote", "feedback", "share", "changelog", "version-open", "diagnose"];
  var sessionEnabled;
  function telemetryEnabled() {
    if (sessionEnabled !== void 0) return sessionEnabled;
    try {
      return localStorage.getItem(OPT_OUT_KEY) !== "off";
    } catch {
      return false;
    }
  }
  function setTelemetryEnabled(enabled) {
    sessionEnabled = enabled;
    try {
      localStorage.setItem(OPT_OUT_KEY, enabled ? "on" : "off");
    } catch {
    }
  }
  function track(event) {
    if (!EVENTS.includes(event) || !telemetryEnabled()) return;
    try {
      const body = JSON.stringify({ project: "bloom", event, params: { v: PLUGIN_VERSION, lang: getLang() } });
      void fetch(ENDPOINT, { method: "POST", body, keepalive: true, mode: "no-cors", credentials: "omit" }).catch(() => {
      });
    } catch {
    }
  }

  // src/switcher.ts
  var CHANGELOG = typeof define_BLOOM_CHANGELOG_default !== "undefined" ? define_BLOOM_CHANGELOG_default : { version: PLUGIN_VERSION, items: [] };
  function escapeHTML(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function changelogHTML() {
    const tag = (k) => k === "feat" ? tr("新") : k === "fix" ? tr("修") : tr("优");
    const list = CHANGELOG.items.length && getLang() === "zh" ? `<ul class="dsh-bloom-log__list">${CHANGELOG.items.map((it, i) => `<li class="dsh-bloom-log__item" style="--i:${i}"><span class="dsh-bloom-log__tag" data-kind="${it.kind}">${tag(it.kind)}</span><span>${escapeHTML(it.text)}</span></li>`).join("")}</ul>` : "";
    return `<div class="dsh-bloom-log">
        <div class="dsh-bloom-log__head">
          <span class="dsh-bloom-log__title">${tr("本版更新")} · v${CHANGELOG.version}</span>
          <a class="dsh-bloom-log__all" data-track="changelog" href="https://github.com/webkubor/dsh-bloom-theme/releases" target="_blank" rel="noopener">${tr("完整日志")} ›</a>
        </div>
        ${list}
      </div>`;
  }
  var poemStyle = (v) => `--bloom-poem-a:rgb(${PALETTE[v].morandi});--bloom-poem-b:${PALETTE[v].accentL};--bloom-poem-bd:${PALETTE[v].accentD}`;
  var dotStyle = (v) => `background:linear-gradient(135deg, rgb(${PALETTE[v].morandi}) 0%, ${PALETTE[v].accentL} 100%)`;
  function applyVariant(variant) {
    if (!VARIANTS.includes(variant)) variant = "mist";
    const apply2 = () => {
      document.body.dataset.bloomVariant = variant;
      try {
        window.localStorage.setItem(STORAGE_KEY, variant);
      } catch {
      }
      resetRotationTimer();
      const root = document.querySelector(".dsh-bloom-switcher");
      if (!root) return;
      root.querySelectorAll(".dsh-bloom-option").forEach((el) => {
        const on = el.dataset.variant === variant;
        el.setAttribute("data-active", String(on));
        el.setAttribute("aria-selected", String(on));
      });
      const name = root.querySelector(".dsh-bloom-trigger__name");
      if (name) name.textContent = variantName(variant);
      const dot = root.querySelector(".dsh-bloom-trigger .dsh-bloom-dot");
      if (dot) dot.setAttribute("style", dotStyle(variant));
      const headName = root.querySelector("[data-head-name]");
      if (headName) headName.textContent = variantName(variant);
      const headDot = root.querySelector(".dsh-bloom-head__current .dsh-bloom-dot");
      if (headDot) headDot.setAttribute("style", dotStyle(variant));
    };
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(apply2);
    } else {
      apply2();
    }
  }
  var icon = (body) => `<svg class="dsh-bloom-foot__icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  var ICON_STAR = icon('<path d="m7 1.3 1.7 3.5 3.8.6-2.8 2.7.7 3.9L7 10.2l-3.4 1.8.7-3.9L1.5 5.4l3.8-.6z"/>');
  var ICON_CHAT = icon('<path d="M12.1 8.1a1.8 1.8 0 0 1-1.8 1.8H5.6L2.9 12.1V3.7a1.8 1.8 0 0 1 1.8-1.8h5.6a1.8 1.8 0 0 1 1.8 1.8z"/>');
  var ICON_DIAGNOSE = icon('<rect x="2.8" y="2.5" width="8.4" height="9.5" rx="1.6"/><path d="M5 2.5V1.5a.8.8 0 0 1 .8-.8h1.6a.8.8 0 0 1 .8.8v1M5 6h4M5 8.5h2.5"/>');
  var ICON_SHARE = icon('<circle cx="10.5" cy="3.3" r="1.6"/><circle cx="3.5" cy="7" r="1.6"/><circle cx="10.5" cy="10.7" r="1.6"/><path d="M4.9 6.2l4.2-2.2M4.9 7.8l4.2 2.2"/>');
  var buildShareText = () => [
    tr("我在用 Bloom：诗意配色与玻璃质感，欢迎试试，也欢迎到仓库点个 Star。"),
    "",
    tr("请帮我安装并启用 DeepSeek Harness 的 Bloom 主题（dsh-bloom-theme）。"),
    tr("请先使用官方 plugin_manager 的 list_bundles 查询，再用 install_bundle 安装 dsh-bloom-theme，并按返回的 application / nextStep 完成和验证。"),
    tr("如果使用自建 CLI profile，请先确认 profile 名称，再运行："),
    "dsh plugin --profile <profile> add dsh-bloom-theme",
    tr("仓库：https://github.com/webkubor/dsh-bloom-theme")
  ].join("\n");
  async function shareInstall(btn, schedule2) {
    const SHARE_TEXT = buildShareText();
    const slot = btn.querySelector("span") ?? btn;
    const label = slot.textContent;
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SHARE_TEXT);
        ok = true;
      }
    } catch {
    }
    if (!ok) {
      const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const ta = document.createElement("textarea");
      ta.value = SHARE_TEXT;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
      }
      ta.remove();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    }
    slot.textContent = ok ? tr("已复制") : tr("复制失败");
    schedule2(() => {
      if (slot.isConnected) slot.textContent = label;
    }, 1600);
    return ok;
  }
  var AMBIENCE_LABELS = {
    diagonal: "对角漫染",
    galaxy: "漫天星辰",
    corner: "角落微光",
    stream: "斜光流转",
    wash: "水彩晕染",
    clear: "清透留白",
    off: "不显示"
  };
  function ambienceRows() {
    return Object.keys(AMBIENCE_PRESETS).map((scheme) => {
      const current = readAmbience(scheme);
      const buttons = AMBIENCE_PRESETS[scheme].map((preset) => `<button type="button" class="dsh-bloom-ambience__btn" data-preset="${preset}" role="radio" aria-checked="${preset === current}" data-active="${preset === current}">${tr(AMBIENCE_LABELS[preset])}</button>`).join("");
      const hint = scheme === "dark" ? tr("深色背景") : tr("浅色背景");
      return `<div class="dsh-bloom-ambience" data-scheme="${scheme}" role="radiogroup" aria-label="${hint}">${buttons}</div>`;
    }).join("");
  }
  var switcherSerial = 0;
  function buildSwitcherHTML(currentVariant) {
    const sharePanelId = `dsh-bloom-share-${++switcherSerial}`;
    const shown = FEATURED_VARIANTS.includes(currentVariant) ? FEATURED_VARIANTS : [currentVariant, ...FEATURED_VARIANTS];
    const rotationOptions = ROTATION_MINUTES.map((m) => `<option value="${m}"${readRotationMinutes() === m ? " selected" : ""}>${m ? tr("{0} 分钟", m) : tr("关闭自动换色")}</option>`).join("");
    const options = shown.map((v) => {
      const on = v === currentVariant;
      return `<button type="button" class="dsh-bloom-option" role="option" data-variant="${v}" aria-selected="${on}" data-active="${on}" title="${variantName(v)} · ${variantPoem(v)}"><span class="dsh-bloom-dot" style="${dotStyle(v)}"></span><span class="dsh-bloom-option__name">${variantName(v)}${isNewVariant(v, PLUGIN_VERSION) ? `<span class="dsh-bloom-option__new">${tr("新")}</span>` : ""}</span><span class="dsh-bloom-option__en" lang="${getLang()}" style="${poemStyle(v)}">${variantPoem(v)}</span><span class="dsh-bloom-check" aria-hidden="true">✓</span></button>`;
    }).join("");
    return `<div class="dsh-bloom-switcher" data-plugin="${PLUGIN_ID}">
  <button type="button" class="dsh-bloom-trigger" aria-haspopup="dialog" aria-expanded="false" title="${tr("Bloom 主题 · v{0}", PLUGIN_VERSION)}">
    <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
    <span class="dsh-bloom-trigger__name">${variantName(currentVariant)}</span>
    <svg class="dsh-bloom-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="dsh-bloom-menu" lang="${getLang()}" role="dialog" aria-label="${tr("Bloom 外观设置")}" hidden>
    <div class="dsh-bloom-head">
      <span class="dsh-bloom-head__title">${tr("外观")}</span>
      <span class="dsh-bloom-head__current">
        <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
        <span data-head-name>${variantName(currentVariant)}</span>
      </span>
      <button type="button" class="dsh-bloom-close" aria-label="${tr("关闭")}">✕</button>
    </div>
    <div class="dsh-bloom-section">${tr("主题")}</div>
    <div class="dsh-bloom-options" role="listbox" aria-label="${tr("配色")}">${options}</div>
    <div class="dsh-bloom-section" data-mode-section hidden>${tr("模式")}</div>
    <div class="dsh-bloom-appearance" role="group" aria-label="${tr("深浅模式")}" hidden>
      <div class="dsh-bloom-appearance__seg">
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="light">${tr("浅色")}</button>
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="dark">${tr("深色")}</button>
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="system">${tr("跟随系统")}</button>
      </div>
    </div>
    <div class="dsh-bloom-section">${tr("质感")}</div>
    <div class="dsh-bloom-glass" role="group" aria-label="${tr("质感")}">
      <div class="dsh-bloom-glass__choices">
        <button type="button" class="dsh-bloom-glass__choice" data-glass="frosted">${tr("毛玻璃")}</button>
        <button type="button" class="dsh-bloom-glass__choice" data-glass="matte">${tr("磨砂玻璃")}</button>
        <button type="button" class="dsh-bloom-glass__choice" data-glass="liquid">${tr("液态玻璃")}</button>
      </div>
      <p class="dsh-bloom-glass__hint" data-glass-hint hidden></p>
    </div>
    <div class="dsh-bloom-section">${tr("背景")}</div>
    ${ambienceRows()}
    <div class="dsh-bloom-meteor-color" role="radiogroup" aria-label="${tr("流星颜色")}">
      <span>${tr("流星颜色")}</span>
      ${["solid", "colorful"].map((mode) => `<button type="button" data-meteor-color="${mode}" role="radio" aria-checked="${readMeteorColorMode() === mode}" data-active="${readMeteorColorMode() === mode}">${tr(mode === "solid" ? "纯色" : "彩色")}</button>`).join("")}
    </div>
    <label class="dsh-bloom-rotation">${tr("自动换色")}
      <select class="dsh-bloom-rotation__select" aria-label="${tr("自动换色")}">
        ${rotationOptions}
      </select>
    </label>
    <div class="dsh-bloom-more-body" hidden data-open="false" data-instant="true">
      <div class="dsh-bloom-more-inner">
      ${changelogHTML()}
      <div class="dsh-bloom-version" role="separator">
        <span class="dsh-bloom-version__update" hidden></span>
      </div>
      <div class="dsh-bloom-dsh-update" role="separator">
        <div class="dsh-bloom-dsh-row">
          <span class="dsh-bloom-dsh-label">DSH</span>
          <span class="dsh-bloom-dsh-ver" data-dsh-current>—</span>
          <span class="dsh-bloom-dsh-platform" data-dsh-platform hidden></span>
          <span class="dsh-bloom-dsh-state" data-dsh-state></span>
          <span class="dsh-bloom-dsh-spacer"></span>
          <button type="button" class="dsh-bloom-dsh-btn" data-act="refresh" title="${tr("重新检查 DSH 最新版")}">↻</button>
          <button type="button" class="dsh-bloom-dsh-btn dsh-bloom-dsh-btn--primary" data-act="copy" title="${tr("检查到可用版本后，把升级命令直接填进下方输入框")}">${tr("填入")}</button>
        </div>
        <div class="dsh-bloom-dsh-row dsh-bloom-dsh-row--latest">
          <span class="dsh-bloom-dsh-label">${tr("最新")}</span>
          <span class="dsh-bloom-dsh-ver" data-dsh-latest>${tr("检查中…")}</span>
        </div>
        <div class="dsh-bloom-dsh-hint" data-dsh-hint hidden></div>
        <div class="dsh-bloom-dsh-row">
          <button type="button" class="dsh-bloom-dsh-btn dsh-bloom-diagnose" title="${tr("复制排错诊断信息（在 GitHub 提交 Issue 时粘贴）")}">${ICON_DIAGNOSE}<span>${tr("复制诊断")}</span></button>
          <a class="dsh-bloom-foot__link" data-track="vote" href="https://github.com/webkubor/dsh-bloom-theme/discussions/26" target="_blank" rel="noopener noreferrer">${tr("配色投票")}</a>
        </div>
        <label class="dsh-bloom-telemetry" title="${tr("只上报按钮点击的事件名和版本，不含对话内容")}">
          <input type="checkbox" class="dsh-bloom-telemetry__box" data-telemetry${telemetryEnabled() ? " checked" : ""}>
          <span class="dsh-bloom-telemetry__box-ui" aria-hidden="true"></span>
          <span class="dsh-bloom-telemetry__text">${tr("发送匿名使用统计")}</span>
        </label>
      </div>
      </div>
    </div>
    <div class="dsh-bloom-foot">
      <button type="button" class="dsh-bloom-more" aria-expanded="false" title="${tr("版本与更新")}">
        <span class="dsh-bloom-more__name">Bloom</span><span class="dsh-bloom-more__ver">v${PLUGIN_VERSION}</span>
        <svg class="dsh-bloom-more__arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M4 2l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="dsh-bloom-foot__links">
        <a class="dsh-bloom-foot__link dsh-bloom-feedback" data-track="feedback" href="https://github.com/webkubor/dsh-bloom-theme/issues/new" target="_blank" rel="noopener noreferrer" title="${tr("填写反馈，自动附上基础诊断")}">${ICON_CHAT}<span>${tr("反馈")}</span></a>
        <a class="dsh-bloom-foot__link dsh-bloom-star" href="https://github.com/webkubor/dsh-bloom-theme" target="_blank" rel="noopener noreferrer" title="${tr("喜欢 Bloom？欢迎去 GitHub 点个 Star")}">${ICON_STAR}<span>${tr("点个星")}</span></a>
        <span class="dsh-bloom-share-wrap">
          <button type="button" class="dsh-bloom-foot__link dsh-bloom-share" aria-expanded="false" aria-controls="${sharePanelId}">${ICON_SHARE}<span>${tr("分享")}</span></button>
          <span id="${sharePanelId}" class="dsh-bloom-share-panel" role="group" aria-label="${tr("分享 Bloom")}" hidden>
            <span class="dsh-bloom-share-intro">${tr("喜欢 Bloom？欢迎分享，也欢迎到仓库点个 Star。")}</span>
            <button type="button" class="dsh-bloom-share-action dsh-bloom-share-install"><span class="dsh-bloom-share-action__title">${tr("复制安装提示词")}</span><span class="dsh-bloom-share-action__hint">${tr("发给 Agent，帮你安装")}</span></button>
            <button type="button" class="dsh-bloom-share-action" data-share-capture="screenshot"><span class="dsh-bloom-share-action__title">${tr("截图分享")}</span><span class="dsh-bloom-share-action__hint">${tr("选择要展示的屏幕、窗口或标签页")}</span></button>
            <button type="button" class="dsh-bloom-share-action" data-share-capture="record"><span class="dsh-bloom-share-action__title">${tr("录制 5 秒")}</span><span class="dsh-bloom-share-action__hint">${tr("记录动态界面，不录制声音")}</span></button>
            <textarea class="dsh-bloom-share-manual" aria-label="${tr("安装提示词")}" readonly hidden></textarea>
            <span class="dsh-bloom-share-status" role="status" aria-live="polite"></span>
            <button type="button" class="dsh-bloom-share-cancel" hidden>${tr("取消")}</button>
            <span class="dsh-bloom-share-result" hidden><button type="button" class="dsh-bloom-share-system" hidden>${tr("分享文件")}</button><a class="dsh-bloom-share-save" download>${tr("保存文件")}</a></span>
          </span>
        </span>
      </span>
    </div>
  </div>
</div>`;
  }
  var closeShareSessions = /* @__PURE__ */ new WeakMap();
  function closeMenu(root) {
    closeShareSessions.get(root)?.();
    const menu = root.querySelector(".dsh-bloom-menu");
    const trigger = root.querySelector(".dsh-bloom-trigger");
    if (menu) {
      menu.hidden = true;
      menu.classList.remove("is-entering");
    }
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }
  function playEnter(menu) {
    menu.classList.remove("is-entering");
    void menu.offsetWidth;
    menu.classList.add("is-entering");
  }
  function setMoreOpen(root, open) {
    const more = root.querySelector(".dsh-bloom-more");
    const body = root.querySelector(".dsh-bloom-more-body");
    if (!more || !body) return;
    body.dataset.instant = "false";
    body.hidden = false;
    body.dataset.open = String(open);
    more.setAttribute("aria-expanded", String(open));
    if (!open) {
      window.setTimeout(() => {
        if (body.dataset.open !== "true") body.hidden = true;
      }, 300);
    }
  }
  function rerenderMenu(el, variant) {
    const holder = document.createElement("div");
    holder.innerHTML = buildSwitcherHTML(variant);
    const fresh = holder.querySelector(".dsh-bloom-menu");
    const cur = el.querySelector(".dsh-bloom-menu");
    const moreWasOpen = el.querySelector(".dsh-bloom-more")?.getAttribute("aria-expanded") === "true";
    if (fresh && cur) {
      fresh.hidden = cur.hidden;
      cur.replaceWith(fresh);
    }
    if (moreWasOpen) {
      const more = el.querySelector(".dsh-bloom-more");
      const body = el.querySelector(".dsh-bloom-more-body");
      if (more) more.setAttribute("aria-expanded", "true");
      if (body) {
        body.dataset.instant = "true";
        body.hidden = false;
        body.dataset.open = "true";
      }
    }
    const name = el.querySelector(".dsh-bloom-trigger__name");
    if (name) name.textContent = variantName(variant);
    const trigger = el.querySelector(".dsh-bloom-trigger");
    if (trigger) trigger.setAttribute("title", tr("Bloom 主题 · v{0}", PLUGIN_VERSION));
    syncAppearanceRow(el);
    fresh?.querySelectorAll(".dsh-bloom-option").forEach((opt) => opt.setAttribute("tabindex", "-1"));
    refreshUpdateBadge();
    renderDshUpdate();
  }
  function syncAppearanceRow(el) {
    const row = el.querySelector(".dsh-bloom-appearance");
    if (!row) return;
    const sec = el.querySelector("[data-mode-section]");
    row.hidden = false;
    if (sec) sec.hidden = false;
    const stored = readStoredMode();
    for (const btn of Array.from(row.querySelectorAll(".dsh-bloom-appearance__btn"))) {
      const on = btn.dataset.mode === stored;
      btn.dataset.active = String(on);
      btn.setAttribute("aria-pressed", String(on));
    }
  }
  function syncGlassRow(el) {
    const row = el.querySelector(".dsh-bloom-glass");
    if (!row) return;
    const stored = readGlassMode();
    const effective = effectiveGlassMode();
    const shown = stored === "auto" ? effective === "solid" ? "liquid" : effective : stored;
    for (const btn of Array.from(row.querySelectorAll(".dsh-bloom-glass__choice"))) {
      const on = btn.dataset.glass === shown;
      btn.dataset.active = String(on);
      btn.setAttribute("aria-pressed", String(on));
    }
    const hint = row.querySelector("[data-glass-hint]");
    if (!hint) return;
    const systemDowngraded = effective === "solid";
    hint.hidden = !systemDowngraded;
    if (systemDowngraded) {
      hint.textContent = tr("系统设置已降低透明效果；已保留你的质感选择。");
    }
  }
  var switcherCleanups = /* @__PURE__ */ new Map();
  function disposeSwitcher(el) {
    switcherCleanups.get(el)?.();
    switcherCleanups.delete(el);
  }
  function cleanupSwitcher() {
    for (const el of switcherCleanups.keys()) disposeSwitcher(el);
  }
  function buildSwitcherEl(initialVariant) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildSwitcherHTML(initialVariant);
    const el = wrapper.firstElementChild;
    const capture = createShareCapture();
    const timers = /* @__PURE__ */ new Set();
    let disposed = false;
    let shareFile;
    let shareUrl;
    let shareRequest = 0;
    const schedule2 = (fn, delay) => {
      if (disposed) return;
      const timer2 = setTimeout(() => {
        timers.delete(timer2);
        fn();
      }, delay);
      timers.add(timer2);
    };
    const releaseShareFile = () => {
      if (shareUrl) URL.revokeObjectURL(shareUrl);
      shareUrl = void 0;
      shareFile = void 0;
    };
    const closeShare = () => {
      shareRequest++;
      capture.cancel();
      releaseShareFile();
      const panel = el.querySelector(".dsh-bloom-share-panel");
      if (panel) panel.hidden = true;
      el.querySelector(".dsh-bloom-share")?.setAttribute("aria-expanded", "false");
      const status = el.querySelector(".dsh-bloom-share-status");
      if (status) status.textContent = "";
      const result = el.querySelector(".dsh-bloom-share-result");
      if (result) result.hidden = true;
      const manual = el.querySelector(".dsh-bloom-share-manual");
      if (manual) {
        manual.value = "";
        manual.hidden = true;
      }
      const cancel = el.querySelector(".dsh-bloom-share-cancel");
      if (cancel) cancel.hidden = true;
      el.querySelectorAll("[data-share-capture]").forEach((button) => {
        button.disabled = false;
      });
    };
    closeShareSessions.set(el, closeShare);
    const shareStatus = (message) => {
      const status = el.querySelector(".dsh-bloom-share-status");
      if (status) status.textContent = message;
    };
    const showShareFile = (file) => {
      releaseShareFile();
      shareFile = file;
      const result = el.querySelector(".dsh-bloom-share-result");
      const save = el.querySelector(".dsh-bloom-share-save");
      const system = el.querySelector(".dsh-bloom-share-system");
      if (!result || !save || !system) return;
      try {
        shareUrl = URL.createObjectURL(file);
      } catch {
      }
      save.hidden = !shareUrl;
      if (shareUrl) {
        save.href = shareUrl;
        save.download = file.name;
      }
      let canShare = false;
      try {
        canShare = typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
      } catch {
      }
      system.hidden = !canShare;
      result.hidden = !canShare && !shareUrl;
      shareStatus(result.hidden ? tr("无法准备文件，请检查浏览器权限") : canShare ? tr("文件已准备好，可分享或保存") : tr("文件已准备好，保存后即可分享"));
    };
    const startCapture = (kind) => {
      releaseShareFile();
      const result = el.querySelector(".dsh-bloom-share-result");
      if (result) result.hidden = true;
      const request = ++shareRequest;
      el.querySelectorAll("[data-share-capture]").forEach((button) => {
        button.disabled = true;
      });
      const cancel = el.querySelector(".dsh-bloom-share-cancel");
      if (cancel) {
        cancel.hidden = false;
        cancel.focus({ preventScroll: true });
      }
      shareStatus(kind === "record" ? tr("请选择屏幕、窗口或标签页，将录制 5 秒且不录音") : tr("请选择要截图的屏幕、窗口或标签页"));
      const pending = kind === "record" ? capture.record() : capture.screenshot();
      void pending.then((outcome) => {
        if (disposed || request !== shareRequest || !el.isConnected) return;
        el.querySelectorAll("[data-share-capture]").forEach((button) => {
          button.disabled = false;
        });
        const cancel2 = el.querySelector(".dsh-bloom-share-cancel");
        if (cancel2) cancel2.hidden = true;
        if (outcome.kind === "success") {
          showShareFile(outcome.file);
          return;
        }
        const captureFailed = tr("无法打开屏幕选择器或完成捕获，可能是宿主不支持、系统权限受限或已取消；可使用系统截图或录屏工具");
        const messages = {
          cancelled: tr("已取消"),
          denied: captureFailed,
          unsupported: tr("当前环境不支持直接截图或录屏"),
          busy: tr("请先结束当前操作"),
          ended: tr("屏幕共享已结束"),
          failed: captureFailed
        };
        shareStatus(messages[outcome.kind] ?? messages.failed);
      }).catch(() => {
        if (disposed || request !== shareRequest || !el.isConnected) return;
        el.querySelectorAll("[data-share-capture]").forEach((button) => {
          button.disabled = false;
        });
        const cancel2 = el.querySelector(".dsh-bloom-share-cancel");
        if (cancel2) cancel2.hidden = true;
        shareStatus(tr("无法打开屏幕选择器或完成捕获，可能是宿主不支持、系统权限受限或已取消；可使用系统截图或录屏工具"));
      });
    };
    const onLanguageChange = () => {
      closeShare();
      if (el.isConnected) rerenderMenu(el, readVariant());
    };
    window.addEventListener(LANG_CHANGE_EVENT, onLanguageChange);
    startRotation(applyVariant);
    const openMenu = () => {
      const wanted = readVariant();
      const options = el.querySelectorAll(".dsh-bloom-option");
      const currentlyShown = [...options].map((opt) => opt.dataset.variant);
      const expected = FEATURED_VARIANTS.includes(wanted) ? FEATURED_VARIANTS : [wanted, ...FEATURED_VARIANTS];
      if (expected.some((v, i) => v !== currentlyShown[i]) || currentlyShown.length !== expected.length) rerenderMenu(el, wanted);
      const menu = el.querySelector(".dsh-bloom-menu");
      const trigger = el.querySelector(".dsh-bloom-trigger");
      menu.hidden = false;
      playEnter(menu);
      trigger.setAttribute("aria-expanded", "true");
      syncAppearanceRow(el);
      syncGlassRow(el);
      const active = menu.querySelector('.dsh-bloom-option[data-active="true"]') || menu.querySelector(".dsh-bloom-option");
      active?.focus();
    };
    el.addEventListener("change", (e) => {
      const control = e.target.closest(".dsh-bloom-rotation__select");
      if (control) {
        setRotationMinutes(Number(control.value));
        return;
      }
      const box = e.target.closest(".dsh-bloom-telemetry__box");
      if (box) {
        setTelemetryEnabled(box.checked);
      }
    });
    el.addEventListener("click", (e) => {
      const target = e.target;
      const tracked = target.closest("[data-track]");
      if (tracked?.dataset.track) track(tracked.dataset.track);
      if (target.closest(".dsh-bloom-close")) {
        closeMenu(el);
        return;
      }
      const meteorBtn = target.closest("[data-meteor-color]");
      if (meteorBtn) {
        const mode = meteorBtn.dataset.meteorColor;
        if (mode === "solid" || mode === "colorful") {
          writeMeteorColorMode(mode);
          el.querySelectorAll("[data-meteor-color]").forEach((button) => {
            const active = button.dataset.meteorColor === mode;
            button.dataset.active = String(active);
            button.setAttribute("aria-checked", String(active));
          });
        }
        e.stopPropagation();
        return;
      }
      const ambienceBtn = target.closest(".dsh-bloom-ambience__btn");
      if (ambienceBtn) {
        e.stopPropagation();
        const row = ambienceBtn.closest(".dsh-bloom-ambience");
        const scheme = row?.dataset.scheme;
        if (row && scheme && writeAmbience(scheme, ambienceBtn.dataset.preset ?? "")) {
          row.querySelectorAll(".dsh-bloom-ambience__btn").forEach((b) => {
            const on = b === ambienceBtn;
            b.dataset.active = String(on);
            b.setAttribute("aria-checked", String(on));
          });
        }
        return;
      }
      const diagnose = target.closest(".dsh-bloom-diagnose");
      if (diagnose) {
        e.stopPropagation();
        track("diagnose");
        void copyDiagnostics(diagnose);
        return;
      }
      const feedback = target.closest(".dsh-bloom-feedback");
      if (feedback) {
        try {
          feedback.href = buildFeedbackUrl(formatDiagnosticsMarkdown(), getLang());
        } catch {
        }
        return;
      }
      const install = target.closest(".dsh-bloom-share-install");
      if (install) {
        e.stopPropagation();
        void shareInstall(install, schedule2).then((ok) => {
          if (ok || disposed || !install.isConnected) return;
          const manual = el.querySelector(".dsh-bloom-share-manual");
          if (manual) {
            manual.value = buildShareText();
            manual.hidden = false;
            manual.focus();
            manual.select();
          }
          shareStatus(tr("复制失败，请手动复制"));
        });
        return;
      }
      const cancelCapture = target.closest(".dsh-bloom-share-cancel");
      if (cancelCapture) {
        e.stopPropagation();
        closeShare();
        el.querySelector(".dsh-bloom-share")?.focus();
        return;
      }
      const captureAction = target.closest("[data-share-capture]");
      if (captureAction) {
        e.stopPropagation();
        if (captureAction.dataset.shareCapture === "screenshot" || captureAction.dataset.shareCapture === "record") startCapture(captureAction.dataset.shareCapture);
        return;
      }
      const systemShare = target.closest(".dsh-bloom-share-system");
      if (systemShare && shareFile && typeof navigator.share === "function") {
        e.stopPropagation();
        try {
          void navigator.share({ files: [shareFile], title: "Bloom" }).catch((error) => {
            if (!disposed) shareStatus(error instanceof Error && error.name === "AbortError" ? tr("已取消") : tr("无法分享，请先保存文件"));
          });
        } catch {
          shareStatus(tr("无法分享，请先保存文件"));
        }
        return;
      }
      const share = target.closest(".dsh-bloom-share");
      if (share) {
        e.stopPropagation();
        const panel = el.querySelector(".dsh-bloom-share-panel");
        if (!panel) return;
        if (!panel.hidden) closeShare();
        else {
          track("share");
          panel.hidden = false;
          share.setAttribute("aria-expanded", "true");
        }
        return;
      }
      const more = target.closest(".dsh-bloom-more");
      if (more) {
        const nowOpen = more.getAttribute("aria-expanded") === "true";
        if (!nowOpen) track("version-open");
        setMoreOpen(el, !nowOpen);
        return;
      }
      const modeBtn = target.closest(".dsh-bloom-appearance__btn[data-mode]");
      if (modeBtn) {
        setMode(modeBtn.dataset.mode);
        syncAppearanceRow(el);
        return;
      }
      const glassBtn = target.closest(".dsh-bloom-glass__choice[data-glass]");
      if (glassBtn) {
        writeGlassMode(glassBtn.dataset.glass);
        syncGlassRow(el);
        return;
      }
      const trigger = e.target.closest(".dsh-bloom-trigger");
      if (trigger) {
        const menu = el.querySelector(".dsh-bloom-menu");
        if (menu.hidden) openMenu();
        else closeMenu(el);
        return;
      }
      const opt = e.target.closest(".dsh-bloom-option");
      if (opt) {
        applyVariant(opt.dataset.variant);
        closeMenu(el);
        el.querySelector(".dsh-bloom-trigger")?.focus();
        return;
      }
    });
    el.addEventListener("keydown", (e) => {
      const menu = el.querySelector(".dsh-bloom-menu");
      const trigger = el.querySelector(".dsh-bloom-trigger");
      const options = [...menu.querySelectorAll(".dsh-bloom-option")];
      const idx = options.indexOf(document.activeElement);
      const meteorChoice = e.target instanceof Element ? e.target.closest("[data-meteor-color]") : null;
      if (meteorChoice && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        const other = el.querySelector(`[data-meteor-color="${meteorChoice.dataset.meteorColor === "solid" ? "colorful" : "solid"}"]`);
        if (other) {
          e.preventDefault();
          other.click();
          other.focus();
        }
        return;
      }
      const sharePanel = el.querySelector(".dsh-bloom-share-panel");
      const shareTrigger = el.querySelector(".dsh-bloom-share");
      if (sharePanel && !sharePanel.hidden) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeShare();
          shareTrigger?.focus();
          return;
        }
        const withinShare = e.target instanceof Element && (sharePanel.contains(e.target) || e.target === shareTrigger);
        if (withinShare && !(e.target instanceof HTMLTextAreaElement) && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
          const actions = [...sharePanel.querySelectorAll("button:not([disabled]), a[href], textarea:not([hidden])")].filter((node) => node.getClientRects().length > 0);
          if (actions.length) {
            e.preventDefault();
            const index = actions.indexOf(document.activeElement);
            actions[e.key === "ArrowDown" ? (index + 1) % actions.length : index <= 0 ? actions.length - 1 : index - 1]?.focus();
          }
          return;
        }
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        if (e.key === "Escape") {
          closeMenu(el);
          trigger?.focus();
        }
        return;
      }
      if (document.activeElement === trigger && menu.hidden) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openMenu();
        }
        return;
      }
      if (menu.hidden) return;
      switch (e.key) {
        case "Escape":
          closeMenu(el);
          trigger?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          options[(idx + 1) % options.length]?.focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          options[(idx - 1 + options.length) % options.length]?.focus();
          break;
        case "Home":
          e.preventDefault();
          options[0]?.focus();
          break;
        case "End":
          e.preventDefault();
          options[options.length - 1]?.focus();
          break;
        case "Enter":
        case " ":
          if (idx >= 0) {
            e.preventDefault();
            applyVariant(options[idx].dataset.variant);
            closeMenu(el);
            trigger?.focus();
          }
          break;
        case "Tab": {
          const stops = Array.from(menu.querySelectorAll('button:not([disabled]), select, a[href], [tabindex="0"]')).filter((node) => node.tabIndex >= 0 && node.getClientRects().length > 0);
          const edge = e.shiftKey ? stops[0] : stops[stops.length - 1];
          if (document.activeElement === edge) {
            e.preventDefault();
            closeMenu(el);
            trigger?.focus();
          }
          break;
        }
      }
    });
    el.querySelectorAll(".dsh-bloom-option").forEach((opt) => {
      opt.setAttribute("tabindex", "-1");
    });
    const onOutsideClick = (e) => {
      if (!el.contains(e.target)) closeMenu(el);
    };
    document.addEventListener("click", onOutsideClick);
    switcherCleanups.set(el, () => {
      disposed = true;
      closeShare();
      capture.dispose();
      closeShareSessions.delete(el);
      for (const timer2 of timers) clearTimeout(timer2);
      timers.clear();
      window.removeEventListener(LANG_CHANGE_EVENT, onLanguageChange);
      document.removeEventListener("click", onOutsideClick);
    });
    return el;
  }
  function mountSwitcher(host, anchor) {
    injectCSS(SWITCHER_CSS, "switcher.css");
    const el = buildSwitcherEl(readVariant());
    el.dataset.slotted = "true";
    host.append(el);
    const trigger = el.querySelector(".dsh-bloom-trigger");
    let last = "";
    let size = "";
    const position = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const width = Math.ceil(triggerRect.width);
      const height = Math.ceil(triggerRect.height);
      const measured = `${width}|${height}`;
      if (measured !== size) {
        size = measured;
        anchor.style.width = `${width}px`;
        anchor.style.height = `${height}px`;
      }
      const box = anchor.getBoundingClientRect();
      const covered = Array.from(document.querySelectorAll('dialog[open], [role="dialog"][aria-modal="true"]')).some((modal) => !el.contains(modal) && modal.getClientRects().length > 0 && getComputedStyle(modal).visibility !== "hidden");
      const key = `${box.left}|${box.top}|${box.width}|${box.height}|${window.innerHeight}|${covered}`;
      if (key === last) return;
      last = key;
      el.style.visibility = box.width && box.height && !covered ? "visible" : "hidden";
      if (covered) closeMenu(el);
      el.style.left = `${box.left}px`;
      el.style.top = `${box.top}px`;
      el.style.setProperty("--bloom-menu-max-h", `${Math.max(160, window.innerHeight - box.bottom - 18)}px`);
    };
    position();
    let frame = 0;
    const track2 = () => {
      position();
      frame = requestAnimationFrame(track2);
    };
    frame = requestAnimationFrame(track2);
    const observer = new ResizeObserver(position);
    observer.observe(anchor);
    observer.observe(trigger);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    refreshUpdateBadge();
    renderDshUpdate();
    void checkDshLatest();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      disposeSwitcher(el);
      el.remove();
      anchor.style.removeProperty("width");
      anchor.style.removeProperty("height");
    };
  }

  // src/liquid-lens.ts
  var SVG_NS = "http://www.w3.org/2000/svg";
  var XLINK_NS = "http://www.w3.org/1999/xlink";
  var LIQUID_LENS_ID = "dsh-bloom-liquid-lens";
  function channelMap(channel) {
    const vertical = channel === "g";
    const color = (v) => vertical ? `rgb(0,${v},0)` : `rgb(${v},0,0)`;
    const stops = [[0, 232], [0.035, 160], [0.08, 128], [0.92, 128], [0.965, 96], [1, 24]];
    const svg = `<svg xmlns="${SVG_NS}" width="128" height="128"><defs><linearGradient id="r" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([at, value]) => `<stop offset="${at}" stop-color="${color(value)}"/>`).join("")}</linearGradient></defs><rect width="128" height="128" fill="url(#r)"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  function buildLiquidLens(doc) {
    const svg = doc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:fixed;pointer-events:none";
    const defs = doc.createElementNS(SVG_NS, "defs");
    const filter = doc.createElementNS(SVG_NS, "filter");
    filter.id = LIQUID_LENS_ID;
    filter.setAttribute("x", "0%");
    filter.setAttribute("y", "0%");
    filter.setAttribute("width", "100%");
    filter.setAttribute("height", "100%");
    filter.setAttribute("color-interpolation-filters", "sRGB");
    filter.setAttribute("primitiveUnits", "objectBoundingBox");
    for (const channel of ["r", "g"]) {
      const image = doc.createElementNS(SVG_NS, "feImage");
      image.setAttribute("href", channelMap(channel));
      image.setAttributeNS(XLINK_NS, "xlink:href", channelMap(channel));
      image.setAttribute("width", "1");
      image.setAttribute("height", "1");
      image.setAttribute("preserveAspectRatio", "none");
      image.setAttribute("result", channel);
      filter.append(image);
    }
    const map = doc.createElementNS(SVG_NS, "feComposite");
    for (const [key, value] of Object.entries({ in: "r", in2: "g", operator: "arithmetic", k2: "1", k3: "1", result: "lens" })) map.setAttribute(key, value);
    const neutral = doc.createElementNS(SVG_NS, "feComponentTransfer");
    neutral.setAttribute("in", "lens");
    neutral.setAttribute("result", "neutral");
    for (const channel of ["R", "G"]) {
      const transfer = doc.createElementNS(SVG_NS, `feFunc${channel}`);
      transfer.setAttribute("type", "linear");
      transfer.setAttribute("slope", "1");
      transfer.setAttribute("intercept", String(0.5 - 128 / 255));
      neutral.append(transfer);
    }
    const bend = doc.createElementNS(SVG_NS, "feDisplacementMap");
    for (const [key, value] of Object.entries({ in: "SourceGraphic", in2: "neutral", scale: "0.016", xChannelSelector: "R", yChannelSelector: "G" })) bend.setAttribute(key, value);
    filter.append(map, neutral, bend);
    defs.append(filter);
    svg.append(defs);
    return svg;
  }

  // src/fog.ts
  var NS = "http://www.w3.org/2000/svg";
  var PREFIX = "dsh-bloom-fog-";
  function element(doc, name, attrs = {}) {
    const node = doc.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    return node;
  }
  function buildFogDefinitions(doc) {
    const svg = element(doc, "svg", { width: 0, height: 0, "aria-hidden": "true", focusable: "false" });
    svg.style.cssText = "position:fixed;pointer-events:none";
    const defs = element(doc, "defs");
    const gradient = element(doc, "radialGradient", { id: `${PREFIX}soft` });
    for (const [offset, opacity] of [["0%", ".50"], ["25%", ".40"], ["65%", ".12"], ["100%", "0"]]) {
      gradient.append(element(doc, "stop", { offset, "stop-color": "white", "stop-opacity": opacity }));
    }
    const noise = element(doc, "filter", { id: `${PREFIX}noise`, filterUnits: "userSpaceOnUse", primitiveUnits: "userSpaceOnUse", x: "-.15", y: "-.15", width: "1.3", height: "1.3", "color-interpolation-filters": "sRGB" });
    noise.append(
      element(doc, "feTurbulence", { type: "fractalNoise", baseFrequency: "8 10", numOctaves: 2, seed: 13, result: "texture" }),
      element(doc, "feDisplacementMap", { in: "SourceGraphic", in2: "texture", scale: ".09", xChannelSelector: "R", yChannelSelector: "G", result: "broken" }),
      element(doc, "feColorMatrix", { in: "texture", type: "matrix", values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.4 0 0 0 -.25", result: "grain" }),
      element(doc, "feComposite", { in: "broken", in2: "grain", operator: "in" })
    );
    defs.append(gradient, noise);
    const masks = Object.fromEntries(["stream", "wash", "clear"].map((name) => {
      const mask = element(doc, "mask", { id: `${PREFIX}${name}`, maskUnits: "objectBoundingBox", maskContentUnits: "objectBoundingBox", x: 0, y: 0, width: 1, height: 1, "mask-type": "luminance" });
      defs.append(mask);
      return [name, mask];
    }));
    const fields = {
      stream: [[0.12, 0.18, 0.27, 0.19, 1], [0.87, 0.82, 0.27, 0.19, 0.85]],
      wash: [[0.24, 0.1, 0.24, 0.15, 0.9], [0.78, 0.13, 0.22, 0.16, 0.85], [0.2, 0.88, 0.22, 0.15, 0.8], [0.78, 0.89, 0.23, 0.15, 0.85]],
      clear: [[-0.02, 0.34, 0.21, 0.3, 0.55], [1.02, 0.66, 0.21, 0.3, 0.55]]
    };
    for (const [name, shapes] of Object.entries(fields)) {
      const group = element(doc, "g", { filter: `url(#${PREFIX}noise)` });
      for (const [cx, cy, rx, ry, opacity] of shapes) {
        group.append(element(doc, "ellipse", { cx, cy, rx, ry, opacity, fill: `url(#${PREFIX}soft)` }));
      }
      masks[name].append(group);
    }
    svg.append(defs);
    return svg;
  }

  // src/ui.ts
  function createBloomComponents(React, installUpdateCheck2) {
    let overlay = null;
    const onOverlayChange = /* @__PURE__ */ new Set();
    function Switcher() {
      const anchor = React.useRef(null);
      React.useEffect(() => {
        let dispose;
        const sync = () => {
          dispose?.();
          dispose = overlay && anchor.current ? mountSwitcher(overlay, anchor.current) : void 0;
        };
        onOverlayChange.add(sync);
        sync();
        return () => {
          onOverlayChange.delete(sync);
          dispose?.();
        };
      }, []);
      return React.createElement("div", {
        ref: anchor,
        className: "dsh-bloom-slot",
        "data-bloom-slot": "switcher",
        "aria-hidden": true
      });
    }
    function Decorations() {
      const host = React.useRef(null);
      React.useEffect(() => {
        const container = host.current;
        if (!container) return;
        const sparkles = buildSparkles(container.ownerDocument);
        const lens = buildLiquidLens(container.ownerDocument);
        const fog = buildFogDefinitions(container.ownerDocument);
        container.append(lens, fog, sparkles);
        const stopUpdates = installUpdateCheck2(container);
        overlay = container;
        onOverlayChange.forEach((sync) => sync());
        return () => {
          overlay = null;
          onOverlayChange.forEach((sync) => sync());
          stopUpdates();
          sparkles.remove();
          lens.remove();
          fog.remove();
        };
      }, []);
      return React.createElement("div", { ref: host, className: "dsh-bloom-overlay", "data-bloom-slot": "decorations" });
    }
    return { Switcher, Decorations };
  }

  // src/typing.ts
  var TYPING_ATTR = "data-bloom-typing";
  var IDLE_MS = 900;
  var disposeCurrent;
  function isComposerInput(el) {
    if (!(el instanceof HTMLElement)) return false;
    if (el.closest('[class*="_composer"]') === null) return false;
    const tag = el.tagName;
    if (tag === "TEXTAREA") return true;
    if (tag === "INPUT") {
      const type = el.type;
      return type === "text" || type === "search" || type === "email";
    }
    return el.isContentEditable;
  }
  function setTyping(on) {
    const body = document.body;
    if (!body) return;
    if (on) body.setAttribute(TYPING_ATTR, "true");
    else body.removeAttribute(TYPING_ATTR);
  }
  function initTypingGlow() {
    if (typeof document === "undefined") return () => {
    };
    disposeCurrent?.();
    let timer2;
    const clearIdle = () => {
      if (timer2 !== void 0) {
        window.clearTimeout(timer2);
        timer2 = void 0;
      }
    };
    const onInput = (e) => {
      if (!isComposerInput(e.target)) return;
      setTyping(true);
      clearIdle();
      timer2 = window.setTimeout(() => {
        timer2 = void 0;
        setTyping(false);
      }, IDLE_MS);
    };
    const onFocusOut = (e) => {
      if (!isComposerInput(e.target)) return;
      clearIdle();
      setTyping(false);
    };
    document.addEventListener("input", onInput, true);
    document.addEventListener("focusout", onFocusOut, true);
    const dispose = () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("focusout", onFocusOut, true);
      clearIdle();
      setTyping(false);
      if (disposeCurrent === dispose) disposeCurrent = void 0;
    };
    disposeCurrent = dispose;
    return dispose;
  }

  // src/teardown.ts
  var BODY_ATTRS = ["data-bloom-variant", "data-bloom-glass", "data-bloom-ambience-dark", "data-bloom-ambience-light", "data-bloom-typing", "data-bloom-update"];
  var NODE_ATTRS = ["data-bloom-think", "data-bloom-think-body", "data-bloom-live-turn"];
  function teardownBloom() {
    if (typeof document === "undefined") return;
    setVersionUpdatesActive(false);
    cleanupSwitcher();
    clearAppearanceSync();
    window.__dshBloomThinkOff__?.();
    window.__dshBloomThinkObserver__?.disconnect();
    window.__dshBloomThinkObserver__ = void 0;
    window.__dshBloomCursorOff__?.();
    window.__dshBloomGlassOff__?.();
    window.__dshBloomGlassOff__ = void 0;
    stopRotation();
    delete window.__BLOOM_DEBUG__;
    document.querySelectorAll(`style[data-plugin="${PLUGIN_ID}"]`).forEach((n) => n.remove());
    document.querySelectorAll(".dsh-bloom-switcher, #dsh-bloom-sparkles, #dsh-bloom-starlight, #dsh-bloom-update-banner").forEach((n) => n.remove());
    const body = document.body;
    if (body) for (const a of BODY_ATTRS) body.removeAttribute(a);
    for (const a of NODE_ATTRS) document.querySelectorAll(`[${a}]`).forEach((n) => n.removeAttribute(a));
    const root = document.documentElement;
    root.style.removeProperty("--bloom-cursor-x");
    root.style.removeProperty("--bloom-cursor-y");
  }

  // src/inspect.ts
  var SURFACES2 = {
    sidebar: '[class*="_sidebarCol"]',
    header: 'header[class*="_header"]',
    composer: 'div[class*="_composer"] div[class*="_card"]',
    composerSeat: '[class*="_composerSeat"]',
    composerDock: '[class*="_composerSeat"] [class*="_dock"] > [class*="_bar"]',
    sendButton: 'div[class*="_composer"] button[class*="_primary"]',
    menu: ".dsh-bloom-menu"
  };
  var STYLES = ["position", "background-color", "background-image", "backdrop-filter", "border-top-width", "border-top-color", "box-shadow", "outline-style", "outline-width", "outline-color", "animation-name", "opacity", "overflow-x", "mask-image"];
  var SCOPES = ["summary", "tables", "surfaces", "canvas", "all"];
  var PAGE_ID = globalThis.crypto?.randomUUID?.() ?? `bloom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  function rect(element2) {
    if (!element2) return null;
    const r = element2.getBoundingClientRect();
    return Object.fromEntries(["x", "y", "width", "height", "right", "bottom"].map((key) => [key, Math.round(r[key] * 100) / 100]));
  }
  function safeCSS(value) {
    return value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g, (_match, _quote, resource) => {
      const fragment = resource.match(/#(dsh-bloom-[a-z0-9-]+)$/i);
      return fragment ? `url("#${fragment[1]}")` : 'url("[resource]")';
    });
  }
  function styles(element2, pseudo) {
    const cs = getComputedStyle(element2, pseudo);
    return Object.fromEntries(STYLES.map((key) => [key, safeCSS(cs.getPropertyValue(key))]));
  }
  function backgroundCascade(element2) {
    if (!element2) return [];
    const found = [];
    function visit(rules, sheet) {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) {
          let matches = false;
          try {
            matches = element2.matches(rule.selectorText);
          } catch {
          }
          if (!matches) continue;
          const declarations = ["background", "background-color", "background-image"].map((property) => ({ property, value: safeCSS(rule.style.getPropertyValue(property)).slice(0, 400), priority: rule.style.getPropertyPriority(property) })).filter((item) => item.value);
          if (declarations.length) found.push({ sheet, selector: rule.selectorText.includes("_sidebarCol") ? "sidebar-specific" : "generic", declarations });
        } else if (rule instanceof CSSMediaRule) {
          if (matchMedia(rule.conditionText).matches) visit(rule.cssRules, sheet);
        } else if (rule instanceof CSSSupportsRule) {
          if (CSS.supports(rule.conditionText)) visit(rule.cssRules, sheet);
        } else if ("cssRules" in rule) {
          visit(rule.cssRules, sheet);
        }
      }
    }
    Array.from(document.styleSheets).forEach((sheet, i) => {
      try {
        visit(sheet.cssRules, i);
      } catch {
      }
    });
    const important = found.filter((rule) => rule.declarations.some((item) => item.priority === "important"));
    return [...important, ...found.filter((rule) => !rule.declarations.some((item) => item.priority === "important")).slice(-20)].slice(-40);
  }
  function scrollerFor(element2) {
    let parent = element2.parentElement;
    while (parent && parent !== document.body) {
      const cs = getComputedStyle(parent);
      if (["auto", "scroll"].includes(cs.overflowX) && parent.scrollWidth > parent.clientWidth + 1) return parent;
      parent = parent.parentElement;
    }
    return null;
  }
  function tableMetrics(table, index) {
    const scroller = scrollerFor(table);
    const row = table.rows[1] || table.rows[0];
    const lastCell = row?.cells[row.cells.length - 1];
    const range = lastCell ? document.createRange() : null;
    if (range && lastCell) range.selectNodeContents(lastCell);
    const content = range?.getBoundingClientRect();
    const bounds = scroller?.getBoundingClientRect();
    const maxScroll = scroller ? scroller.scrollWidth - scroller.clientWidth : 0;
    return {
      index,
      rows: table.rows.length,
      columns: row?.cells.length ?? 0,
      rect: rect(table),
      hasWideContainer: !!table.closest(".md-table-wide"),
      scroller: scroller ? {
        rect: rect(scroller),
        clientWidth: scroller.clientWidth,
        scrollWidth: scroller.scrollWidth,
        scrollLeft: scroller.scrollLeft,
        maxScrollLeft: maxScroll,
        atRightEdge: scroller.scrollLeft >= maxScroll - 1
      } : null,
      lastCell: lastCell ? { rect: rect(lastCell), clientWidth: lastCell.clientWidth, scrollWidth: lastCell.scrollWidth, styles: styles(lastCell) } : null,
      lastContentRect: content ? { left: content.left, right: content.right, width: content.width } : null,
      lastContentWithinScroller: content && bounds ? content.left >= bounds.left - 1 && content.right <= bounds.right + 1 : null
    };
  }
  function collectRuntimeSnapshot(scope3 = "summary", cascade = false) {
    const body = document.body;
    const composer = document.querySelector(SURFACES2.composer);
    const editor = composer?.querySelector('textarea, [contenteditable="true"]');
    const draft = editor instanceof HTMLTextAreaElement ? editor.value : editor?.textContent ?? "";
    const result = {
      page: { id: PAGE_ID, origin: location.origin, pathname: location.pathname, visibility: document.visibilityState, focused: document.hasFocus() },
      viewport: { width: innerWidth, height: innerHeight, devicePixelRatio, documentScrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: body?.scrollWidth ?? 0 },
      bloom: {
        version: PLUGIN_VERSION,
        variant: body?.dataset.bloomVariant ?? null,
        appearance: body?.hasAttribute("data-ds-dark-theme") ? "dark" : "light",
        appearancePreference: readStoredMode(),
        appearanceSource: hasThemeSupport() ? "host" : "legacy",
        glass: readGlassMode(),
        rotationMinutes: readRotationMinutes(),
        ambience: { light: readAmbience("light"), dark: readAmbience("dark") },
        typing: body?.dataset.bloomTyping === "true",
        menuOpen: !!document.querySelector(".dsh-bloom-menu:not([hidden])"),
        lensPresent: !!document.getElementById("dsh-bloom-liquid-lens"),
        fogPresent: ["stream", "wash", "clear"].every((id) => !!document.getElementById(`dsh-bloom-fog-${id}`)),
        captureCapabilities: {
          secureContext: globalThis.isSecureContext === true,
          displayMedia: typeof navigator.mediaDevices?.getDisplayMedia === "function",
          mediaRecorder: typeof globalThis.MediaRecorder === "function",
          fileShare: typeof navigator.share === "function" && typeof navigator.canShare === "function",
          clipboardText: typeof navigator.clipboard?.writeText === "function"
        }
      },
      input: { found: !!editor, rect: rect(editor ?? null), empty: draft.trim().length === 0, length: draft.length, knownTestDraft: draft === "BLOOM UI TEST", focused: !!editor && (document.activeElement === editor || editor.contains(document.activeElement)), typingAnimation: composer ? getComputedStyle(composer, "::after").animationName : null }
    };
    if (scope3 === "canvas" || scope3 === "all") {
      const seat = document.querySelector(SURFACES2.composerSeat);
      const chain = [];
      for (let element2 = seat; element2 && chain.length < 16; element2 = element2.parentElement) {
        const style = getComputedStyle(element2);
        const known = ["composerSeat", "scrollBody", "centerCol", "frame", "root", "body"].filter((name) => element2.className && typeof element2.className === "string" && element2.className.includes(`_${name}`));
        chain.push({ tag: element2.tagName.toLowerCase(), kind: known, rect: rect(element2), color: style.backgroundColor, image: safeCSS(style.backgroundImage), attachment: style.backgroundAttachment, position: style.position, zIndex: style.zIndex, opacity: style.opacity, transform: style.transform, isolation: style.isolation });
      }
      const state = (element2) => element2 ? { rect: rect(element2), ...styles(element2) } : null;
      result.canvas = { chain, html: state(document.documentElement), body: state(body), bodyCascade: cascade ? backgroundCascade(body) : void 0, seatBefore: seat ? styles(seat, "::before") : null };
    }
    if (scope3 === "tables" || scope3 === "all") {
      const tables = Array.from(document.querySelectorAll("table"));
      result.tables = tables.slice(0, 24).map(tableMetrics);
      result.tableCount = tables.length;
      result.tablesTruncated = tables.length > 24;
    }
    if (scope3 === "surfaces" || scope3 === "all") {
      result.background = body ? { before: styles(body, "::before"), after: styles(body, "::after") } : { before: null, after: null };
      if (cascade) result.sidebarCascade = backgroundCascade(document.querySelector(SURFACES2.sidebar));
      result.surfaces = Object.fromEntries(Object.entries(SURFACES2).map(([key, selector]) => {
        const element2 = document.querySelector(selector);
        const inline = element2 instanceof HTMLElement ? Object.fromEntries(["background", "background-color", "background-image"].map((name) => [name, { value: safeCSS(element2.style.getPropertyValue(name)), priority: element2.style.getPropertyPriority(name) }])) : null;
        return [key, element2 ? { rect: rect(element2), element: styles(element2), before: styles(element2, "::before"), after: styles(element2, "::after"), inline } : null];
      }));
      result.glassSummary = Object.fromEntries(Object.entries(SURFACES2).map(([key, selector]) => {
        const element2 = document.querySelector(selector);
        if (!element2) return [key, null];
        const host = getComputedStyle(element2);
        const before = getComputedStyle(element2, "::before");
        const bounds = element2.getBoundingClientRect();
        return [key, {
          filter: host.backdropFilter || "none",
          fill: host.backgroundColor,
          hostBackgroundImage: host.backgroundImage === "none" ? "none" : "image",
          beforeFilter: before.backdropFilter || "none",
          beforeFill: before.backgroundColor,
          beforeImage: before.backgroundImage === "none" ? "none" : "image",
          radius: before.borderTopLeftRadius,
          size: [Math.round(bounds.width), Math.round(bounds.height)]
        }];
      }));
    }
    return result;
  }
  function createBloomInspectProvider() {
    return {
      manifest: {
        id: "BloomDiagnostics",
        description: "Read-only Bloom runtime state and layout metrics; no message content, draft content, URLs with query strings, or mutations.",
        methods: [{
          name: "snapshot",
          description: "Read current theme, viewport, input-state lengths, and optional table or surface geometry. Desktop target rejects other origins; verify the returned page identity.",
          inputSchema: {
            type: "object",
            properties: {
              target: { type: "string", enum: ["desktop", "any"] },
              scope: { type: "string", enum: SCOPES },
              pageId: { type: "string", description: "Optional diagnostic page id returned by a previous snapshot." },
              foreground: { type: "boolean", description: "Require a visible, focused page when identifying the current window." },
              editorLeft: { type: "number", description: "Optional native editor x coordinate relative to the selected window." },
              editorWidth: { type: "number", description: "Optional native editor width for distinguishing pages." },
              cascade: { type: "boolean", description: "Include sanitized sidebar or body background cascade for the selected diagnostic scope." }
            },
            additionalProperties: false
          },
          outputSchema: {
            type: "object",
            required: ["page", "viewport", "bloom", "input"],
            properties: { page: { type: "object" }, viewport: { type: "object" }, bloom: { type: "object" }, input: { type: "object" }, tables: { type: "array", items: { type: "object" } }, tableCount: { type: "integer" }, tablesTruncated: { type: "boolean" }, surfaces: { type: "object" }, canvas: { type: "object" }, background: { type: "object" }, glassSummary: { type: "object" }, sidebarCascade: { type: "array", items: { type: "object" } } },
            additionalProperties: false
          }
        }]
      },
      query(method, input, context) {
        if (method !== "snapshot") throw new Error("Unknown Bloom diagnostics method");
        if (context?.signal?.aborted) throw new Error("Bloom diagnostics query cancelled");
        const target = input?.target ?? "desktop";
        const scope3 = input?.scope ?? "summary";
        if (!["desktop", "any"].includes(target) || !SCOPES.includes(scope3)) throw new Error("Invalid Bloom diagnostics options");
        if (target === "desktop" && location.origin !== "dsh-app://app") throw new Error("This page is not the requested desktop origin");
        if (input?.pageId && input.pageId !== PAGE_ID) throw new Error("This is a different diagnostic page");
        if (input?.foreground && (document.visibilityState !== "visible" || !document.hasFocus())) throw new Error("This page is not in the foreground");
        if (input?.editorLeft !== void 0 || input?.editorWidth !== void 0) {
          const editor = document.querySelector(SURFACES2.composer)?.querySelector('textarea, [contenteditable="true"]');
          if (!editor) throw new Error("This page has no matching editor");
          const bounds = editor.getBoundingClientRect();
          if (input.editorLeft !== void 0 && Math.abs(bounds.x - input.editorLeft) > 8 || input.editorWidth !== void 0 && Math.abs(bounds.width - input.editorWidth) > 8) {
            throw new Error("This is a different editor geometry");
          }
        }
        return collectRuntimeSnapshot(scope3, input?.cascade === true);
      }
    };
  }
  function bindBloomInspect(ctx) {
    if (typeof ctx?.inject !== "function") return;
    ctx.inject(["cordisInspect"], (scope3) => {
      if (typeof scope3.cordisInspect?.register !== "function") return;
      scope3.effect(() => scope3.cordisInspect.register(createBloomInspectProvider()), "dsh-bloom-theme: read-only diagnostics");
    });
  }

  // src/client.ts
  function watchCursorGlow() {
    if (window.__dshBloomCursorBound__) return;
    window.__dshBloomCursorBound__ = true;
    let raf = 0;
    const write = (x, y) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const root = document.documentElement;
        root.style.setProperty("--bloom-cursor-x", `${x * 100}%`);
        root.style.setProperty("--bloom-cursor-y", `${y * 100}%`);
      });
    };
    const onMove = (e) => {
      const v = document.body?.dataset.bloomVariant;
      if (v !== "aurora" && v !== "cinnabar") return;
      write(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.__dshBloomCursorOff__ = () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      window.__dshBloomCursorBound__ = false;
      window.__dshBloomCursorOff__ = void 0;
    };
  }
  function installSkin() {
    let disposed = false;
    const controller = new AbortController();
    const boot = () => {
      if (disposed) return;
      const variant = readVariant();
      injectCSS(buildBloomCSS(), "bloom.css");
      injectCSS(COMPONENT_CSS, "components.css");
      injectCSS(GLASS_CSS + BACKGROUND_CSS + BUTTON_CSS, "glass.css");
      injectCSS(ADAPTIVE_CSS + SURFACES_CSS, "adaptive.css");
      document.body.dataset.bloomVariant = variant;
      initAppearanceSync();
      initAmbience();
      window.__dshBloomGlassOff__ ?? (window.__dshBloomGlassOff__ = initGlassMode());
      setVersionUpdatesActive(true);
      void checkUpdate(controller.signal);
      watchThinkTags();
      watchCursorGlow();
      window.__BLOOM_DEBUG__ = { dump: collectDiagnostics, copy: () => copyDiagnostics() };
    };
    if (document.body) boot();
    else document.addEventListener("DOMContentLoaded", boot, { once: true });
    return () => {
      disposed = true;
      controller.abort();
      document.removeEventListener("DOMContentLoaded", boot);
      teardownBloom();
    };
  }
  var UpdateFailure = class extends Error {
    constructor(key, localizable) {
      super(key);
      this.key = key;
      this.localizable = localizable;
    }
  };
  var pluginManager = null;
  var layout = null;
  var refreshUpdateCapability;
  function bindPluginManager(ctx) {
    if (typeof ctx?.inject !== "function") return;
    ctx.inject(["remote", "remote.pluginManager"], (scope3) => {
      const service = scope3?.remote?.pluginManager;
      if (service && typeof service.updateBundle === "function") {
        scope3.effect(() => {
          pluginManager = service;
          refreshUpdateCapability?.();
          return () => {
            if (pluginManager === service) {
              pluginManager = null;
              refreshUpdateCapability?.();
            }
          };
        });
      }
    });
  }
  function installUpdateCheck(host) {
    if (typeof window === "undefined" || typeof fetch !== "function") return;
    let disposed = false;
    const controller = new AbortController();
    const timers = /* @__PURE__ */ new Set();
    const later = (fn, ms) => {
      const timer2 = setTimeout(() => {
        timers.delete(timer2);
        if (!disposed) fn();
      }, ms);
      timers.add(timer2);
      return timer2;
    };
    const REGISTRY = "https://registry.npmjs.org/" + PLUGIN_ID + "/latest";
    const CHECK_TTL_MS = 24 * 60 * 60 * 1e3;
    const LS_LAST = "dsh-bloom-update-check";
    const LS_DISMISSED = "dsh-bloom-update-dismissed";
    const updateCmd = (v) => tr("dsh plugin --profile <你的profile名> add ") + PLUGIN_ID + "@" + v;
    const RELEASES_URL = "https://github.com/webkubor/dsh-bloom-theme/releases";
    function isNewer(a, b) {
      const [va, pa] = a.split("-"), [vb, pb] = b.split("-");
      const na = va.split(".").map(Number), nb = vb.split(".").map(Number);
      for (let i = 0; i < 3; i++) {
        if ((na[i] || 0) !== (nb[i] || 0)) return (na[i] || 0) > (nb[i] || 0);
      }
      if (!pa && pb) return true;
      if (pa && !pb) return false;
      if (pa && pb) return pa > pb;
      return false;
    }
    const ls = {
      get(k) {
        try {
          return window.localStorage.getItem(k);
        } catch {
          return null;
        }
      },
      set(k, v) {
        try {
          window.localStorage.setItem(k, v);
        } catch {
        }
      }
    };
    const isDesktopHost = () => typeof window.dshDesktop !== "undefined" || typeof window.dshDesktopBoot !== "undefined" || location.protocol === "dsh-app:" || /Electron/i.test(navigator.userAgent);
    let bannerVersion = null;
    let outcome = { kind: "available" };
    const refreshCapability = () => {
      if (outcome.kind === "available" && bannerVersion && document.getElementById("dsh-bloom-update-banner")) showBanner(bannerVersion, true);
    };
    refreshUpdateCapability = refreshCapability;
    const onLanguageChange = () => {
      if (bannerVersion && document.getElementById("dsh-bloom-update-banner")) showBanner(bannerVersion, true);
    };
    window.addEventListener(LANG_CHANGE_EVENT, onLanguageChange);
    function showBanner(latest, refresh = false) {
      if (disposed || !document.body) return;
      const existing = document.getElementById("dsh-bloom-update-banner");
      if (existing && !refresh) return;
      const dismissed = ls.get(LS_DISMISSED);
      if (dismissed === latest) return;
      const isDesktop = isDesktopHost();
      const canUpdate = !!pluginManager?.updateBundle;
      const canOpenPlugins = typeof layout?.selectPanel === "function";
      if (bannerVersion !== latest) outcome = { kind: "available" };
      bannerVersion = latest;
      const el = existing || document.createElement("div");
      el.id = "dsh-bloom-update-banner";
      el.setAttribute("role", "status");
      el.innerHTML = `
      <style>
        /* ⚠️ 这里的颜色**只准用真实存在的 token**。
           原先写的是 var(--bloom-glass-bg, rgba(255,255,255,0.72)) 和
           var(--bloom-tx, inherit) —— 这两个变量**从来没被定义过**，于是：
             背景 fallback 成 rgba(255,255,255,0.72)（一个「亮色」假设的浅白底）
             文字 fallback 成 inherit（继承 DSH 暗色主题的近白色）
           浅白底 + 近白字，实测标题 1.62:1、命令框 1.93:1、「（当前 x.y.z）」
           叠了 opacity:.65 只剩 1.38:1 —— 不是「有点淡」，是几乎不可读。

           这块样式是内联 <style>，不在 src/css/ 里，所以 CSS 常量白名单和视觉审计
           都没扫到它 —— 它烂了很久没人发现，正因为它躲在闸门外面。
           现在一律走 --dsw-alias-* / --bloom-*（都是 tokens.ts 里真实定义的，
           且已按明暗分档），不再自造变量名。 */
        #dsh-bloom-update-banner{position:fixed;right:20px;bottom:20px;z-index:2147483000;
          max-width:340px;padding:14px 16px;border-radius:14px;
          background:color-mix(in oklch,var(--dsw-alias-bg-layer-1,#fff),transparent 12%);
          backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);
          border:1px solid var(--bloom-hairline,rgba(146,168,179,0.35));
          box-shadow:var(--bloom-shadow,0 10px 30px rgba(0,0,0,0.18));
          font:12.5px/1.6 system-ui,-apple-system,'PingFang SC','Segoe UI',sans-serif;
          color:var(--dsw-alias-label-primary,#222);animation:bloom-up-in .45s cubic-bezier(.2,.9,.3,1.2)}
        @keyframes bloom-up-in{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
        #dsh-bloom-update-banner a{color:var(--bloom-accent,#34698c);font-weight:600;text-decoration:none}
        #dsh-bloom-update-banner a:hover{text-decoration:underline}
        #dsh-bloom-update-banner code{font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
          display:block;margin:8px 0;padding:6px 8px;border-radius:8px;word-break:break-all;
          background:var(--bloom-code-bg,rgba(146,168,179,0.13));
          color:var(--dsw-alias-label-primary,#222)}
        #dsh-bloom-update-banner code[hidden]{display:none}
        /* 次要信息用 label-secondary 这个**已按明暗分档且过 AA** 的 token，
           不再用 opacity 硬压 —— opacity 会把对比度再乘一次，1.62 直接掉到 1.38。 */
        #dsh-bloom-update-banner .bloom-upd-cur{color:var(--dsw-alias-label-secondary,#666)}
        #dsh-bloom-update-banner .bloom-upd-actions{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
        #dsh-bloom-update-banner button{font:12px/1 system-ui,sans-serif;padding:7px 12px;border-radius:9px;
          cursor:pointer;border:1px solid var(--bloom-hairline-strong,rgba(146,168,179,0.55));
          background:transparent;color:var(--dsw-alias-label-primary,#222);transition:all .18s}
        #dsh-bloom-update-banner button:hover{border-color:var(--bloom-accent,#34698c);
          color:var(--bloom-accent,#34698c)}
        #dsh-bloom-update-banner button:active{transform:scale(.97)}
        /* 主按钮:accent 底 + label-primary-foreground(即 bg 色)文字。
           PALETTE 的 accent×bg 组合本来就由 contrast-guard 守着 ≥4.5,这条路天然达标;
           原先写死 color:#fff,在亮色档的 accent 上只有 2.3:1。 */
        #dsh-bloom-update-banner button[data-primary]{background:var(--bloom-accent,#34698c);
          color:var(--dsw-alias-label-primary-foreground,#fff);border-color:transparent}
        #dsh-bloom-update-banner button[data-primary]:hover{filter:brightness(1.12)}
        #dsh-bloom-update-banner .bloom-upd-x{position:absolute;top:6px;right:8px;border:none!important;
          background:none!important;padding:4px!important;font-size:14px!important;line-height:1!important}
      </style>
      <div class="bloom-upd-x" title="${tr("关闭（此版本不再提醒）")}">×</div>
      <div class="bloom-upd-body">🌸 <strong>${tr("Bloom 主题有新版本")}</strong>
        ${latest} ${tr("可用")}<span class="bloom-upd-cur">（${tr("当前")} ${PLUGIN_VERSION}）</span></div>
      ${canUpdate ? `<div class="bloom-upd-hint" style="font-size:11px;line-height:1.4;margin:6px 0 2px;color:var(--dsw-alias-label-secondary,#666);padding:4px 8px;border-radius:6px;background:var(--bloom-code-bg,rgba(146,168,179,0.13))">${tr("在应用内点「立即更新」即可，无需终端命令")}</div>` : isDesktop ? `<div class="bloom-upd-hint" style="font-size:11px;line-height:1.4;margin:6px 0 2px;color:var(--dsw-alias-label-secondary,#666);padding:4px 8px;border-radius:6px;background:var(--bloom-code-bg,rgba(146,168,179,0.13))">${tr("当前宿主不支持一键更新，请在侧栏「插件」管理中查看")}</div>` : ""}
      <code${canUpdate || isDesktop ? " hidden" : ""}></code>
      <div class="bloom-upd-actions">
        ${canUpdate ? `<button data-primary data-act="install">${tr("立即更新")}</button>
             <button data-act="open">${tr("更新日志")}</button>` : isDesktop ? `${canOpenPlugins ? `<button data-primary data-act="plugins">${tr("打开插件管理")}</button>` : ""}
               <button data-act="open">${tr("更新日志")}</button>` : `<button data-primary data-act="copy">${tr("复制更新命令")}</button>
               <button data-act="open">${tr("更新日志")}</button>`}
      </div>`;
      el.querySelector("code").textContent = updateCmd(latest);
      el.querySelector(".bloom-upd-x").addEventListener("click", () => {
        ls.set(LS_DISMISSED, latest);
        el.remove();
      });
      el.querySelector('[data-act="plugins"]')?.addEventListener("click", () => {
        layout?.selectPanel("plugins");
      });
      el.querySelector('[data-act="copy"]')?.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        navigator.clipboard?.writeText(updateCmd(latest)).then(() => {
          if (disposed) return;
          btn.textContent = tr("✓ 已复制");
          later(() => btn.textContent = tr("复制更新命令"), 1600);
        }).catch(() => {
        });
      });
      el.querySelector('[data-act="install"]')?.addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        if (btn.disabled) return;
        if (outcome.kind === "installing") return;
        outcome = { kind: "installing" };
        btn.disabled = true;
        btn.textContent = tr("更新中…");
        try {
          const response = await pluginManager?.updateBundle?.(PLUGIN_ID, latest);
          if (disposed) return;
          if (response?.ok === false) throw new UpdateFailure(response.error.message, false);
          if (!response || response.ok !== true) throw new UpdateFailure("宿主未返回有效的更新结果", true);
          const update = response.value;
          if (!update?.result) throw new UpdateFailure("宿主未返回有效的更新结果", true);
          const result = update.result;
          if (result.error) throw new UpdateFailure(result.error.code + (result.error.diagnostic ? "：" + result.error.diagnostic : ""), false);
          if (result.application === "cancelled") throw new UpdateFailure("更新已取消，当前版本保持不变", true);
          if (result.application === "overridden") throw new UpdateFailure("安装配置被覆盖，请在「插件」管理中检查", true);
          if (result.application !== "applied" && result.application !== "restart-required") throw new UpdateFailure("宿主未确认更新成功", true);
          if (update.step !== "install" || update.to !== latest || update.restore) throw new UpdateFailure("宿主未确认更新成功", true);
          const needRestart = result.application === "restart-required";
          outcome = { kind: "installed", version: latest, restart: needRestart };
          const current = document.getElementById("dsh-bloom-update-banner");
          if (current) showInstalled(current, latest, needRestart);
        } catch (error) {
          if (disposed) return;
          const failure = error instanceof UpdateFailure ? error : new UpdateFailure(error instanceof Error ? error.message : String(error), false);
          outcome = { kind: "failed", reason: failure.key, localizableReason: failure.localizable };
          const current = document.getElementById("dsh-bloom-update-banner");
          if (current) showInstallFailed(current, latest, failure.key, failure.localizable);
        }
      });
      el.querySelector('[data-act="open"]').addEventListener("click", () => {
        window.open(RELEASES_URL + "/tag/v" + latest, "_blank", "noopener");
      });
      host.appendChild(el);
      if (outcome.kind === "installing") {
        const button = el.querySelector('[data-act="install"]');
        if (button) {
          button.disabled = true;
          button.textContent = tr("更新中…");
        }
      } else if (outcome.kind === "installed") showInstalled(el, outcome.version || latest, !!outcome.restart);
      else if (outcome.kind === "failed") showInstallFailed(el, latest, outcome.reason || "", !!outcome.localizableReason);
    }
    function showInstalled(el, version, needRestart) {
      const body = el.querySelector(".bloom-upd-body");
      const actions = el.querySelector(".bloom-upd-actions");
      if (!body || !actions) return;
      el.querySelector(".bloom-upd-hint")?.remove();
      body.textContent = needRestart ? tr`已更新到 v${version}，需要重启 DSH 才生效` : tr`已更新到 v${version}`;
      actions.innerHTML = `<button data-act="dismiss">${tr("稍后")}</button>`;
      actions.querySelector('[data-act="dismiss"]')?.addEventListener("click", () => el.remove());
    }
    function showInstallFailed(el, version, reason, localizable) {
      const body = el.querySelector(".bloom-upd-body");
      const actions = el.querySelector(".bloom-upd-actions");
      if (!body || !actions) return;
      el.querySelector(".bloom-upd-hint")?.remove();
      body.style.whiteSpace = "pre-line";
      const detail = localizable ? tr(reason) : reason;
      body.textContent = tr`应用内更新失败：${detail}` + (isDesktopHost() ? "\n" + tr("请在侧栏「插件」管理中检查更新；桌面端无需执行终端命令") : "");
      actions.innerHTML = `<button data-act="retry">${tr("重试")}</button>` + (isDesktopHost() ? "" : `<button data-act="copy">${tr("复制更新命令")}</button>`) + `<button data-act="open">${tr("更新日志")}</button>`;
      actions.querySelector('[data-act="retry"]')?.addEventListener("click", () => {
        outcome = { kind: "available" };
        el.remove();
        showBanner(version);
      });
      actions.querySelector('[data-act="copy"]')?.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        navigator.clipboard?.writeText(updateCmd(version)).then(() => {
          if (disposed) return;
          btn.textContent = tr("✓ 已复制");
          later(() => btn.textContent = tr("复制更新命令"), 1600);
        }).catch(() => {
        });
      });
      actions.querySelector('[data-act="open"]')?.addEventListener("click", () => {
        window.open(RELEASES_URL + "/tag/v" + version, "_blank", "noopener");
      });
    }
    function check() {
      try {
        const last = JSON.parse(ls.get(LS_LAST) || "null");
        if (last && Date.now() - last.at < CHECK_TTL_MS && last.latest === PLUGIN_VERSION) return;
      } catch {
      }
      if (disposed) return;
      const timer2 = later(() => controller.abort(), 5e3);
      fetch(REGISTRY, { cache: "no-store", signal: controller.signal }).then((r) => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))).then((manifest) => {
        if (disposed) return;
        const latest = manifest && manifest.version;
        if (typeof latest !== "string") return;
        ls.set(LS_LAST, JSON.stringify({ at: Date.now(), latest }));
        if (isNewer(latest, PLUGIN_VERSION)) showBanner(latest);
      }).catch(() => {
      }).finally(() => {
        clearTimeout(timer2);
        timers.delete(timer2);
      });
    }
    later(check, 4e3);
    return () => {
      disposed = true;
      controller.abort();
      for (const timer2 of timers) clearTimeout(timer2);
      timers.clear();
      window.removeEventListener(LANG_CHANGE_EVENT, onLanguageChange);
      if (refreshUpdateCapability === refreshCapability) refreshUpdateCapability = void 0;
      document.getElementById("dsh-bloom-update-banner")?.remove();
    };
  }
  function bindLocaleToHost(ctx) {
    if (typeof ctx?.inject !== "function") return;
    ctx.inject(["locale"], (scope3) => attachLocale(scope3));
  }
  function attachLocale(ctx) {
    const locale = ctx.locale;
    if (!locale || typeof locale.bind !== "function") return;
    ctx.effect?.(() => {
      try {
        return locale.register(LOCALE_NS, DICTS) ?? (() => {
        });
      } catch {
        return () => {
        };
      }
    }, "dsh-bloom-theme: dictionaries");
    let unbindLocale;
    try {
      unbindLocale = bindLocale(locale);
    } catch {
    }
    if (unbindLocale) {
      ctx.effect?.(() => unbindLocale, "dsh-bloom-theme: bind locale");
    }
    ctx.effect?.(
      () => {
        try {
          return locale.subscribe?.(() => {
            try {
              window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
            } catch {
            }
          }) ?? (() => {
          });
        } catch {
          return () => {
          };
        }
      },
      "dsh-bloom-theme: follow locale"
    );
  }
  function bindThemeToHost(ctx) {
    if (typeof ctx?.inject !== "function") return;
    ctx.inject(["theme"], (scope3) => {
      const service = scope3?.theme;
      if (!service || typeof service.setTheme !== "function") return;
      scope3.effect?.(() => {
        const release = bindHostTheme(service);
        initAppearanceSync();
        return release;
      }, "dsh-bloom-theme: host theme");
    });
  }
  window.__ModuleLoader__.load({
    id: PLUGIN_ID,
    factory: (require2) => {
      const React = require2("react");
      const { Switcher, Decorations } = createBloomComponents(React, installUpdateCheck);
      const exports = {};
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      exports.inject = ["slots"];
      exports.apply = function apply2(ctx) {
        if (typeof document === "undefined") return;
        bindLocaleToHost(ctx);
        bindThemeToHost(ctx);
        bindPluginManager(ctx);
        ctx.inject(["layout"], (scope3) => {
          scope3.effect(() => {
            const service = scope3.layout;
            layout = service;
            refreshUpdateCapability?.();
            return () => {
              if (layout === service) {
                layout = null;
                refreshUpdateCapability?.();
              }
            };
          }, "dsh-bloom-theme: plugin navigation");
        });
        ctx.effect(() => installSkin(), "dsh-bloom-theme: skin");
        bindBloomInspect(ctx);
        ctx.slots.inject("conversation.header.leading", () => ctx.slots.register({
          name: "conversation.header.leading"
        }, Switcher));
        ctx.slots.inject("shell.overlay", () => ctx.slots.register({
          name: "shell.overlay",
          id: "dsh-bloom-theme.decorations",
          order: -100
        }, Decorations));
        ctx.effect?.(() => initTypingGlow(), "dsh-bloom-theme: typing glow");
      };
      return exports;
    }
  });
})();
