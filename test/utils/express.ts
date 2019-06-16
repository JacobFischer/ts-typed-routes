import { Server } from "http";
import { createServer } from "net";
import express from "express";

export const closeServer = (server: Server): Promise<void> => new Promise((resolve, reject) => {
    server.close((err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

export const newExpressServer = (
    port: number,
    withApp?: (app: express.Application) => void | Promise<unknown>,
): Promise<Server> => new Promise<Server>(async (resolve) => {
    const app = express();
    if (withApp) {
        await withApp(app);
    }
    const server = app.listen(port, () => resolve(server));
});

export const isPortTaken = (port: number): Promise<boolean> => new Promise((resolve, reject) => {
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
