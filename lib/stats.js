/**
 * Bloom · coding stats —— 读取一个本地 Git 仓库，算出可「秀」的开发统计。
 *
 * 设计约束（导师原则）：
 *  - 纯本地、离线、零依赖（只跑 git 二进制 + Node fs）；
 *  - 只读，绝不上传；仓库名/统计是否显示由调用方决定；
 *  - 数据源 = 本地 git 工作树（受 .gitignore 约束，天然排除 node_modules 等），
 *    面向「当前正在写的项目」而非整台机器。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, resolve, dirname, join } from 'node:path';
/** 常见扩展名 → 显示语言名（只统计这些，避免把二进制/巨无霸拖进来）。 */
const EXT_LANG = {
    ts: 'TypeScript', tsx: 'TypeScript', mts: 'TypeScript', cts: 'TypeScript',
    js: 'JavaScript', jsx: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
    css: 'CSS', scss: 'SCSS', sass: 'SCSS', less: 'CSS', html: 'HTML', vue: 'Vue', svelte: 'Svelte',
    md: 'Markdown', mdx: 'Markdown', py: 'Python', go: 'Go', java: 'Java', rs: 'Rust',
    rb: 'Ruby', php: 'PHP', c: 'C', h: 'C/C++', cpp: 'C++', hpp: 'C++', cs: 'C#', swift: 'Swift',
    kt: 'Kotlin', sh: 'Shell', bash: 'Shell', sql: 'SQL', yaml: 'YAML', yml: 'YAML', json: 'JSON',
    toml: 'TOML', xml: 'XML', graphql: 'GraphQL', proto: 'Protobuf', dart: 'Dart', zig: 'Zig',
};
/** 单个大文件（> 1.2MB）不计入行数，避免读库/压缩包拖慢。 */
const MAX_SINGLE_BYTES = 1.2 * 1024 * 1024;
/** 执行 git 命令，容错返回空串 / 抛出前先判断是否 git 仓库。 */
function git(args, cwd) {
    return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim();
}
/** 从 dir 向上找到最近的 git 顶层；找不到返回 null。 */
function findGitRoot(dir) {
    let cur = resolve(dir);
    for (;;) {
        if (existsSync(join(cur, '.git')))
            return cur;
        const parent = dirname(cur);
        if (parent === cur)
            return null;
        cur = parent;
    }
}
/** 由一组 'YYYY-MM-DD' 日期算「最近连续提交天数」：以今天或昨天为锚往前数。 */
function computeStreak(dates) {
    if (dates.length === 0)
        return 0;
    const set = new Set(dates);
    const day = (d) => d.toISOString().slice(0, 10);
    const now = new Date();
    const today = day(now);
    const yest = day(new Date(now.getTime() - 86400000));
    // 从今天开始，若今天没有则从昨天开始（streak 不断）
    let cursor = set.has(today) ? today : (set.has(yest) ? yest : null);
    if (!cursor)
        return 0;
    let streak = 0;
    let t = new Date(cursor + 'T00:00:00Z');
    while (set.has(t.toISOString().slice(0, 10))) {
        streak++;
        t = new Date(t.getTime() - 86400000);
    }
    return streak;
}
/** 读取一个目录的 git 统计。dir 非 git 仓库时向上找最近 git 根。 */
export function computeStats(dir) {
    const root = findGitRoot(dir) ?? resolve(dir);
    const project = basename(root);
    let tracked = [];
    try {
        tracked = git(['ls-files'], root).split('\n').filter(Boolean);
    }
    catch {
        tracked = [];
    }
    const locByLang = {};
    const fileByLang = {};
    let loc = 0;
    let files = tracked.length;
    for (const rel of tracked) {
        const p = join(root, rel);
        const ext = (rel.split('.').pop() || '').toLowerCase();
        const lang = EXT_LANG[ext];
        if (!lang)
            continue;
        let size = 0;
        try {
            size = statSync(p).size;
        }
        catch {
            continue;
        }
        if (size === 0 || size > MAX_SINGLE_BYTES)
            continue;
        let lines = 0;
        try {
            lines = readFileSync(p, 'utf8').split('\n').length - 1;
        }
        catch {
            continue;
        }
        loc += lines;
        locByLang[lang] = (locByLang[lang] || 0) + lines;
        fileByLang[lang] = (fileByLang[lang] || 0) + 1;
        files = files; // keep; files = tracked.length intentionally
    }
    let commits = 0;
    try {
        commits = Number(git(['rev-list', '--count', 'HEAD'], root)) || 0;
    }
    catch {
        commits = 0;
    }
    let dates = [];
    try {
        dates = git(['log', '--pretty=%ad', '--date=short'], root).split('\n').filter(Boolean);
    }
    catch {
        dates = [];
    }
    const today = new Date().toISOString().slice(0, 10);
    const streak = computeStreak(dates);
    const activeToday = dates.includes(today);
    let lastCommitted = null;
    try {
        lastCommitted = git(['log', '-1', '--format=%cr'], root) || null;
    }
    catch {
        lastCommitted = null;
    }
    const langs = Object.keys(locByLang).sort((a, b) => locByLang[b] - locByLang[a]);
    const languages = {};
    const byExtension = [];
    const locByExtension = [];
    for (const l of langs) {
        languages[l] = locByLang[l];
        byExtension.push(fileByLang[l] || 0);
        locByExtension.push(locByLang[l]);
    }
    return { project, root, loc, files, commits, lastCommitted, activeToday, streak, languages, byExtension, locByExtension };
}
/** 一行可复制的纯文本摘要（命令输出用）。 */
export function renderStatsText(s) {
    const langs = Object.entries(s.languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, n]) => `${name} ${n.toLocaleString()} 行`)
        .join(' · ');
    return [
        `🌊 Bloom · 代码统计 —— ${s.project}`,
        `根目录  ${s.root}`,
        `代码    ${s.loc.toLocaleString()} 行 / ${s.files} 文件 / ${s.commits.toLocaleString()} 次提交`,
        `连续    ${s.activeToday ? '🔥 今天已写 · ' : ''}${s.streak} 天` + (s.lastCommitted ? `（最近提交 ${s.lastCommitted}）` : ''),
        langs ? `语言    ${langs}` : '语言    （未识别到代码）',
        '',
        `使用：/bloom stats [目录]  （省略目录则用当前项目）`,
    ].join('\n');
}
/** 语言显示条的颜色（按 莫兰迪可读轨 accent 的一套邻近色，保证辨识度）。 */
const LANG_COLOR = {
    TypeScript: '#4b7ea8', JavaScript: '#c9b458', CSS: '#8f79c4', SCSS: '#c5778f',
    HTML: '#d1685a', Markdown: '#7f8c8d', Python: '#5a9a8c', Go: '#4e9ab5',
    Vue: '#5aac8a', Svelte: '#c05a3f', Rust: '#b57a48', Java: '#c57658', 'C/C++': '#7f9b8a',
    Shell: '#5a8a7f', JSON: '#8f9a6a', YAML: '#a8a0c4', SQL: '#6f8ab0', Diff: '#d1685a',
};
/** 生成一张自包含、可直接导出为图片的「代码统计卡」（秀给别人的核心产物）。 */
export function renderStatsCardHTML(s) {
    const total = s.loc || 1;
    const langs = Object.entries(s.languages).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const bars = langs.map(([name, n]) => {
        const pct = Math.round((n / total) * 100);
        const c = LANG_COLOR[name] || '#92a8b3';
        return `<div class="bar"><span class="bar-label">${name}</span>` +
            `<span class="bar-track"><span class="bar-fill" style="width:${pct}%;background:${c}"></span></span>` +
            `<span class="bar-val">${pct}%</span></div>`;
    }).join('');
    const streakIcon = s.activeToday ? '🔥' : (s.streak > 0 ? '⚡' : '🌱');
    const nums = [
        [s.loc.toLocaleString(), '代码行'],
        [s.files.toLocaleString(), '文件'],
        [s.commits.toLocaleString(), '提交'],
        [`${s.streak}天`, '连击'],
    ];
    const numsHTML = nums.map(([v, l]) => `<div class="num"><b>${v}</b><span>${l}</span></div>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin:0; box-sizing:border-box; }
    body { font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;
           background:#e9edf1; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .card { width:540px; padding:22px 24px; border-radius:18px;
      background:linear-gradient(160deg,#f6f4ef, #eef0f2);
      background-clip:padding-box; color:#2a2f33;
      box-shadow:0 18px 50px -18px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.9),
        inset 0 0 0 1px rgba(255,255,255,.55); }
    .head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
    .head .t { font-size:17px; font-weight:700; letter-spacing:.02em; }
    .head .badge { font-size:11px; color:#6b7a86; background:rgba(146,168,179,.16);
      padding:3px 9px; border-radius:999px; }
    .proj { font-size:13px; color:#5a666f; margin-bottom:14px;
      font-family:ui-monospace,'SF Mono',Menlo,monospace; }
    .nums { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:16px; }
    .num { background:rgba(255,255,255,.6); border:1px solid rgba(146,168,179,.25);
      border-radius:12px; padding:10px 8px; text-align:center; }
    .num b { display:block; font-size:20px; font-weight:700; color:#2a2f33; font-variant-numeric:tabular-nums; }
    .num span { font-size:11px; color:#7c8791; }
    .langs .cap { font-size:11px; color:#8a94a0; margin:2px 0 8px; letter-spacing:.05em; }
    .bar { display:flex; align-items:center; gap:8px; margin-bottom:7px; font-size:12px; }
    .bar-label { width:82px; color:#4a545c; }
    .bar-track { flex:1; height:8px; border-radius:999px; background:rgba(0,0,0,.06); overflow:hidden; }
    .bar-fill { display:block; height:100%; border-radius:999px; }
    .bar-val { width:36px; text-align:right; color:#7c8791; font-variant-numeric:tabular-nums; }
    .foot { margin-top:16px; padding-top:12px; border-top:1px solid rgba(146,168,179,.25);
      display:flex; align-items:center; justify-content:space-between; font-size:12px; color:#6b7a86; }
    .foot b { color:#3d6a8f; }
  </style></head><body>
  <div class="card">
    <div class="head">
      <span class="t">🌊 Bloom · 代码统计</span>
      <span class="badge">${s.activeToday ? '今日活跃' : 'coding'}</span>
    </div>
    <div class="proj">\u{1F9ED} ${s.project}${s.lastCommitted ? `　·　最近提交 ${s.lastCommitted}` : ''}</div>
    <div class="nums">${numsHTML}</div>
    <div class="langs">
      <div class="cap">语言分布</div>
      ${bars || '<div class="bar"><span class="bar-val">暂无代码</span></div>'}
    </div>
    <div class="foot"><span>Made with <b>Bloom for DSH</b></span><span>⭐&nbsp;支持开源</span></div>
  </div>
</body></html>`;
}
