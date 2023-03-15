module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript'
  ],
  overrides: [
  ],
  plugins: [
    'react'
  ],
  parserOptions: {
    project: [
      './tsconfig.json'
    ],
    sourceType: 'module'
  },
  rules: {
    'no-console': 0,
    'no-extend-native': 0,
    'react/jsx-props-no-spreading': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'class-methods-use-this': 0,
    'max-classes-per-file': 0,
    'node/no-missing-import': 0,
    'node/no-unpublished-import': 0,
    'node/no-unsupported-features/es-syntax': 0,
    '@typescript-eslint/prefer-nullish-coalescing': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    'consistent-type-imports': 0,
    '@typescript-eslint/consistent-type-imports': 0
  },
  settings: {
    node: {
      tryExtensions: ['.tsx'] // append tsx to the list as well
    }
  }
}
