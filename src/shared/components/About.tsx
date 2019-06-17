import React from "react";

export const About = ({ creator = "ANONYMOUS" }): JSX.Element => (
    <>
        <h2>About</h2>
        <p>{creator} made this page! It&apos;s simple boilerplate to get up and moving ASAP.</p>
    </>
);
