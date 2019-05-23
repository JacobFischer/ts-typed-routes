// @ts-check
/* eslint-env node */

/** @type {typeof import("../../.eslintrc.js")} */
const clientEslintConfig = {
    env: {
        browser: true,
    },
    extends: ["../../.eslintrc.js"],
};

module.exports = clientEslintConfig;
