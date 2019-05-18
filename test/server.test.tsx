import { stat } from "fs-extra";
import { Server } from "http";
import fetch from "node-fetch";
import { join } from "path";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { PORT, start } from "../src/server/start";
import { getScriptsFromIndexHtml, templateHtml } from "../src/shared/build";
import { App } from "../src/shared/components/App";

const DIST_BUNDLE_DIR = join(__dirname, "../dist/client/");

beforeAll(async () => {
    if (!(await stat(DIST_BUNDLE_DIR)).isDirectory()) {
        throw new Error("Cannot test server without client being build for client side rendering tests");
    }
});

describe("Server", () => {
    it("has a port to bind to", () => {
        expect(PORT).toBeGreaterThan(0);
    });

    [
        ["with only server side rendering", null] as const,
        ["with client side rendering", DIST_BUNDLE_DIR] as const,
    ].forEach(([description, clientSideRendering]) => describe(description, () => {
        let server: Server | undefined;
        it("starts", async () => {
            server = await start(clientSideRendering);
            expect(server).toBeInstanceOf(Server);
            expect(server.listening).toBe(true);
        });

        it("serves the page", async () => {
            const location = "/";
            const response = await fetch(`http://localhost:${PORT}${location}`);
            expect(response.status).toEqual(200);

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
            const body = await response.text();
            expect(body).toEqual(expectedBody);
        });

        it("rejects on busy ports", async () => {
            expect(server).toBeInstanceOf(Server);
            await (expect(() => start(clientSideRendering)).rejects);
        });

        it("closes", async () => {
            expect(server).toBeInstanceOf(Server);
            if (!server) {
                throw new Error("Paradox: Server exists but does not?");
            }

            expect(server.listening).toBe(true);
            server.close();
            expect(server.listening).toBe(false);
            server = undefined;
        });
    }));
});
