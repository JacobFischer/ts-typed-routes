import HtmlWebpackPlugin from "html-webpack-plugin";
import { join, resolve } from "path";
import * as webpack from "webpack";
import { BUNDLE_DIR, HTML_END, HTML_MID, HTML_START } from "../shared/build";

export default (
    env: undefined,
    options: webpack.Configuration,
): webpack.Configuration => ({
    devtool: options.mode === "development"
        ? "inline-source-map"
        : false,
    entry: resolve(__dirname, "./index.tsx"),
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader",
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
        alias: {
            "react-dom": "@hot-loader/react-dom",
        },
        extensions: [".tsx", ".ts", ".js"],
    },
});
