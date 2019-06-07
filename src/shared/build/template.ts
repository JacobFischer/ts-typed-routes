/** Un-indents text from 4 spaces, newlines, and tabs to nothing */
const unIndent = (str: string) => str.replace(/ {4}|\n|\t/g, "");

export const indexHtmlTemplate = Object.freeze({
    top: unIndent(`
<!DOCTYPE html>
<html>
    <head>
        <title>Flexi-Stack</title>
    </head>
    <body>`),
    bottom: unIndent(`
    </body>
</html>
`),
});
