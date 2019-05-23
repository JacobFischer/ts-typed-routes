// @ts-check
/* eslint-env node */

const { resolve } = require("path");

/** @type {import("eslint").Linter.Config & { plugins?: string[]; extends?: string[] }} */
const baseEslintConfig = {
    env: {
        es6: true,
        "shared-node-browser": true,
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
        "eslint:recommended",
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

module.exports = baseEslintConfig;
