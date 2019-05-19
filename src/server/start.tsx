import cors from "cors";
import express from "express";
import { readdir } from "fs-extra";
import { Server } from "http";
import { join } from "path";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { preloadAll } from "react-loadable";
import { StaticRouter } from "react-router";
import { HTML_END, HTML_MID, HTML_START, JS_BUNDLE_DIR } from "../shared/build";
import { App } from "../shared/components/App";
import { getScriptsFromIndexHtml } from "./build";

let iteration = 0;
export async function start(port = 8080, clientSideBundleDir: null | string): Promise<Server> {
    const app = express();
    app.use(cors());
    app.disable("x-powered-by"); // Redundant, no need to report on every response

    const iter = iteration++;
    console.log(iter, "getting scripts from...", clientSideBundleDir);
    const scripts = clientSideBundleDir && await getScriptsFromIndexHtml(clientSideBundleDir) || "";
    console.log(iter, "scripts are", scripts);
    if (clientSideBundleDir) {
        app.use(`/${JS_BUNDLE_DIR}`, express.static(join(clientSideBundleDir, JS_BUNDLE_DIR)));
    }

    // preload all react-loadable components
    await preloadAll();

    app.get("*", async (req, res) => {
        console.log(iter, "get *", clientSideBundleDir, scripts);
        res.write(HTML_START);

        const context = {};
        const componentStream = ReactDOMServer.renderToNodeStream(
            <StaticRouter location={req.url} context={context}>
                <App />
            </StaticRouter>,
        );
        componentStream.pipe(res, { end: false });
        await new Promise((resolve) => componentStream.once("end", resolve));

        console.log(iter, "done piping react stream", clientSideBundleDir, scripts);
        res.write(HTML_MID);
        if (scripts) {
            console.log(iter, "writing to response scripts", scripts);
            res.write(scripts);
        }
        res.write(HTML_END);
        res.end();
    });

    return new Promise((resolve) => {
        const server = app.listen(port, () => resolve(server));
    });
}
