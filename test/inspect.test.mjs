import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const { outputFiles } = await build({ stdin: { contents: `import {createBloomInspectProvider,bindBloomInspect} from './src/inspect.ts'; import {bindHostTheme} from './src/appearance.ts'; window.fixture={createBloomInspectProvider,bindBloomInspect,bindHostTheme};`, resolveDir: fileURLToPath(new URL('..', import.meta.url)) }, bundle:true,write:false,format:'iife',platform:'browser' })
async function setup(t) {
  const browser = await chromium.launch({ executablePath:process.env.BLOOM_CHROMIUM_PATH || undefined,args:['--no-sandbox'] })
  t.after(()=>browser.close())
  const context = await browser.newContext({viewport:{width:800,height:600}})
  const page = await context.newPage()
  await page.route('**/*', route=>route.fulfill({contentType:'text/html',body:`<body data-bloom-variant="mist"><main style="width:400px"><div class="md-table-wide" style="overflow:auto"><table style="min-width:1200px"><tr><td>Secret message not for diagnostics</td><td style="width:160px">LAST-COLUMN</td></tr></table></div><div class="demo_composer"><div class="demo_card" style="background-image:url('https://asset.test/private?token=DO-NOT-EXPOSE')"><textarea>Private draft not for diagnostics</textarea></div></div></main></body>`}))
  await page.goto('https://bloom.test/current?token=DO-NOT-EXPOSE')
  await page.addScriptTag({content:outputFiles[0].text})
  return page
}

test('snapshot is read-only and excludes draft, message, query and resource contents', async t=>{
  const page=await setup(t)
  const data=await page.evaluate(()=>{
    const before=document.documentElement.outerHTML
    const storage=JSON.stringify({...localStorage})
    const result=window.fixture.createBloomInspectProvider().query('snapshot',{target:'any',scope:'all'})
    return {result,unchanged:before===document.documentElement.outerHTML&&storage===JSON.stringify({...localStorage})}
  })
  assert.equal(data.unchanged,true)
  const serialized=JSON.stringify(data.result)
  for(const forbidden of ['Private draft','Secret message','DO-NOT-EXPOSE','asset.test']) assert.equal(serialized.includes(forbidden),false,forbidden)
  assert.equal(data.result.page.origin,'https://bloom.test')
  assert.equal(data.result.page.pathname,'/current')
  assert.equal(data.result.input.empty,false)
  assert.equal(data.result.input.length,'Private draft not for diagnostics'.length)
  assert.match(data.result.surfaces.composer.element['background-image'],/\[resource\]/)
})

test('appearance preference is reported independently from the effective scheme', async t=>{
  const page=await setup(t)
  const data=await page.evaluate(()=>{
    const dispose=window.fixture.bindHostTheme({getTheme:()=>({preference:'system',active:{colorScheme:'dark'}}),setTheme:()=>{}})
    document.body.setAttribute('data-ds-dark-theme','')
    const value=window.fixture.createBloomInspectProvider().query('snapshot',{target:'any'}).bloom
    dispose()
    return value
  })
  assert.equal(data.appearance,'dark')
  assert.equal(data.appearancePreference,'system')
  assert.equal(data.appearanceSource,'host')
})

test('sidebar cascade is opt-in and sanitizes resource URLs', async t=>{
  const page=await setup(t)
  const data=await page.evaluate(()=>{
    const sidebar=document.createElement('div');sidebar.className='x_sidebarCol';document.body.append(sidebar)
    const style=document.createElement('style');style.textContent='.x_sidebarCol { background-image:url("https://private.invalid/image?token=secret") !important }';document.head.append(style)
    const p=window.fixture.createBloomInspectProvider()
    return {plain:p.query('snapshot',{target:'any',scope:'surfaces'}),detailed:p.query('snapshot',{target:'any',scope:'surfaces',cascade:true})}
  })
  assert.equal(data.plain.sidebarCascade,undefined)
  assert.ok(data.detailed.sidebarCascade.some(rule=>rule.declarations.some(d=>d.priority==='important')))
  assert.doesNotMatch(JSON.stringify(data.detailed.sidebarCascade),/private\.invalid|token=secret/)
})

test('canvas diagnostics omit private selector values and resource URLs', async t=>{
  const page=await setup(t)
  const result=await page.evaluate(()=>{
    document.body.dataset.privateSelector='secret-value'
    const style=document.createElement('style')
    style.textContent='body[data-private-selector="secret-value"] { background-image:url("https://private.invalid/pixel?token=secret") !important }'
    document.head.append(style)
    return window.fixture.createBloomInspectProvider().query('snapshot',{target:'any',scope:'canvas',cascade:true})
  })
  const text=JSON.stringify(result.canvas)
  assert.doesNotMatch(text,/secret-value|private\.invalid|token=secret/)
  assert.ok(result.canvas.bodyCascade.some(rule=>rule.declarations.some(item=>item.priority==='important')))
  assert.match(result.canvas.body['background-image'],/\[resource\]/)
})

