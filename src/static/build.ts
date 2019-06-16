import { join } from "path";
import { createWriteStream, ensureDir } from "fs-extra";
import { preloadAll } from "react-loadable";
import { render } from "../server/render";
import { routes } from "../shared/routes";

const silentLog: (...strings: string[]) => void = () => undefined;

export async function buildStaticPages(outputPath: string, log = silentLog) {
    const rootDir = (...paths: string[]) => join(outputPath, ...paths);
    const routesAnd404 = ["/404", ...routes.map(([route]) => route)];

    log(`Starting to build static pages for all ${routesAnd404.length} routes`);

    await preloadAll();

    await Promise.all(routesAnd404.map(async (route) => {
        let pathDir = rootDir(route);
        let filename = "index.html";
        if (route === "/404") {
            pathDir = rootDir(); // we don't want the directory 404/,
            filename = "404.html"; // just the file 404.html
        }

        await ensureDir(pathDir);

        const pathFile = join(pathDir, filename);
        const fileStream = createWriteStream(pathFile);

        await render(fileStream, route);

        log(`  -> Route '${route}' saved to static file '${pathFile}'`);
    }));
}
