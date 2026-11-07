/** Release media validation. This module only reads local files; it never uploads. */
import { readFileSync, realpathSync, statSync } from 'node:fs'
import { basename, extname, isAbsolute, relative, resolve, sep } from 'node:path'

const VERSION = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/
const PLACEHOLDER = /(?:待补充|待补|即将补充|视频占位|视频筹备中|planned|coming soon|to be added|video placeholder|placeholder video|tbd)/i
// GitHub renders a bare attachment URL as a video player. Structure only: actual
// playback, attachment provenance and correspondence to the local MP4 require review.
const GITHUB_VIDEO_LINE = /^https:\/\/github\.com\/user-attachments\/assets\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[ \t]*$/gim
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function versioned(name, version) {
  return new RegExp(`(?:^|[^0-9A-Za-z])v?${escapeRe(version)}(?![0-9A-Za-z-]|\\.[0-9])`, 'i').test(name)
}

function mediaSignature(bytes, extension) {
  if (!Buffer.isBuffer(bytes) || !bytes.length) return false
  switch (extension.toLowerCase()) {
    case '.png': return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    case '.jpg': case '.jpeg': return bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    case '.webp': return bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
    case '.gif': return ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6))
    case '.mp4': case '.mov': return bytes.length >= 12 && bytes.toString('ascii', 4, 8) === 'ftyp'
    case '.webm': return bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))
    default: return false
  }
}

function visibleMarkdown(text) {
  return text.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, '')
}

/** Pure validation on already loaded data. Header signatures are not a playback or provenance check. */
export function validateReleaseMedia({ version, image, video, readmes } = {}) {
  const errors = []
  if (typeof version !== 'string' || !VERSION.test(version)) errors.push('Invalid candidate version')
  const validVersion = errors.length === 0
  const media = [['image', image, ['.png', '.jpg', '.jpeg', '.webp', '.gif']], ['video', video, ['.mp4', '.mov', '.webm']]]
  for (const [kind, item, extensions] of media) {
    if (!item || typeof item.path !== 'string' || typeof item.url !== 'string') { errors.push(`Missing ${kind} descriptor`); continue }
    const ext = extname(item.path).toLowerCase()
    if (!extensions.includes(ext)) errors.push(`Unsupported ${kind} extension`)
    if (!mediaSignature(item.bytes, ext)) errors.push(`Invalid or empty ${kind} file`)
    if (validVersion && !versioned(basename(item.path), version)) errors.push(`${kind} filename does not identify ${version}`)
    try {
      const url = new URL(item.url)
      if (url.protocol !== 'https:' || url.username || url['pass' + 'word'] || url.search || url.hash || /[\s()<>]/.test(item.url)) throw new Error('unsafe')
      const urlName = decodeURIComponent(url.pathname.split('/').at(-1))
      if (urlName !== basename(item.path)) errors.push(`${kind} URL filename does not match local file`)
      if (validVersion && !versioned(urlName, version)) errors.push(`${kind} URL does not identify ${version}`)
    } catch { errors.push(`Invalid ${kind} HTTPS URL`) }
  }
  const videoAttachments = new Map()
  if (!Array.isArray(readmes) || readmes.length === 0) errors.push('At least one README is required')
  else for (const doc of readmes) {
    if (!doc || typeof doc.name !== 'string' || typeof doc.text !== 'string') { errors.push('Invalid README descriptor'); continue }
    const visible = visibleMarkdown(doc.text)
    if (PLACEHOLDER.test(visible)) errors.push(`${doc.name} contains placeholder text`)
    const attachments = [...visible.matchAll(GITHUB_VIDEO_LINE)].map(match => match[0].trim().toLowerCase())
    videoAttachments.set(doc.name, attachments)
    if (!attachments.length) errors.push(`${doc.name} must contain a standalone GitHub video attachment URL`)
    if (image?.url) {
      const url = escapeRe(image.url)
      const markdownImage = new RegExp(`!\\[[^\\]\\n]*\\]\\(<?${url}>?(?:\\s+[^)]*)?\\)`)
      const htmlImage = new RegExp(`<img\\b[^>]*\\bsrc=["']${url}["'][^>]*>`, 'i')
      if (!markdownImage.test(visible) && !htmlImage.test(visible)) errors.push(`${doc.name} does not embed the candidate image`)
    }
    if (video?.url) {
      const url = escapeRe(video.url)
      const linkedVideo = new RegExp(`(?<!!)\\[[^\\]\\n]+\\]\\(<?${url}>?(?:\\s+[^)]*)?\\)|(?:^|[\\s<])${url}(?=$|[\\s>])`, 'm')
      if (!linkedVideo.test(visible)) errors.push(`${doc.name} does not link the candidate video`)
    }
  }
  const zhAttachments = videoAttachments.get('README.md')
  const enAttachments = videoAttachments.get('README.en.md')
  if (!zhAttachments || !enAttachments) errors.push('Both README.md and README.en.md are required')
  else if (zhAttachments.length && enAttachments.length && !zhAttachments.some(url => enAttachments.includes(url))) {
    errors.push('README.md and README.en.md must embed the same GitHub video attachment')
  }
  return { ok: errors.length === 0, errors, releaseMarkdown: errors.length ? null : `![Bloom ${version} showcase](${image.url})\n\n[Watch the Bloom ${version} demo](${video.url})` }
}

/** Read and validate real files under root, rejecting path traversal and symlink escapes. */
export function checkReleaseMediaFiles({ root, version, imagePath, videoPath, imageUrl, videoUrl, readmes = ['README.md', 'README.en.md'] } = {}) {
  const errors = []
  let rootPath
  try { rootPath = realpathSync(root) } catch { return { ok: false, errors: ['Invalid repository root'], releaseMarkdown: null } }
  function load(path, label) {
    if (typeof path !== 'string' || !path || isAbsolute(path)) { errors.push(`Invalid ${label} path`); return null }
    try {
      const absolute = realpathSync(resolve(rootPath, path))
      const rel = relative(rootPath, absolute)
      if (!rel || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error('outside root')
      if (!statSync(absolute).isFile()) throw new Error('not a file')
      return readFileSync(absolute)
    } catch { errors.push(`Cannot read ${label} within repository`) ; return null }
  }
  const imageBytes = load(imagePath, 'image')
  const videoBytes = load(videoPath, 'video')
  const docs = Array.isArray(readmes) ? readmes.map(name => {
    const bytes = load(name, `README ${name}`)
    return { name, text: bytes?.toString('utf8') ?? '' }
  }) : []
  const result = validateReleaseMedia({ version, image: { path: imagePath, url: imageUrl, bytes: imageBytes }, video: { path: videoPath, url: videoUrl, bytes: videoBytes }, readmes: docs })
  errors.push(...result.errors)
  return { ok: errors.length === 0, errors, releaseMarkdown: errors.length ? null : result.releaseMarkdown }
}
