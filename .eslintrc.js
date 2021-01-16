'use strict';

module.exports = {
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  plugins: [],
  extends: ['prettier', 'prettier/@typescript-eslint'],
  root: true,
  env: {
    node: true,
    jest: true,
    es6: true,
  },
  rules: {
    // Possible Errors
    // https://github.com/eslint/eslint/tree/master/docs/rules#possible-errors
    'comma-dangle': [2, 'only-multiline'],
    'no-control-regex': 2,
    'no-debugger': 2,
    'no-dupe-args': 2,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-empty-character-class': 2,
    'no-ex-assign': 2,
    'no-extra-boolean-cast': 2,
    'no-extra-parens': [2, 'functions'],
    'no-extra-semi': 2,
    'no-func-assign': 2,
    'no-invalid-regexp': 2,
    'no-irregular-whitespace': 2,
    'no-obj-calls': 2,
    'no-proto': 2,
    'no-template-curly-in-string': 2,
    'no-unexpected-multiline': 2,
    'no-unreachable': 2,
    'no-unsafe-negation': 2,
    'use-isnan': 2,
    'valid-typeof': 2,

    // Best Practices
    // https://github.com/eslint/eslint/tree/master/docs/rules#best-practices
    'dot-location': [2, 'property'],
    'no-fallthrough': 2,
    'no-global-assign': 2,
    'no-multi-spaces': 2,
    'no-octal': 2,
    'no-redeclare': 2,
    'no-self-assign': 2,
    'no-unused-labels': 2,
    'no-useless-call': 2,
    'no-useless-escape': 2,
    'no-void': 2,
    'no-with': 2,
  },
};
