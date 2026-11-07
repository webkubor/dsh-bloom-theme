import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

// Portable Playwright regression; uses the same Chromium installed by CI.
// Run: node --test test/surface-regression.test.mjs
// Contracts copied from installed DSH 0.2.1 web-frontend Markdown/Tooltip CSS,
// ui-chat ReasoningRow/TurnTriggerNodeView, ui-conversation and plugin-manager.
// Hashes are deliberately varied: Bloom must use semantic names, not build IDs.
const hostCSS = `
body { margin:0; --dsh-chat-content-width:520px; --dsw-alias-bg-base:rgb(24,26,30); --dsw-alias-bg-layer-1:rgb(245,240,235); --bloom-accent:rgb(80,130,90); --bloom-morandi:80,130,90; --bloom-hairline:rgba(80,130,90,.2); --bloom-hairline-strong:rgba(80,130,90,.4); }
main { width:748px; padding:20px; }
.fixture_tableScroll { max-width:100%; overflow-x:auto; overscroll-behavior-x:contain; }
.fixture_tableScroll.md-table-wide { overflow-x:hidden; padding-bottom:var(--dsh-scrollbar-width,5px); }
.fixture_tableScroll.md-table-wide:hover,.fixture_tableScroll.md-table-wide:focus-visible { overflow-x:scroll; padding-bottom:0; }
.fixture_tableScroll table { border-collapse:collapse; width:max-content; max-width:max-content; }
.fixture_tableFill table { width:100%; max-width:none; }
.fixture_tableScroll th,.fixture_tableScroll td { padding:10px 16px; min-width:100px; }
.fixture_tableScroll td { white-space:nowrap; }
.fixture_reasoning[data-expanded] [data-open] [data-disclosure-header] { z-index:1; background:var(--dsw-alias-bg-base); position:sticky; top:0; }
.fixture_trigger { background:var(--dsw-alias-turn-trigger-bg,var(--dsw-alias-markdown-code-block)); }
.fixture_trigger:hover { background:var(--dsw-alias-turn-trigger-bg-hover,var(--dsw-alias-interactive-bg-hover)); }
.fixture_card.fixture_preview { background:var(--dsw-alias-bg-layer-1); padding:10px; }
header.fixture_header { height:40px; }
#plugins { padding:10px; }
#preview { position:fixed; left:580px; top:30px; width:250px; }
* { animation:none !important; transition:none !important; }
`
const row = (wide = false) => `<tr>${Array.from({ length:4 }, (_, i) => `<td>${wide ? 'Long unbroken diagnostic value '.repeat(4) : `C${i}`}</td>`).join('')}</tr>`
const html = `<main>
<header class="fixture_header"><div id="chat-tabs" class="fixture_tabs">Chat · Files</div></header>
<section id="plugins"><div id="plugin-tabs" class="fixture_tabs">Installed · Discover</div><div>Plugin list</div></section>
<div id="short" tabindex="0" class="fixture_tableScroll md-table-wide"><table>${row()}</table></div>
<div id="wide" tabindex="0" class="fixture_tableScroll md-table-wide"><table>${row(true)}</table></div>
<div id="fill" class="fixture_tableScroll fixture_tableFill"><table><tr><td>A</td><td>B</td></tr></table></div>
<div class="fixture_reasoning" data-variant="think" data-expanded><div data-open><button id="reasoning" data-disclosure-header>Thinking</button><div>Reasoning details</div></div></div>
<div id="trigger" class="fixture_trigger" data-turn-trigger>Turn trigger</div>
<div id="preview" class="fixture_card fixture_preview"><pre>File change preview</pre></div>
<div id="unrelated" class="fixture_card">Ordinary card</div>
<aside class="fixture_sidebarCol" style="width:220px"><div id="sidelist" class="fixture_list" style="overflow:auto;height:90px">${'<div role="treeitem" style="width:100%;height:30px">Session row</div>'.repeat(4)}</div></aside>
</main>`
const css = ['component', 'glass', 'background'].map(name => {
  const source = readFileSync(new URL(`../src/css/${name}.ts`, import.meta.url), 'utf8')
  return runInNewContext(source.slice(source.indexOf('= `') + 2, source.lastIndexOf('`') + 1))
}).join('\n')

