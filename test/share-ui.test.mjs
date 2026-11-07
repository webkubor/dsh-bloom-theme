import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const {outputFiles}=await build({stdin:{contents:`import {buildSwitcherEl,cleanupSwitcher} from './src/switcher.ts'; import {buildBloomCSS} from './src/tokens.ts'; import {COMPONENT_CSS} from './src/css/component.ts'; import {GLASS_CSS} from './src/css/glass.ts'; import {BACKGROUND_CSS} from './src/css/background.ts'; import {BUTTON_CSS} from './src/css/button.ts'; import {ADAPTIVE_CSS} from './src/css/adaptive.ts'; import {SURFACES_CSS} from './src/css/surfaces.ts'; import {SWITCHER_CSS} from './src/css/switcher.ts'; import {buildLiquidLens} from './src/liquid-lens.ts'; import {buildFogDefinitions} from './src/fog.ts'; window.fixture={buildSwitcherEl,cleanupSwitcher,css:[buildBloomCSS(),COMPONENT_CSS,GLASS_CSS,BACKGROUND_CSS,BUTTON_CSS,ADAPTIVE_CSS,SURFACES_CSS,SWITCHER_CSS],buildLiquidLens,buildFogDefinitions}`,resolveDir:fileURLToPath(new URL('..',import.meta.url))},bundle:true,write:false,format:'iife',platform:'browser'})
async function setup(t){
  const browser=await chromium.launch({executablePath:process.env.BLOOM_CHROMIUM_PATH||undefined,args:['--no-sandbox']});t.after(()=>browser.close())
  const context=await browser.newContext({viewport:{width:1000,height:760},locale:'zh-CN'});const page=await context.newPage();page.setDefaultTimeout(5000)
  await page.route('https://bloom.test/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html lang="zh"><body data-bloom-variant="mist"></body></html>'}))
  await page.goto('https://bloom.test/')
  await page.evaluate(()=>{
    localStorage.setItem('bloom-telemetry','off')
    window.__copy='';window.__requests=[];window.__captures=[];window.__shared=[]
    window.fetch=async (...args)=>{window.__requests.push(String(args[0]));return new Response('',{status:404})}
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copy=text}}})
    Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__shared.push({name:data.files[0].name,type:data.files[0].type})}})
    Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true})
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getDisplayMedia:options=>{
      const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90
      const ctx=canvas.getContext('2d');ctx.fillStyle='#aa7799';ctx.fillRect(0,0,160,90)
      const stream=canvas.captureStream(30);window.__captures.push({options,stream,activated:navigator.userActivation.isActive})
      const timer=setInterval(()=>{ctx.fillStyle=ctx.fillStyle==='#aa7799'?'#7799aa':'#aa7799';ctx.fillRect(0,0,160,90)},40)
      window.__fixtureTimers??=[];window.__fixtureTimers.push(timer)
      return Promise.resolve(stream)
    }}})
    document.addEventListener('click',e=>{if(e.target instanceof Element && e.target.closest('.dsh-bloom-feedback'))e.preventDefault()},true)
  })
  await page.addScriptTag({content:outputFiles[0].text})
  await page.evaluate(()=>{for(const css of window.fixture.css){const style=document.createElement('style');style.textContent=css;document.head.append(style)}document.body.append(window.fixture.buildLiquidLens(document),window.fixture.buildFogDefinitions(document));window.__root=window.fixture.buildSwitcherEl('mist');window.__root.dataset.slotted='true';window.__root.style.left='80px';window.__root.style.top='40px';document.body.append(window.__root)})
  await page.locator('.dsh-bloom-trigger').click()
  return page
}

