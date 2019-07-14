import { route, parameter } from "../src";

describe("route", () => {
    it("exists", () => {
        expect(route).toBeTruthy();
    });

    it("is a function", () => {
        expect(typeof route).toBe("function");
    });

    it("route has the correct shape", () => {
        const test = route("test");

        expect(typeof test).toBe("object");
        expect(typeof test.parameters).toBe("object");
        expect(typeof test.create).toBe("function");
        expect(typeof test.path).toBe("function");
        expect(Object.keys(test)).toHaveLength(3);
    });

    it("works with parameters", () => {
        const routeWithParameters = route(
            "first/", parameter("someNumber", Number), "/third/parameter/", parameter("aString"),
        );
        expect(routeWithParameters).toBeTruthy();

        const parameterNames = Object.keys(routeWithParameters.parameters).sort();
        const expectedParameterNames = ["someNumber", "aString"].sort();
        expect(parameterNames).toMatchObject(expectedParameterNames);

        const expectedPath = "first/:someNumber/third/parameter/:aString";
        expect(routeWithParameters.path()).toBe(expectedPath);

        const expectedWithParameters = "first/1337/third/parameter/hello%20there";
        expect(routeWithParameters.create({
            aString: "hello there",
            someNumber: 1337,
        })).toBe(expectedWithParameters);
    });

    it("works with just strings", () => {
        const strings = ["this/only/has", "/strings", "/in/it"] as const;
        const fullRoute = strings.join("");
        const routeOnlyStrings = route(...strings);
        expect(routeOnlyStrings).toBeTruthy();

        expect(Object.keys(routeOnlyStrings.parameters)).toHaveLength(0);
        expect(routeOnlyStrings.path()).toBe(fullRoute);
        expect(routeOnlyStrings.path((s) => `---${s.toUpperCase()}---`)).toBe(fullRoute);
        expect(routeOnlyStrings.create()).toBe(fullRoute);
        expect(routeOnlyStrings.create({})).toBe(fullRoute);
    });

    it("works with a custom replacer", () => {
        const custom = route("test", parameter("one"), parameter("two"));

        expect(custom.path((s) => `>$-${s}-$<`)).toBe("test>$-one-$<>$-two-$<");
    });
});
