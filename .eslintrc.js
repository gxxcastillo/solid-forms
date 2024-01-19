module.exports = {
  root: true,
  plugins: ['@typescript-eslint'],
  extends: [
    'moon',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'airbnb-base',
    'airbnb-typescript/base',
    'prettier'
  ],
  rules: {
    'no-restricted-syntax': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-default-export': 0,
    'consistent-return': 0,
    'import/extensions': 0,
    'sort-keys': 0,
    'simple-import-sort/imports': 0,
    'import/prefer-default-export': 0,
    'import/no-unresolved': 0,
    'no-param-reassign': 0,
    'no-nested-ternary': 0,
    'promise/prefer-await-to-then': 0,
    'promise/prefer-await-to-callbacks': 0,
    '@typescript-eslint/no-confusing-void-expression': 0,
    '@typescript-eslint/no-unsafe-call': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-unsafe-member-access': 0,
    '@typescript-eslint/no-unsafe-return': 0,
    '@typescript-eslint/sort-type-constituents': 0,
    '@typescript-eslint/no-redundant-type-constituents': 0,
    '@typescript-eslint/no-unsafe-argument': 0
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.eslint.json', './apps/**/tsconfig.json', './packages/**/tsconfig.json'],
    tsconfigRootDir: __dirname
  }
};
