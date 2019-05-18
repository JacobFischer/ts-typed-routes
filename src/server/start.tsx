import cors from "cors";
import express from "express";
import { readdir, readFile } from "fs-extra";
import { Server } from "http";
import { join } from "path";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { preloadAll } from "react-loadable";
import { StaticRouter } from "react-router";
import { getScriptsFromIndexHtml, HTML_END, HTML_MID, HTML_START, JS_BUNDLE_DIR } from "../shared/build";
import { App } from "../shared/components/App";

export const PORT = 8080;

export async function start(clientSideBundleDir: null | string): Promise<Server> {
    const app = express();
    app.use(cors());
    app.disable("x-powered-by"); // Redundant, no need to report on every response

    let scripts = "";
    if (clientSideBundleDir) {
        const bundlePath = join(clientSideBundleDir, JS_BUNDLE_DIR);

        const dir = await readdir(bundlePath);
        for (const filename of dir) {
            const bundled = join(JS_BUNDLE_DIR, filename).replace(/\\/g, "/");

            app.get(`/${bundled}`, (req, res) => res.sendFile(join(bundlePath, filename)));
        }

        scripts = await getScriptsFromIndexHtml(clientSideBundleDir);
    }

    // preload all react-loadable components
    await preloadAll();

    app.get("*", (req, res) => {
        res.write(HTML_START);

        const context = {};
        const componentStream = ReactDOMServer.renderToNodeStream(
            <StaticRouter location={req.url} context={context}>
                <App />
            </StaticRouter>,
        );
        componentStream.pipe(res, { end: false });
        componentStream.on("end", () => {
            res.write(HTML_MID);
            if (clientSideBundleDir) {
                res.write(scripts);
            }
            res.write(HTML_END);
            res.end();
        });
    });

    return new Promise((resolve) => {
        const server = app.listen(PORT, () => resolve(server));
    });
}
