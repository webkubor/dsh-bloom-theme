import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

// RemoteResult wraps ChangeResult; resolving the RPC is not installation success.
const LATEST = '99.0.0'
const { outputFiles } = await build({
  stdin: {
    contents: `import './src/client.ts';
      const services = {}; const pending = [];
      window.remoteDisposers = [];
      const strictCtx = (declared = []) => new Proxy({}, {
        get(_, key) {
          if (key === 'effect') return fn => {
            const dispose = fn();
            if (declared.includes('remote.pluginManager') && typeof dispose === 'function') window.remoteDisposers.push(dispose);
            return dispose;
          };
          if (key === 'inject') return (names, cb) => {
            const run = () => cb(strictCtx([...declared, ...names]));
            if (names.every(n => services[n] !== undefined)) run(); else pending.push({names, run});
          };
          if (typeof key === 'symbol' || key === 'then') return undefined;
          if (!declared.includes(key)) throw new Error('cannot get property "' + String(key) + '" without inject');
          return services[key];
        }
      });
      window.activateRemote = pm => {
        services.remote = {pluginManager:pm}; services['remote.pluginManager'] = pm;
        for (let i=pending.length-1;i>=0;i--) if(pending[i].names.every(n => services[n] !== undefined)) pending.splice(i,1)[0].run();
      };
      window.applyFixture = (pm, locale) => {
        services.locale=locale;
        if(pm) {services.remote={pluginManager:pm};services['remote.pluginManager']=pm;}
        const mod=window.__ModuleLoader__._module;
        mod.apply(strictCtx(mod.inject ?? []));
      };`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
  }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020',
})
const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
test.after(() => browser.close())

async function setup(t, mode = 'ok', { desktop = true, late = false } = {}) {
  const context = await browser.newContext({ locale: 'zh-CN', colorScheme: 'dark' })
  t.after(() => context.close())
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.route('**/*', route => {
    const url = route.request().url()
    if (url === 'https://bloom.test/') return route.fulfill({ contentType: 'text/html', body: '<html><body><header></header></body></html>' })
    if (url.includes('registry.npmjs.org')) return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ version: LATEST }) })
    return route.fulfill({ status: 404, body: '' })
  })
  await page.goto('https://bloom.test/')
  await page.clock.install()
  await page.evaluate(({mode, desktop, latest}) => {
    window.__ModuleLoader__ = { _module: null, load(def) { this._module=def.factory() } }
    if (desktop) window.dshDesktopBoot = {}
    window.copied = ''
    Object.defineProperty(navigator, 'clipboard', { configurable:true, value:{writeText:async text=>{window.copied=text}} })
    const dictionaries = {}; const listeners = new Set()
    window.locale = {
      active:'zh', register(ns, dict) {dictionaries[ns]=dict;return ()=>delete dictionaries[ns]},
      bind(ns) {return key=>dictionaries[ns]?.[this.active]?.[key]??dictionaries[ns]?.en?.[key]??key},
      getSnapshot(){return {active:this.active}}, subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn)},
      setLocale(next){this.active=next;for(const fn of listeners) fn()}
    }
    window.mode=mode;window.installCalls=[]
    window.pm={updateBundle:async (name, version)=>{
      window.installCalls.push({name,version})
      if(window.mode==='throw') throw new Error('RPC disconnected')
      if(window.mode==='pending') return new Promise(resolve=>{window.resolveInstall=resolve})
      if(window.mode==='transport') return {ok:false,error:{message:'RPC disconnected'}}
      if(window.mode==='invalid') return {ok:true,value:{from:'0.0.1',to:version,step:'install',result:{changed:true}}}
      const result={changed:true,application:'applied',stage:'install',target:name+'@'+version,bundle:'dsh-bloom-theme',version:latest}
      if(window.mode==='restart') Object.assign(result,{application:'restart-required',restartReason:'no-hmr'})
      if(window.mode==='failed') Object.assign(result,{changed:false,application:'failed',error:{code:'operation-error',diagnostic:'network unavailable'},packageResult:{kind:'network',exitCode:1}})
      if(window.mode==='already-installed') Object.assign(result,{changed:false,application:'failed',error:{code:'already-installed'}})
      if(window.mode==='cancelled'||window.mode==='overridden') result.application=window.mode
      return {ok:true,value:{from:'0.0.1',to:version,step:'install',result}}
    }}
    if(mode==='legacy') { delete window.pm.updateBundle; window.pm.installBundle=async()=>{throw new Error('must not call installBundle for an installed theme')} }
  }, { mode, desktop, latest: LATEST })
  await page.addScriptTag({ content: outputFiles[0].text })
  await page.evaluate(({mode,late})=>window.applyFixture(mode==='none'||late?undefined:window.pm,window.locale),{mode,late})
  await page.clock.fastForward(4100)
  await page.locator('#dsh-bloom-update-banner').waitFor()
  return { page, errors }
}
const banner = page => page.locator('#dsh-bloom-update-banner')
async function waitBody(page, text) {
  await page.waitForFunction(text => document.querySelector('#dsh-bloom-update-banner .bloom-upd-body')?.textContent.includes(text), text)
}

test('desktop update invokes exact version once and unwraps a successful host result', async t => {
  const { page, errors } = await setup(t)
  assert.equal(await banner(page).locator('code').isVisible(), false)
  await banner(page).locator('[data-act="install"]').click()
  await banner(page).locator('[data-act="reload"]').waitFor()
  assert.deepEqual(await page.evaluate(()=>window.installCalls), [{name:'dsh-bloom-theme',version:LATEST}])
  await waitBody(page, `已更新到 v${LATEST}`)
  assert.deepEqual(errors, [])
})

