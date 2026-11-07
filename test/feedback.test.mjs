import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { runInNewContext } from 'node:vm'
import { fileURLToPath } from 'node:url'

const {outputFiles}=await build({stdin:{contents:`import {buildFeedbackUrl} from './src/feedback.ts';globalThis.fixture={buildFeedbackUrl}`,resolveDir:fileURLToPath(new URL('..',import.meta.url))},bundle:true,write:false,platform:'node',format:'iife'})
const scope={URL};runInNewContext(outputFiles[0].text,scope)

test('feedback drafts include diagnostics without submitting or attaching files',()=>{
  for(const lang of ['zh','en']){
    const url=new URL(scope.fixture.buildFeedbackUrl('Bloom 0.26.0\nTheme: mint',lang))
    assert.equal(url.origin,'https://github.com')
    assert.equal(url.pathname,'/webkubor/dsh-bloom-theme/issues/new')
    const body=url.searchParams.get('body')
    assert.match(body,/Bloom 0\.26\.0/)
    assert.match(body,lang==='zh'?/截图或录屏/:/Screenshot or recording/)
    assert.equal(url.searchParams.has('submit'),false)
  }
})
