import type { CodeLens, TextDocument } from 'vscode'
import type { MissingModule } from './core'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'
import { createCodeLens, createRange, getCurrentFileUrl, registerCodeLensProvider } from '@vscode-use/utils'
import { findUpSync } from 'find-up'
import { useJSONParse } from 'lazy-js-utils'
import { EventEmitter } from 'vscode'
import YAML from 'yamljs'
import { getAliasKeys } from './alias'
import { detectMissingModules } from './core'

const codeLensChangeEmitter = new EventEmitter<void>()
const execFileAsync = promisify(execFile)
const packageExistsCache = new Map<string, Promise<boolean>>()

export function refreshCodeLenses() {
  codeLensChangeEmitter.fire()
}

function readPackageJson(url: string) {
  if (!fs.existsSync(url))
    return
  return useJSONParse(fs.readFileSync(url, 'utf-8'))
}

function getWorkspaceRoot(fileUrl = getCurrentFileUrl() || undefined) {
  if (!fileUrl)
    return

  let currentDir = dirname(fileUrl)
  while (true) {
    const workspace = resolve(currentDir, 'pnpm-workspace.yaml')
    if (fs.existsSync(workspace))
      return currentDir

    const pkgUrl = resolve(currentDir, 'package.json')
    const pkg = readPackageJson(pkgUrl)
    if (pkg?.workspaces)
      return currentDir

    const parentDir = dirname(currentDir)
    if (parentDir === currentDir)
      return
    currentDir = parentDir
  }
}

export function getPnpmWorkspace(fileUrl = getCurrentFileUrl() || undefined) {
  const workspaceRoot = getWorkspaceRoot(fileUrl)
  if (!workspaceRoot)
    return
  const workspace = resolve(workspaceRoot, 'pnpm-workspace.yaml')
  if (!fs.existsSync(workspace))
    return
  const content = fs.readFileSync(workspace, 'utf-8')
  const obj = YAML.parse(content)
  const packages = obj.packages
  return packages
}

export function getCurrentPkgPath(fileUrl = getCurrentFileUrl() || undefined) {
  if (!fileUrl)
    return
  return findUpSync('package.json', {
    cwd: fileUrl,
  })
}

export function getCurrentPackageDir(fileUrl = getCurrentFileUrl() || undefined) {
  const pkg = getCurrentPkgPath(fileUrl)
  if (!pkg)
    return
  return dirname(pkg)
}

export function getCurrentPkg(fileUrl = getCurrentFileUrl() || undefined) {
  const pkg = getCurrentPkgPath(fileUrl)
  if (!pkg)
    return []
  const base = getDeps(pkg)
  const workspaceRoot = getWorkspaceRoot(fileUrl)
  if (workspaceRoot) {
    const url = resolve(workspaceRoot, 'package.json')
    if (fs.existsSync(url) && url !== pkg) {
      const rootBase = getDeps(url)
      return [...rootBase, ...base || []]
    }
  }
  return base
}

function getDeps(url: string) {
  const obj = readPackageJson(url)
  if (!obj)
    return []
  return Object.keys(Object.assign({}, obj.dependencies, obj.devDependencies))
}

async function packageExists(name: string) {
  if (packageExistsCache.has(name))
    return packageExistsCache.get(name)!

  const promise = execFileAsync('npm', ['view', name, 'version'])
    .then(() => {
      const result = Promise.resolve(true)
      packageExistsCache.set(name, result)
      return true
    })
    .catch(() => {
      packageExistsCache.delete(name)
      return false
    })
  packageExistsCache.set(name, promise)
  return promise
}

export function createInstallCodeLensProvider() {
  return registerCodeLensProvider(['typescript', 'javascript', 'vue', 'typescriptreact', 'javascriptreact'], {
    onDidChangeCodeLenses: codeLensChangeEmitter.event,
    async provideCodeLenses(document: TextDocument) {
      if (document.uri.scheme !== 'file')
        return []

      const codeLens: any[] = []
      const modules = detectMissingModules(
        document.getText(),
        getCurrentPkg(document.uri.fsPath),
        await getAliasKeys(document.uri.fsPath),
      )
      const data = (await Promise.all(modules.map(async (module) => {
        if (await packageExists(module.name))
          return module
      }))).filter((module): module is MissingModule => Boolean(module))

      data.forEach((module) => {
        const { index, name } = module
        const position = document.positionAt(index)
        const range = createRange(position.line, position.character, position.line, position.character)
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
      return codeLens as CodeLens[]
    },
  })
}
