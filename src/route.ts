/* eslint-disable */

import { parameter } from "./parameter";

type ValuesOf<T extends unknown[]> = T[number]; // eslint-disable-line @typescript-eslint/no-explicit-any
type RouteSegment = string | ReturnType<typeof parameter>;
type OnlyRouteParameterTuples<T extends RouteSegment[]> = Exclude<(ValuesOf<T>), string>;
type ParametersObject<T extends [string, unknown]> = { [key in T[0]]: ReturnType<Extract<T, [key, (val: string) => unknown]>[1]> };
// type FooBar<T extends [string, any]> = Record<T[0], T[1]>;

/**
 * Creates a route from JUST strings, no parameters.
 *
 * @param segments - The string segments of the route.
 * @returns a route object to help you build paths for this route.
 */
export function route(...segments: string[]): {
    create(): string;
    path(): string;
    parameters: {};
};

/**
 * Creates a route of static strings and parameters.
 *
 * @param segments - The segments of the route, a mix of static strings and parameters.
 * @returns a route object to help you build paths for this route.
 */
export function route<
    T extends RouteSegment[],
    RT = OnlyRouteParameterTuples<T>,
    P = RT extends [string, unknown] ? ParametersObject<RT> : undefined,
>(...segments: T): {
    create(parameters: P): string;
    path(formatter?: (parameterName: string) => string): string;
    parameters: P;
};

/**
 * Creates a route of static strings and parameters.
 *
 * @param segments - The segments of the route, a mix of static strings and parameters.
 * @returns a route object to help you build paths for this route.
 */
export function route<
    T extends RouteSegment[],
    RT = OnlyRouteParameterTuples<T>,
    P = RT extends [string, unknown]
        ? ParametersObject<RT>
        : undefined,
>(...segments: T) {
    const makeRoute = (formatParameter: (p: T[0]) => string) => segments
        .map((segment) => Array.isArray(segment)
            ? formatParameter(segment)
            : segment
        )
        .join("");

    return {
        create(parameters: P) {
            return makeRoute(p => encodeURIComponent(String(parameters[p[0] as keyof P])));
        },

        path(formatter = (parameterName: string) => `:${parameterName}`) {
            return makeRoute(p => formatter(p[0]));
        },

        parameters: {} as P, // TODO: won't work
    };
}

const r = route("foo/bar/", parameter("baz", Number));

r.parameters.baz
