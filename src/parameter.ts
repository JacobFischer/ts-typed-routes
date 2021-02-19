/**
 * A parameter in a typesafe route, used to name and convert to and from
 * strings.
 */
export interface BaseParameter<
  TName extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TType extends any,
  TOptional extends boolean
> {
  name: TName;
  optional: TOptional;
  parser: (serialized: string) => TType;
  stringify: (value: TType) => string;
}

/* -- Regular Parameters -- */

/**
 * A parameter in a typesafe route, used to name and convert to and from
 * strings.
 */
export type Parameter<
  TName extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TType extends any
> = BaseParameter<TName, TType, false>;

/**
 * A tuple for a route with a type parser.
 *
 * @param name - The name of the parameter in the route.
 * @param parser - The parser that takes a string and returns a new type.
 * The return type of this function is considered the typing of this parameter
 * for future input types.
 * @param stringify - The function that parses the value from it's type to a
 * serialized string.
 * @returns A tuple [name, parser].
 */
export function parameter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TType extends any,
  TName extends string
>(
  name: TName,
  parser: (serialized: string) => TType,
  stringify?: (value: TType) => string,
): Parameter<TName, TType>;

/**
 * A simple parameter in a route of type string.
 *
 * @param name - The name of the parameter in the route.
 * @returns A tuple of just [name].
 */
export function parameter<TName extends string>(
  name: TName,
): Parameter<TName, string>;

/**
 * Creates a tuple for TypeScript to pickup the parameters in a route.
 *
 * @param name - The name of the parameter in the route.
 * @param parser - An optional type parser. Must be convertable to and from
 * strings in the Route.
 * @param stringify - The function that parses the value from it's type to a
 * serialized string.
 * @returns A tuple with at least the name of the parameter, and an optional
 * second argument of the parser.
 */
export function parameter<
  TName extends string,
  TType extends unknown = string
>(
  name: TName,
  parser?: (serialized: string) => TType,
  stringify?: (value: TType) => string,
): Parameter<TName, TType> {
  // TType defaults to string, so defaulting the values to String functions
  // is safe, as otherwise a parser is required.
  return {
    name,
    optional: false,
    parser: parser || (String as never),
    stringify: stringify || (String as never),
  };
}

/* -- Optional Parameters -- */

/**
 * A parameter in a typesafe route, used to name and convert to and from
 * strings.
 */
export type OptionalParameter<
  TName extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TType extends any
> = BaseParameter<TName, TType, true>;

/**
 * A tuple for a route with a type parser.
 *
 * @param name - The name of the parameter in the route.
 * @param parser - The parser that takes a string and returns a new type.
 * The return type of this function is considered the typing of this parameter
 * for future input types.
 * @param stringify - The function that parses the value from it's type to a
 * serialized string.
 * @returns A tuple [name, parser].
 */
export function optionalParameter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TType extends any,
  TName extends string
>(
  name: TName,
  parser: (serialized: string) => TType,
  stringify?: (value: TType) => string,
): OptionalParameter<TName, TType>;

/**
 * A simple parameter in a route of type string.
 *
 * @param name - The name of the parameter in the route.
 * @returns A tuple of just [name].
 */
export function optionalParameter<TName extends string>(
  name: TName,
): OptionalParameter<TName, string>;

/**
 * Creates a tuple for TypeScript to pickup the optional parameters in a route.
 *
 * @param name - The name of the parameter in the route.
 * @param parser - An optional type parser. Must be convertable to and from
 * strings in the Route.
 * @param stringify - The function that parses the value from it's type to a
 * serialized string.
 * @returns A tuple with at least the name of the parameter, and an optional
 * second argument of the parser.
 */
export function optionalParameter<
  TName extends string,
  TType extends unknown = string
>(
  name: TName,
  parser?: (serialized: string) => TType,
  stringify?: (value: TType) => string,
): OptionalParameter<TName, TType> {
  // TType defaults to string, so defaulting the values to String functions
  // is safe, as otherwise a parser is required.
  return {
    name,
    optional: true,
    parser: parser || (String as never),
    stringify: stringify || (String as never),
  };
}
