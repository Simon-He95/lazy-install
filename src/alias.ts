import { existsSync, promises, statSync } from 'node:fs'
import path, { resolve } from 'node:path'
import { getCurrentFileUrl } from '@vscode-use/utils/index'
import { findUp } from 'find-up'
import { isArray, toArray, useJSONParse } from 'lazy-js-utils'

type AliasValue = Record<string, string>

// 获取当前package.json下的配置
export const aliasMap = new Map<string, { mtimeMs: number, value: AliasValue }>()
const workspaceMap = new Map<string, string | undefined>()

export function clearAliasCache() {
  aliasMap.clear()
  workspaceMap.clear()
}

export async function getAliasKeys(fileUrl?: string) {
  return Object.keys(await getAliasByFile(fileUrl))
}

export async function getAliasByFile(fileUrl = getCurrentFileUrl() || undefined): Promise<AliasValue> {
  const configPath = await getWorkspaceConfigPath(fileUrl)
  if (!configPath)
    return {}
  return (await getAlias(configPath)) || {}
}

export async function getAlias(configUrl?: string, visited = new Set<string>()): Promise<AliasValue> {
  if (!configUrl)
    return getAliasByFile()

  const configPath = configUrl
  if (visited.has(configPath))
    return {}
  visited.add(configPath)

  const cacheKey = configPath
  const cacheStat = statSync(configPath)
  const cached = aliasMap.get(cacheKey)
  if (cached && cached.mtimeMs === cacheStat.mtimeMs)
    return cached.value

  const _config = useJSONParse(await promises.readFile(configPath, 'utf-8'))
  if (!_config)
    return {}

  const result: AliasValue = {}

  // 递归处理 references
  if (_config.references && Array.isArray(_config.references)) {
    const refPromises = _config.references
      .filter((ref: any) => ref.path)
      .map((ref: any) => {
        let refConfigPath = resolve(path.dirname(configPath), ref.path)
        if (!existsSync(refConfigPath))
          return Promise.resolve({})
        if (statSync(refConfigPath).isDirectory()) {
          const tsConfigPath = resolve(refConfigPath, 'tsconfig.json')
          const jsConfigPath = resolve(refConfigPath, 'jsconfig.json')
          if (existsSync(tsConfigPath))
            refConfigPath = tsConfigPath
          else if (existsSync(jsConfigPath))
            refConfigPath = jsConfigPath
          else
            return Promise.resolve({})
        }
        if (existsSync(refConfigPath))
          return getAlias(refConfigPath, visited)
        return Promise.resolve({})
      })
    const refAliases = await Promise.all(refPromises)
    for (const refAlias of refAliases) {
      for (const key in refAlias) {
        if (result[key] && result[key] !== refAlias[key]) {
          // 已有同名 alias，合并为数组，去重
          const arr = toArray(result[key])
          if (!arr.includes(refAlias[key]))
            arr.push(refAlias[key])
          result[key] = arr as any
        }
        else {
          result[key] = refAlias[key]
        }
      }
    }
  }

  const paths = _config?.compilerOptions?.paths
  if (paths) {
    Object.keys(paths).forEach((key: any) => {
      let value = paths[key]
      if (isArray(value))
        value = value[0]
      key = key.replace(/\/\*\*/g, '').replace(/\/\*/g, '')
      value = value.replace(/\/\*\*/g, '').replace(/\/\*/g, '')
      if (key === '@') {
        key = '@/'
        value = `${value}/`
      }
      if (result[key] && result[key] !== value) {
        // 已有同名 alias，合并为数组，去重
        const arr = toArray(result[key])
        if (!arr.includes(value))
          arr.push(value)
        result[key] = arr as any
      }
      else {
        result[key] = value
      }
    })
  }

  aliasMap.set(cacheKey, {
    mtimeMs: cacheStat.mtimeMs,
    value: result,
  })
  return result
}

async function getWorkspaceConfigPath(fileUrl?: string) {
  const currentWorkspaceUrl = await getCurrentWorkspaceUrl(fileUrl)
  if (!currentWorkspaceUrl)
    return

  let configPath = resolve(currentWorkspaceUrl, 'tsconfig.json')
  if (!existsSync(configPath))
    configPath = resolve(currentWorkspaceUrl, 'jsconfig.json')
  if (!existsSync(configPath))
    return

  return configPath
}

async function getCurrentWorkspaceUrl(fileUrl?: string) {
  const currentFileUrl = fileUrl || getCurrentFileUrl() || undefined
  if (!currentFileUrl)
    return

  if (workspaceMap.has(currentFileUrl))
    return workspaceMap.get(currentFileUrl)

  const currentWorkspaceUrl = await findUp('package.json', {
    cwd: currentFileUrl,
    type: 'file',
  })
  if (currentWorkspaceUrl) {
    const url = path.resolve(currentWorkspaceUrl, '..')
    workspaceMap.set(currentFileUrl, url)
    return url
  }
  workspaceMap.set(currentFileUrl, undefined)
}
