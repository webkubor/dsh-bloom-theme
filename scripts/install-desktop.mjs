import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const profileName = process.env.DSH_PROFILE ?? 'desktop'
const profileRoot = process.env.DSH_HOME
  ? join(process.env.DSH_HOME, 'profiles', profileName)
  : join(homedir(), '.dsh/profiles', profileName)
const candidates = [
  process.env.DSH_BIN,
  join(homedir(), '.local/bin/dsh'),
  '/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh',
].filter(Boolean)

function resolveDsh() {
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  try {
    return execFileSync('which', ['dsh'], { encoding: 'utf8' }).trim()
  } catch {
    throw new Error('找不到 dsh CLI；请安装 DeepSeek Harness，或用 DSH_BIN 指定路径')
  }
}

function hashFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

const dshBin = resolveDsh()
execFileSync(dshBin, ['plugin', '--profile', profileName, 'add', root], {
  cwd: root,
  stdio: 'inherit',
})

const installedRoot = join(profileRoot, 'node_modules/dsh-bloom-theme')
const installedPackage = join(installedRoot, 'package.json')
if (!existsSync(installedPackage)) {
  throw new Error(`安装校验失败：未找到 ${installedPackage}`)
}

const installedPackageJson = JSON.parse(readFileSync(installedPackage, 'utf8'))
if (installedPackageJson.name !== 'dsh-bloom-theme') {
  throw new Error(`安装校验失败：插件包名是 ${installedPackageJson.name}`)
}

const sourceBundle = join(root, 'lib/client.js')
const installedBundle = join(installedRoot, 'lib/client.js')
const sourceHash = hashFile(sourceBundle)
const installedHash = hashFile(installedBundle)
if (sourceHash !== installedHash) {
  throw new Error(`安装校验失败：源文件 ${sourceHash}，桌面端 ${installedHash}`)
}

console.log(`Bloom 已安装到 DSH ${profileName} profile`)
console.log(`插件目录：${realpathSync(installedRoot)}`)
console.log(`客户端 SHA-256：${installedHash}`)
