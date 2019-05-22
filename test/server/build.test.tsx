import { createFile, ensureDir, remove } from "fs-extra";
import { join } from "path";
import { getScriptsFromIndexHtml } from "../../src/server/build";

const TEMP_DIR = "./temp";

beforeAll(() => ensureDir(TEMP_DIR));
afterAll(() => remove(TEMP_DIR));

describe("getScriptsFromIndexHtml", () => {
    it("gets script tags from a proper index.html", async () => {
        const scripts = await getScriptsFromIndexHtml("./dist/client/");
        expect(typeof scripts).toBe("string");
        expect(scripts.length).toBeGreaterThan(0);
    });

    it("gets an empty string on invalid files", async () => {
        // create an empty index.html to test against this function
        await createFile(join(TEMP_DIR, "index.html"));
        const scripts = await getScriptsFromIndexHtml(TEMP_DIR);

        expect(typeof scripts).toBe("string");
        expect(scripts).toEqual("");
    });
});
