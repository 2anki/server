module.exports = {
  extends: ['airbnb', 'airbnb-typescript', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  rules: {
    'import/no-named-as-default': 'off',
    'import/prefer-default-export': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'off',
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
    quotes: [2, 'single', 'avoid-escape']
  },
  ignorePatterns: ['.eslintrc.js']
};
