export type BloomLang = 'zh' | 'en';
/** 本插件在 DSH locale 服务里的命名空间（词条按它注册/查找）。 */
export declare const LOCALE_NS = "dsh-bloom-theme";
export declare const LANG_CHANGE_EVENT = "dsh-bloom-lang-change";
/**
 * DSH locale 运行时里本插件用到的那几个方法。
 * 结构化子集，不引 DSH 的类型包 —— 本插件零运行时依赖是承诺。
 */
export interface LocaleLike {
    register(ns: string, dicts: Record<string, Record<string, string>>): void | (() => void);
    bind(ns: string): (key: string) => string;
    getSnapshot(): {
        active: string;
    };
    subscribe(fn: () => void): () => void;
}
/** 交给 DSH 注册的两张表。zh 恒等、en 是译文。 */
export declare const DICTS: Record<BloomLang, Record<string, string>>;
/**
 * 把语言源接到 DSH 上。由 apply(ctx) 调用一次。
 * 绑定后广播变化，让早于 apply 注入的面板立即使用 DSH 当前语言。
 */
export declare function bindLocale(locale: LocaleLike): () => void;
/** 当前界面语言。唯一真源是 DSH；未知或未绑定时回落英文。 */
export declare function getLang(): BloomLang;
/**
 * 中文原文 → 当前界面语言。两种用法：
 *
 *   tr('深色')                      普通字符串
 *   tr`超时 ${secs}s`               带变量的模板（key 是骨架「超时 {0}s」）
 *
 * 接上 DSH 后走 locale.bind(LOCALE_NS)，回落链由 DSH 负责；没接上时用英文表。
 * 译文里少了某个 {n} 也不会把变量弄丢：补在句尾，不能少信息。
 */
export declare function tr(input: string | TemplateStringsArray, ...vals: (string | number)[]): string;
/** 变体名：英文缺词时回退中文，加配色时忘了写译文也不会显示空白。 */
export declare const variantName: (v: any) => any;
/** 右侧诗句：中文用原句，英文用 poemEn，漏写才退回原句。 */
export declare const variantPoem: (v: any) => any;
