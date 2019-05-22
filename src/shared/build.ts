export const JS_BUNDLE_DIR = "js/";
export const ROOT_ELEMENT_ID = "site-root";

export const HTML_START =
`<!DOCTYPE html>
<html>
    <head>
        <title>Hello World!</title>
    </head>
    <body>
        <div id="${ROOT_ELEMENT_ID}">`.replace(/ {4}|\n/g, "");

export const HTML_MID = "</div>";

export const HTML_END = "</body></html>";

export const templateHtml = (body: string = "", scripts: string = ""): string => [
    HTML_START,
    body,
    HTML_MID,
    scripts,
    HTML_END,
].join("");
