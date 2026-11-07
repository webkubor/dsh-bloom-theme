export type Scheme = 'dark' | 'light';
export declare const AMBIENCE_PRESETS: {
    readonly dark: readonly ['corner', 'diagonal', 'galaxy', 'off'];
    readonly light: readonly ['stream', 'wash', 'clear', 'off'];
};
export type AmbiencePreset<S extends Scheme = Scheme> = typeof AMBIENCE_PRESETS[S][number];
export declare const AMBIENCE_ATTRS: Record<Scheme, string>;
export declare function readAmbience(scheme: Scheme): AmbiencePreset;
export declare function writeAmbience(scheme: Scheme, preset: string): boolean;
export declare function initAmbience(): void;
export declare function clearAmbience(): void;
