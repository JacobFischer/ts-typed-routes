// @ts-check

/** @type {typeof import("../.eslintrc.js")} */
const testEslintConfig = {
    env: {
        jest: true,
        "jest/globals": true,
        node: true,
    },
    plugins: [ "jest" ],
    extends: [
        "../.eslintrc.js",
        "plugin:jest/recommended",
    ],
};

module.exports = testEslintConfig;
