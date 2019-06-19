import React from "react";
import styled from "styled-components";

const Hot = styled.div({
    color: "hotpink",
});

/**
 * An example Home page element.
 *
 * @returns a functional component.
 */
export const Home = (): JSX.Element => (
    <Hot>
        <h1>Home</h1>
        <p>Welcome to the index page!</p>
    </Hot>
);
