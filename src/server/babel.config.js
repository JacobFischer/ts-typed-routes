/* @ts-check */
/* eslint-env node */

/** @type {import("@babel/core").TransformOptions} */
const babelConfig = {
    plugins: [
        "@babel/plugin-syntax-dynamic-import",
        ["babel-plugin-styled-components", {
            ssr: true,
            displayName: true,
            pure: true,
        }],
    ],
};

module.exports = babelConfig;
