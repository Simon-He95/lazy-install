// @ts-check
const simon_he = require('@antfu/eslint-config').default

module.exports = simon_he({
  rules: {
    'ts/no-var-requires': 'off',
    'ts/no-require-imports': 'off',
    'no-console': 'off',
  },
})
