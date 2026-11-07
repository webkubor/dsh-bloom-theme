import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { checkReleaseMediaFiles, validateReleaseMedia } from '../scripts/release-media-gate.mjs'

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const mp4 = Buffer.from([0, 0, 0, 12, 102, 116, 121, 112, 105, 115, 111, 109])
const imagePath = 'assets/bloom-v0.27.0.png'
const videoPath = 'assets/bloom-v0.27.0.mp4'
const imageUrl = 'https://example.org/bloom-v0.27.0.png'
const videoUrl = 'https://example.org/bloom-v0.27.0.mp4'
const attachment = 'https://github.com/user-attachments/assets/12345678-1234-1234-1234-123456789abc'
const doc = `![Bloom](${imageUrl})\n\n${attachment}\n\n[Watch demo](${videoUrl})\n`

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'bloom-release-media-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'assets'))
  writeFileSync(join(root, imagePath), png)
  writeFileSync(join(root, videoPath), mp4)
  writeFileSync(join(root, 'README.md'), doc)
  writeFileSync(join(root, 'README.en.md'), doc)
  return { root, version: '0.27.0', imagePath, videoPath, imageUrl, videoUrl }
}

function fails(result, text) {
  assert.equal(result.ok, false)
  assert.equal(result.releaseMarkdown, null)
  assert.ok(result.errors.some(e => e.includes(text)), result.errors.join('; '))
}

test('accepts matching files and both READMEs, returning release media markdown', t => {
  const f = fixture(t)
  const result = checkReleaseMediaFiles(f)
  assert.equal(result.ok, true, result.errors.join('; '))
  assert.equal(result.releaseMarkdown, `![Bloom 0.27.0 showcase](${imageUrl})\n\n[Watch the Bloom 0.27.0 demo](${videoUrl})`)
})

test('pure validator never mutates inputs', () => {
  const input = { version: '0.27.0', image: { path: imagePath, url: imageUrl, bytes: png }, video: { path: videoPath, url: videoUrl, bytes: mp4 }, readmes: [{ name: 'README.md', text: doc }, { name: 'README.en.md', text: doc }] }
  const before = JSON.stringify(input)
  assert.equal(validateReleaseMedia(input).ok, true)
  assert.equal(JSON.stringify(input), before)
})

test('missing, empty or mislabeled media is rejected', t => {
  const f = fixture(t)
  rmSync(join(f.root, videoPath))
  fails(checkReleaseMediaFiles(f), 'Cannot read video')
  writeFileSync(join(f.root, videoPath), mp4)
  writeFileSync(join(f.root, imagePath), '')
  fails(checkReleaseMediaFiles(f), 'Invalid or empty image')
  writeFileSync(join(f.root, imagePath), 'not a PNG')
  fails(checkReleaseMediaFiles(f), 'Invalid or empty image')
})

test('requires exact candidate version in filenames and URLs', t => {
  const f = fixture(t)
  fails(checkReleaseMediaFiles({ ...f, version: '0.27.1' }), 'does not identify 0.27.1')
  fails(checkReleaseMediaFiles({ ...f, version: '0.27.0-beta.1' }), 'does not identify')
  fails(checkReleaseMediaFiles({ ...f, imageUrl: 'https://example.org/bloom-v0.26.0.png' }), 'does not match local file')
})

test('requires real links in every README; comments and fenced code are not evidence', t => {
  const f = fixture(t)
  writeFileSync(join(f.root, 'README.en.md'), `<!-- ${doc} -->\n\`\`\`md\n${doc}\`\`\`\n`)
  const result = checkReleaseMediaFiles(f)
  fails(result, 'README.en.md does not embed')
  assert.ok(result.errors.some(e => e.includes('does not link')))
})

