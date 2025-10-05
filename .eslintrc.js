module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-typescript', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['import', '@typescript-eslint', 'prettier'],
  rules: {
    'react/jsx-filename-extension': 'off',
    'prettier/prettier': ['error', { endOfLine: 'lf' }],
    'require-await': 'error',
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
  },
  ignorePatterns: [
    'src/data_layer/public/',
    'migrations',
    '*.test.*',
    'scripts/',
  ],
};
