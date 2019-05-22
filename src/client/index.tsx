import React from "react";
import { hydrate } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ROOT_ELEMENT_ID } from "../shared/build";
import { App } from "../shared/components/App";

hydrate(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById(ROOT_ELEMENT_ID),
);