test('requires a standalone attachment in each README, not just a Markdown link', t => {
  const f = fixture(t)
  writeFileSync(join(f.root, 'README.md'), `![Bloom](${imageUrl})\n[Watch demo](${videoUrl})\n`)
  fails(checkReleaseMediaFiles(f), 'README.md must contain a standalone')
  writeFileSync(join(f.root, 'README.md'), doc)
  writeFileSync(join(f.root, 'README.en.md'), `![Bloom](${imageUrl})\n[Watch demo](${videoUrl})\n[GitHub video](${attachment})\n`)
  fails(checkReleaseMediaFiles(f), 'README.en.md must contain a standalone')
  writeFileSync(join(f.root, 'README.en.md'), `![Bloom](${imageUrl})\n[Watch demo](${videoUrl})\n<!--\n${attachment}\n-->\n`)
  fails(checkReleaseMediaFiles(f), 'README.en.md must contain a standalone')
  writeFileSync(join(f.root, 'README.en.md'), `![Bloom](${imageUrl})\n[Watch demo](${videoUrl})\n\`\`\`\n${attachment}\n\`\`\`\n`)
  fails(checkReleaseMediaFiles(f), 'README.en.md must contain a standalone')
})

test('rejects differing attachment URLs and malformed or disguised URLs', t => {
  const f = fixture(t)
  const other = 'https://github.com/user-attachments/assets/abcdefab-1234-1234-1234-123456789abc'
  writeFileSync(join(f.root, 'README.en.md'), doc.replace(attachment, other))
  fails(checkReleaseMediaFiles(f), 'must embed the same')
  for (const bad of [attachment + '?download=1', attachment + '/extra', attachment.replace('github.com', 'github.com.example.org'), attachment.replace('123456789abc', 'not-a-uuid')]) {
    writeFileSync(join(f.root, 'README.en.md'), doc.replace(attachment, bad))
    fails(checkReleaseMediaFiles(f), 'README.en.md must contain a standalone')
  }
  writeFileSync(join(f.root, 'README.en.md'), doc)
  assert.equal(checkReleaseMediaFiles(f).ok, true)
})

test('rejects unfinished README placeholder in either language', t => {
  const f = fixture(t)
  writeFileSync(join(f.root, 'README.md'), `${doc}\n视频待补充`)
  fails(checkReleaseMediaFiles(f), 'placeholder')
  writeFileSync(join(f.root, 'README.md'), doc)
  writeFileSync(join(f.root, 'README.en.md'), `${doc}\nDemo video coming soon`)
  fails(checkReleaseMediaFiles(f), 'placeholder')
})

test('refuses traversal, absolute paths and symlinks outside repository', t => {
  const f = fixture(t)
  const outside = mkdtempSync(join(tmpdir(), 'bloom-media-outside-'))
  t.after(() => rmSync(outside, { recursive: true, force: true }))
  writeFileSync(join(outside, 'bloom-v0.27.0.mp4'), mp4)
  fails(checkReleaseMediaFiles({ ...f, videoPath: '../bloom-v0.27.0.mp4' }), 'Cannot read video')
  fails(checkReleaseMediaFiles({ ...f, videoPath: join(outside, 'bloom-v0.27.0.mp4') }), 'Invalid video path')
  symlinkSync(join(outside, 'bloom-v0.27.0.mp4'), join(f.root, 'assets', 'linked-v0.27.0.mp4'))
  fails(checkReleaseMediaFiles({ ...f, videoPath: 'assets/linked-v0.27.0.mp4' }), 'Cannot read video')
})

test('rejects unsafe URLs and requires at least one README', t => {
  const f = fixture(t)
  fails(checkReleaseMediaFiles({ ...f, imageUrl: 'http://example.org/bloom-v0.27.0.png' }), 'HTTPS')
  fails(checkReleaseMediaFiles({ ...f, videoUrl: 'https://user:secret@example.org/bloom-v0.27.0.mp4' }), 'HTTPS')
  fails(checkReleaseMediaFiles({ ...f, videoUrl: `${videoUrl})\nunsafe` }), 'HTTPS')
  fails(checkReleaseMediaFiles({ ...f, readmes: [] }), 'At least one README')
})
