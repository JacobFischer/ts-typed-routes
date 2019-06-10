import { createWriteStream, ensureDir } from "fs-extra";
import fetch from "node-fetch";
import { start } from "../server/start";
import { routes } from "../shared/routes";
import { join } from "path";
import { DIST_PATH_STATIC } from "../shared/build";
import { streamEnd } from "../shared/utils/streams";
import { closeServer } from "../../test/utils";

/* eslint-disable no-console */

const PORT = 8080;
const rootDir = (...paths: string[]) => join(DIST_PATH_STATIC, ...paths);

export async function buildStaticPages() {
    const routesAnd404 = ["/404", ...routes.map(([route]) => route)];
    console.log(`Starting to build static pages for all ${routesAnd404.length} routes`)
    const server = await start(PORT, false);

    try {
        await Promise.all(routesAnd404.map(async (route) => {
            const basePath = rootDir(route);
            await ensureDir(basePath);

            const response = await fetch(`http://localhost:${PORT}${route}`);

            let path = join(basePath, "index.html");
            if (route === "/404") {
                path = rootDir("404.html");
            } else if (response.status !== 200) { // if not ok response, the route was borked in some way!
                throw new Error(`Unexpected response ${response.status} from route '${route}'.`);
            }

            const fileStream = createWriteStream(path);
            response.body.pipe(fileStream);
            await streamEnd(response.body);

            console.log(`  -> Route '${route}' saved to static file '${path}'`);
        }));
    } catch(err) {
        console.error("Unexpected error:", err);
        process.exit(1);
    }

    closeServer(server);
}

buildStaticPages().then(() => {
    console.log("done!");
});
