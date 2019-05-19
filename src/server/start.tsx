import cors from "cors";
import express from "express";
import { Server } from "http";
import { join } from "path";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { preloadAll } from "react-loadable";
import { StaticRouter } from "react-router";
import { HTML_END, HTML_MID, HTML_START, JS_BUNDLE_DIR } from "../shared/build";
import { App } from "../shared/components/App";
import { getScriptsFromIndexHtml } from "./build";

export async function start(port: number, clientSideBundleDir: null | string): Promise<Server> {
    const app = express();
    app.use(cors());
    app.disable("x-powered-by"); // Redundant, no need to report on every response

    const scripts = clientSideBundleDir && await getScriptsFromIndexHtml(clientSideBundleDir) || "";
    if (clientSideBundleDir) {
        app.use(`/${JS_BUNDLE_DIR}`, express.static(join(clientSideBundleDir, JS_BUNDLE_DIR)));
    }

    // preload all react-loadable components
    await preloadAll();

    app.get("*", async (req, res) => {
        res.write(HTML_START);

        const context = {};
        const componentStream = ReactDOMServer.renderToNodeStream(
            <StaticRouter location={req.url} context={context}>
                <App />
            </StaticRouter>,
        );
        componentStream.pipe(res, { end: false });
        await new Promise((resolve) => componentStream.once("end", resolve));
        res.write(HTML_MID);
        if (scripts) {
            res.write(scripts);
        }
        res.write(HTML_END);
        res.end();
    });

    return new Promise((resolve) => {
        const server = app.listen(port, () => resolve(server));
    });
}
