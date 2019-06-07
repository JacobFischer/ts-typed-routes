/* @ts-check */
/* eslint-env node */

/** @type {import("@babel/core").TransformOptions} */
const sharedBabelConfig = {
    plugins: [
        "react-loadable/babel",
        "@babel/plugin-syntax-dynamic-import",
        ["babel-plugin-styled-components", {
            ssr: true,
            displayName: true,
            pure: true,
        }],
    ],
};

module.exports = sharedBabelConfig;
