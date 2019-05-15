import HtmlWebpackPlugin from "html-webpack-plugin";
import { join, resolve } from "path";
import * as webpack from "webpack";
import { BUNDLE_DIR, HTML_END, HTML_MID, HTML_START } from "../shared/build";

console.log("  ->>>>>", resolve(__dirname));

export default (
    env: undefined,
    options: webpack.Configuration,
): webpack.Configuration => ({
    devtool: options.mode === "development"
        ? "inline-source-map"
        : false,
    entry: [
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
                        options: {
                            configFile: resolve(__dirname, "./babel.config.js"),
                        },
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
        filename: join(BUNDLE_DIR, "[name].js"),
        path: resolve(__dirname, "../../dist/client"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            templateContent: HTML_START + HTML_MID + HTML_END,
        }),
    ],
    resolve: {
        alias: options.mode === "development"
            ? { "react-dom": "@hot-loader/react-dom" }
            : {},
        extensions: [".tsx", ".ts", ".js"],
    },
});
