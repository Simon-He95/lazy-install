import simon_he from '@antfu/eslint-config'

export default simon_he({
  rules: {
    'ts/no-var-requires': 'off',
    'ts/no-require-imports': 'off',
    'no-console': 'off',
    'no-restricted-syntax': 'off',
  },
})
