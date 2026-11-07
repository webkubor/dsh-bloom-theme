export interface BloomDiagnostics {
    timestamp: string;
    bloom: {
        version: string;
        variant: string;
        appearance: 'light' | 'dark';
        glassMode: string;
        ambience: {
            dark: string;
            light: string;
        };
        rotationMinutes: number;
        bodyDataset: Record<string, string>;
        slots: {
            switcherAnchorMounted: boolean;
            overlayMounted: boolean;
        };
    };
    host: {
        platform: string;
        userAgent: string;
        devicePixelRatio: number;
        viewport: {
            width: number;
            height: number;
        } | null;
        language: string;
    };
    domAudit: {
        sidebar?: Record<string, string | boolean> | null;
        header?: Record<string, string | boolean> | null;
        plugins?: Record<string, string | boolean> | null;
        body?: {
            backgroundColor?: string;
            backgroundImage?: string;
            color?: string;
        } | null;
    };
    tokens: Record<string, string>;
}
export declare function collectDiagnostics(): BloomDiagnostics;
export declare function formatDiagnosticsMarkdown(data?: BloomDiagnostics): string;
export declare function copyDiagnostics(btn?: HTMLElement): Promise<boolean>;
