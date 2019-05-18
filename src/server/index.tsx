import cors from "cors";
import express from "express";
import { readdir, readFile } from "fs-extra";
import { Server } from "http";
import { join } from "path";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { preloadAll } from "react-loadable";
import { StaticRouter } from "react-router";
import { BUNDLE_DIR, HTML_END, HTML_MID, HTML_START } from "../shared/build";
import { App } from "../shared/components/App";

export const PORT = 8080;
const CLIENT_DIST = join(__dirname, "../client/");
const BUNDLE_PATH = join(CLIENT_DIST, BUNDLE_DIR);

export async function start(clientSideRendering = true): Promise<Server> {
    const app = express();
    app.use(cors());

    let scripts = "";
    if (clientSideRendering) {
        const dir = await readdir(BUNDLE_PATH);
        for (const filename of dir) {
            const bundled = join(BUNDLE_DIR, filename).replace(/\\/g, "/");

            app.get(`/${bundled}`, (req, res) => res.sendFile(join(BUNDLE_PATH, filename)));
        }

        const indexHtml = (await readFile(join(CLIENT_DIST, "index.html"))).toString();
        const matches = indexHtml.match(/<script(.*?)<\/script>/g);
        scripts = matches
            ? matches.join("")
            : "";
    }

    // preload all react-loadable components
    await preloadAll();

    app.get("*", (req, res) => {
        const context = {};

        const componentStream = ReactDOMServer.renderToNodeStream(
            <StaticRouter location={req.url} context={context}>
                <App />
            </StaticRouter>,
        );

        res.write(HTML_START);

        componentStream.pipe(res, { end: false });
        componentStream.on("end", () => {
            res.write(HTML_MID);
            if (clientSideRendering) {
                res.write(scripts);
            }
            res.write(HTML_END);
            res.end();
        });
    });

    return new Promise((resolve, reject) => {
        const server = app.listen(PORT, (err: unknown) => {
            if (err) {
                return reject(err);
            }
            resolve(server);
        });
    });
}
