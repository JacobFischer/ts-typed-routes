// import cors from "cors";
import express from "express";
import { Server } from "http";
import { resolve } from "path";
import React from "react";
import { renderToNodeStream } from "react-dom/server";
import { preloadAll, Capture } from "react-loadable";
import { getBundles, Manifest } from 'react-loadable/webpack'
import { StaticRouter, StaticRouterContext } from "react-router";
import { ServerStyleSheet } from 'styled-components'
import { DIST_PATH_CLIENT, DIST_PATH_REACT_LOADABLES_MANIFEST, ROOT_ELEMENT_ID, STATIC_BUNDLE_DIR, indexHtmlTemplate } from "../shared/build";
import { App } from "../shared/components/App";
import { routeExists } from "../shared/routes";
import urlJoin from "url-join";
import { readFile } from "fs-extra";

const rootDir = (...paths: string[]) => resolve(__dirname, "../../", ...paths);

export async function start(port: number, clientSideRendering: boolean) {
    await preloadAll(); // don't even start express till react-loadable is preloaded

    const app = express();

    let manifest: Manifest = {};
    let mainScripts = "";
    if (clientSideRendering) {
        const manifestFile = await readFile(rootDir(DIST_PATH_REACT_LOADABLES_MANIFEST));
        manifest = JSON.parse(manifestFile.toString());

        const indexHtml = await readFile(rootDir(DIST_PATH_CLIENT, "index.html"));
        const indexHtmlScripts = indexHtml.toString().match(/<script(.*?)<\/script>/g);

        /* istanbul ignore else: we never expect this to happen, check is to appease TypeScript */
        if (indexHtmlScripts) {
            mainScripts = indexHtmlScripts.join("");
        }

        app.use(`/static`, express.static(rootDir(DIST_PATH_CLIENT, STATIC_BUNDLE_DIR)));
    }

    app.get("*", async (req, res) => {
        if (!routeExists(req.url)) {
            res.status(404);
        }

        res.write(indexHtmlTemplate.top);

        const sheet = new ServerStyleSheet();
        const loadedModules = new Array<string>();
        // normally we'd use a StaticRouter context to capture if the rendered route was a 404 not found;
        // however we are streaming this response. So the HTTP Status Code has already been sent,
        // thus we don't care at this point in time.
        const staticRouterContext: StaticRouterContext = {};

        let jsx = sheet.collectStyles((
            <div id={ROOT_ELEMENT_ID}>
                <StaticRouter location={req.url} context={staticRouterContext}>
                    <App />
                </StaticRouter>
            </div>),
        );

        /* istanbul ignore if: chunks do not exist during tests, so no modules are loaded */
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

        /* istanbul ignore if: once again, chunks are never found during tests */
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
