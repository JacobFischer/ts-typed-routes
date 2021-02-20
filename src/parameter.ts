/**
 * A Base parameter in a route, used to name and convert to and from strings.
 */
export interface BaseParameter<
  TName extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TType extends any,
  TOptional extends boolean
> {
  readonly name: TName;
  readonly optional: TOptional;
  readonly parser: (serialized: string) => TType;
  readonly stringify: (value: TType) => string;
}

/* -- Regular Parameters -- */

/** A required parameter within a route. */
export type Parameter<
  TName extends string,
  TType extends unknown
> = BaseParameter<TName, TType, false>;

/**
 * Creates a required Parameter for use in a route.
 *
 * @param name - The name of the parameter in the route.
 * @param parser - An optional type parser. Used to convert from strings in
 * the Route to your expected type. Defaults to `String()` (string type).
 * @param stringify - The function that transforms the value to a string for
 * use within routes. Defaults to `String()` (string type).
 * @returns A parameter for a route.
 */
export function parameter<
  TName extends string,
  TType extends unknown = string
>(
  name: TName,
  parser: (serialized: string) => TType = String as never,
  stringify: (value: TType) => string = String as never,
): Parameter<TName, TType> {
  // TType defaults to string, so defaulting the values to String functions
  // is safe, as otherwise a parser is required.
  return {
    name,
    optional: false,
    parser,
    stringify,
  };
}

/* -- Optional Parameters -- */

/** An optional parameter within a route. */
export type OptionalParameter<
  TName extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TType extends any
> = BaseParameter<TName, TType, true>;

/**
 * Creates an optional Parameter for use in a route.
 *
 * @param name - The name of the parameter in the route.
 * @param parser - An optional type parser. Used to convert from strings in
 * the Route to your expected type. Defaults to `String()` (string type).
 * @param stringify - The function that transforms the value to a string for
 * use within routes. Defaults to `String()` (string type).
 * @returns A parameter for a route.
 */
export function optionalParameter<
  TName extends string,
  TType extends unknown = string
>(
  name: TName,
  parser: (serialized: string) => TType = String as never,
  stringify: (value: TType) => string = String as never,
): OptionalParameter<TName, TType> {
  // TType defaults to string, so defaulting the values to String functions
  // is safe, as otherwise a parser is required.
  return {
    name,
    optional: true,
    parser,
    stringify,
  };
}
