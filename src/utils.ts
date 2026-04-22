import type { MissingModule } from './core'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'
import { createCodeLens, createRange, getActiveText, getCurrentFileUrl, getPosition, getRootPath, registerCodeLensProvider } from '@vscode-use/utils'
import { findUpSync } from 'find-up'
import { getCurrentAliasKeys } from './alias'
import { detectMissingModules } from './core'

export const pnpmWorkspace = getPnpmWorkspace()
const YAML = require('yamljs')

const execFileAsync = promisify(execFile)
const packageExistsCache = new Map<string, Promise<boolean>>()

const projectUrl = getRootPath()
export function getPnpmWorkspace() {
  if (!projectUrl)
    return
  const workspace = resolve(projectUrl, 'pnpm-workspace.yaml')
  if (!fs.existsSync(workspace))
    return
  const content = fs.readFileSync(workspace, 'utf-8')
  const obj = YAML.parse(content)
  const packages = obj.packages
  return packages
}

const modules: {
  data: MissingModule[]
} = {
  data: [],
}
export function detectModule() {
  // 检测文本变化
  const code = getActiveText()
  if (!code)
    return
  const deps = getCurrentPkg()
  const aliasKeys = getCurrentAliasKeys()
  modules.data = detectMissingModules(code, deps, aliasKeys)
}

export function getCurrentPkgPath() {
  return findUpSync('package.json', {
    cwd: getCurrentFileUrl()! as string,
  })
}

export function getCurrentPackageDir() {
  const pkg = getCurrentPkgPath()
  if (!pkg)
    return
  return dirname(pkg)
}

export function getCurrentPkg() {
  const pkg = getCurrentPkgPath()
  if (!pkg)
    return []
  const base = getDeps(pkg)
  if (pnpmWorkspace) {
    const url = resolve(projectUrl!, 'package.json')
    if (fs.existsSync(url)) {
      const rootBase = getDeps(url) || []
      return [...rootBase, ...base || []]
    }
  }
  return base
}

function getDeps(url: string) {
  if (!fs.existsSync(url))
    return []
  try {
    const obj = JSON.parse(fs.readFileSync(url, 'utf-8'))
    return Object.keys(Object.assign({}, obj.dependencies, obj.devDependencies))
  }
  catch (error) {
    console.log(error)
    return []
  }
}

async function packageExists(name: string) {
  if (!packageExistsCache.has(name)) {
    packageExistsCache.set(name, execFileAsync('npm', ['view', name, 'version'])
      .then(() => true)
      .catch(() => false))
  }
  return packageExistsCache.get(name)!
}

export function createInstallCodeLensProvider() {
  return registerCodeLensProvider(['typescript', 'javascript', 'vue', 'typescriptreact', 'javascriptreact'], {
    async provideCodeLenses() {
      const codeLens: any[] = []
      const data = (await Promise.all(modules.data.map(async (module) => {
        if (await packageExists(module.name))
          return module
      }))).filter((module): module is MissingModule => Boolean(module))
      // 过滤非 npm 上可搜索到的包
      data.forEach((module) => {
        const { index, name } = module
        const position = getPosition(index)
        const range = createRange(position.line, position.column, position.line, position.column)
        codeLens.push(createCodeLens(range, {
          command: 'lazy-install.install',
          title: name,
          tooltip: name,
          arguments: [range, name],
        }))
        const _name = `${name} -D`
        codeLens.push(createCodeLens(range, {
          command: 'lazy-install.install',
          title: _name,
          tooltip: name,
          arguments: [range, _name],
        }))
      })
      return codeLens
    },
  })
}
