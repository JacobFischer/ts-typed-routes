// @ts-check
/* eslint-env node */

const { resolve } = require('path');

process.env.ESLINT_PATH_TSCONFIG = resolve('./tsconfig.eslint.json');
process.env.ESLINT_PATH_BABELCONFIG = '/';

/** @type {import("eslint").Linter.Config} */
const baseEslintConfig = {
  extends: ['jacobfischer', 'jacobfischer-react'],
  ignorePatterns: ['dist/*', 'docs/*'],
};

module.exports = baseEslintConfig;
