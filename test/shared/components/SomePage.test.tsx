import React from "react";
import renderer from "react-test-renderer";
import { SomePage } from "../../../src/shared/components/SomePage";

describe("SomePage component", () => {
    it("renders", () => {
        expect(renderer.create(<SomePage />).toJSON()).toMatchSnapshot();
    });
});
