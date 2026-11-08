// Minimal DSH locale service used by the i18n browser tests.
export const makeLocale = active => ({
  active,
  dicts: {},
  listeners: new Set(),
  register(ns, dicts) {
    if (Object.keys(dicts).sort().join(',') !== 'en,zh') throw new Error('Only zh/en dictionaries are supported')
    this.dicts[ns] = dicts
  },
  bind(ns) {
    const dicts = this.dicts[ns] ?? {}
    return key => {
      for (const loc of [this.active, 'en']) {
        const value = dicts[loc]?.[key]
        if (value !== undefined) return value
      }
      return key
    }
  },
  getSnapshot() { return { active: this.active } },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn) },
  setLocale(id) {
    if (!['zh', 'en'].includes(id)) throw new Error(`locale "${id}" is not registered`)
    this.active = id
    for (const fn of this.listeners) fn()
  },
  addLanguage() { throw new Error('Bloom must not register additional DSH languages') },
})
