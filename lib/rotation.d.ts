export declare const ROTATION_MINUTES: number[];
export declare function readRotationMinutes(): number;
export declare function startRotation(apply: (variant: string) => void): void;
export declare function setRotationMinutes(minutes: number): void;
/** 停止自动换色：清定时器、解 visibilitychange（插件停用时由 teardown 调用）。 */
export declare function stopRotation(): void;
/** Manual color changes start a fresh interval; background tabs never catch up missed ticks. */
export declare function resetRotationTimer(): void;
/** Allow tests and teardown to reset module state entirely. */
export declare function resetRotationState(): void;
