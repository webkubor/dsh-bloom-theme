/**
 * 深浅外观 —— 把深浅状态**交还宿主**，面板只做入口。
 *
 * ## 为什么不再自己写 body 属性（2026-11-04 改，v0.24.0）
 *
 * v0.23.0 及之前，本文件自己改 `document.body` 上的 `data-ds-dark-theme`，
 * 并把模式存进 localStorage。功能上能切，但它跟宿主是**两个真源**：
 *
 *   - 宿主 `dsh-client-ui-layout` 的 ThemePresenter 才是 `data-ds-dark-theme`
 *     的合法持有者。它在每次 `theme/change` 时把属性 set/remove，
 *     插件自己写的值在宿主下一次快照时会**被无声覆盖**。
 *   - 插件的 dispose（重载、切换 profile）如果不清属性，界面会卡在深色；
 *     宿主调研里 `dsh-dream-skin` 明确因为这个坑选择不碰这个属性。
 *   - 设置面板里的深浅选中态跟插件的 localStorage 档位各说各话。
 *
 * 宿主其实有正规 API（`dsh-client-ui-theme` 提供 `ctx.theme`）：
 *   · `getTheme()` → 不可变快照，`active.colorScheme` 是解析后的明暗
 *   · `setTheme('light' | 'dark' | 'system')` → 唯一的用户偏好写入口，
 *     宿主自己持久化，自己广播 `theme/change`
 *   · `register(def)` / `overrideTokens(source, tokens)` → 主题与 token 覆盖层
 *
 * 所以现在：**状态归宿主，面板只调 `ctx.theme.setTheme()`**。
 * 插件不读也不写 `data-ds-dark-theme`，不存自己的模式档位。
 *
 * ## 兼容旧宿主
 *
 * 宿主 0.2.0 之前没有 `ctx.theme`。那时插件退回自己写 body 属性
 * （`applyMode`），并在 localStorage 留档 —— 保证老宿主上深浅切换仍然可用。
 * 一旦发现宿主提供了 theme 服务，就走宿主路径，旧档位不再参与。
 */
/** 深浅模式：与宿主 `ctx.theme.setTheme()` 接受的偏好值一一对应。 */
export type AppearanceMode = 'light' | 'dark' | 'system';
/**
 * 宿主 theme 服务的最小契约面。
 *
 * 只声明我们真用到的四个方法，不依赖具体实现 —— 不同宿主版本
 * （以及测试替身）只要满足这个形状就能用。
 */
export interface HostThemeService {
    getTheme?: () => {
        preference?: string;
        active?: {
            colorScheme?: string;
        };
    };
    setTheme?: (id: string) => void;
}
/**
 * 记住宿主的 theme 服务。
 *
 * @returns 一个函数，把服务清回 null —— 宿主卸载该服务时用。
 */
export declare function bindHostTheme(service: HostThemeService | null): () => void;
/**
 * 当前模式。
 *
 * 有宿主服务时读宿主的偏好（`preference`）—— 这才是用户真正选的那一档，
 * 「跟随系统」在宿主里也是一档（preference='system'），而不是「当前正好是深色」。
 * 没有宿主服务时读旧档位。
 */
export declare function readStoredMode(): AppearanceMode;
/**
 * 切换深浅模式。
 *
 * 有宿主服务时调 `ctx.theme.setTheme()`：宿主自己持久化、自己广播
 * `theme/change`、自己更新 body 属性 —— 插件不插手。
 * 没有宿主服务时退回旧的本地路径。
 */
export declare function setMode(mode: AppearanceMode): void;
export declare function clearAppearanceSync(): void;
/**
 * 启动时对齐深浅状态。
 *
 * 有宿主服务时**什么都不用做** —— 宿主在插件之前就 boot 完了，属性早就是对的。
 * 这里只做一件防御性的事：万一快照还没到（例如插件先于 ui-layout materialize），
 * 就按宿主的当前偏好补一次，让首屏不闪。
 *
 * 没有宿主服务时，走旧路径：重放本地档位，并在「跟随系统」下监听 OS 偏好变化。
 */
export declare function initAppearanceSync(): void;
/**
 * 当前是否深色。
 *
 * 有宿主服务时读宿主的 `active.colorScheme`（解析后的结果）；
 * 没有时读 body 属性（旧路径自己写的那份）。
 */
export declare function currentIsDark(): boolean;
/**
 * 宿主服务是否提供了 theme —— 供 UI 决定深浅行是否可用。
 *
 * 没有宿主服务时（老宿主），面板仍可显示深浅行，走的是本地路径。
 */
export declare function hasThemeSupport(): boolean;
