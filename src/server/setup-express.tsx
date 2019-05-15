import cors from "cors";
import express from "express";
import { readdir } from "fs-extra";
import { join } from "path";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router";
import { App } from "../shared/components/App";
import { BUNDLE_DIR, HTML_END, HTML_MID, HTML_START } from "../shared/build";

const PORT = 8080;
const CLIENT_SIDE_RENDERING = true; // TODO: read from config or env file

export async function setupExpress(): Promise<number> {
    const app = express();
    app.use(cors());

    const bundles = new Array<string>();
    if (CLIENT_SIDE_RENDERING) {
        const bundlePath = join(__dirname, "../client/", BUNDLE_DIR);
        const dir = await readdir(bundlePath);
        for (const filename of dir) {
            const bundled = join(BUNDLE_DIR, filename).replace(/\\/g, "/");;
            bundles.push(bundled);

            app.get(`/${bundled}`, (req, res) => res.sendFile(join(bundlePath, filename)));
        }
    }

    const bundleScripts = bundles
        .map((bundle) => `<script type="text/javascript" src="${bundle}"></script>`)
        .join("");

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
                res.write(bundleScripts);
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
