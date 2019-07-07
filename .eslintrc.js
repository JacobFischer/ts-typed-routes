// @ts-check
/* eslint-env node */

const ENABLED_ERROR = "error";

const { resolve } = require("path");

/** @type {import("eslint").Linter.Config & { plugins?: string[]; extends?: string[] }} */
const baseEslintConfig = {
    env: {
        es6: true,
        node: true,
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
        "eslint-plugin-import-order-alphabetical",
        "jsdoc",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "airbnb-base",
    ],
    rules: {
        // TypeScript
        "@typescript-eslint/explicit-function-return-type": "off", // For now does not allow enough control over arrow functions, always requiring return types even on simple reducers and such.

        // Basically old rules from tslint ported over that override airbnb
        "quotes": [ENABLED_ERROR, "double"],
        "indent": [ENABLED_ERROR, 4],
        "arrow-parens": [ENABLED_ERROR, "always"],
        "sort-imports": "off", // terrible configuration options mean this cannot be enabled without unfixable errors
        "import-order-alphabetical/order": ENABLED_ERROR, // should be part of imports/order

        // "import/order": [ENABLED_ERROR, {"groups": ["index", "sibling", "parent", "internal", "external", "builtin"]}],
        "import/prefer-default-export": "off", // named exports easier to refactor with types
        "no-array-constructor": "off", // new Array<type>() allows for more natural types usage
        "max-len": [ENABLED_ERROR, 120], // again from Microsoft's TSLint reccomended
        "no-restricted-syntax": "off", // hyper controversial

        // JSDoc
        "jsdoc/require-jsdoc": ENABLED_ERROR,

        "jsdoc/check-param-names": ENABLED_ERROR,
        "jsdoc/require-param": ENABLED_ERROR,
        "jsdoc/require-param-description": ENABLED_ERROR,
        "jsdoc/require-param-name": ENABLED_ERROR,
        "jsdoc/require-hyphen-before-param-description": [ENABLED_ERROR, "always"],

        "jsdoc/require-returns": [ENABLED_ERROR, { forceReturnsWithAsync: true }],
        "jsdoc/require-returns-check": ENABLED_ERROR,
        "jsdoc/require-returns-description": ENABLED_ERROR,

        "jsdoc/check-alignment": ENABLED_ERROR,
        "jsdoc/check-examples": ENABLED_ERROR,
        "jsdoc/check-syntax": ENABLED_ERROR,
        "jsdoc/newline-after-description": ENABLED_ERROR,
        "jsdoc/no-types": ENABLED_ERROR, // because of TypeScript!

        /*
        "valid-jsdoc": [ENABLED_ERROR, {
            matchDescription: "(.+)",

            requireParamDescription: true,
            requireParamType: false, // TS handles type

            requireReturn: true,
            requireReturnDescription: true,
            requireReturnType: false, // TS handles types

            prefer: {
                "return": "returns",
            },
        }],
        "require-jsdoc": [ENABLED_ERROR, {
            "require": {
                "FunctionDeclaration": true,
                "MethodDefinition": true,
                "ClassDeclaration": true,
                "ArrowFunctionExpression": true,
                "FunctionExpression": true
            },
        }],
        */
    },
    settings: {
        react: {
            version: "detect",
        },
        "import/extensions": [".js", ".ts" ],
        "import/resolver": {
            node: {
              extensions: [".js", ".ts" ],
            },
        },
        "import/parsers": {
            "@typescript-eslint/parser": [".ts" ],
        },
    },
};

module.exports = baseEslintConfig;
