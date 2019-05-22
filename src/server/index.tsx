import { resolve } from "path";
import { start } from "./start";

const PORT = 8080;

// tslint:disable:no-console

(async () => {
    console.log("--- Server Starting ---");

    try {
        await start(PORT, resolve(__dirname, "../client/"));
    } catch (err) {
        console.error(`Error starting server:`, err);
        process.exit(1);
    }

    console.log(`--- Server listening on port ${PORT} ---`);
})();
