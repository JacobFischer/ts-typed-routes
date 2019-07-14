/* eslint-disable */

import { parameter, TypesafeRouteParameter } from "./parameter";

type ValuesOf<T extends unknown[]> = T[number]; // eslint-disable-line @typescript-eslint/no-explicit-any
type ParameterType = TypesafeRouteParameter<string, any>;
type RouteSegment = string | ParameterType;
type OnlyRouteParameters<T extends RouteSegment[]> = Exclude<(ValuesOf<T>), string>;
type ParametersObject<T extends RouteSegment[]> = {
    [key in OnlyRouteParameters<T>["name"]]: ReturnType<Extract<OnlyRouteParameters<T>, { name: key }>["parser"]>;
};
// type FooBar<T extends [string, any]> = Record<T[0], T[1]>;

interface TypesafeRoute<T extends {}>{
    /**
     * Creates a new route injecting values to the parmeters.
     *
     * @param parameters - key/value object of parameters to inject
     * @returns A string of the route filled in with parameter values.
     */
    create(parameters: T): string;

    /**
     * Creates the raw path for this route, using parameter name in place.
     * @param formatter - An optional formatter to invoke on each parameter name. By default adds a colon in front.
     * e.g. `parameterName` -> `:parameterName`
     * @returns the route's path with parameter names in place.
     */
    path(formatter?: (parameterName: string) => string): string;

    /**
     * The default value(s) for parameters in this route.
     * This exists mostly as a way to check for key and types at runtime.
     */
    parameters: Readonly<T>;
}

/**
 * Creates a route from JUST strings, no parameters.
 *
 * @param segments - The string segments of the route.
 * @returns a route object to help you build paths for this route.
 */
export function route(...segments: string[]): TypesafeRoute<{}> & {
    create(parameters?: {}): string; // make parameters optional as they will always be empty on parameter-less routes
};

/**
 * Creates a route of static strings and parameters.
 *
 * @param segments - The segments of the route, a mix of static strings and parameters.
 * @returns a route object to help you build paths for this route.
 */
export function route<
    T extends RouteSegment[],
    P = ParametersObject<T>,
>(...segments: T): TypesafeRoute<P>;

/**
 * Creates a route of static strings and parameters.
 *
 * @param segments - The segments of the route, a mix of static strings and parameters.
 * @returns a route object to help you build paths for this route.
 */
export function route<
    T extends RouteSegment[],
    P = ParametersObject<T>,
>(...segments: T): TypesafeRoute<P> {
    const makeRoute = (formatParameter: (p: ParameterType) => string) => segments
        .map((segment) => typeof segment === "string"
            ? segment
            : formatParameter(segment)
        )
        .join("");

    return {
        create(parameters: P) {
            return makeRoute(p => encodeURIComponent(p.stringify(
                parameters[p.name as keyof P] as any,
            )));
        },

        path(formatter = (parameterName: string) => `:${parameterName}`) {
            return makeRoute(p => decodeURIComponent(formatter(p.name)));
        },

        parameters: segments.reduce((parameters, segment) => {
            if (typeof segment !== "string") { // it is a parameter segment, so get it's default value
                parameters[segment.name as keyof P] = segment.parser("");
            }
            return parameters;
        }, {} as P),
    };
}

const r = route("lol", parameter("fuck", Number), "me", parameter("right", Boolean));
const sr = route("lololol");

sr.parameters;

r.parameters.right
