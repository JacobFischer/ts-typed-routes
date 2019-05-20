import React from "react";
import renderer from "react-test-renderer";
import { NotFound } from "../../src/shared/components/NotFound";

describe("NotFound component", () => {
    it("renders", () => {
        expect(renderer.create(<NotFound />).toJSON()).toMatchSnapshot();
    });
});
