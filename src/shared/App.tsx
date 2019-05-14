import React from "react";
import { Link, Route, Switch } from "react-router-dom";

export function App() {
    return (<>
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/some-page">Some Page</Link></li>
            <li><Link to="/not-found">Dead link</Link></li>
        </ul>
        <Switch>
            <Route exact path="/" component={() => <p>Welcome to the index</p>} />
            <Route exact path="/about" component={() => <em>About the app</em>} />
            <Route exact path="/some-page" component={() => <strong>Some random other page</strong>} />
            <Route component={() => <pre>404 Not Found!</pre>} />
        </Switch>
    </>);
}
