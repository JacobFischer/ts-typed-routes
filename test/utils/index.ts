import { Server } from "http";
import { createServer } from "net";

export const closeServer = (server: Server) => new Promise((resolve, reject) => {
  server.close((err) => {
      if (err) {
          reject(err);
      } else {
          resolve();
      }
  });
});

export const isPortTaken = (port: number) => new Promise((resolve, reject) => {
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
