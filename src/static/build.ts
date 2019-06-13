import { createWriteStream, ensureDir } from "fs-extra";
import fetch from "node-fetch";
import { start } from "../server/start";
import { routes } from "../shared/routes";
import { join } from "path";
import { streamEnd } from "../shared/utils/streams";
import { closeServer } from "../../test/utils";

const PORT = 8998;
const silentLog: (...strings: string[]) => void = () => undefined;

export async function buildStaticPages(outputPath: string, log = silentLog) {
    const rootDir = (...paths: string[]) => join(outputPath, ...paths);
    const routesAnd404 = ["/404", ...routes.map(([route]) => route)];

    log(`Starting to build static pages for all ${routesAnd404.length} routes`)
    const server = await start(PORT, false);

    await Promise.all(routesAnd404.map(async (route) => {
        const response = await fetch(`http://localhost:${PORT}${route}`);

        let pathDir = rootDir(route);
        let filename = "index.html";
        /* istanbul ignore else: error case mostly to help developers know when their route is borked */
        if (route === "/404") {
            pathDir = rootDir();  // we don't want the directory 404/,
            filename = "404.html" // just the file 404.html
        } else if (response.status !== 200) { // if not ok response, the route was borked in some way!
            throw new Error(`Unexpected response ${response.status} from route '${route}'.`);
        }

        await ensureDir(pathDir);

        const pathFile = join(pathDir, filename);
        const fileStream = createWriteStream(pathFile);
        response.body.pipe(fileStream);
        await streamEnd(response.body);

        log(`  -> Route '${route}' saved to static file '${pathFile}'`);
    }));

    closeServer(server);
}
