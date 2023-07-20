/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/test/'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
