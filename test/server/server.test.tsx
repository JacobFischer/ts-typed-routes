import { Server } from "http";
import { Writable } from "stream";
import puppeteer from "puppeteer";
import { preloadAll } from "react-loadable";
import { render } from "../../src/server/render";
import { start } from "../../src/server/start";
import { routeExists } from "../../src/shared/routes";
import { closeServer, isPortTaken } from "../utils";

const LONG_TIMEOUT = 12500; // for long tests that use puppeteer heavily

let browser = undefined as unknown as puppeteer.Browser; // will be set first below
beforeAll(() => Promise.all([
    preloadAll(),
    puppeteer.launch().then((b) => { browser = b; }),
]));

afterAll(async () => browser && browser.close());

describe("Server", () => [
    ["with only server side rendering", 8080, false] as const,
    ["with client side rendering", 9090, true] as const,
    // eslint-disable-next-line jest/valid-describe
].forEach(([description, port, enableClientSideRendering]) => describe(description, () => {
    it("has a puppeteer browser", () => {
        expect(browser).toBeTruthy();
    });

    it("has a port to bind to", async () => {
        expect(port).toBeGreaterThan(0);
        const portTaken = await isPortTaken(port);
        expect(portTaken).toBe(false);
    });

    it("starts and closes", async () => {
        const server = await start(port, enableClientSideRendering);
        expect(server).toBeInstanceOf(Server);
        expect(server.listening).toBe(true);

        const portTakenConnected = await isPortTaken(port);
        expect(portTakenConnected).toBe(true);

        await closeServer(server);
        expect(server.listening).toBe(false);

        const portTakenDisconnected = await isPortTaken(port);
        expect(portTakenDisconnected).toBe(false);
    });

    it("serves the page", async (done) => {
        const server = await start(port, enableClientSideRendering);
        const location = "/";
        const page = await browser.newPage();
        page.on("error", (err) => done.fail(err));
        await page.setCacheEnabled(false);
        await page.setJavaScriptEnabled(false);

        const response = await page.goto(`http://localhost:${port}${location}`);
        expect(response).toBeTruthy();
        if (response) {
            expect(response.status()).toStrictEqual(200);
        } else {
            throw new Error("No response!");
        }

        const chunks = new Array<string>();
        const stream = new Writable({
            write: (chunk, _, next) => {
                chunks.push(String(chunk));
                next();
            },
        });
        await render(stream, location);

        // chop off the end, because scripts may exist
        const expectedHtml = chunks.join("").replace("</div></body></html>", "");

        const pageHtml = await page.content();
        expect(pageHtml).toContain(expectedHtml);

        // expect at least 1 script tag with client side rendering, otherwise none
        expect(pageHtml.includes("<script")).toBe(enableClientSideRendering);

        // now test with js to make sure it just renders
        await page.setJavaScriptEnabled(true);
        await page.reload();
        await page.waitFor(1000);
        // if an error was thrown with js enabled the on error callback at the start will fail this test

        await page.close();
        await closeServer(server);
        done();
    }, LONG_TIMEOUT); // these are long with puppeteer working

    it("serves 404 errors on not found routes", async (done) => {
        const route404 = "/i-should-not/work";
        expect(routeExists(route404)).toBe(false);

        const server = await start(port, enableClientSideRendering);
        const page = await browser.newPage();
        page.on("error", (err) => done.fail(err));

        const response = await page.goto(`http://localhost:${port}${route404}`);
        expect(response).toBeTruthy();
        if (response) {
            expect(response.status()).toStrictEqual(404);
        } else {
            throw new Error("No response!");
        }

        await page.close();
        await closeServer(server);
        done();
    }, LONG_TIMEOUT); // these are long with puppeteer working
})));
