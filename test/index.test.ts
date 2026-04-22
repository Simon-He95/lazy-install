import { describe, expect, it } from 'vitest'
import { buildInstallCommand, detectMissingModules } from '../src/core'

describe('buildInstallCommand', () => {
  it('maps supported package managers to install commands', () => {
    expect(buildInstallCommand('npm', 'axios')).toBe('npm install axios')
    expect(buildInstallCommand('pnpm', 'axios')).toBe('pnpm add axios')
    expect(buildInstallCommand('yarn', 'axios')).toBe('yarn add axios')
    expect(buildInstallCommand('ni', 'axios')).toBe('ni axios')
  })

  it('keeps dev installs on the correct flag', () => {
    expect(buildInstallCommand('npm', 'vitest -D')).toBe('npm install -D vitest')
    expect(buildInstallCommand('pnpm', 'vitest -D')).toBe('pnpm add -D vitest')
    expect(buildInstallCommand('yarn', 'vitest -D')).toBe('yarn add -D vitest')
    expect(buildInstallCommand('ni', 'vitest -D')).toBe('ni -D vitest')
  })
})

describe('detectMissingModules', () => {
  it('finds missing packages while ignoring aliases, builtins, and installed deps', () => {
    const code = [
      'import axios from \'axios\'',
      'import type { User } from \'@/types\'',
      'import path from \'node:path\'',
      'import fs from \'fs/promises\'',
      'import { describe } from \'vitest\'',
      'import { Button } from \'@scope/ui/button\'',
      'import \'./local.css\'',
    ].join('\n')

    expect(detectMissingModules(code, ['vitest'], ['@/'])).toEqual([
      {
        index: 0,
        name: 'axios',
      },
      {
        index: code.indexOf('import { Button } from \'@scope/ui/button\''),
        name: '@scope/ui',
      },
    ])
  })

  it('supports side-effect imports, export-from, require, dynamic import, and multiline imports', () => {
    const code = [
      'import {',
      '  Link,',
      '} from \'react-router-dom\'',
      'import \'nprogress\'',
      'const map = require(\'lodash-es/map\')',
      'const load = () => import(\'@scope/pkg/utils\')',
      'const local = () => import(\'@/features/test\')',
      'export * from \'zod\'',
      'export { css } from \'@emotion/css\'',
    ].join('\n')

    expect(detectMissingModules(code, [], ['@/'])).toEqual([
      {
        index: 0,
        name: 'react-router-dom',
      },
      {
        index: code.indexOf('import \'nprogress\''),
        name: 'nprogress',
      },
      {
        index: code.indexOf('require(\'lodash-es/map\')'),
        name: 'lodash-es',
      },
      {
        index: code.indexOf('import(\'@scope/pkg/utils\')'),
        name: '@scope/pkg',
      },
      {
        index: code.indexOf('export * from \'zod\''),
        name: 'zod',
      },
      {
        index: code.indexOf('export { css } from \'@emotion/css\''),
        name: '@emotion/css',
      },
    ])
  })
})
