import React, { useState } from "react";
import styled from "styled-components";

export const Button = styled.button({
    backgroundColor: "lightblue",
    border: "3px solid blue",
});

export function StatefullComponent() {
    // Declare a new state variable, which we'll call "count"
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>You clicked {count} times</p>
            <Button onClick={() => setCount(count + 1)}>Click me</Button>
        </div>
    );
}
