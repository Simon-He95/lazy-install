import type { FileSystemWatcher, Terminal } from 'vscode'
import { addEventListener, createExtension, createTerminal, getConfiguration, registerCommand } from '@vscode-use/utils'
import { workspace } from 'vscode'
import { clearAliasCache } from './alias'
import { buildInstallCommand } from './core'
import { createInstallCodeLensProvider, getCurrentPackageDir, refreshCodeLenses } from './utils'

let terminal: Terminal
let terminalCwd: string | undefined
let timer: ReturnType<typeof setTimeout> | null = null
let watchers: FileSystemWatcher[] = []

function refreshModules() {
  refreshCodeLenses()
}

function refreshConfig() {
  clearAliasCache()
  refreshCodeLenses()
}

export= createExtension(async () => {
  refreshModules()
  createInstallCodeLensProvider()
  addEventListener('activeText-change', refreshModules)
  watchers = [
    workspace.createFileSystemWatcher('**/package.json'),
    workspace.createFileSystemWatcher('**/tsconfig.json'),
    workspace.createFileSystemWatcher('**/jsconfig.json'),
    workspace.createFileSystemWatcher('**/pnpm-workspace.yaml'),
  ]
  watchers[0].onDidChange(refreshModules)
  watchers[0].onDidCreate(refreshModules)
  watchers[0].onDidDelete(refreshModules)
  for (const watcher of watchers.slice(1)) {
    watcher.onDidChange(refreshConfig)
    watcher.onDidCreate(refreshConfig)
    watcher.onDidDelete(refreshConfig)
  }
  registerCommand('lazy-install.install', (_, name: string) => {
    const currentPackageDir = getCurrentPackageDir()
    if (!currentPackageDir)
      return

    if (!terminal || terminal.exitStatus || terminalCwd !== currentPackageDir) {
      terminal?.dispose()
      terminal = createTerminal('lazy-install', { cwd: currentPackageDir })
      terminalCwd = currentPackageDir
    }

    const installWay = getConfiguration('lazy-install.way')
    const command = buildInstallCommand(String(installWay || ''), name)

    terminal.show()
    terminal.processId.then(() => {
      if (timer)
        clearTimeout(timer)
      timer = setTimeout(() => {
        terminal.sendText(command, true)
      }, 800)
    })
  })
}, () => {
  watchers.forEach(watcher => watcher.dispose())
  watchers = []
  terminal?.dispose()
})
