import { readFile, stat } from "fs-extra";
import { join, resolve } from "path";
import * as build from "../../src/shared/build";

const rootDir = (...paths: string[]) => resolve(__dirname, "../../", ...paths);
const isDirectory = async(...paths: string[]) => {
    const stats = await stat(rootDir(...paths));
    return stats.isDirectory();
}


describe("Test the build", () => {
    it("Should have a dist directory", async () => {
        expect(await isDirectory(build.DIST_DIR)).toBe(true);
    });

    it("Should have a client build", async () => {
        expect(await isDirectory(build.DIST_PATH_CLIENT)).toBe(true);
        expect(await isDirectory(build.DIST_PATH_CLIENT, build.STATIC_BUNDLE_DIR)).toBe(true);
    });

    it("Should have a server build", async () => {
        expect(await isDirectory(build.DIST_PATH_SERVER)).toBe(true);

        const manifestPath = rootDir(build.DIST_PATH_REACT_LOADABLES_MANIFEST);
        const loadablesStats = await stat(manifestPath);
        expect(loadablesStats.isFile()).toBe(true);

        const loadablesFile = await readFile(manifestPath);
        const loadablesObject = JSON.parse(loadablesFile.toString());
        expect(loadablesObject).toBeTruthy();
        expect(typeof loadablesObject).toBe("object");
    });
});

describe("indexHtmlTemplate template", () => {
    it("Should have template parts", () => {
        expect(typeof build.indexHtmlTemplate).toBe("object");
    });

    const htmlTemplate = build.indexHtmlTemplate.top + build.indexHtmlTemplate.bottom;

    for (const [part, value] of Object.entries(build.indexHtmlTemplate)) {
        it(`${part} should be a string`, () => {
            expect(value).toBeTruthy();
            expect(typeof value).toBe("string");
        });
    }

    for (const htmlTag of [
        "<!DOCTYPE html>",
        "<html", "</html>",
        "<head", "</head>",
        "<body", "</body>",
    ]) {
        it(`the HTML Tag ${htmlTag} should be in the template`, () => {
            expect(htmlTemplate).toContain(htmlTag);
        });
    }
});
