/**
 * DOM 工具层：样式注入、变体读写、宿主查找、<think> 标签收拾。
 *
 * injectCSS 用 data-plugin-css 属性做幂等标记 —— DSH 的 cordis materialize
 * 可能多次调用 apply，重复注入会让同一份 CSS 叠好几份。
 */
import { PLUGIN_ID, STORAGE_KEY, STORAGE_MOTION_KEY } from './meta.js';
import { VARIANTS } from './palette.js';
export function readMotion() {
    try {
        return window.localStorage.getItem(STORAGE_MOTION_KEY) !== 'off';
    }
    catch {
        return true;
    }
}
export function applyMotion(enabled) {
    try {
        if (enabled) {
            window.localStorage.removeItem(STORAGE_MOTION_KEY);
            document.body?.removeAttribute('data-bloom-motion');
        }
        else {
            window.localStorage.setItem(STORAGE_MOTION_KEY, 'off');
            document.body?.setAttribute('data-bloom-motion', 'off');
        }
    }
    catch { }
}
/**
 * 收拾裸露的 <think> 标签。
 *
 * ⚠️ 这是 workaround，不是根治。根因在 LLM 适配层：某些模型（如 MiniMax-M3）把思考
 * 内容内联在 content 里输出 <think>…</think>，而 DSH 的推理解析没识别它，于是整段
 * 当普通 markdown 渲染，标签就露在正文里。正解是在 provider 适配层解析成 reasoning
 * 字段，交给 DSH 原生的 ReasoningRow 渲染。
 *
 * 之所以敢在主题层做：实测这些标签**各自独占一个段落元素**（56/56，无一混在正文中），
 * 所以只标记、不改任何文本内容 —— 隐藏它们不会丢字。
 * 只加 data-* 属性，不动 DOM 结构，React 重渲染最多是属性丢失，observer 会补回来。
 */
export const THINK_OPEN = '<think>';
export const THINK_CLOSE = '</think>';
export function markThinkTags() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const tags = [];
    let n;
    while ((n = walker.nextNode())) {
        const t = (n.nodeValue || '').trim();
        if (t !== THINK_OPEN && t !== THINK_CLOSE)
            continue;
        const el = n.parentElement;
        if (!el || el.dataset.bloomThink)
            continue;
        el.dataset.bloomThink = t === THINK_OPEN ? 'open' : 'close';
        tags.push(el);
    }
    if (!tags.length)
        return;
    // 配对：把开闭标签之间的兄弟节点标成思考内容（降权显示，不隐藏 —— 信息不丢）
    for (const el of tags) {
        if (el.dataset.bloomThink !== 'open')
            continue;
        for (let sib = el.nextElementSibling; sib; sib = sib.nextElementSibling) {
            if (sib.dataset.bloomThink === 'close')
                break;
            if (sib.dataset.bloomThink === 'open')
                break; // 未配对，停手
            sib.dataset.bloomThinkBody = 'true';
        }
    }
}
export function watchThinkTags() {
    if (window.__dshBloomThinkObserver__)
        return;
    let timer;
    let disposed = false;
    const schedule = () => {
        if (disposed)
            return;
        // 流式输出会高频触发，节流到 300ms
        if (timer)
            return;
        timer = setTimeout(() => {
            timer = undefined;
            if (!disposed) {
                markThinkTags();
                markLiveTurn();
            }
        }, 300);
    };
    const obs = new MutationObserver(schedule);
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.__dshBloomThinkObserver__ = obs;
    window.__dshBloomThinkOff__ = () => {
        disposed = true;
        obs.disconnect();
        if (timer !== undefined)
            clearTimeout(timer);
        if (liveTurnTimer !== undefined)
            clearTimeout(liveTurnTimer);
        liveTurnTimer = undefined;
        lastRowText = new WeakMap();
        window.__dshBloomThinkObserver__ = undefined;
        window.__dshBloomThinkOff__ = undefined;
    };
    markThinkTags();
    markLiveTurn();
}
/**
 * 标出「正在跑」的那一行轮次状态 —— "深度求索中，用时 1分30秒"。
 *
 * ## 为什么需要 JS 标
 *
 * 这行字现在由 DSH 渲染成 `<button data-turn-process>` 里的一个 label，
 * **跑完和跑着是同一个元素**：跑完是 "用时 7分11秒"，跑着是 "深度求索中，用时
 * 1分30秒"，两者在 DOM 上只差文本内容，没有状态属性可挂。
 * （实测三种状态：跑完折叠 `data-open`+disabled、跑完展开 `aria-expanded`、
 * 正在跑 `data-open`+disabled —— disabled / data-open 都不能当「在跑」的判据。）
 *
 * 唯一稳定的信号是**文本在变**：计时每 ~1s 跳一次，跑完就不动了。
 * 所以：同一个 row 的文本相比上一次扫描变了 → 标上；2.5s 内没等到下一次变化
 * → 摘掉。切会话时新 row 第一次被看到不算「变过」（WeakMap 里没有旧值），
 * 所以切过去不会先闪一下再停。
 *
 * ## 为什么复用 watchThinkTags 的 observer
 *
 * 两者要的都是「DOM 变了就重扫一遍」，而计时文本本身就是 characterData 变更，
 * 已经在那个 observer 的射程里。再挂一个 observer 只是把同样的事做两遍。
 * 代价是函数名比做的事多一点 —— 已在调用处注明。
 */
const LIVE_TURN_ATTR = 'data-bloom-live-turn';
let lastRowText = new WeakMap();
let liveTurnTimer;
export function markLiveTurn() {
    const rows = document.querySelectorAll('[data-turn-process]');
    if (!rows.length)
        return;
    // DOM 顺序就是时间顺序，最后一个 = 当前这一轮
    const row = rows[rows.length - 1];
    const label = row.querySelector('[class*="_label"]') || row;
    const text = (label.textContent || '').trim();
    if (!text)
        return;
    const prev = lastRowText.get(row);
    lastRowText.set(row, text);
    if (prev === undefined || text === prev)
        return; // 初次见到 / 没变 → 不算在跑
    row.setAttribute(LIVE_TURN_ATTR, '');
    if (liveTurnTimer)
        clearTimeout(liveTurnTimer);
    liveTurnTimer = setTimeout(() => {
        if (lastRowText.get(row) === text)
            row.removeAttribute(LIVE_TURN_ATTR);
    }, 2500);
}
/* v0.5.0：氛围层（壁纸 / 玻璃开关 / 主题包）整体移除，玻璃改为默认常开。 */
export function readVariant() {
    try {
        const v = window.localStorage.getItem(STORAGE_KEY);
        return VARIANTS.includes(v) ? v : 'mist';
    }
    catch {
        return 'mist';
    }
}
export function injectCSS(css, idSuffix) {
    const tagId = PLUGIN_ID + '/' + idSuffix;
    if (document.querySelector('style[data-plugin-css="' + tagId + '"]'))
        return;
    const tag = document.createElement('style');
    tag.dataset.plugin = PLUGIN_ID;
    tag.dataset.pluginCss = tagId;
    tag.textContent = css;
    document.head.appendChild(tag);
}
