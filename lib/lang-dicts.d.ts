/**
 * 词条表：中文原文 → 界面语言，逐条对应源码里的 tr('…') 调用点（key 就是源码里那句中文）。
 * 只提供 DSH 支持的英文译文；中文恒等表由 lang.ts 生成。模板 key 如「超时 {0}s」。
 *
 * 查不到词条时 tr() 原样返回中文 —— 宁可露一个没译的词，也不要在界面上留空白。
 * 变体名字和诗句不在这里，它们在 palette.ts 的 VARIANT_LABELS（en / poemEn 字段）。
 */
export declare const DICT_EN: Record<string, string>;
