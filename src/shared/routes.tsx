import reactLoadable from "react-loadable";
import React from "react";
import { About } from "./components/About";
import { SomePage } from "./components/SomePage";

const delay = async (time: number) => new Promise((resolve) => setTimeout(resolve, time));
const Loading = () => <em>Loading</em>;

const LoadableHome = reactLoadable({
    loader: async () => {
        await delay(1000);
        return import("./components/Home");
    },
    loading: Loading,
    render: ({ Home }) => <Home />,
});

export const routesObject = {
    "/": LoadableHome,
    "/about": About,
    "/some-page": SomePage,
};

export const routeExists = (path: string) => Object.prototype.hasOwnProperty.call(routesObject, path);

export const routes = Object.entries(routesObject).sort(([a], [b]) => a.localeCompare(b));
