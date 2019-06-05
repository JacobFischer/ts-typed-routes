/* @ts-check */
/* eslint-env node */

/** @type {import("@babel/core").TransformOptions} */
const babelConfig = {
    plugins: [
        "react-hot-loader/babel",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-proposal-optional-catch-binding",
        "@babel/plugin-syntax-dynamic-import",
        ["@babel/plugin-transform-runtime", { regenerator: true }],
        ["babel-plugin-styled-components", {
            ssr: true,
            displayName: true,
            pure: true,
        }],
    ],
    presets: [
        ["@babel/preset-env", { shippedProposals: true }],
        "@babel/preset-react",
    ],
};

module.exports = babelConfig;
