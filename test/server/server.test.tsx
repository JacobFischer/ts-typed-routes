import { stat } from "fs-extra";
import { Server } from "http";
import { createServer } from "net";
import { join } from "path";
import puppeteer from "puppeteer";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { getScriptsFromIndexHtml } from "../../src/server/build";
import { start } from "../../src/server/start";
import { templateHtml } from "../../src/shared/build";
import { App } from "../../src/shared/components/App";

const DIST_BUNDLE_DIR = join(__dirname, "../../dist/client/");

let browser = undefined as any as puppeteer.Browser;
beforeAll(async () => {
    if (!(await stat(DIST_BUNDLE_DIR)).isDirectory()) {
        throw new Error("Cannot test server without client being build for client side rendering tests");
    }

    browser = await puppeteer.launch();
});

afterAll(async () => {
    await browser.close();
});

const isPortTaken = (port: number) => new Promise((resolve, reject) => {
    const tester = createServer();
    tester.once("error", (err: Error & { code?: string }) => {
        if (err.code === "EADDRINUSE") {
            resolve(true); // address was in use, port is thus taken
        } else {
            reject(err); // unexpected other error occurred
        }
    });
    tester.once("listening", () => tester.close(() => resolve(false)));
    tester.listen(port);
});

let i = 999;
const serverTests = (
    description: string,
    port: number,
    clientSideRendering: null | string,
) => new Promise((serverTestsDone) => {
    console.log("iteration", ++i);
    describe(description, () => {
        it("has a port to bind to", async () => {
            console.log(i, "iteration port bind");
            expect(port).toBeGreaterThan(0);
            const portTaken = await isPortTaken(port);
            expect(portTaken).toBe(false);
            console.log(i, "iteration port bind", portTaken, port);
        });

        let server: Server | undefined;
        it("starts", async () => {
            server = await start(port, clientSideRendering);
            expect(server).toBeInstanceOf(Server);
            expect(server.listening).toBe(true);
        });

        it("serves the page", async () => {
            const location = "/";
            const page = await browser.newPage();
            await page.setCacheEnabled(false);
            await page.setJavaScriptEnabled(false); // loadables will start loading and change expected body text

            const response = await page.goto(`http://localhost:${port}${location}`);
            expect(response).toBeTruthy();
            if (response) {
                expect(response.status()).toStrictEqual(200);
            } else {
                throw new Error("No response!");
            }

            const expectedBody = templateHtml(
                renderToString(
                    <StaticRouter location={location}>
                        <App />
                    </StaticRouter>,
                ),
                clientSideRendering
                    ? await getScriptsFromIndexHtml(clientSideRendering)
                    : "",
            );

            const body = await page.content();
            expect(body).toEqual(expectedBody);

            // now test with js to make sure it just renders
            await page.setJavaScriptEnabled(true);
            await page.reload();
            await page.waitFor(1000);
            const jsBody = await page.content();
            expect(typeof jsBody).toBe("string");
            // it should be some string,
            // we can't know for certain how because of how loadables will or will not mutate it however,
            expect(jsBody.length).toBeGreaterThan(0);

            if (clientSideRendering) {
                expect(jsBody).toEqual(body);
            }
            console.log("js body", jsBody);

            await page.close();
        });

        it("closes", async () => {
            expect(server).toBeInstanceOf(Server);
            if (!server) {
                return;
            }

            expect(server.listening).toBe(true);

            await new Promise((resolve, reject) => {
                console.log(i, "attemping to tear down..,", !!server);
                if (server) {
                    server.close((err) => {
                        console.log(i, "closed!", err);
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
            });

            console.log(i, "YAY server closed!");
            expect(server.listening).toBe(false);
            server = undefined;
            serverTestsDone();
        });
    });
});

describe("Server", () => {
    (async () => {
        await serverTests("with only server side rendering", 8080, null);
        console.log(">>>>>>>>>>>>-------<<<<<<<<<<<<<<");
        // await serverTests("with client side rendering", 8081, DIST_BUNDLE_DIR);
    })().catch((err) => {
        throw new Error(`Server tests error: ${err}`);
    });
});
