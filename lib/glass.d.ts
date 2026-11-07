/** 用户可选的三种材质。 */
export type GlassMaterial = 'frosted' | 'matte' | 'liquid';
/** auto 是「让 Bloom 挑」的默认档；深浅一致解析成液态玻璃。 */
export type GlassMode = 'auto' | GlassMaterial;
/** solid 只用于系统无障碍降级，不是用户选项。 */
export type EffectiveGlassMode = GlassMaterial | 'solid';
/** 面板选项：毛玻璃、磨砂玻璃、液态玻璃。 */
export declare const GLASS_MODES: GlassMaterial[];
/** 读取并解析旧值；不在读取时写入存储。 */
export declare function readGlassMode(): GlassMode;
/** 保存标准材质 ID；存储不可用时仍保留本次会话选择。 */
export declare function writeGlassMode(mode: GlassMode): void;
/** 显式材质写入 body；auto 留给 CSS 按媒体查询解析。 */
export declare function applyGlassMode(): void;
/**
 * 返回与 CSS 一致的生效材质；高对比和强制颜色优先。
 *
 * ## auto 不随深浅变（2026-11-07 修正）
 *
 * 材质是**一个与配色方案无关的用户偏好**：用户挑的是「液态玻璃」这件事，
 * 不是「浅色时液态、深色时毛玻璃」这件事。之前 auto 按 `currentIsDark()`
 * 在深色下发 frosted，等于同一个偏好跨深浅给出两种材质 —— 切一次外观
 * 手感就变了，而且深浅两套的「自动」本来也不是用户表达过的选择。
 *
 * 现在 auto 在深浅都解析成 liquid；只有系统无障碍降级（强制颜色、
 * 高对比、降低透明度）才强制 solid —— 那是系统要求，不是用户偏好。
 */
export declare function effectiveGlassMode(): EffectiveGlassMode;
/** 系统是否要求降低透明度。 */
export declare function systemPrefersReducedTransparency(): boolean;
/** 初始化时归一旧存档、应用材质并注册可解绑的系统偏好监听。 */
export declare function initGlassMode(): () => void;
