import express from "express";
import { stat } from "fs-extra";
import { Server } from "http";
import { join } from "path";
import puppeteer from "puppeteer";
import { getClientDistDir, isPortTaken, newExpressServer } from "../utils";

const PORT = 8888;
let browser = undefined as unknown as puppeteer.Browser;
let server = undefined as unknown as Server;
beforeAll(async () => Promise.all([
    puppeteer.launch()
        .then((b) => browser = b),
    newExpressServer(PORT, async (app) => app.use("/", express.static(await getClientDistDir())))
        .then((s) => server = s),
]));

describe("Client", () => {
    it("has been built", async () => {
        const indexStat = await stat(join(await getClientDistDir(), "index.html"));
        expect(indexStat.isFile()).toBe(true);
    });

    it("has a static webserver to receive content from", async () => {
        expect(await isPortTaken(PORT)).toBe(true);
    });

    it("renders on the web page", async () => {
        expect(browser).toBeTruthy();
        const page = await browser.newPage();

        const response = await page.goto(`http://localhost:${PORT}/`);
        expect(response).toBeTruthy();
        if (!response) {
            throw new Error("No response from client static web server!");
        }

        expect(response.status()).toBe(200);

        await page.close();
    });
});
