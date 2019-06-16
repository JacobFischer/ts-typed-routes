/* eslint-env node */
import { resolve } from "path";
import { ReactLoadablePlugin } from "react-loadable/webpack";
import nodeExternals from "webpack-node-externals";
import { DIST_PATH_REACT_LOADABLES_MANIFEST, DIST_PATH_SERVER, createWebpackConfiguration } from "../shared/build";
import babelConfig from "./babel.config";

const distRoot = (...paths: string[]) => resolve(__dirname, "../../", ...paths);

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
        path: distRoot(DIST_PATH_SERVER),
    },
    plugins: [
        new ReactLoadablePlugin({
            filename: distRoot(DIST_PATH_REACT_LOADABLES_MANIFEST),
        }),
    ],
    target: "node",
});
