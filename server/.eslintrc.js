module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: "./tsconfig.json"
  },
  plugins: [
    "import",
    '@typescript-eslint',
  ],
  rules: {
    "react/jsx-filename-extension": "off"
   }
};
