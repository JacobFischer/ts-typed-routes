// import cors from "cors";
import express from "express";
import { Server } from "http";
import { resolve } from "path";
import * as React from "react";
import { renderToNodeStream } from "react-dom/server";
import { preloadAll, Capture } from "react-loadable";
import { getBundles, Manifest } from 'react-loadable/webpack'
import { StaticRouter } from "react-router";
import { ServerStyleSheet } from 'styled-components'
import { DIST_PATH_CLIENT, DIST_PATH_REACT_LOADABLES_MANIFEST, ROOT_ELEMENT_ID, STATIC_BUNDLE_DIR, indexHtmlTemplate } from "../shared/build";
import { App } from "../shared/components/App";
import urlJoin from "url-join";
import { readFile, stat } from "fs-extra";

const rootDir = (...paths: string[]) => resolve(__dirname, "../../", ...paths);

export async function start(port: number, clientSideRendering: boolean) {
    await preloadAll(); // don't even start express till react-loadable is preloaded

    const app = express();

    let manifest: Manifest = {};
    let mainScripts = "";
    if (clientSideRendering) {
        try {
            const manifestFile = await readFile(rootDir(DIST_PATH_REACT_LOADABLES_MANIFEST));
            manifest = JSON.parse(manifestFile.toString());
        }
        catch (err) {
            throw new Error(`Cannot read react-loadables manifest: ${err}`);
        }

        const indexHtml = await readFile(rootDir(DIST_PATH_CLIENT, "index.html"));
        const indexHtmlScripts = indexHtml.toString().match(/<script(.*?)<\/script>/g);

        if (indexHtmlScripts) {
            mainScripts = indexHtmlScripts.join("");
        }

        app.use(`/static`, express.static(rootDir(DIST_PATH_CLIENT, STATIC_BUNDLE_DIR)));
    }

    app.get("*", async (req, res) => {
        res.write(indexHtmlTemplate.top);

        const sheet = new ServerStyleSheet();
        const loadedModules = new Array<string>();
        const context = {};

        let jsx = sheet.collectStyles((
            <div id={ROOT_ELEMENT_ID}>
                <StaticRouter location={req.url} context={context}>
                    <App />
                </StaticRouter>
            </div>),
        );

        if (clientSideRendering) {
            jsx = (
                <Capture report={(moduleName) => loadedModules.push(moduleName)}>
                    {jsx}
                </Capture>
            );
        }

        const bodyStream = sheet.interleaveWithNodeStream(renderToNodeStream(jsx));
        bodyStream.pipe(res, { end: false });
        await new Promise((resolve) => bodyStream.once("end", resolve));

        if (clientSideRendering) {
            res.write(getBundles(manifest, loadedModules)
                .map((bundle) => `<script src="${urlJoin("/", STATIC_BUNDLE_DIR, bundle.file)}"></script>`)
                .join("") + mainScripts,
            );
        }

        res.end(indexHtmlTemplate.bottom);
    });

    return new Promise<Server>((resolve) => {
        const server = app.listen(port, () => resolve(server));
    });
}
