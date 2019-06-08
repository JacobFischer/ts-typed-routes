import { join } from "path";

export const STATIC_BUNDLE_DIR = "static/";
export const ROOT_ELEMENT_ID = "site-root";

export const DIST_DIR = "dist/";
export const DIST_PATH_CLIENT = join(DIST_DIR, "client/");
export const DIST_PATH_SERVER = join(DIST_DIR, "server/");
export const DIST_PATH_REACT_LOADABLES_MANIFEST = join(DIST_PATH_SERVER, "react-loadables.json");

export * from "./shared.webpack.config";
export * from "./template";
