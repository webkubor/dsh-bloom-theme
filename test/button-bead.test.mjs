import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const {outputFiles}=await build({stdin:{contents:`import {buildBloomCSS} from './src/tokens.ts';import {COMPONENT_CSS} from './src/css/component.ts';import {GLASS_CSS} from './src/css/glass.ts';import {BACKGROUND_CSS} from './src/css/background.ts';import {BUTTON_CSS} from './src/css/button.ts';import {ADAPTIVE_CSS} from './src/css/adaptive.ts';import {SURFACES_CSS} from './src/css/surfaces.ts';import {buildLiquidLens} from './src/liquid-lens.ts';import {buildFogDefinitions} from './src/fog.ts';window.definitions=[buildLiquidLens,buildFogDefinitions];window.css=[buildBloomCSS(),COMPONENT_CSS,GLASS_CSS,BACKGROUND_CSS,BUTTON_CSS,ADAPTIVE_CSS,SURFACES_CSS]`,resolveDir:fileURLToPath(new URL('..',import.meta.url))},bundle:true,write:false,format:'iife',platform:'browser'})
const lum=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)
const ratio=(a,b)=>{const x=[lum(a),lum(b)].sort((m,n)=>n-m);return(x[0]+.05)/(x[1]+.05)}

test('approval buttons in the composer keep native text-button geometry',async t=>{
  const browser=await chromium.launch({executablePath:process.env.BLOOM_CHROMIUM_PATH||undefined,args:['--no-sandbox']});t.after(()=>browser.close())
  const page=await browser.newPage({viewport:{width:600,height:360}})
  // Mirrors the shipped approval panel: it takes over the composer and uses the host's shared Button.
  await page.setContent(`<body data-bloom-variant="mist"><style>.host_button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;font-size:14px;line-height:22px;padding:0 14px}.host_md{height:36px}.host_primary{background:rgb(80,100,120);color:rgb(255,255,255)}.host_actionRow{display:flex;justify-content:flex-end;gap:8px;padding:14px 16px}</style><div class="host_composer"><div data-approval-key="fixture" class="approval_root"><div class="approval_card"><div class="host_actionRow"><button class="host_button host_md host_outline">拒绝</button><button class="host_button host_md host_primary">允许一次</button></div></div></div></div></body>`)
  await page.addScriptTag({content:outputFiles[0].text})
  await page.evaluate(()=>{for(const css of window.css){const s=document.createElement('style');s.textContent=css;document.head.append(s)}})
  const button=page.locator('.host_primary')
  for(const dark of [false,true]){
    await page.evaluate(on=>document.body.toggleAttribute('data-ds-dark-theme',on),dark)
    for(const text of ['允许一次','Allow once','Allow always']){
      await button.evaluate((el,value)=>el.textContent=value,text)
      const before=await button.evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(el);return {width:r.width,height:r.height,radius:s.borderRadius,padding:s.paddingLeft,lines:range.getClientRects().length,bg:s.backgroundImage,pseudo:getComputedStyle(el,'::before').content}})
      assert.ok(before.width>45,`${text}: approval must not be a 36px bead`)
      assert.equal(before.height,36);assert.equal(before.radius,'8px');assert.equal(before.padding,'14px')
      assert.equal(before.lines,1,`${text}: text must fit on one line`)
      assert.equal(before.bg,'none');assert.equal(before.pseudo,'none')
      await button.hover()
      assert.equal(await button.evaluate(el=>getComputedStyle(el).backgroundImage),'none')
    }
  }
  await page.emulateMedia({forcedColors:'active'})
  assert.ok(await button.evaluate(el=>el.getBoundingClientRect().width)>45)
})

