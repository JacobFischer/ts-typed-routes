import React from "react";
import { Link, Route, Switch } from "react-router-dom";
import { About } from "./About";
import { Home } from "./Home";
import { NotFound } from "./NotFound";
import { SomePage } from "./SomePage";

export function App() {
    return (<>
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/some-page">Some Page</Link></li>
            <li><Link to="/not-found">Dead link</Link></li>
        </ul>
        <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/about" component={About} />
            <Route exact path="/some-page" component={SomePage} />
            <Route component={NotFound} />
        </Switch>
    </>);
}
