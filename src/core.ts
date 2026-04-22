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
  'require',
  'import',
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

function stripComments(code: string) {
  let result = ''
  let i = 0

  while (i < code.length) {
    const char = code[i]
    const next = code[i + 1]

    if (char === '/' && next === '/') {
      result += '  '
      i += 2
      while (i < code.length && code[i] !== '\n') {
        result += ' '
        i += 1
      }
      continue
    }

    if (char === '/' && next === '*') {
      result += '  '
      i += 2
      while (i < code.length) {
        const commentChar = code[i]
        const commentNext = code[i + 1]
        if (commentChar === '*' && commentNext === '/') {
          result += '  '
          i += 2
          break
        }
        result += commentChar === '\n' ? '\n' : ' '
        i += 1
      }
      continue
    }

    if (char === '\'' || char === '"' || char === '`') {
      const quote = char
      result += char
      i += 1
      while (i < code.length) {
        const stringChar = code[i]
        result += stringChar
        if (stringChar === '\\') {
          i += 1
          if (i < code.length)
            result += code[i]
        }
        else if (stringChar === quote) {
          i += 1
          break
        }
        i += 1
      }
      continue
    }

    result += char
    i += 1
  }

  return result
}

function isIdentifierBoundary(code: string, index: number) {
  const char = code[index]
  return !char || !/[$\w]/.test(char)
}

function skipWhitespace(code: string, index: number) {
  let i = index
  while (i < code.length && /\s/.test(code[i]))
    i += 1
  return i
}

function readStringLiteral(code: string, index: number) {
  const quote = code[index]
  if (quote !== '\'' && quote !== '"')
    return

  let value = ''
  let i = index + 1
  while (i < code.length) {
    const char = code[i]
    if (char === '\\') {
      value += char
      i += 1
      if (i < code.length)
        value += code[i]
    }
    else if (char === quote) {
      return {
        end: i + 1,
        value,
      }
    }
    else {
      value += char
    }
    i += 1
  }
}

function findPatternSource(code: string, index: number, pattern: string) {
  if (!code.startsWith(pattern, index))
    return
  if (!isIdentifierBoundary(code, index - 1) || !isIdentifierBoundary(code, index + pattern.length))
    return

  let i = skipWhitespace(code, index + pattern.length)
  if (code[i] !== '(')
    return

  i = skipWhitespace(code, i + 1)
  const literal = readStringLiteral(code, i)
  if (!literal)
    return

  i = skipWhitespace(code, literal.end)
  if (code[i] !== ')')
    return

  return literal.value
}

function findDynamicSources(code: string) {
  const data: Array<{ index: number, source: string }> = []
  let i = 0

  while (i < code.length) {
    const char = code[i]
    const next = code[i + 1]

    if (char === '/' && next === '/') {
      i += 2
      while (i < code.length && code[i] !== '\n')
        i += 1
      continue
    }

    if (char === '/' && next === '*') {
      i += 2
      while (i < code.length) {
        if (code[i] === '*' && code[i + 1] === '/') {
          i += 2
          break
        }
        i += 1
      }
      continue
    }

    if (char === '\'' || char === '"' || char === '`') {
      const quote = char
      i += 1
      while (i < code.length) {
        if (code[i] === '\\') {
          i += 2
          continue
        }
        if (code[i] === quote) {
          i += 1
          break
        }
        i += 1
      }
      continue
    }

    for (const pattern of MODULE_PATTERNS) {
      const source = findPatternSource(code, i, pattern)
      if (!source)
        continue
      data.push({
        index: i,
        source,
      })
      break
    }

    i += 1
  }

  return data
}

export function detectMissingModules(code: string, deps: string[], aliasKeys: string[]) {
  const data: MissingModule[] = []
  const codeWithoutComments = stripComments(code)

  const statementMatches = Array.from(codeWithoutComments.matchAll(STATEMENT_START))
  statementMatches.forEach((matcher, index) => {
    const statement = codeWithoutComments.slice(matcher.index, statementMatches[index + 1]?.index)
    const source = getStatementSource(statement)
    if (!source)
      return
    const missingModule = toMissingModule(source, matcher.index, deps, aliasKeys)
    if (missingModule)
      data.push(missingModule)
  })

  findDynamicSources(code).forEach(({ index, source }) => {
    const missingModule = toMissingModule(source, index, deps, aliasKeys)
    if (missingModule)
      data.push(missingModule)
  })

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
