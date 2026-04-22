import type { Terminal } from 'vscode'
import { addEventListener, createExtension, createTerminal, getConfiguration, registerCommand } from '@vscode-use/utils'
import { getAlias } from './alias'
import { buildInstallCommand } from './core'
import { createInstallCodeLensProvider, detectModule, getCurrentPackageDir } from './utils'

let terminal: Terminal
let terminalCwd: string | undefined
let timer: ReturnType<typeof setTimeout> | null = null

async function refreshModules() {
  await getAlias()
  detectModule()
}

export= createExtension(async () => {
  await refreshModules()
  createInstallCodeLensProvider()
  addEventListener('text-change', refreshModules)
  addEventListener('activeText-change', refreshModules)
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
        void refreshModules()
      }, 800)
    })
  })
}, () => {
  terminal?.dispose()
})
