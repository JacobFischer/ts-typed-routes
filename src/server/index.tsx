import { PORT, start } from "./start";

// tslint:disable:no-console

(async function startServer() {
    console.log("--- Server Starting ---");

    await start();

    console.log(`--- Server listening on port ${PORT} ---`);
})();
