import cors from "cors";
import express from "express";
import { readdir, readFile } from "fs-extra";
import { join } from "path";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { preloadAll } from "react-loadable";
import { StaticRouter } from "react-router";
import { BUNDLE_DIR, HTML_END, HTML_MID, HTML_START } from "../shared/build";
import { App } from "../shared/components/App";

const PORT = 8080;
const CLIENT_SIDE_RENDERING = true; // TODO: read from config or env file
const CLIENT_DIST = join(__dirname, "../client/");
const BUNDLE_PATH = join(CLIENT_DIST, BUNDLE_DIR);

export async function setupExpress(): Promise<number> {
    const app = express();
    app.use(cors());

    let scripts = "";
    if (CLIENT_SIDE_RENDERING) {
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
            if (CLIENT_SIDE_RENDERING) {
                res.write(scripts);
            }
            res.write(HTML_END);
            res.end();
        });
    });

    await new Promise((resolve, reject) => {
        app.listen(PORT, (err: unknown) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });

    return PORT;
}
