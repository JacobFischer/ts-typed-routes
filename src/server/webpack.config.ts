/* eslint-env node */
import { resolve } from "path";
import * as webpack from "webpack";
import nodeExternals from "webpack-node-externals";

const babelConfig = require("./babel.config.js") as {}; // wish TS was smart enough to deduce from @type

export default (
    env: undefined,
    options: webpack.Configuration,
): webpack.Configuration => ({
    devtool: options.mode === "development"
        ? "source-map"
        : false,
    entry: [
        resolve(__dirname, "./index.tsx"),
    ],
    externals: [nodeExternals()], // we don't want to bundle node_modules (external modules)
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
    node: { // we will be running on node, no polyfills or mocks needs; so assume all node built-ins are safe to use
        console: false,
        process: false,
        global: false,
        __filename: false,
        __dirname: false,
        Buffer: false,
        setImmediate: false,
    },
    output: {
        filename: "[name].js",
        path: resolve(__dirname, "../../dist/server"),
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    target: "node",
});
