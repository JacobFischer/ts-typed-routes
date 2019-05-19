import { resolve } from "path";
import { PORT, start } from "./start";

// tslint:disable:no-console

(async function startServer() {
    console.log("--- Server Starting ---");

    let server: any;
    try {
        server = await start(resolve(__dirname, "../client/"));
    } catch (err) {
        console.error(`Error starting server:`, err);
        process.exit(1);
    }

    console.log(`--- Server listening on port ${PORT} ---`);

    setTimeout(() => {
        server.getConnections((err: Error, count: any) => {
            console.log("count is", count);

            console.log("killing server", new Date());
            server.close(() => {
                console.log("server killed", new Date());
            });
        });
    }, 10000);
})();
