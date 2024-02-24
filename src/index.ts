import { addEventListener, createTerminal, getConfiguration, getCurrentFileUrl, registerCommand } from '@vscode-use/utils'
import type { Disposable, ExtensionContext, Terminal } from 'vscode'
import { createInstallCodeLensProvider, detectModule, getPnpmWorkspace } from './utils'

export const pnpmWorkspace = getPnpmWorkspace()
let terminal: Terminal
export async function activate(context: ExtensionContext) {
  const disposes: Disposable[] = []
  detectModule()
  disposes.push(createInstallCodeLensProvider())
  disposes.push(addEventListener('text-change', detectModule))
  disposes.push(addEventListener('activeText-change', detectModule))
  disposes.push(registerCommand('lazy-install.install', (_, name: string) => {
    // 考虑复用terminal
    if (!terminal)
      terminal = createTerminal('lazy-install')
    const installWay = getConfiguration('lazy-install.way')
    const currentFileUrl = getCurrentFileUrl()!
    if (!currentFileUrl)
      return
    const isInWorkspace = pnpmWorkspace
      ? pnpmWorkspace.some((w: string) => currentFileUrl.indexOf(w))
      : false
    terminal.show()
    terminal.processId.then(() => {
      setTimeout(() => {
        // 考虑在monorepo子仓下安装, 需要补充 -w
        terminal?.sendText(`${installWay} ${name} ${isInWorkspace ? '-w' : ''}`)
      }, 800)
    })
  }))

  context.subscriptions.push(...disposes)
}

export function deactivate() {
  terminal?.dispose()
}
