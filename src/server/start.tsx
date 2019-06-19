import { Server } from "http";
import { resolve } from "path";
// import cors from "cors";
import express from "express";
import { readFile } from "fs-extra";
import { preloadAll } from "react-loadable";
import { Manifest } from "react-loadable/webpack";
import { DIST_PATH_CLIENT, DIST_PATH_REACT_LOADABLES_MANIFEST, STATIC_BUNDLE_DIR } from "../shared/build";
import { routeExists } from "../shared/routes";
import { render } from "./render";

/**
 * Resolves some path(s) to the root directory.
 *
 * @param paths - Variadic args to append to the path.
 * @returns A string of the absolute path at the root.
 */
const rootDir = (...paths: string[]) => resolve(__dirname, "../../", ...paths);

/**
 * Gets the React-Loadables manifest from the dist.
 *
 * @returns a promise that resolves to the react-loadables manifest.
 * _Note_: This is not type checked at runtime,
 * it is just assumed the file in the expected position is already the correct shape.
 */
async function getReactLoadablesManifest(): Promise<Manifest> {
    const manifestFile = await readFile(rootDir(DIST_PATH_REACT_LOADABLES_MANIFEST));
    return JSON.parse(manifestFile.toString()); // technically type unsafe
}

/**
 * Gets the main scripts from a client dist.
 *
 * @returns a promise that resolves to the <script src="index.js" /> and what-not in the client dist.
 */
async function getMainScripts(): Promise<string> {
    const indexHtml = await readFile(rootDir(DIST_PATH_CLIENT, "index.html"));
    const indexHtmlScripts = indexHtml.toString().match(/<script(.*?)<\/script>/g);

    /* istanbul ignore if: we never expect this to happen, check is to appease TypeScript */
    if (!indexHtmlScripts) {
        throw new Error("No main scripts!");
    }

    return indexHtmlScripts.join("");
}

/**
 * Starts a new http server listening for requests and responding to them.
 *
 * @param port - The port to bind to. Must be open.
 * @param clientSideRendering - If client side rendering should be enabled.
 * If true the client dist must already be built.
 * @returns A promise that resolves once the http server is up an listening, resolving to that node server.
 */
export async function start(port: number, clientSideRendering: boolean) {
    await preloadAll(); // don"t even start express till react-loadable is preloaded

    const app = express();
    // app.use(cors);

    if (clientSideRendering) {
        app.use("/static", express.static(rootDir(DIST_PATH_CLIENT, STATIC_BUNDLE_DIR)));
    }

    const csrData = clientSideRendering
        ? {
            mainScripts: await getMainScripts(),
            manifest: await getReactLoadablesManifest(),
            preloaded: true,
        }
        : undefined;

    app.get("*", (req, res) => {
        if (!routeExists(req.url)) {
            res.status(404);
        }

        return render(res, req.url, csrData);
    });

    return new Promise<Server>((res) => {
        const server = app.listen(port, () => res(server));
    });
}
