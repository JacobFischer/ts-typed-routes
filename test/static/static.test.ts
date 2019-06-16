import { join, resolve } from "path";
import {
    emptyDir, ensureDir, readdir, remove, stat,
} from "fs-extra";
import { routes } from "../../src/shared/routes";
import { buildStaticPages } from "../../src/static/build";

const TEMP_DIR = resolve(__dirname, "../../temp/");
const OUTPUT_DIR = join(TEMP_DIR, "static/");

beforeAll(() => ensureDir(OUTPUT_DIR));
afterEach(() => emptyDir(OUTPUT_DIR));
afterAll(async () => {
    await remove(OUTPUT_DIR);
    await remove(TEMP_DIR);
});

describe("Static site generation", () => {
    it("Should be a function", () => {
        expect(typeof buildStaticPages).toBe("function");
    });

    it("Should generate a static site", async () => {
        const preStat = await stat(OUTPUT_DIR);
        expect(preStat.isDirectory()).toBe(true);
        const preFiles = await readdir(OUTPUT_DIR);
        expect(preFiles.length).toBe(0);

        await buildStaticPages(OUTPUT_DIR);

        const postStat = await stat(OUTPUT_DIR);
        expect(postStat.isDirectory()).toBe(true);
        const postFiles = await readdir(OUTPUT_DIR);
        expect(postFiles.length).toBeGreaterThanOrEqual(2); // 404 and index pages must exist
        expect(postFiles).toContain("404.html");

        await Promise.all(routes.map(async ([route]) => {
            const staticPath = join(OUTPUT_DIR, route, "index.html");
            const fileStats = await stat(staticPath);
            expect(fileStats.isFile()).toBe(true);
        }));
    }, 12500);

    it("Use a custom logger", async () => {
        let logged = false;
        await buildStaticPages(OUTPUT_DIR, (...strings) => {
            logged = true;
            for (const str of strings) {
                expect(typeof str).toBe("string");
            }
        });

        expect(logged).toBe(true);
    }, 12500);
});
