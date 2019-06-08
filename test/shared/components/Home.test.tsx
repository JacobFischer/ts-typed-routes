import React from "react";
import renderer from "react-test-renderer";
import { Home } from "../../../src/shared/components/Home";

describe("Home component", () => {
    it("renders", () => {
        expect(renderer.create(<Home />).toJSON()).toMatchSnapshot();
    });
});