test('send control is a readable glass bead across materials and adapts to contrast settings',async t=>{
  const browser=await chromium.launch({executablePath:process.env.BLOOM_CHROMIUM_PATH||undefined,args:['--no-sandbox']});t.after(()=>browser.close())
  const page=await browser.newPage({viewport:{width:400,height:200},deviceScaleFactor:1})
  await page.setContent(`<body data-bloom-variant="mist"><style>.demo_composer{position:absolute;left:50px;top:50px}.demo_primary{display:grid;place-items:center;width:32px;height:32px;color:white;background:#4961ad;border:0}.demo_primary:disabled{opacity:.4}.demo_primary[data-sending]:disabled{opacity:1;cursor:progress}.demo_primary svg{width:16px;height:16px}</style><div class="demo_composer"><div class="demo_card"><div class="demo_row"><div class="demo_trailing"><button class="demo_primary" aria-label="Send message"><svg viewBox="0 0 16 16"><path d="M2 8h10M8 4l4 4-4 4" stroke="currentColor" fill="none"/></svg></button></div></div></div></div></body>`)
  await page.addScriptTag({content:outputFiles[0].text})
  await page.evaluate(()=>{for(const create of window.definitions)document.body.append(create(document));for(const css of window.css){const s=document.createElement('style');s.textContent=css;document.head.append(s)}})
  for(const material of ['frosted','matte','liquid']){
    await page.evaluate(value=>document.body.dataset.bloomGlass=value,material)
    const bead=await page.locator('.demo_primary').screenshot({animations:'disabled'})
    const result=await page.evaluate(async base64=>{
      const image=await createImageBitmap(await(await fetch(`data:image/png;base64,${base64}`)).blob())
      const canvas=new OffscreenCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0)
      const background=[...ctx.getImageData(9,9,1,1).data].slice(0,3)
      ctx.clearRect(0,0,1,1);ctx.fillStyle=getComputedStyle(document.querySelector('.demo_primary svg')).color;ctx.fillRect(0,0,1,1)
      const foreground=[...ctx.getImageData(0,0,1,1).data].slice(0,3)
      const cs=getComputedStyle(document.querySelector('.demo_primary'))
      const rim=getComputedStyle(document.querySelector('.demo_primary'),'::before')
      return {background,foreground,width:cs.width,height:cs.height,radius:cs.borderRadius,image:cs.backgroundImage,filter:cs.backdropFilter,rimMask:rim.maskImage}
    },bead.toString('base64'))
    assert.equal(result.width,'36px');assert.equal(result.height,'36px');assert.equal(result.radius,'50%')
    assert.ok(result.background.every(v=>v>210),`${material}: bead should be pale, got ${result.background}`)
    assert.ok(ratio(result.foreground,result.background)>=3,`${material}: icon contrast ${ratio(result.foreground,result.background)}`)
    assert.match(result.image,/radial-gradient/)
    assert.match(result.filter,/dsh-bloom-liquid-lens/,'bead refracts the backdrop')
    assert.match(result.rimMask,/linear-gradient/,'bead rim uses a thin masked reflection')
  }
  const colors=[]
  for(const variant of ['cinnabar','dawn','tangerine','aurora','osmanthus','mint','ripple','mist','lapis','lavender','silverrose','petal']){
    await page.evaluate(v=>document.body.dataset.bloomVariant=v,variant)
    const bead=await page.locator('.demo_primary').screenshot({animations:'disabled'})
    const sample=await page.evaluate(async base64=>{
      const image=await createImageBitmap(await(await fetch(`data:image/png;base64,${base64}`)).blob())
      const canvas=new OffscreenCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0)
      const face=[...ctx.getImageData(26,26,1,1).data].slice(0,3)
      ctx.clearRect(0,0,1,1);ctx.fillStyle=getComputedStyle(document.querySelector('.demo_primary svg')).color;ctx.fillRect(0,0,1,1)
      return {face,icon:[...ctx.getImageData(0,0,1,1).data].slice(0,3)}
    },bead.toString('base64'))
    assert.ok(ratio(sample.icon,sample.face)>=3,`${variant}: icon contrast ${ratio(sample.icon,sample.face)}`)
    colors.push({variant,...sample})
  }
  t.diagnostic(`Button pixel samples: ${JSON.stringify(colors.filter(c=>['cinnabar','aurora','mint','mist'].includes(c.variant)))}`)
  assert.ok(new Set(colors.map(c=>c.face.join(','))).size>=8,'bead face follows palette rather than remaining fixed blue')
  assert.ok(new Set(colors.map(c=>c.icon.join(','))).size>=8,'bead icon follows palette')
  await page.locator('.demo_primary').evaluate(e=>e.disabled=true)
  const disabled=await page.locator('.demo_primary').evaluate(e=>({image:getComputedStyle(e).backgroundImage,opacity:Number(getComputedStyle(e).opacity)}))
  assert.match(disabled.image,/radial-gradient/,'disabled send keeps its glass appearance')
  assert.ok(disabled.opacity<1,'disabled state remains distinguishable')
  await page.evaluate(()=>document.body.dataset.bloomVariant='silverrose')
  await page.locator('.demo_primary').evaluate(e=>{e.dataset.sending='';e.disabled=true;e.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-opacity=".35"/><path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor"/></svg>'})
  const busy=await page.locator('.demo_primary').evaluate(e=>({image:getComputedStyle(e).backgroundImage,color:getComputedStyle(e).color,opacity:getComputedStyle(e).opacity,disabled:e.disabled}))
  assert.match(busy.image,/radial-gradient/,'sending spinner retains the glass surface')
  assert.equal(busy.opacity,'1','sending spinner remains clearly visible')
  assert.equal(busy.disabled,true,'sending button remains disabled while its request is in flight')
  const busyColors=[]
  for(const variant of ['cinnabar','dawn','tangerine','aurora','osmanthus','mint','ripple','mist','lapis','lavender','silverrose','petal']) {
    await page.evaluate(v=>document.body.dataset.bloomVariant=v,variant)
    busyColors.push(await page.locator('.demo_primary').evaluate(e=>({image:getComputedStyle(e).backgroundImage,color:getComputedStyle(e).color})))
  }
  assert.ok(new Set(busyColors.map(c=>c.image)).size>=8,'sending face follows the selected palette')
  assert.ok(new Set(busyColors.map(c=>c.color)).size>=8,'sending spinner follows the selected palette')
  await page.locator('.demo_primary').evaluate(e=>{delete e.dataset.sending;e.disabled=false})
  await page.evaluate(()=>document.body.dataset.dsDarkTheme='')
  const dark=await page.locator('.demo_primary').evaluate(e=>({color:getComputedStyle(e).color,image:getComputedStyle(e).backgroundImage}))
  assert.match(dark.image,/radial-gradient/)
  await page.emulateMedia({forcedColors:'active'})
  const forced=await page.locator('.demo_primary').evaluate(e=>({filter:getComputedStyle(e).backdropFilter,image:getComputedStyle(e).backgroundImage,rim:getComputedStyle(e,'::before').display}))
  assert.equal(forced.filter,'none');assert.equal(forced.image,'none');assert.equal(forced.rim,'none')
})
