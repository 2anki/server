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
    'prettier/prettier': ['error'],
  },
  "ignorePatterns": ["src/schemas"],
};
