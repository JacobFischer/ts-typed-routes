import { HTML_END, HTML_MID, HTML_START, templateHtml } from "../../src/shared/build";

const BODY = "<p>Hello!</p>";
const SCRIPTS = "<scrip>foobar</script>";

describe("builder helper function templateHtml", () => {
    it("creates an empty template", () => {
        expect(templateHtml()).toEqual([
            HTML_START,
            HTML_MID,
            HTML_END,
        ].join(""));
    });

    it("creates a filled body", () => {
        const html = templateHtml(BODY);
        expect(html.includes(BODY)).toEqual(true);
        expect(html.includes(SCRIPTS)).toEqual(false);
    });

    it("creates a filled script", () => {
        const html = templateHtml(undefined, SCRIPTS);
        expect(html.includes(BODY)).toEqual(false);
        expect(html.includes(SCRIPTS)).toEqual(true);
    });

    it("creates a filled body and script", () => {
        const html = templateHtml(BODY, SCRIPTS);
        expect(html.includes(BODY)).toEqual(true);
        expect(html.includes(SCRIPTS)).toEqual(true);
    });
});
