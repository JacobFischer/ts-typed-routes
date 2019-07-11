/* eslint-disable import/export */// TS allows us to export multiple times for overloaded function signatures

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
): [TName, (val: string) => string];

/**
 * A tuple for a route with a type converter.
 *
 * @param name - The name of the parameter in the route.
 * @param converter - The converter that takes a string and returns a new type. The return type of this function is
 * considered the typing of this parameter for future input types.
 * @returns A tuple [name, converter].
 */
export function parameter<
    TName extends string,
    TConverter extends (val: string) => unknown,
>(
    name: TName,
    converter: TConverter,
): [TName, TConverter];

/**
 * Creates a tuple for TypeScript to pickup the parameters in a route.
 *
 * @param name - The name of the parameter in the route.
 * @param converter - An optional type converter. Must be convertable to and from strings in the Route.
 * @returns A tuple with at least the name of the parameter, and an optional second argument of the converter.
 */
export function parameter<
    TName extends string,
    TConverter extends (val: string) => unknown,
>(
    name: TName,
    converter?: TConverter,
) {
    return [name, converter || String];
}

// --- working, but wrong ---

// /**
//  * A simple parameter in a route of type string.
//  *
//  * @param name - The name of the parameter in the route.
//  * @returns A tuple of just [name].
//  */
// export function parameter<
//     TName extends string,
// >(
//     name: TName,
// ): [TName, string];

// /**
//  * A tuple for a route with a type converter.
//  *
//  * @param name - The name of the parameter in the route.
//  * @param converter - The converter that takes a string and returns a new type. The return type of this function is
//  * considered the typing of this parameter for future input types.
//  * @returns A tuple [name, converter].
//  */
// export function parameter<
//     TName extends string,
//     TReturns,
// >(
//     name: TName,
//     converter: (val: string) => TReturns,
// ): [TName, TReturns];

// /**
//  * Creates a tuple for TypeScript to pickup the parameters in a route.
//  *
//  * @param name - The name of the parameter in the route.
//  * @param converter - An optional type converter. Must be convertable to and from strings in the Route.
//  * @returns A tuple with at least the name of the parameter, and an optional second argument of the converter.
//  */
// export function parameter<
//     TName extends string,
//     TReturns,
// >(
//     name: TName,
//     converter?: (val: string) => TReturns,
// ) {
//     const converted = converter ? converter("") : String("");
//     return [name, converted];
// }

// --- bad ----

// /**
//  * A simple parameter in a route of type string.
//  *
//  * @param name - The name of the parameter in the route.
//  * @returns A tuple of just [name].
//  */
// export function parameter<
//     TName extends string,
// >(
//     name: TName,
// ): {
//     name: TName;
//     converter: (val?: string) => string;
// };

// /**
//  * A tuple for a route with a type converter.
//  *
//  * @param name - The name of the parameter in the route.
//  * @param converter - The converter that takes a string and returns a new type. The return type of this function is
//  * considered the typing of this parameter for future input types.
//  * @returns A tuple [name, converter].
//  */
// export function parameter<
//     TName extends string,
//     TConverter extends (val?: string) => unknown,
// >(
//     name: TName,
//     converter: TConverter,
// ): {
//     name: TName;
//     converter: TConverter;
// };

// /**
//  * Creates a tuple for TypeScript to pickup the parameters in a route.
//  *
//  * @param name - The name of the parameter in the route.
//  * @param converter - An optional type converter. Must be convertable to and from strings in the Route.
//  * @returns A tuple with at least the name of the parameter, and an optional second argument of the converter.
//  */
// export function parameter<
//     TName extends string,
//     TConverter,
// >(
//     name: TName,
//     converter?: TConverter,
// ) {
//     return {
//         name,
//         converter: converter || String,
//     };
// }

