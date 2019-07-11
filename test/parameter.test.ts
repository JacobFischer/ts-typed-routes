import { parameter } from "../src";

describe("parameter", () => {
    it("exists", () => {
        expect(parameter).toBeTruthy();
    });

    it("is a function", () => {
        expect(typeof parameter).toBe("function");
    });

    it("works with one argument", () => {
        const one = parameter("one");
        expect(one).toMatchObject(["one", String]);
    });

    it("works with two arguments", () => {
        const two = parameter("two", Number);
        expect(two).toMatchObject(["two", Number]);
    });
});
