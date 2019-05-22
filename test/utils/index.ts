import { stat } from "fs-extra";
import { join } from "path";

const CLIENT_DIST_DIR = join(__dirname, "../../dist/client/");
export async function getClientDistDir(): Promise<string> {
    if (!(await stat(CLIENT_DIST_DIR)).isDirectory()) {
        throw new Error("Client dist bundle not build! Tests cannot run!");
    }
    return CLIENT_DIST_DIR;
}

export * from "./express";
