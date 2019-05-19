import { readFile } from "fs-extra";
import { join } from "path";

export async function getScriptsFromIndexHtml(clientSideBundleDir: string) {
  const indexHtmlPath = join(clientSideBundleDir, "index.html");
  const indexHtml = (await readFile(indexHtmlPath)).toString();
  const scripts = indexHtml.match(/<script(.*?)<\/script>/g);

  return scripts
      ? scripts.join("")
      : "";
}
