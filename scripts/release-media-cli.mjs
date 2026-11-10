#!/usr/bin/env node
/** Validate release-media.json or attach its validated media to existing Release notes. */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkReleaseMediaFiles } from './release-media-gate.mjs'

const START = '<!-- bloom-release-media:start -->'
const END = '<!-- bloom-release-media:end -->'

export function prepareMedia(root) {
  let manifest, pkg
  try {
    pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
    manifest = JSON.parse(readFileSync(resolve(root, 'release-media.json'), 'utf8'))
  } catch (error) { throw new Error(`Cannot read package.json or release-media.json: ${error.message}`) }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || typeof pkg.version !== 'string' || !mediaCovers(manifest.version, pkg.version)) {
    throw new Error('release-media.json version must match package.json version, or be an earlier patch of the same minor line')
  }
  // Media keeps its own version in file names and the Release caption, so a patch never claims new footage.
  const result = checkReleaseMediaFiles({ root, version: manifest.version, imagePath: manifest.imagePath, videoPath: manifest.videoPath, imageUrl: manifest.imageUrl, videoUrl: manifest.videoUrl })
  if (!result.ok) throw new Error(`Release media validation failed:\n- ${result.errors.join('\n- ')}`)
  return { version: pkg.version, mediaVersion: manifest.version, markdown: result.releaseMarkdown }
}

/** Patch releases may reuse the media of an earlier patch in the same x.y line; minor/major releases need new media. */
export function mediaCovers(media, release) {
  const parse = v => typeof v === 'string' && /^(\d+)\.(\d+)\.(\d+)$/.exec(v)
  const m = parse(media), r = parse(release)
  if (!m || !r) return typeof media === 'string' && media === release
  return m[1] === r[1] && m[2] === r[2] && Number(m[3]) <= Number(r[3])
}

/** Replace only our own delimited block; all other release notes remain intact. */
export function updateReleaseNotes(current, markdown) {
  if (typeof current !== 'string') throw new Error('Release notes must be text')
  const start = current.indexOf(START), end = current.indexOf(END)
  const block = `${START}\n${markdown}\n${END}`
  if (start === -1 && end === -1) return `${current}${current && !current.endsWith('\n') ? '\n' : ''}${current ? '\n' : ''}${block}\n`
  if (start === -1 || end < start || current.indexOf(START, start + START.length) !== -1 || current.indexOf(END, end + END.length) !== -1) {
    throw new Error('Release media markers are malformed or duplicated')
  }
  return current.slice(0, start) + block + current.slice(end + END.length)
}

export function run(args, { root = process.cwd(), exec = execFileSync, output = console.log } = {}) {
  const [command, ...flags] = args
  const dryRun = flags.includes('--dry-run')
  if (!['check', 'append'].includes(command) || flags.some(f => f !== '--dry-run') || (command === 'check' && dryRun)) {
    throw new Error('Usage: node scripts/release-media-cli.mjs check | append [--dry-run]')
  }
  const media = prepareMedia(root)
  if (command === 'check') { output(`Release media ${media.version} validated`); return }
  const tag = process.env.GITHUB_REF_NAME
  if (tag !== `v${media.version}`) throw new Error('GITHUB_REF_NAME must match the candidate version tag')
  // Dry run must never talk to GitHub; exercise formatting against a deterministic sample.
  if (dryRun) { output(updateReleaseNotes('Existing release notes', media.markdown)); return }
  const current = exec('gh', ['release', 'view', tag, '--json', 'body', '--jq', '.body'], { cwd: root, encoding: 'utf8' })
  const next = updateReleaseNotes(current, media.markdown)
  if (next === current) { output(`Release ${tag} already has the current media`); return }
  exec('gh', ['release', 'edit', tag, '--notes-file', '-'], { cwd: root, encoding: 'utf8', input: next })
  output(`Release ${tag} media updated`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run(process.argv.slice(2)) } catch (error) { console.error(error.message); process.exitCode = 1 }
}
