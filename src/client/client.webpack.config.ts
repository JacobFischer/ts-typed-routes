/* eslint-env node */
import HtmlWebpackPlugin from "html-webpack-plugin";
import { join, resolve } from "path";
import { createWebpackConfiguration, indexHtmlTemplate, ROOT_ELEMENT_ID, STATIC_BUNDLE_DIR } from "../shared/build";
import babelConfig from "./babel.config.js";

export default createWebpackConfiguration(babelConfig, {
    entry: [
        "core-js/modules/es6.promise",
        "core-js/modules/es6.array.iterator",
        "@babel/polyfill/dist/polyfill.js", // polyfill new ES functions for babel
        resolve(__dirname, "./index.tsx"),
    ],
    output: {
        filename: join(STATIC_BUNDLE_DIR, "[name].js"),
        path: resolve(__dirname, "../../dist/client"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            templateContent: [
                indexHtmlTemplate.top,
                `<div id="${ROOT_ELEMENT_ID}"></div>`,
                indexHtmlTemplate.bottom,
            ].join(""),
        }),
    ],
});
