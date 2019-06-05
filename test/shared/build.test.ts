import { templateHtml } from "../../src/shared/build";

const testStrings = [
    ["body", "jest-body-string"],
    ["head", "jest-head-string"],
    ["scripts", "jest-scripts-string"],
    ["title", "jest-title-string"],
] as const;

const shouldNotExistString = "jest-should-not-exist!";

describe("builder helper function templateHtml", () => {
    it("creates an empty template", () => {
        const html = templateHtml();
        expect(typeof html).toBe("string");
        expect(html.length).toBeGreaterThan(0);
    });

    testStrings.forEach(([templateKey, value]) => describe(`template part '${templateKey}'`, () => {
        it("should template the value", () => {
            const html = templateHtml({ [templateKey]: value });
            expect(html.includes(value)).toBe(true);
            expect(html.includes(shouldNotExistString)).toBe(false);
        });
    }));
});
