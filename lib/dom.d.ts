export declare function readMotion(): boolean;
export declare function applyMotion(enabled: boolean): void;
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
export declare const THINK_OPEN = "<think>";
export declare const THINK_CLOSE = "</think>";
export declare function markThinkTags(): void;
export declare function watchThinkTags(): void;
export declare function markLiveTurn(): void;
export declare function readVariant(): string;
export declare function injectCSS(css: any, idSuffix: any): void;
