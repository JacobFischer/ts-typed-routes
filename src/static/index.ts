import { DIST_PATH_STATIC } from "../shared/build";
import { buildStaticPages } from "./build";

/* eslint-disable no-console */

(async () => {
    try {
        await buildStaticPages(DIST_PATH_STATIC, console.log);
        console.log("Static website built");
    } catch (err) {
        console.error("Error generating static pages!", err);
        process.exit(1);
    }
})();
