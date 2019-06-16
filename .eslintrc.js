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
        "eslint-plugin-import-order-alphabetical",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "airbnb",
    ],
    rules: {
        // React
        "react/prop-types": "off", // Redundant with TypeScript checking props
        "react/display-name": "off", // Babel plugin now injects display name

        // TypeScript
        "@typescript-eslint/explicit-function-return-type": "off", // For now does not allow enough control over arrow functions, always requiring return types even on simple reducers and such.

        // Basically old rules from tslint ported over that override airbnb
        "quotes": ["error", "double"],
        "indent": ["error", 4],
        "react/jsx-indent": ["error", 4], // same indent as above
        "arrow-parens": ["error", "always"],
        "sort-imports": "off", // terrible configuration options mean this cannot be enabled without unfixable errors
        "import-order-alphabetical/order": "error", // should be part of imports/order

        // "import/order": ["error", {"groups": ["index", "sibling", "parent", "internal", "external", "builtin"]}],
        "import/prefer-default-export": "off", // named exports easier to refactor with types
        "no-array-constructor": "off", // new Array<type>() allows for more natural types usage
        "max-len": ["error", 120], // again from Microsoft's TSLint reccomended
        "react/jsx-filename-extension": [1, { "extensions": [".jsx", ".tsx"] }], // tsx not allowed by default
        "no-restricted-syntax": "off", // hyper controversial
    },
    settings: {
        react: {
            version: "detect",
        },
        "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
        "import/resolver": {
            node: {
              extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
    },
};

module.exports = baseEslintConfig;
