/* eslint-env node */
import HtmlWebpackPlugin from "html-webpack-plugin";
import { join, resolve } from "path";
import * as webpack from "webpack";
import { htmlTemplatePreBody, htmlTemplatePostBody, ROOT_ELEMENT_ID, STATIC_BUNDLE_DIR } from "../shared/build";

const babelConfig = require("./babel.config.js") as {}; // wish TS was smart enough to deduce from @type

export default (
    env: undefined,
    options: webpack.Configuration,
): webpack.Configuration => ({
    devtool: options.mode === "development"
        ? "inline-source-map"
        : false,
    entry: [
        "core-js/modules/es6.promise",
        "core-js/modules/es6.array.iterator",
        "@babel/polyfill/dist/polyfill.js", // polyfill new ES functions for babel
        resolve(__dirname, "./index.tsx"),
    ],
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: babelConfig,
                    },
                    {
                        loader: "ts-loader",
                    },
                ],
            },
        ],
    },
    optimization: {
        sideEffects: true,
        splitChunks: {
            chunks: "all",
        },
        usedExports: true,
    },
    output: {
        filename: join(STATIC_BUNDLE_DIR, "[name].js"),
        path: resolve(__dirname, "../../dist/client"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            templateContent: `${htmlTemplatePreBody()}<div id="${ROOT_ELEMENT_ID}"></div>${htmlTemplatePostBody()}`,
        }),
    ],
    resolve: {
        alias: options.mode === "development"
            ? { "react-dom": "@hot-loader/react-dom" }
            : {},
        extensions: [".tsx", ".ts", ".js"],
    },
});
