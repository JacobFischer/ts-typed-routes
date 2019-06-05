import React from "react";
import styled from "styled-components";

const Hot = styled.div({
    color: "hotpink",
});

export const Home = (): JSX.Element => (
    <Hot>
        <h1>Home</h1>
        <p>Welcome to the index page!</p>
    </Hot>
);
