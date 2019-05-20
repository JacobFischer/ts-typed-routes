import React from "react";
import renderer from "react-test-renderer";
import { About } from "../../src/shared/components/About";

describe("About component", () => {
    it("renders", () => {
        expect(renderer.create(<About />).toJSON()).toMatchSnapshot();
    });
});
