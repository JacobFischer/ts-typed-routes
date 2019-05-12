import HtmlWebpackPlugin from "html-webpack-plugin";
import { resolve } from "path";
import * as webpack from "webpack";

export default (
    env: undefined,
    options: webpack.Configuration,
): webpack.Configuration => ({
    entry: "./src/index.tsx",
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader",
            },
        ],
    },
    output: {
        filename: "bundle.js",
        path: resolve(__dirname, "dist"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Single Page Application",
        }),
    ],
    resolve: {
        alias: {
            "react-dom": "@hot-loader/react-dom",
        },
        extensions: [".tsx", ".ts", ".js"],
    },
});
