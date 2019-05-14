import React from "react";
import { hydrate } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { App } from "../shared/App";
import { ROOT_ELEMENT_ID } from "../shared/build";

hydrate(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById(ROOT_ELEMENT_ID),
);
