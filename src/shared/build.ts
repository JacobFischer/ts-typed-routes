
import { readFile } from "fs-extra";
import { join } from "path";

export const JS_BUNDLE_DIR = "js/";
export const ROOT_ELEMENT_ID = "site-root";

export const HTML_START =
`<!doctype html>
	<head>
		<title>Hello World!</title>
	</head>
	<body>
		<div id="${ROOT_ELEMENT_ID}">`;

export const HTML_MID = "</div>";

export const HTML_END = "</body></html>";

export const templateHtml = (body: string = "", scripts: string = "") => [
    HTML_START,
    body,
    HTML_MID,
    scripts,
    HTML_END,
].join("");

export async function getScriptsFromIndexHtml(clientSideBundleDir: string) {
    const indexHtmlPath = join(clientSideBundleDir, "index.html");
    const indexHtml = (await readFile(indexHtmlPath)).toString();

    return (indexHtml.match(/<script(.*?)<\/script>/g) || []).join("");
}
