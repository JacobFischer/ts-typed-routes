// @ts-check

const { resolve } = require("path");

/** @type {import("eslint").Linter.Config & { plugins?: string[]; extends?: string[] }} */
const config = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: resolve("./tsconfig.json"),
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2018,
        sourceType: "module",
        babelOptions: {
            configFile: resolve("./src/client/babel.config.js"),
        },
    },
    plugins: [
        "@typescript-eslint",
        "react",
    ],
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
    ],
    rules: {
        // React
        "react/prop-types": "off", // Redundant with TypeScript checking props
        "react/display-name": "off", // Babel plugin now injects display name

        // TypeScript
        "@typescript-eslint/explicit-function-return-type": ["warn", {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
        }],
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};

module.exports = config;
