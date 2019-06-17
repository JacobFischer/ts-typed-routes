import { shallow } from "enzyme";
import React from "react";
import renderer from "react-test-renderer";
import { Button, StatefullComponent } from "../../../src/shared/components/StatefullComponent";

describe("StatefullComponent component", () => {
    it("renders", () => {
        expect(renderer.create(<StatefullComponent />).toJSON()).toMatchSnapshot();
    });

    it("Counts state", () => {
        const wrapper = shallow(<StatefullComponent />);

        const button = wrapper.find(Button);
        expect(button.length).toBe(1);

        for (let i = 1; i < 9; i += 1) {
            button.simulate("click");
            // TODO: actually check once merged: https://github.com/airbnb/enzyme/issues/2011
            // expect(html.includes(String(i))).toBe(true);
        }
    });
});
