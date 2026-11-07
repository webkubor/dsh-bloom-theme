import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const [output, ...flags] = process.argv.slice(2)
if (!output || flags.some(flag => flag !== '--menu')) throw new Error('Usage: node scripts/ui/desk.mjs <output.png> [--menu]')
const helper = '/tmp/bloom-native-ui'
execFileSync('swiftc', [fileURLToPath(new URL('./native-ui.swift', import.meta.url)), '-o', helper])
execFileSync('osascript', ['-e', 'tell application "DeepSeek Harness" to activate', '-e', 'delay 0.5'])
const ui = (...args) => JSON.parse(execFileSync(helper, args, { encoding: 'utf8' }))
const trigger = () => ui('list', 'Bloom 主题').find(row => row.role === 'AXPopUpButton' && row.help?.startsWith('Bloom 主题'))
const initial = trigger()
if (!initial) throw new Error('Bloom menu unavailable in actual desktop')
const wantMenu = flags.includes('--menu')
try {
  if (Boolean(initial.expanded) !== wantMenu) ui('press', 'Bloom 主题 ·*', 'AXPopUpButton')
  const window = ui('window')
  if (!window.onscreen) throw new Error('Actual DSH window is not onscreen')
  const path = resolve(output)
  mkdirSync(dirname(path), { recursive: true })
  execFileSync('screencapture', ['-x', '-o', '-l', String(window.id), path])
  writeFileSync(`${path}.json`, JSON.stringify({ window, trigger: trigger(), source: 'actual-macOS-desktop' }, null, 2))
  console.log(path)
} finally {
  if (Boolean(trigger()?.expanded) !== Boolean(initial.expanded)) ui('press', 'Bloom 主题 ·*', 'AXPopUpButton')
}
