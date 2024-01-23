import fs from 'node:fs'
import { resolve } from 'node:path'
import { createCodeLens, createRange, getActiveText, getCurrentFileUrl, getPosition, getRootPath, registerCodeLensProvider } from '@vscode-use/utils'
import type { Disposable } from 'vscode'
import { findUpSync } from 'find-up'
import { pnpmWorkspace } from '.'

const YAML = require('yamljs')

let dispose: Disposable

export function createInstallCodeLensProvider(modules: any[]) {
  if (dispose)
    dispose.dispose()

  dispose = registerCodeLensProvider(['typescript', 'javascript', 'vue', 'typescriptreact', 'javascriptreact'], {
    provideCodeLenses() {
      const codeLens: any[] = []
      modules.forEach((module) => {
        // const {range,}
        const [name, index] = module
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

const IMPORT_REF = /from ['"]([^'"]+)['"]/g
const isNodeModules = /^(@\/|\.|\~|\/)/
const filters = [/^vscode$/, /^node:/, /^(fs|process)$/, /^virtual:/]
export function detectModule() {
  // 检测文本变化
  const code = getActiveText()!
  const modules: any[] = []
  const deps = getCurrentPkg()
  for (const matcher of code.matchAll(IMPORT_REF)) {
    const source = matcher[1]
    if (isNodeModules.test(source))
      continue

    const name = source.startsWith('@')
      ? source.split('/').slice(0, 2).join('/')
      : source
    const index = matcher.index
    if (!deps.includes(name) && !filters.some(r => r.test(name)))
      modules.push([name, index])
  }
  createInstallCodeLensProvider(modules)
}

export function getCurrentPkg() {
  const pkg = findUpSync('package.json', {
    cwd: getCurrentFileUrl()! as string,
  })
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
  const obj = JSON.parse(fs.readFileSync(url, 'utf-8'))
  return Object.keys(Object.assign({}, obj.dependencies, obj.devDependencies))
}
