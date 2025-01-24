import { addEventListener, createExtension, createTerminal, getConfiguration, getCurrentFileUrl, registerCommand } from '@vscode-use/utils'
import type { Disposable, Terminal } from 'vscode'
import { createInstallCodeLensProvider, detectModule, pnpmWorkspace } from './utils'

let terminal: Terminal
let timer: any = null

export= createExtension(() => {
  const disposes: Disposable[] = []
  let preInstallName = ''
  detectModule()
  disposes.push(createInstallCodeLensProvider())
  disposes.push(addEventListener('text-change', detectModule))
  disposes.push(addEventListener('activeText-change', detectModule))
  disposes.push(registerCommand('lazy-install.install', (_, name: string) => {
    if (preInstallName && preInstallName === name)
      return
    preInstallName = name
    // 考虑复用terminal
    if (!terminal)
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
  }))
  return disposes
}, () => {
  terminal?.dispose()
})
