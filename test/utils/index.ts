import { join } from "path";
import { stat } from "fs-extra";

const CLIENT_DIST_DIR = join(__dirname, "../../dist/client/");

/**
 * Gets the client dist directory, or throws an error if it does not exist.
 *
 * @returns a promise that resolves to the path as a string. If the dist is not present it instread throws an error.
 */
export async function getClientDistDir(): Promise<string> {
    if (!(await stat(CLIENT_DIST_DIR)).isDirectory()) {
        throw new Error("Client dist bundle not build! Tests cannot run!");
    }
    return CLIENT_DIST_DIR;
}

export * from "./express";