test('meteor colour choice is visible only for the dark meteor background and persists',async t=>{
  const page=await setup(t)
  const row=page.locator('.dsh-bloom-meteor-color')
  assert.equal(await row.isHidden(),true)
  await page.evaluate(()=>{document.body.setAttribute('data-ds-dark-theme','');document.body.setAttribute('data-bloom-ambience-dark','galaxy')})
  assert.equal(await row.isVisible(),true)
  const layout=await page.evaluate(()=>{
    const label=document.querySelector('.dsh-bloom-meteor-color > span').getBoundingClientRect()
    const color=document.querySelector('[data-meteor-color="colorful"]').getBoundingClientRect()
    const rotation=document.querySelector('.dsh-bloom-rotation'), select=rotation.querySelector('select').getBoundingClientRect()
    const material=document.querySelector('.dsh-bloom-glass__choices').getBoundingClientRect()
    return {labelLeft:label.left,rotationLeft:rotation.getBoundingClientRect().left+parseFloat(getComputedStyle(rotation).paddingLeft),colorRight:color.right,selectRight:select.right,materialHeight:material.height,samples:document.querySelectorAll('.dsh-bloom-glass__sample,[data-glass-description]').length}
  })
  assert.ok(Math.abs(layout.labelLeft-layout.rotationLeft)<1,JSON.stringify(layout))
  assert.ok(Math.abs(layout.colorRight-layout.selectRight)<1,JSON.stringify(layout))
  assert.ok(layout.materialHeight<55,JSON.stringify(layout))
  assert.equal(layout.samples,0)
  await page.locator('[data-meteor-color="solid"]').click()
  assert.equal(await page.locator('[data-meteor-color="solid"]').getAttribute('aria-checked'),'true')
  assert.equal(await page.locator('[data-meteor-color="colorful"]').getAttribute('aria-checked'),'false')
  await page.evaluate(()=>{window.fixture.cleanupSwitcher();window.__root.remove();window.__root=window.fixture.buildSwitcherEl('mist');window.__root.dataset.slotted='true';window.__root.style.left='80px';window.__root.style.top='40px';document.body.append(window.__root)})
  await page.locator('.dsh-bloom-trigger').click()
  assert.equal(await page.locator('[data-meteor-color="solid"]').getAttribute('aria-checked'),'true')
  await page.evaluate(()=>document.body.setAttribute('data-bloom-ambience-dark','corner'))
  assert.equal(await row.isHidden(),true)
})

test('footer keeps feedback and stars accessible and copies an actionable Agent prompt',async t=>{
  const page=await setup(t)
  assert.equal(await page.locator('.dsh-bloom-foot__links > a').count(),2)
  assert.equal(await page.locator('.dsh-bloom-star').getAttribute('href'),'https://github.com/webkubor/dsh-bloom-theme')
  await page.evaluate(()=>{document.body.dataset.secretHostToken='private-token';const field=document.createElement('textarea');field.value='private-draft';document.body.append(field)})
  await page.locator('.dsh-bloom-feedback').click()
  const feedback=new URL(await page.locator('.dsh-bloom-feedback').getAttribute('href'))
  assert.equal(feedback.pathname,'/webkubor/dsh-bloom-theme/issues/new')
  assert.match(feedback.searchParams.get('body'),/Bloom/)
  assert.doesNotMatch(feedback.searchParams.get('body'),/private-token|private-draft/)
  await page.locator('.dsh-bloom-share').click()
  assert.equal(await page.locator('.dsh-bloom-share-panel').isVisible(),true)
  await page.locator('.dsh-bloom-share-install').click()
  await page.waitForFunction(()=>window.__copy.length>0)
  const text=await page.evaluate(()=>window.__copy)
  assert.match(text,/plugin_manager/);assert.match(text,/install_bundle/);assert.match(text,/dsh plugin --profile <profile> add dsh-bloom-theme/)
  assert.equal(await page.evaluate(()=>window.__captures.length),0,'opening and copying never start capture')
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('.dsh-bloom-share-panel').isHidden(),true)
  assert.equal(await page.locator('.dsh-bloom-menu').isVisible(),true)
  assert.deepEqual(await page.evaluate(()=>window.__requests),[],'no media or diagnostics are uploaded')
})

test('actual share menu stays inside a narrow viewport',async t=>{
  const page=await setup(t)
  await page.setViewportSize({width:360,height:600})
  await page.evaluate(()=>{window.__root.style.left='12px'})
  await page.locator('.dsh-bloom-share').click()
  const bounds=await page.evaluate(()=>{
    const menu=document.querySelector('.dsh-bloom-menu').getBoundingClientRect()
    const panel=document.querySelector('.dsh-bloom-share-panel').getBoundingClientRect()
    return {menu:{left:menu.left,right:menu.right,top:menu.top,bottom:menu.bottom},panel:{left:panel.left,right:panel.right,top:panel.top,bottom:panel.bottom},width:innerWidth,height:innerHeight}
  })
  assert.ok(bounds.panel.left>=0 && bounds.panel.right<=bounds.width,JSON.stringify(bounds))
  assert.ok(bounds.panel.top>=bounds.menu.top && bounds.panel.bottom<=bounds.menu.bottom,JSON.stringify(bounds))
})

