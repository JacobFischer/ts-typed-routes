/* eslint-env node */
import { TransformOptions } from "@babel/core";
import { Configuration } from "webpack";
import webpackMerge from "webpack-merge";

export const createWebpackConfiguration = (
    babelConfig: TransformOptions,
    ...configs: Configuration[]
) => (env: undefined, argv: Configuration): Configuration => webpackMerge({
    devtool: argv.mode === "development"
        ? "inline-source-map"
        : false,
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
    resolve: {
        alias: argv.mode === "development"
            ? { "react-dom": "@hot-loader/react-dom" }
            : {},
        extensions: [".tsx", ".ts", ".js"],
    },
}, ...configs);