test('native editor geometry rejects a different client page', async t=>{
  const page=await setup(t)
  const result=await page.evaluate(()=>{
    const provider=window.fixture.createBloomInspectProvider()
    const bounds=document.querySelector('textarea').getBoundingClientRect()
    const matches=provider.query('snapshot',{target:'any',editorLeft:bounds.x,editorWidth:bounds.width}).input.rect
    let rejected=false
    try{provider.query('snapshot',{target:'any',editorLeft:bounds.x+30,editorWidth:bounds.width})}catch{rejected=true}
    return {matches,rejected}
  })
  assert.ok(result.matches)
  assert.equal(result.rejected,true)
})

test('summary stays compact and surfaces are returned only when requested', async t=>{
  const page=await setup(t)
  const result=await page.evaluate(()=>{
    const provider=window.fixture.createBloomInspectProvider()
    return {summary:provider.query('snapshot',{target:'any'}),surfaces:provider.query('snapshot',{target:'any',scope:'surfaces'})}
  })
  assert.equal(result.summary.surfaces,undefined)
  assert.equal(result.summary.background,undefined)
  assert.ok(result.surfaces.surfaces.composer)
  assert.ok(result.surfaces.glassSummary.composer)
})

test('table metrics distinguish internal overflow and actual right-edge visibility', async t=>{
  const page=await setup(t)
  const read=()=>page.evaluate(()=>window.fixture.createBloomInspectProvider().query('snapshot',{target:'any',scope:'tables'}))
  const before=await read()
  assert.equal(before.viewport.documentScrollWidth,800)
  assert.equal(before.tables[0].hasWideContainer,true)
  assert.ok(before.tables[0].scroller.maxScrollLeft>700)
  assert.equal(before.tables[0].scroller.atRightEdge,false)
  assert.equal(before.tables[0].lastContentWithinScroller,false)
  await page.evaluate(()=>{const e=document.querySelector('.md-table-wide');e.scrollLeft=e.scrollWidth})
  const after=await read()
  assert.equal(after.tables[0].scroller.atRightEdge,true)
  assert.equal(after.tables[0].lastContentWithinScroller,true,JSON.stringify(after.tables[0]))
})

test('at-right-edge does not falsely certify an oversized last-cell label as visible', async t=>{
  const page=await setup(t)
  await page.evaluate(()=>{
    document.querySelector('td:last-child').style.width='800px'
    const scroller=document.querySelector('.md-table-wide')
    scroller.scrollLeft=scroller.scrollWidth
  })
  const result=await page.evaluate(()=>window.fixture.createBloomInspectProvider().query('snapshot',{target:'any',scope:'tables'}))
  assert.equal(result.tables[0].scroller.atRightEdge,true)
  assert.equal(result.tables[0].lastContentWithinScroller,false)
})

test('desktop routing, method names and cancellation are enforced', async t=>{
  const page=await setup(t)
  const result=await page.evaluate(()=>{
    const p=window.fixture.createBloomInspectProvider()
    const error=(f)=>{try{f();return null}catch(e){return e.message}}
    const c=new AbortController();c.abort()
    return [error(()=>p.query('snapshot')),error(()=>p.query('write',{target:'any'})),error(()=>p.query('snapshot',{target:'any',scope:'invalid'})),error(()=>p.query('snapshot',{target:'any'},{signal:c.signal}))]
  })
  assert.match(result[0],/desktop origin/)
  assert.match(result[1],/Unknown/)
  assert.match(result[2],/Invalid/)
  assert.match(result[3],/cancelled/)
})

test('page identity prevents another client from answering a pinned query',async t=>{
  const page=await setup(t)
  const first=await page.evaluate(()=>window.fixture.createBloomInspectProvider().query('snapshot',{target:'any'}))
  const other=await page.context().newPage()
  await other.setContent('<body></body>')
  await other.addScriptTag({content:outputFiles[0].text})
  const second=await other.evaluate(()=>window.fixture.createBloomInspectProvider().query('snapshot',{target:'any'}))
  assert.notEqual(first.page.id,second.page.id)
  const rejected=await other.evaluate(id=>{
    try { window.fixture.createBloomInspectProvider().query('snapshot',{target:'any',pageId:id});return false }
    catch(error) { return /different diagnostic page/.test(error.message) }
  },first.page.id)
  assert.equal(rejected,true)
  const pinned=await page.evaluate(id=>window.fixture.createBloomInspectProvider().query('snapshot',{target:'any',pageId:id}),first.page.id)
  assert.equal(pinned.page.id,first.page.id)
})

test('optional provider registration is owned and disposed by its Cordis effect',async t=>{
  const page=await setup(t)
  const result=await page.evaluate(()=>{
    let attach,active=0,registered,dispose
    window.fixture.bindBloomInspect({inject(names,callback){if(names[0]!=='cordisInspect')throw Error('wrong service');attach=callback}})
    const before=active
    attach({cordisInspect:{register(provider){registered=provider.manifest;active++;return ()=>active--}},effect(setup){dispose=setup()}})
    const during=active
    dispose()
    return {before,during,after:active,manifest:registered}
  })
  assert.deepEqual([result.before,result.during,result.after],[0,1,0])
  assert.equal(result.manifest.id,'BloomDiagnostics')
  assert.equal(result.manifest.methods[0].name,'snapshot')
  assert.equal(result.manifest.methods[0].inputSchema.additionalProperties,false)
})
