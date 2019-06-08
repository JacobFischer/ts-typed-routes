import { Server } from "http";
import puppeteer from "puppeteer";
import React from "react";
import { renderToString } from "react-dom/server";
import { preloadAll } from "react-loadable";
import { StaticRouter } from "react-router";
import { start } from "../../src/server/start";
import { App } from "../../src/shared/components/App";
import { routeExists } from "../../src/shared/routes";
import { closeServer, isPortTaken } from "../utils";

const LONG_TIMEOUT = 12500; // for long tests that use puppeteer heavily

let browser = undefined as unknown as puppeteer.Browser; // will be set first below
beforeAll(() => Promise.all([
    preloadAll(),
    puppeteer.launch().then(b => browser = b),
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

        await closeServer(server);
        expect(server.listening).toBe(false);
    });

    it("serves the page", async (done) => {
        const server = await start(port, enableClientSideRendering);
        const location = "/";
        const page = await browser.newPage();
        page.on("error", (err) => done.fail(err));
        await page.setCacheEnabled(false);
        await page.setJavaScriptEnabled(false); // loadables will start loading and change expected body text

        const response = await page.goto(`http://localhost:${port}${location}`);
        expect(response).toBeTruthy();
        if (response) {
            expect(response.status()).toStrictEqual(200);
        } else {
            throw new Error("No response!");
        }

        const expectedHtml = renderToString(
            <StaticRouter location={location}>
                <App />
            </StaticRouter>
        );

        const pageHtml = await page.content();
        expect(pageHtml).toContain(expectedHtml);

        if (enableClientSideRendering) {
            // we'd expect some scripts for client side rendering to be in the html
            expect(pageHtml).toContain("<script");
        }

        // now test with js to make sure it just renders
        await page.setJavaScriptEnabled(true);
        await page.reload();
        await page.waitFor(1000);
        const pageHtmlJsRendered = await page.content();
        expect(typeof pageHtmlJsRendered).toBe("string");
        // it should be some string,
        // we can't know for certain how because of how loadables will or will not mutate it however,
        expect(pageHtmlJsRendered.length).toBeGreaterThan(0);

        if (!enableClientSideRendering) {
            // server side render should not change when the client renders it
            expect(pageHtmlJsRendered).toEqual(pageHtml);
        }
        // else client side rendering took over, and loadables may have already mutated the page

        await page.close();
        await closeServer(server);
        done();
    }, LONG_TIMEOUT); // these are long with puppeteer working

    it("serves 404 errors on not found routes", async (done) => {
        const route = "/i-should-not/work";
        expect(routeExists(route)).toBe(false);

        const server = await start(port, enableClientSideRendering);
        const page = await browser.newPage();
        page.on("error", (err) => done.fail(err));

        const response = await page.goto(`http://localhost:${port}${route}`);
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
