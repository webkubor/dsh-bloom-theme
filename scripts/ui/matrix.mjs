import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const [output, mode = 'palettes', ...flags] = process.argv.slice(2)
if (!output || !['representatives', 'palettes', 'full'].includes(mode) || flags.some(flag => flag !== '--resume')) throw new Error('Usage: node scripts/ui/matrix.mjs <output-directory> [representatives|palettes|full] [--resume]')
const helper = '/tmp/bloom-native-ui'
execFileSync('swiftc', [fileURLToPath(new URL('./native-ui.swift', import.meta.url)), '-o', helper])
execFileSync('python3', [fileURLToPath(new URL('./native-matrix.py', import.meta.url)), '--helper', helper, '--out', output, '--mode', mode, ...flags], { stdio: 'inherit' })