function measure() {
  const style = id => getComputedStyle(document.getElementById(id))
  const table = id => {
    const el = document.getElementById(id)
    const t = el.querySelector('table')
    const s = style(id)
    return { width:el.clientWidth, height:el.getBoundingClientRect().height, table:t.getBoundingClientRect().width,
      paddingBottom:s.paddingBottom, overflow:s.overflowX, gutter:s.scrollbarGutter, thumb:s.scrollbarColor,
      background:s.backgroundColor, border:s.borderTopWidth, backdrop:s.backdropFilter, maxScroll:el.scrollWidth - el.clientWidth }
  }
  return { short:table('short'), wide:table('wide'), fill:table('fill'),
    pluginShadow:style('plugin-tabs').boxShadow, pluginBackdrop:style('plugin-tabs').backdropFilter,
    chatShadow:style('chat-tabs').boxShadow, preview:style('preview').backgroundColor,
    previewImage:style('preview').backgroundImage, reasoning:style('reasoning').backgroundColor,
    reasoningPosition:style('reasoning').position, trigger:style('trigger').backgroundColor }
}

test('host table branches and themed surfaces survive hover, focus, and palette changes', async () => {
  const browser = await chromium.launch({ executablePath: process.env.BLOOM_CHROMIUM_PATH || undefined, args: ['--no-sandbox'] })
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
    await page.goto('about:blank')
    await page.evaluate(({html,css}) => {document.head.innerHTML='<style>'+css+'</style>';document.body.innerHTML=html;document.body.dataset.bloomVariant='mint'}, {html, css:hostCSS + '\n' + css})
const before = await page.evaluate(measure);
  assert.ok(before.short.table < before.short.width, 'short wide table stays intrinsic');
  assert.ok(before.wide.table > before.wide.width, 'long wide table keeps horizontal overflow');
  assert.ok(Math.abs(before.fill.table - before.fill.width) < 2, 'tableFill spans viewport');
  assert.equal(before.wide.paddingBottom, '0px');
  assert.equal(before.wide.overflow, 'auto');
  assert.equal(before.wide.gutter, 'stable');
  assert.equal(before.wide.background, 'rgba(0, 0, 0, 0)');
  assert.equal(before.wide.border, '0px');
  assert.equal(before.wide.backdrop, 'none');
  assert.equal(before.pluginShadow, 'none', 'Plugins tabs do not inherit conversation shadow');
  assert.equal(before.pluginBackdrop, 'none');
  assert.notEqual(before.chatShadow, 'none', 'conversation tabs retain their surface');
  assert.notEqual(before.reasoning, 'rgb(24, 26, 30)', 'sticky header replaces native bg-base');
  assert.equal(before.reasoningPosition, 'sticky');
  await page.hover('#wide');
  const hovered = await page.evaluate(measure);
  assert.equal(hovered.wide.height, before.wide.height, 'hover cannot add/remove scrollbar padding');
  assert.equal(hovered.wide.overflow, 'auto');
  assert.match(before.wide.thumb, /^transparent transparent$|rgba\(0, 0, 0, 0\) rgba\(0, 0, 0, 0\)/, 'wide-table scrollbar is invisible at rest');
  assert.notEqual(hovered.wide.thumb, before.wide.thumb, 'wide-table scrollbar appears on hover');
  await page.hover('#sidelist [role="treeitem"]');
  assert.ok(await page.evaluate(() => { const l=document.getElementById('sidelist'); return l.scrollWidth <= l.clientWidth }), 'hovering a session row cannot create a horizontal sidebar scrollbar');
  await page.hover('#wide');
  await page.evaluate(() => {const el=document.getElementById('wide');el.scrollLeft=999;});
  assert.ok(await page.evaluate(() => document.getElementById('wide').scrollLeft > 0), 'wide table actually scrolls');
  await page.focus('#wide');
  assert.equal((await page.evaluate(measure)).wide.height, before.wide.height, 'keyboard focus keeps viewport geometry');
  await page.hover('#preview');
  const preview = await page.evaluate(measure);
  assert.equal(preview.preview, before.preview, 'diff preview stays opaque on hover');
  assert.equal(preview.previewImage, 'none');
  await page.evaluate(() => {document.body.dataset.dsDarkTheme='';document.body.dataset.bloomVariant='cinnabar';document.body.style.setProperty('--dsw-alias-bg-layer-1','rgb(40,30,30)');document.body.style.setProperty('--bloom-accent','rgb(190,100,80)');document.body.style.setProperty('--bloom-morandi','190,100,80');});
  const switched = await page.evaluate(measure);
  assert.notEqual(switched.reasoning, before.reasoning, 'reasoning follows switched palette');
  assert.notEqual(switched.trigger, before.trigger, 'trigger follows switched palette');
  assert.equal(switched.preview, 'rgb(40, 30, 30)', 'hover preview follows dark surface');
  await page.hover('#trigger');
  assert.notEqual((await page.evaluate(measure)).trigger, switched.trigger, 'trigger retains palette hover');
  
  } finally { await browser.close() }
})
