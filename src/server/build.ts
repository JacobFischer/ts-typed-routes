import { readFile } from "fs-extra";
import { join } from "path";

// tslint:disable-next-line:export-name
export async function getScriptsFromIndexHtml(clientSideBundleDir: string): Promise<string> {
    const indexHtmlPath = join(clientSideBundleDir, "index.html");
    const indexHtml = (await readFile(indexHtmlPath)).toString();
    const scripts = indexHtml.match(/<script(.*?)<\/script>/g);

    return scripts
        ? scripts.join("")
        : "";
}
