import fs from 'node:fs'
import { resolve } from 'node:path'
import { createCodeLens, createRange, getActiveText, getPosition, getRootPath, registerCodeLensProvider } from '@vscode-use/utils'
import type { Disposable } from 'vscode'

const YAML = require('yamljs')

let dispose: Disposable

export function createInstallCodeLensProvider(moduels: any[]) {
  if (dispose)
    dispose.dispose()

  dispose = registerCodeLensProvider(['typescript', 'javascript', 'vue', 'typescriptreact', 'javascriptreact'], {
    provideCodeLenses() {
      const codeLens: any[] = []
      moduels.forEach((module) => {
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

export function getPnpmWorkspace() {
  const projectUrl = getRootPath()!
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
export function detectModule() {
  // 检测文本变化
  const code = getActiveText()!
  const modules: any[] = []
  for (const matcher of code.matchAll(IMPORT_REF)) {
    const source = matcher[1]
    if (isNodeModules.test(source))
      continue

    const name = source.startsWith('@')
      ? source.split('/').slice(0, 2).join('/')
      : source
    const index = matcher.index
    modules.push([name, index])
  }
  createInstallCodeLensProvider(modules)
}
