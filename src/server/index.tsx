import { resolve } from "path";
import { start } from "./start";
/* eslint-disable no-console */

const PORT = 8080;

(async () => {
    console.log("--- Server Starting ---");

    try {
        await start(PORT, resolve(__dirname, "../client/"));
    } catch (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }

    console.log(`--- Server listening on port ${PORT} ---`);
})();
