import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'
import { prepareMedia, run, updateReleaseNotes } from '../scripts/release-media-cli.mjs'

const imagePath = 'assets/bloom-v0.27.0.png', videoPath = 'assets/bloom-v0.27.0.mp4'
const imageUrl = 'https://example.org/bloom-v0.27.0.png', videoUrl = 'https://example.org/bloom-v0.27.0.mp4'
const notes = 'Original notes\n\n- Feature A\n'
const manifest = { version: '0.27.0', imagePath, videoPath, imageUrl, videoUrl }

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'bloom-media-cli-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'assets'))
  writeFileSync(join(root, 'package.json'), JSON.stringify({ version: manifest.version }))
  writeFileSync(join(root, 'release-media.json'), JSON.stringify(manifest))
  writeFileSync(join(root, imagePath), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  writeFileSync(join(root, videoPath), Buffer.from([0, 0, 0, 12, 102, 116, 121, 112, 105, 115, 111, 109]))
  for (const name of ['README.md', 'README.en.md']) writeFileSync(join(root, name), `![Bloom](${imageUrl})\n[Watch](${videoUrl})\nhttps://github.com/user-attachments/assets/12345678-1234-1234-1234-123456789abc\n`)
  return root
}

test('checks manifest version, media files and both READMEs', t => {
  const root = fixture(t)
  const media = prepareMedia(root)
  assert.equal(media.version, '0.27.0')
  assert.ok(media.markdown.includes(imageUrl) && media.markdown.includes(videoUrl))
  writeFileSync(join(root, 'release-media.json'), JSON.stringify({ ...manifest, version: '0.26.0' }))
  assert.throws(() => prepareMedia(root), /must match/)
  writeFileSync(join(root, 'release-media.json'), JSON.stringify(manifest))
  writeFileSync(join(root, videoPath), '')
  assert.throws(() => prepareMedia(root), /Invalid or empty video/)
})

test('patch releases reuse earlier media of the same minor line, labelled with the media version', t => {
  const root = fixture(t)
  writeFileSync(join(root, 'package.json'), JSON.stringify({ version: '0.27.1' }))
  const media = prepareMedia(root)
  assert.equal(media.version, '0.27.1')
  assert.equal(media.mediaVersion, '0.27.0')
  assert.ok(media.markdown.includes('Bloom 0.27.0 showcase'))
  for (const version of ['0.28.0', '1.27.1', '0.27.1-rc.1']) {
    writeFileSync(join(root, 'package.json'), JSON.stringify({ version }))
    assert.throws(() => prepareMedia(root), /must match/, version)
  }
  writeFileSync(join(root, 'package.json'), JSON.stringify({ version: '0.26.9' }))
  assert.throws(() => prepareMedia(root), /must match/)
  writeFileSync(join(root, 'release-media.json'), JSON.stringify({ ...manifest, version: '0.27.2' }))
  writeFileSync(join(root, 'package.json'), JSON.stringify({ version: '0.27.1' }))
  assert.throws(() => prepareMedia(root), /must match/, 'newer media cannot cover an older patch')
})

test('patch append checks the release tag, not the reused media version', t => {
  const root = fixture(t)
  writeFileSync(join(root, 'package.json'), JSON.stringify({ version: '0.27.1' }))
  const previous = process.env.GITHUB_REF_NAME
  t.after(() => { if (previous === undefined) delete process.env.GITHUB_REF_NAME; else process.env.GITHUB_REF_NAME = previous })
  process.env.GITHUB_REF_NAME = 'v0.27.0'
  assert.throws(() => run(['append', '--dry-run'], { root, output() {} }), /GITHUB_REF_NAME/)
  process.env.GITHUB_REF_NAME = 'v0.27.1'
  let out = ''
  run(['append', '--dry-run'], { root, output: s => { out = s } })
  assert.ok(out.includes('Bloom 0.27.0 showcase'))
})

test('fails closed for missing manifest, media, invalid JSON or placeholder', t => {
  const root = fixture(t)
  rmSync(join(root, 'release-media.json'))
  assert.throws(() => prepareMedia(root), /Cannot read/)
  writeFileSync(join(root, 'release-media.json'), '{')
  assert.throws(() => prepareMedia(root), /Cannot read/)
  writeFileSync(join(root, 'release-media.json'), JSON.stringify(manifest))
  rmSync(join(root, imagePath))
  assert.throws(() => prepareMedia(root), /Cannot read image/)
  writeFileSync(join(root, imagePath), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  writeFileSync(join(root, 'README.en.md'), `![Bloom](${imageUrl})\n[Watch](${videoUrl})\nVideo coming soon`)
  assert.throws(() => prepareMedia(root), /placeholder/)
})

test('appends idempotently and preserves surrounding release notes', () => {
  const first = updateReleaseNotes(notes, 'image and video')
  assert.ok(first.startsWith(notes))
  assert.equal(updateReleaseNotes(first, 'image and video'), first)
  const withTail = `${first}Unrelated extra notes\n`
  const next = updateReleaseNotes(withTail, 'new media')
  assert.ok(next.startsWith(notes))
  assert.ok(next.endsWith('Unrelated extra notes\n'))
  assert.ok(next.includes('new media'))
  assert.ok(!next.includes('image and video'))
  assert.throws(() => updateReleaseNotes('unclosed <!-- bloom-release-media:start -->', 'x'), /malformed/)
  assert.throws(() => updateReleaseNotes(first + first, 'x'), /duplicated/)
})

test('uses gh via execFile arguments and stdin; second append makes no edit', t => {
  const root = fixture(t)
  const previous = process.env.GITHUB_REF_NAME
  t.after(() => { if (previous === undefined) delete process.env.GITHUB_REF_NAME; else process.env.GITHUB_REF_NAME = previous })
  process.env.GITHUB_REF_NAME = 'v0.27.0'
  let body = notes
  const calls = []
  const exec = (file, args, opts) => {
    calls.push({ file, args, opts })
    if (args[1] === 'view') return body
    assert.equal(args[1], 'edit')
    body = opts.input
    return ''
  }
  run(['append'], { root, exec, output() {} })
  assert.equal(calls.length, 2)
  assert.equal(calls[0].file, 'gh')
  assert.deepEqual(calls[0].args, ['release', 'view', 'v0.27.0', '--json', 'body', '--jq', '.body'])
  assert.deepEqual(calls[1].args, ['release', 'edit', 'v0.27.0', '--notes-file', '-'])
  assert.ok(body.startsWith(notes) && body.includes(imageUrl) && body.includes(videoUrl))
  run(['append'], { root, exec, output() {} })
  assert.equal(calls.length, 3, 'repeat reads release but does not write')
})

test('rejects wrong or injected tags before invoking gh', t => {
  const root = fixture(t)
  const previous = process.env.GITHUB_REF_NAME
  t.after(() => { if (previous === undefined) delete process.env.GITHUB_REF_NAME; else process.env.GITHUB_REF_NAME = previous })
  process.env.GITHUB_REF_NAME = 'v0.27.0; touch pwned'
  assert.throws(() => run(['append'], { root, exec: () => { throw Error('unexpected command') }, output() {} }), /must match/)
})

test('actual dry-run is offline and does not require gh', t => {
  const root = fixture(t)
  const script = resolve('scripts/release-media-cli.mjs')
  const result = execFileSync(process.execPath, [script, 'append', '--dry-run'], { cwd: root, encoding: 'utf8', env: { PATH: '', GITHUB_REF_NAME: 'v0.27.0' } })
  assert.match(result, /Existing release notes/)
  assert.ok(result.includes(imageUrl) && result.includes(videoUrl))
})
