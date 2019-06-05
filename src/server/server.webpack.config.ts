/* eslint-env node */
import { resolve } from "path";
import nodeExternals from "webpack-node-externals";
import { createWebpackConfiguration } from "../shared/build";
import babelConfig from "./babel.config.js";

export default createWebpackConfiguration(babelConfig, {
    entry: [
        resolve(__dirname, "./index.tsx"),
    ],
    // we don't want to bundle node_modules (external modules)
    externals: [nodeExternals()],
    // we will be running on node, no polyfills or mocks needs;
    //   so assume all node built-ins are safe to use
    node: {
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
    target: "node",
});
