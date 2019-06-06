/* @ts-check */
/* eslint-env node */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolve } = require("path");

/** @type {import("@babel/core").TransformOptions} */
const clientBabelConfig = {
    extends: resolve(__dirname, "../shared/build/babel.config.js"),
    plugins: [
        "react-hot-loader/babel",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-proposal-optional-catch-binding",
        ["@babel/plugin-transform-runtime", { regenerator: true }],
    ],
    presets: [
        ["@babel/preset-env", { shippedProposals: true }],
        "@babel/preset-react",
    ],
};

module.exports = clientBabelConfig;
