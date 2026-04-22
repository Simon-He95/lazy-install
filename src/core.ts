import { builtinModules } from 'node:module'

export interface MissingModule {
  index: number
  name: string
}

const STATEMENT_START = /^\s*(import|export)\b/gm
const SIDE_EFFECT_IMPORT = /^\s*import\s*['"]([^'"]+)['"]/
const IMPORT_FROM = /^\s*import(?:\s+type)?[\s\S]*?\sfrom\s*['"]([^'"]+)['"]/
const EXPORT_FROM = /^\s*export(?:\s+type)?[\s\S]*?\sfrom\s*['"]([^'"]+)['"]/
const MODULE_PATTERNS = [
  /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
]
const isNodeModules = /^(?:\w|@\w)/
const IGNORED_MODULE_PREFIXES = [
  'node:',
  'virtual:',
]
const IGNORED_PACKAGE_NAMES = new Set([
  'process',
  'vscode',
  ...builtinModules.map(name => name.replace(/^node:/, '').split('/')[0]),
])

function isIgnoredPackage(source: string, name: string) {
  if (IGNORED_MODULE_PREFIXES.some(prefix => source.startsWith(prefix)))
    return true
  return IGNORED_PACKAGE_NAMES.has(name)
}

function toMissingModule(source: string, index: number, deps: string[], aliasKeys: string[]) {
  if (!isNodeModules.test(source))
    return

  const name = source.startsWith('@')
    ? source.split('/').slice(0, 2).join('/')
    : source.split('/')[0]

  if (aliasKeys.some(key => name.startsWith(key)))
    return
  if (deps.includes(name) || isIgnoredPackage(source, name))
    return

  return {
    index,
    name,
  }
}

function getStatementSource(statement: string) {
  return SIDE_EFFECT_IMPORT.exec(statement)?.[1]
    || IMPORT_FROM.exec(statement)?.[1]
    || EXPORT_FROM.exec(statement)?.[1]
}

export function detectMissingModules(code: string, deps: string[], aliasKeys: string[]) {
  const data: MissingModule[] = []

  const statementMatches = Array.from(code.matchAll(STATEMENT_START))
  statementMatches.forEach((matcher, index) => {
    const statement = code.slice(matcher.index, statementMatches[index + 1]?.index)
    const source = getStatementSource(statement)
    if (!source)
      return
    const missingModule = toMissingModule(source, matcher.index, deps, aliasKeys)
    if (missingModule)
      data.push(missingModule)
  })

  for (const pattern of MODULE_PATTERNS) {
    for (const matcher of code.matchAll(pattern)) {
      const missingModule = toMissingModule(matcher[1], matcher.index, deps, aliasKeys)
      if (missingModule)
        data.push(missingModule)
    }
  }

  data.sort((a, b) => a.index - b.index)
  return data
}

export function buildInstallCommand(installWay: string, target: string) {
  const isDev = target.endsWith(' -D')
  const packageName = isDev ? target.slice(0, -3).trim() : target

  switch (installWay.trim()) {
    case 'npm':
      return `npm install${isDev ? ' -D' : ''} ${packageName}`
    case 'pnpm':
      return `pnpm add${isDev ? ' -D' : ''} ${packageName}`
    case 'yarn':
      return `yarn add${isDev ? ' -D' : ''} ${packageName}`
    case '':
    case 'ni':
      return `ni${isDev ? ' -D' : ''} ${packageName}`
    default:
      return `${installWay} ${packageName}${isDev ? ' -D' : ''}`
  }
}
