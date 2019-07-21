/* eslint-disable import/export */// TS allows us to export multiple times for overloaded function signatures
/* eslint-disable @typescript-eslint/no-explicit-any */// any required here for Parameter types

/** A parameter in a typesafe route, used to name and convert to and from strings. */
export interface TypesafeRouteParameter<
    TName extends string,
    TType extends any,
> {
    name: TName;
    parser: (serialized: string) => TType;
    stringify: (value: TType) => string;
}

/**
 * A tuple for a route with a type parser.
 *
 * @param name - The name of the parameter in the route.
 * @param parser - The parser that takes a string and returns a new type. The return type of this function is
 * considered the typing of this parameter for future input types.
 * @param stringify - The function that parses the value from it's type to a serialized string.
 * @returns A tuple [name, parser].
 */
export function parameter<
    TType extends any,
    TName extends string,
>(
    name: TName,
    parser: (serialized: string) => TType,
    stringify?: (value: TType) => string,
): TypesafeRouteParameter<TName, TType>;

/**
 * A simple parameter in a route of type string.
 *
 * @param name - The name of the parameter in the route.
 * @returns A tuple of just [name].
 */
export function parameter<
    TName extends string,
>(
    name: TName,
): TypesafeRouteParameter<TName, string>;

/**
 * Creates a tuple for TypeScript to pickup the parameters in a route.
 *
 * @param name - The name of the parameter in the route.
 * @param parser - An optional type parser. Must be convertable to and from strings in the Route.
 * @param stringify - The function that parses the value from it's type to a serialized string.
 * @returns A tuple with at least the name of the parameter, and an optional second argument of the parser.
 */
export function parameter<
    TName extends string,
    TType extends any = string,
>(
    name: TName,
    parser?: (serialized: string) => TType,
    stringify?: (value: TType) => string,
): TypesafeRouteParameter<TName, TType> {
    return {
        name,
        parser: parser || (String as any), // TType defaults to string, so this is safe
        stringify: stringify || (String as any),
    };
}