test('screenshot is user-selected, locally prepared and shared only on a second click',async t=>{
  const page=await setup(t)
  await page.locator('.dsh-bloom-share').click()
  await page.locator('[data-share-capture="screenshot"]').click()
  await page.waitForSelector('.dsh-bloom-share-result:not([hidden])',{timeout:8000})
  const state=await page.evaluate(()=>({calls:window.__captures.length,opts:window.__captures[0].options,activated:window.__captures[0].activated,tracks:window.__captures[0].stream.getTracks().map(t=>t.readyState),shared:window.__shared.length,href:document.querySelector('.dsh-bloom-share-save').getAttribute('href')}))
  assert.equal(state.calls,1);assert.equal(state.opts.audio,false);assert.equal(state.activated,true)
  assert.deepEqual(state.tracks,['ended']);assert.equal(state.shared,0);assert.match(state.href,/^blob:/)
  await page.locator('.dsh-bloom-share-system').click()
  const sent=await page.evaluate(()=>window.__shared)
  assert.equal(sent.length,1);assert.equal(sent[0].type,'image/png')
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('.dsh-bloom-share-panel').isHidden(),true)
  assert.equal(await page.evaluate(()=>window.__requests.length),0)
})

test('permission denial and clipboard failure leave clear manual fallbacks',async t=>{
  const page=await setup(t)
  await page.evaluate(()=>{
    navigator.mediaDevices.getDisplayMedia=()=>Promise.reject(new DOMException('denied','NotAllowedError'))
    navigator.clipboard.writeText=()=>Promise.reject(new DOMException('denied','NotAllowedError'))
    document.execCommand=()=>false
  })
  await page.locator('.dsh-bloom-share').click()
  await page.locator('[data-share-capture="screenshot"]').click()
  await page.waitForFunction(()=>/denied|cancelled|未获得|取消/i.test(document.querySelector('.dsh-bloom-share-status').textContent),null,{timeout:5000})
  assert.equal(await page.locator('[data-share-capture="screenshot"]').isEnabled(),true)
  assert.equal(await page.locator('.dsh-bloom-share-result').isHidden(),true)
  await page.locator('.dsh-bloom-share-install').click()
  const manual=page.locator('.dsh-bloom-share-manual')
  await manual.waitFor({state:'visible'})
  assert.match(await manual.inputValue(),/plugin_manager/)
  assert.equal(await page.evaluate(()=>window.__requests.length),0)
})

test('closing the share panel cancels a pending picker and stops a later grant',async t=>{
  const page=await setup(t)
  await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=16;canvas.height=16
    window.__lateStream=canvas.captureStream(1)
    navigator.mediaDevices.getDisplayMedia=()=>new Promise(resolve=>{window.__resolvePicker=resolve})
  })
  await page.locator('.dsh-bloom-share').click()
  await page.locator('[data-share-capture="record"]').click()
  assert.equal(await page.locator('[data-share-capture="record"]').isDisabled(),true)
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('.dsh-bloom-share-panel').isHidden(),true)
  await page.evaluate(()=>window.__resolvePicker(window.__lateStream))
  await page.waitForFunction(()=>window.__lateStream.getTracks().every(track=>track.readyState==='ended'))
  assert.equal(await page.locator('.dsh-bloom-share-result').isHidden(),true)
  assert.equal(await page.evaluate(()=>window.__shared.length),0)
})

test('five-second recording uses the selected video track and prepares a local file',async t=>{
  const page=await setup(t)
  await page.locator('.dsh-bloom-share').click()
  const started=Date.now()
  await page.locator('[data-share-capture="record"]').click()
  await page.waitForSelector('.dsh-bloom-share-result:not([hidden])',{timeout:12000})
  assert.ok(Date.now()-started>=4800,'recording runs for approximately five seconds')
  const state=await page.evaluate(()=>({opts:window.__captures[0].options,tracks:window.__captures[0].stream.getTracks().map(t=>t.readyState),name:document.querySelector('.dsh-bloom-share-save').download}))
  assert.equal(state.opts.audio,false);assert.deepEqual(state.tracks,['ended']);assert.match(state.name,/\.(webm|mp4)$/)
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('.dsh-bloom-share-save').click()])
  assert.match(download.suggestedFilename(),/\.(webm|mp4)$/)
  assert.equal(await page.evaluate(()=>window.__requests.length),0)
})
