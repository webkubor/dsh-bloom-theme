import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const {outputFiles}=await build({stdin:{contents:`import {buildBloomCSS} from './src/tokens.ts';import {COMPONENT_CSS} from './src/css/component.ts';import {GLASS_CSS} from './src/css/glass.ts';import {BACKGROUND_CSS} from './src/css/background.ts';import {ADAPTIVE_CSS} from './src/css/adaptive.ts';import {buildFogDefinitions} from './src/fog.ts';window.buildFogDefinitions=buildFogDefinitions;window.testCSS=[buildBloomCSS(),COMPONENT_CSS,GLASS_CSS,BACKGROUND_CSS,ADAPTIVE_CSS]`,resolveDir:fileURLToPath(new URL('..',import.meta.url))},bundle:true,write:false,format:'iife',platform:'browser'})
const variants=['cinnabar','dawn','tangerine','aurora','osmanthus','mint','ripple','mist','lapis','lavender','silverrose','petal']
const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)
const contrast=(a,b)=>{const l=[luminance(a),luminance(b)].sort((x,y)=>y-x);return(l[0]+.05)/(l[1]+.05)}

test('all light backgrounds retain readable text and palette accents',async t=>{
  const browser=await chromium.launch({executablePath:process.env.BLOOM_CHROMIUM_PATH||undefined,args:['--no-sandbox']});t.after(()=>browser.close())
  const page=await browser.newPage({viewport:{width:480,height:300},deviceScaleFactor:1,reducedMotion:'reduce'})
  await page.setContent('<html><body data-bloom-variant="mist" style="margin:0"><span id="accent" style="position:absolute;left:-9999px;color:var(--bloom-accent)">X</span><span id="primary" style="position:absolute;left:-9999px;color:var(--dsw-alias-label-primary)">X</span></body></html>')
  await page.addScriptTag({content:outputFiles[0].text})
  await page.evaluate(()=>{document.body.append(window.buildFogDefinitions(document));for(const css of window.testCSS){const el=document.createElement('style');el.textContent=css;document.head.append(el)}})
  const failures=[]
  let worst={ratio:Infinity}
  for(const variant of variants) for(const background of ['stream','wash','clear']) {
    await page.evaluate(([variant,background])=>{document.body.dataset.bloomVariant=variant;document.body.dataset.bloomAmbienceLight=background},[variant,background])
    const png=await page.screenshot()
    const pixels=await page.evaluate(async base64=>{
      const image=await createImageBitmap(await(await fetch(`data:image/png;base64,${base64}`)).blob())
      const canvas=new OffscreenCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0)
      const values=[]
      for(const y of [20,100,180,280])for(const x of [20,120,240,360,460])values.push([...ctx.getImageData(x,y,1,1).data].slice(0,3))
      const colors={}
      for(const id of ['accent','primary']){ctx.clearRect(0,0,1,1);ctx.fillStyle=getComputedStyle(document.getElementById(id)).color;ctx.fillRect(0,0,1,1);colors[id]=[...ctx.getImageData(0,0,1,1).data].slice(0,3)}
      return {values,colors}
    },png.toString('base64'))
    for(const [label,fg] of Object.entries(pixels.colors)) {
      const minimum=Math.min(...pixels.values.map(bg=>contrast(fg,bg)))
      if(minimum<worst.ratio) worst={variant,background,label,ratio:Number(minimum.toFixed(3))}
      if(minimum<4.5) failures.push({variant,background,label,minimum:Number(minimum.toFixed(2))})
    }
  }
  t.diagnostic(`Lowest sampled contrast: ${JSON.stringify(worst)}`)
  assert.deepEqual(failures,[],'light text and palette accents must reach WCAG AA over every sampled background')
})

