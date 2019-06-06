/** Un-indents text from 4 spaces, newlines, and tabs to nothing */
const unIndent = (str: string) => str.replace(/ {4}|\n|\t/g, "");

export const indexHtmlTemplate = Object.freeze({
    preHead: unIndent(`
<!DOCTYPE html>
<html>
    <head>`),
    postHeadPreBody: unIndent(`
    </head>
    <body>`),
    postBody: unIndent(`
    </body>
</html>
`),
});
