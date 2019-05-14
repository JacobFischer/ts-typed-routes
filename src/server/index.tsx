import { setupExpress } from "./setup-express";

// tslint:disable:no-console

(async function start() {
    console.log("--- Server Starting... ---");

    const port = await setupExpress();

    console.log(`--- Server listening on port ${port} ---`);
})();
