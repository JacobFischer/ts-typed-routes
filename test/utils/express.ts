import express from "express";
import { Server } from "http";
import { createServer } from "net";

export const closeServer = (server: Server) => new Promise<void>((resolve, reject) => {
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
) => new Promise<Server>(async (resolve) => {
    const app = express();
    if (withApp) {
        await withApp(app);
    }
    const server = app.listen(port, () => resolve(server));
});

export const isPortTaken = (port: number) => new Promise<boolean>((resolve, reject) => {
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
