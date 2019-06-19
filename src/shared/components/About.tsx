import React from "react";

/**
 * The About page.
 *
 * @param props - React props
 * @param props.creator - An optional creator string override to show how to use a param.
 * @returns A functional react component that uses props.
 */
export const About = ({ creator = "ANONYMOUS" }): JSX.Element => (
    <>
        <h2>About</h2>
        <p>{creator} made this page! It&apos;s simple boilerplate to get up and moving ASAP.</p>
    </>
);