test('restart-required instructs application restart and never offers a page reload', async t => {
  const {page} = await setup(t, 'restart')
  await banner(page).locator('[data-act="install"]').click()
  await waitBody(page, '需要重启 DSH')
  assert.equal(await banner(page).locator('[data-act="reload"]').count(), 0)
  assert.equal(await banner(page).locator('[data-act="dismiss"]').count(), 1)
})

for (const [mode,reason] of [['failed','network unavailable'],['transport','RPC disconnected'],['throw','RPC disconnected'],['already-installed','already-installed'],['cancelled','更新已取消'],['overridden','安装配置被覆盖'],['invalid','宿主未确认更新成功']]) {
  test(`${mode}: a non-successful result never claims installation succeeded`, async t => {
    const {page,errors}=await setup(t,mode)
    await banner(page).locator('[data-act="install"]').click()
    await waitBody(page, reason)
    assert.equal(await banner(page).locator('[data-act="reload"]').count(),0)
    assert.equal(await banner(page).locator('[data-act="copy"]').count(),0,'desktop fallback must not offer a rejected CLI command')
    assert.equal(await banner(page).locator('[data-act="retry"]').count(),1)
    assert.deepEqual(errors,[])
  })
}

test('failed update can retry through a fresh install button', async t => {
  const {page}=await setup(t,'failed')
  await banner(page).locator('[data-act="install"]').click()
  await waitBody(page,'network unavailable')
  await page.evaluate(()=>{window.mode='ok'})
  await banner(page).locator('[data-act="retry"]').click()
  await banner(page).locator('[data-act="install"]').click()
  await banner(page).locator('[data-act="reload"]').waitFor()
  assert.equal(await page.evaluate(()=>window.installCalls.length),2)
})

test('language changes keep an in-flight install disabled and preserve its completion state', async t => {
  const {page}=await setup(t,'pending')
  await banner(page).locator('[data-act="install"]').click()
  await page.waitForFunction(()=>typeof window.resolveInstall==='function')
  await page.evaluate(()=>window.locale.setLocale('en'))
  assert.equal(await banner(page).locator('[data-act="install"]').isDisabled(),true)
  assert.match(await banner(page).locator('[data-act="install"]').textContent(),/Updating/)
  await page.evaluate(latest=>window.resolveInstall({ok:true,value:{from:'0.0.1',to:latest,step:'install',result:{changed:true,application:'applied',stage:'install',target:'dsh-bloom-theme@'+latest,version:latest}}}),LATEST)
  await waitBody(page,`Updated to v${LATEST}`)
  await page.evaluate(()=>window.locale.setLocale('ru'))
  await waitBody(page,`Обновлено до v${LATEST}`)
  assert.equal(await page.evaluate(()=>window.installCalls.length),1)
  assert.equal(await banner(page).locator('[data-act="install"]').count(),0)
})

test('a localizable failure is re-translated when the interface language changes', async t => {
  const {page}=await setup(t,'cancelled')
  await banner(page).locator('[data-act="install"]').click()
  await waitBody(page,'更新已取消')
  await page.evaluate(()=>window.locale.setLocale('en'))
  await waitBody(page,'cancelled')
  await page.evaluate(()=>window.locale.setLocale('ru'))
  await waitBody(page,'отменено')
})

test('the stale update hint disappears once the outcome replaces the available state', async t => {
  const {page}=await setup(t)
  assert.equal(await banner(page).locator('.bloom-upd-hint').count(),1)
  await banner(page).locator('[data-act="install"]').click()
  await banner(page).locator('[data-act="reload"]').waitFor()
  assert.equal(await banner(page).locator('.bloom-upd-hint').count(),0)
})

test('late optional service arrival refreshes capability and disposal removes stale install controls', async t => {
  const {page}=await setup(t,'ok',{late:true})
  assert.equal(await banner(page).locator('[data-act="install"]').count(),0)
  await page.evaluate(()=>window.activateRemote(window.pm))
  await banner(page).locator('[data-act="install"]').waitFor()
  await page.evaluate(()=>window.remoteDisposers.forEach(fn=>fn()))
  assert.equal(await banner(page).locator('[data-act="install"]').count(),0)
})

test('legacy manager cannot advertise an update using its install-only API', async t => {
  const {page}=await setup(t,'legacy')
  assert.equal(await banner(page).locator('[data-act="install"]').count(),0)
  assert.match(await banner(page).locator('.bloom-upd-hint').textContent(),/不支持一键更新/)
})

test('desktop without the optional service points to Plugins and never offers an unusable command', async t => {
  const {page}=await setup(t,'none')
  assert.equal(await banner(page).locator('[data-act="install"]').count(),0)
  assert.equal(await banner(page).locator('[data-act="copy"]').count(),0)
  assert.equal(await banner(page).locator('code').isVisible(),false)
  assert.equal(await banner(page).locator('[data-act="open"]').count(),1)
})

test('self-hosted profile without the service keeps the exact-version copy fallback', async t => {
  const {page}=await setup(t,'none',{desktop:false})
  assert.equal(await banner(page).locator('[data-act="install"]').count(),0)
  await banner(page).locator('[data-act="copy"]').click()
  assert.match(await page.evaluate(()=>window.copied),new RegExp(`dsh-bloom-theme@${LATEST}`))
})
