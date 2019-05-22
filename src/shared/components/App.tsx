import React from "react";
import reactLoadable from "react-loadable";
import { Link, Route, Switch } from "react-router-dom";
import { About } from "./About";
import { NotFound } from "./NotFound";
import { SomePage } from "./SomePage";

const delay = async (time: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, time));
const Loading = (): JSX.Element => <em>Loading...</em>;

const LoadableHome = reactLoadable({
    loader: async () => {
        await delay(1000);
        return import("./Home");
    },
    loading: Loading,
    render: ({ Home }, props) => <Home {...props} />,
});

export const App = (): JSX.Element => (
    <>
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/some-page">Some Page</Link></li>
            <li><Link to="/not-found">Dead link</Link></li>
        </ul>
        <Switch>
            <Route exact path="/" component={LoadableHome} />
            <Route exact path="/about" component={About} />
            <Route exact path="/some-page" component={SomePage} />
            <Route component={NotFound} />
        </Switch>
    </>
);
