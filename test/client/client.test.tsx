import { Server } from "http";
import { join } from "path";
import express from "express";
import { stat } from "fs-extra";
import puppeteer from "puppeteer";
import {
    closeServer, getClientDistDir, isPortTaken, newExpressServer,
} from "../utils";

const PORT = 8888;
let browser = undefined as unknown as puppeteer.Browser;
let server = undefined as unknown as Server;
beforeAll(() => Promise.all([
    puppeteer.launch()
        .then((b) => { browser = b; }),
    newExpressServer(PORT, async (app) => app.use("/", express.static(await getClientDistDir())))
        .then((s) => { server = s; }),
]));

afterAll(() => Promise.all([
    browser.close(),
    closeServer(server),
]));

describe("Client", () => {
    it("has been built", async () => {
        const indexStat = await stat(join(await getClientDistDir(), "index.html"));
        expect(indexStat.isFile()).toBe(true);
    });

    it("has a static webserver to receive content from", async () => {
        expect(await isPortTaken(PORT)).toBe(true);
    });

    it("renders on the web page", async (done) => {
        expect(browser).toBeTruthy();
        const page = await browser.newPage();
        page.on("error", (err) => done.fail(err));

        const response = await page.goto(`http://localhost:${PORT}/`);
        expect(response).toBeTruthy();
        if (!response) {
            throw new Error("No response from client static web server!");
        }
        expect(response.status()).toBe(200);

        const content = await page.content();
        expect(typeof content).toBe("string");
        expect(content.length).toBeGreaterThan(0); // loadable can mutate to page so just test to make sure it exists

        await page.close();
        done();
    });
});
