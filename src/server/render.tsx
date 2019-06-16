import { Writable } from "stream";
import React from "react";
import { renderToNodeStream } from "react-dom/server";
import { Capture } from "react-loadable";
import { Manifest, getBundles } from "react-loadable/webpack";
import { StaticRouter, StaticRouterContext } from "react-router";
import { ServerStyleSheet } from "styled-components";
import urlJoin from "url-join";
import { ROOT_ELEMENT_ID, STATIC_BUNDLE_DIR, indexHtmlTemplate } from "../shared/build";
import { App } from "../shared/components/App";
import { streamEnd } from "../shared/utils/streams";

/**
 * Renders the React app in a node (server) environment
 * @param output - the write stream to stream the html to as it is built
 * @param location - the location to render in the app
 * @param csr - client side rendering options to inject into the rendered html
 * @returns a promise that resolves once the entire html document has been written to `output`
 */
export async function render(output: Writable, location: string, csr?: {
    mainScripts: string;
    manifest: Manifest;
}) {
    output.write(indexHtmlTemplate.top);

    const sheet = new ServerStyleSheet();
    const loadedModules = new Array<string>();
    // normally we"d use a StaticRouter context to capture if the rendered route was a 404 not found;
    // however we are streaming this response. So the HTTP Status Code has already been sent,
    // thus we don"t care at this point in time.
    const staticRouterContext: StaticRouterContext = {};

    let jsx = sheet.collectStyles((
        <div id={ROOT_ELEMENT_ID}>
            <StaticRouter location={location} context={staticRouterContext}>
                <App />
            </StaticRouter>
        </div>
    ));

    /* istanbul ignore if: chunks do not exist during tests, so no modules are loaded */
    if (csr) {
        jsx = (
            <Capture report={(moduleName) => loadedModules.push(moduleName)}>
                {jsx}
            </Capture>
        );
    }

    const bodyStream = sheet.interleaveWithNodeStream(renderToNodeStream(jsx));
    bodyStream.pipe(output, { end: false });
    await streamEnd(bodyStream);

    /* istanbul ignore if: once again, chunks are never found during tests */
    if (csr) {
        output.write(getBundles(csr.manifest, loadedModules)
            .map((bundle) => `<script src="${urlJoin("/", STATIC_BUNDLE_DIR, bundle.file)}"></script>`)
            .join("") + csr.mainScripts);
    }

    output.end(indexHtmlTemplate.bottom);
}
