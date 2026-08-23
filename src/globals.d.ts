export {}
/** DSH 客户端模块加载器（window.__ModuleLoader__）—— client 模块用它注册插件。 */
declare global {
  interface Window {
    __ModuleLoader__: {
      load(opts: { id: string; factory: () => Record<string, unknown> }): void
    }
    __dshBloomObserver__?: MutationObserver
    __dshBloomThinkObserver__?: MutationObserver
  }
}
