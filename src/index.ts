import { addEventListener, createExtension, createTerminal, getConfiguration, getCurrentFileUrl, registerCommand } from '@vscode-use/utils'
import type { Terminal } from 'vscode'
import { createInstallCodeLensProvider, detectModule, pnpmWorkspace } from './utils'
import { getAlias } from './alias'

let terminal: Terminal
let timer: any = null

export= createExtension(async () => {
  await getAlias()
  detectModule()
  createInstallCodeLensProvider()
  addEventListener('text-change', detectModule)
  addEventListener('activeText-change', detectModule)
  registerCommand('lazy-install.install', (_, name: string) => {
    // 考虑复用terminal
    if (!terminal || terminal.exitStatus)
      terminal = createTerminal('lazy-install', {})
    const installWay = getConfiguration('lazy-install.way')
    const currentFileUrl = getCurrentFileUrl()!
    if (!currentFileUrl)
      return
    const isInWorkspace = pnpmWorkspace
      ? pnpmWorkspace.some((w: string) => currentFileUrl.indexOf(w))
      : false
    terminal.show()
    terminal.processId.then(() => {
      if (timer)
        clearInterval(timer)
      timer = setTimeout(() => {
        // 考虑在monorepo子仓下安装, 需要补充 -w
        terminal.sendText(`${installWay} ${name} ${isInWorkspace ? '-w' : ''}`, true)
        detectModule()
      }, 800)
    })
  })
}, () => {
  terminal?.dispose()
})
