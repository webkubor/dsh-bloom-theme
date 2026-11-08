import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const script = fileURLToPath(new URL('../scripts/enrich-release.mjs', import.meta.url))

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'bloom-enrich-test-'))
  const bin = join(root, 'bin')
  const calls = join(root, 'calls.jsonl')
  const notes = join(root, 'notes.md')
  mkdirSync(bin)
  const mock = `#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')
const command = path.basename(process.argv[1])
const args = process.argv.slice(2)
fs.appendFileSync(process.env.BLOOM_TEST_CALLS, JSON.stringify({ command, args }) + '\\n')
if (command === 'git') {
  if (args[0] === 'describe') process.stdout.write('v1.2.2\\n')
  else if (args[0] === 'tag') process.stdout.write('v1.2.2\\nv1.2.3-rc.1\\n')
  else if (args[0] === 'log') process.stdout.write('abc123\\x01fix: example\\x01User-visible detail\\x01END\\n')
  else process.exit(2)
} else if (command === 'gh' && args[0] === 'release' && args[1] === 'view') {
  process.stdout.write('## Release notes\\n')
} else if (command === 'gh' && args[0] === 'release' && args[1] === 'edit') {
  fs.writeFileSync(process.env.BLOOM_TEST_NOTES, fs.readFileSync(0, 'utf8'))
} else process.exit(2)
`
  for (const name of ['git', 'gh']) writeFileSync(join(bin, name), mock, { mode: 0o755 })
  return { root, calls, notes, env: { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}`, BLOOM_TEST_CALLS: calls, BLOOM_TEST_NOTES: notes } }
}

function cleanup(root) {
  assert.equal(resolve(root).startsWith(resolve(tmpdir()) + '/bloom-enrich-test-'), true)
  rmSync(root, { recursive: true, force: true })
}

test('rejects malicious and invalid tag arguments before running commands', () => {
  const f = fixture()
  try {
    for (const tag of ['v1.2.3;touch pwned', 'v1.2.3$(touch pwned)', 'v1', 'v1.2.3-..', 'v1.2.3-01', 'v1.2.3+..', '--unexpected']) {
      const result = spawnSync(process.execPath, [script, tag], { cwd: f.root, env: f.env, encoding: 'utf8' })
      assert.notEqual(result.status, 0, tag)
      assert.equal(existsSync(f.calls), false, 'invalid tag must not invoke git or gh')
      assert.equal(existsSync(join(f.root, 'pwned')), false)
    }
  } finally { cleanup(f.root) }
})

test('accepts a prerelease version and passes the tag as a separate argument', () => {
  const f = fixture()
  try {
    const result = spawnSync(process.execPath, [script, 'v1.2.3-rc.1', '--dry'], { cwd: f.root, env: f.env, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /User-visible detail/)
    const calls = readFileSync(f.calls, 'utf8').trim().split('\n').map(JSON.parse)
    const describe = calls.find(x => x.command === 'git' && x.args[0] === 'describe')
    assert.deepEqual(describe.args, ['describe', '--tags', '--abbrev=0', 'v1.2.3-rc.1^'])
    assert.equal(calls.some(x => x.command === 'gh' && x.args[1] === 'edit'), false)
  } finally { cleanup(f.root) }
})

test('passes release notes to gh on stdin without a shell or temporary file', () => {
  const f = fixture()
  try {
    const result = spawnSync(process.execPath, [script, 'v1.2.3-rc.1'], { cwd: f.root, env: f.env, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    const calls = readFileSync(f.calls, 'utf8').trim().split('\n').map(JSON.parse)
    const edit = calls.find(x => x.command === 'gh' && x.args[1] === 'edit')
    assert.deepEqual(edit.args, ['release', 'edit', 'v1.2.3-rc.1', '--notes-file', '-'])
    assert.match(readFileSync(f.notes, 'utf8'), /User-visible detail/)
  } finally { cleanup(f.root) }
})
