import HtmlWebpackPlugin from "html-webpack-plugin";
import { join, resolve } from "path";
import * as webpack from "webpack";
import { JS_BUNDLE_DIR, templateHtml } from "../shared/build";
import { babelConfig } from "./babel.config";

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
                        options: {
                            compilerOptions: {
                                // Keep es6+ imports in place for babel to handle.
                                // This allows the lodash treeshakers to work.
                                // This also means we are relying fully on babel for ESNext --> ES5 (or lower)
                                module: "esnext",
                            },
                        },
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
        filename: join(JS_BUNDLE_DIR, "[name].js"),
        path: resolve(__dirname, "../../dist/client"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            templateContent: templateHtml(),
        }),
    ],
    resolve: {
        alias: options.mode === "development"
            ? { "react-dom": "@hot-loader/react-dom" }
            : {},
        extensions: [".tsx", ".ts", ".js"],
    },
});
