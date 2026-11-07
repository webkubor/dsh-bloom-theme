export {}
/** DSH 客户端模块加载器（window.__ModuleLoader__）—— client 模块用它注册插件。 */
declare global {
  interface Window {
    __ModuleLoader__: {
      load(opts: { id: string; factory: (require: (name: string) => unknown) => Record<string, unknown> }): void
    }
    __dshBloomThinkObserver__?: MutationObserver
    __dshBloomThinkOff__?: () => void
    __dshBloomCursorBound__?: boolean
    __dshBloomCursorOff__?: () => void
    __dshBloomGlassOff__?: () => void
    __BLOOM_DEBUG__?: {
      dump(): import('./diagnostics.js').BloomDiagnostics
      copy(): Promise<boolean>
    }
  }
}