test('all palette backgrounds remain distinct and independent from the chosen material',async t=>{
  const browser=await chromium.launch({executablePath:process.env.BLOOM_CHROMIUM_PATH||undefined,args:['--no-sandbox']});t.after(()=>browser.close())
  const page=await browser.newPage({viewport:{width:800,height:600},reducedMotion:'reduce'})
  await page.setContent('<body data-bloom-variant="mist"></body>')
  await page.addScriptTag({content:outputFiles[0].text})
  await page.evaluate(()=>{document.body.append(window.buildFogDefinitions(document));for(const css of window.testCSS){const el=document.createElement('style');el.textContent=css;document.head.append(el)}})
  const data=await page.evaluate(variants=>{
    const result=[]
    for(const variant of variants){
      document.body.dataset.bloomVariant=variant
      document.body.removeAttribute('data-ds-dark-theme')
      const backgrounds=[]
      for(const preset of ['stream','wash','clear']){
        document.body.dataset.bloomAmbienceLight=preset
        const images=[]
        for(const material of ['frosted','matte','liquid']){
          document.body.dataset.bloomGlass=material
          images.push(getComputedStyle(document.body,'::before').backgroundImage)
        }
        backgrounds.push(images)
      }
      document.body.dataset.dsDarkTheme=''
      document.body.dataset.bloomAmbienceDark='off'
      result.push({variant,backgrounds,darkOff:getComputedStyle(document.body,'::before').backgroundImage})
    }
    return result
  },variants)
  const streamSet=new Set()
  for(const item of data){
    streamSet.add(item.backgrounds[0][0])
    for(const images of item.backgrounds){assert.equal(new Set(images).size,1,`${item.variant}: material changed background`);assert.notEqual(images[0],'none')}
    assert.equal(new Set(item.backgrounds.map(x=>x[0])).size,3,`${item.variant}: background presets must be distinct`)
    assert.equal(item.darkOff,'none',`${item.variant}: dark off must remove background`)
  }
  assert.ok(streamSet.size>=8,`light backgrounds must follow the active palette spectrum, got ${streamSet.size} distinct`)
})

test('composer underlay fades gradually across its full height',async t=>{
  const browser=await chromium.launch({executablePath:process.env.BLOOM_CHROMIUM_PATH||undefined,args:['--no-sandbox']});t.after(()=>browser.close())
  const page=await browser.newPage({viewport:{width:480,height:300},deviceScaleFactor:1,reducedMotion:'reduce'})
  await page.setContent('<body data-bloom-variant="mist"><div class="sample_root"><div class="sample_composerSeat" style="position:fixed;inset:auto 0 0;height:140px"></div></div></body>')
  await page.addScriptTag({content:outputFiles[0].text})
  await page.evaluate(()=>{
    document.body.append(window.buildFogDefinitions(document))
    for(const css of window.testCSS){const s=document.createElement('style');s.textContent=css;document.head.append(s)}
    const backdrop=document.createElement('style');backdrop.textContent='body[data-bloom-variant]::before{background-image:linear-gradient(#b8cadc,#b8cadc)}';document.head.append(backdrop)
  })
  const withSeat=await page.screenshot()
  await page.locator('.sample_composerSeat').evaluate(e=>e.hidden=true)
  const withoutSeat=await page.screenshot()
  const gains=await page.evaluate(async ([a,b])=>{
    const read=async text=>{const image=await createImageBitmap(await(await fetch(`data:image/png;base64,${text}`)).blob());const canvas=new OffscreenCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);return y=>[...ctx.getImageData(240,y,1,1).data].slice(0,3)}
    const [visible,base]=await Promise.all([read(a),read(b)])
    return [150,180,230,290].map(y=>visible(y).reduce((sum,v,i)=>sum+Math.abs(v-base(y)[i]),0)/3)
  },[withSeat.toString('base64'),withoutSeat.toString('base64')])
  t.diagnostic(`Underlay gains before/early/middle/end: ${gains.join(', ')}`)
  assert.ok(gains[0]<2,`underlay must not affect content above its top: ${gains}`)
  assert.ok(gains[3]>5,`underlay must still protect input readability: ${gains}`)
  assert.ok(gains[1]<gains[3]*.5 && gains[2]<gains[3]*.7,`underlay fades too abruptly: ${gains}`)
  await page.locator('.sample_composerSeat').evaluate(e=>e.hidden=false)
  await page.emulateMedia({forcedColors:'active'})
  const forced=await page.locator('.sample_composerSeat').evaluate(e=>({filter:getComputedStyle(e,'::before').backdropFilter,mask:getComputedStyle(e,'::before').maskImage}))
  assert.equal(forced.filter,'none','forced colors removes the underlay blur')
  assert.equal(forced.mask,'none','forced colors removes the underlay mask')
})
