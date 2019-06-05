export const STATIC_BUNDLE_DIR = "static/";
export const ROOT_ELEMENT_ID = "site-root";
export * from "./shared.webpack.config";

/** Un-indents text from 4 spaces, newlines, and tabs to nothing */
const unIndent = (str: string): string => str.replace(/ {4}|\n|\t/g, "");

export const htmlTemplatePreBody = (title: string = "Page Title"): string => unIndent(`
<!DOCTYPE html>
<html>
    <head>
        <title>${title}</title>
    </head>
    <body>`);

export const htmlTemplatePostBody = (): string => unIndent(`
    </body>
</html>`);
