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
    'require-await': 'error',
    "max-lines-per-function": ["error", 30],
    "max-params": ["error", 3]
  },
  "ignorePatterns": ["src/data_layer/public/", "migrations"],
};
