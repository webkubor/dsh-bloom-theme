/**
 * DSH Bloom 桌面 profile 依赖切换。
 *
 * 本地开发使用 link: 指向当前工作树；发布成功后切到 npm 上已经存在的精确版本。
 * 这样桌面测试能立即看到本地改动，生产桌面端则不会继续依赖开发工作树。
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageName = '@kubor/dsh-bloom-theme'
const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoDir = resolve(scriptDir, '..')
const profileDir = resolve(homedir(), '.dsh/profiles/desktop')
const profilePackagePath = resolve(profileDir, 'package.json')
const rootPackage = JSON.parse(readFileSync(resolve(repoDir, 'package.json'), 'utf8'))
const args = process.argv.slice(2)
const mode = args[0]
const dryRun = args.includes('--dry-run')

if (!['link', 'production'].includes(mode)) {
  throw new Error('用法：node scripts/desktop-profile.mjs <link|production> [version] [--dry-run]')
}
if (!existsSync(profilePackagePath)) {
  throw new Error(`找不到桌面 profile：${profilePackagePath}`)
}

const productionVersion = args.find(arg => arg !== mode && arg !== '--dry-run') || rootPackage.version
if (mode === 'production') {
  const published = execFileSync('npm', ['view', `${packageName}@${productionVersion}`, 'version', '--json'], {
    cwd: repoDir,
    encoding: 'utf8',
  }).trim().replaceAll('"', '')
  if (published !== productionVersion) {
    throw new Error(`${packageName}@${productionVersion} 尚未发布，拒绝切换桌面 production profile`)
  }
}

const profilePackage = JSON.parse(readFileSync(profilePackagePath, 'utf8'))
const nextDependency = mode === 'link' ? `link:${repoDir}` : productionVersion
const nextProfilePackage = {
  ...profilePackage,
  dependencies: {
    ...profilePackage.dependencies,
    [packageName]: nextDependency,
  },
}

console.log(`desktop profile: ${mode} → ${nextDependency}`)
if (dryRun) process.exit(0)

writeFileSync(profilePackagePath, `${JSON.stringify(nextProfilePackage, null, 2)}\n`)
execFileSync('pnpm', ['install', '--ignore-scripts'], { cwd: profileDir, stdio: 'inherit' })
console.log('已更新桌面 profile；重载桌面 DSH 页面或重启其进程后生效。')
