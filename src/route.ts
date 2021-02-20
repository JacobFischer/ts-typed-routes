import type { BaseParameter } from './parameter';

type ValuesOf<T extends unknown[]> = T[number];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParameterType = BaseParameter<string, any, boolean>;
type RouteSegment = string | ParameterType;
type AllRouteParameters<T extends RouteSegment[]> = Exclude<
  ValuesOf<T>,
  string
>;
type OnlyRouteParameters<
  T extends RouteSegment[],
  TOptional extends boolean
> = Exclude<
  Exclude<ValuesOf<T>, string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BaseParameter<string, any, TOptional>
>;
type PathFormatter<TSegments extends RouteSegment[]> = (
  // {} & string allows any string type, but preserves the named parameter
  // segments for IDEs to show developers
  // eslint-disable-next-line @typescript-eslint/ban-types
  parameterName: AllRouteParameters<TSegments>['name'] | ({} & string),
  optional: boolean,
) => string;
type ParametersObject<T extends RouteSegment[]> = {
  [key in OnlyRouteParameters<T, true>['name']]: ReturnType<
    Extract<OnlyRouteParameters<T, true>, { name: key }>['parser']
  >;
} &
  {
    [key in OnlyRouteParameters<T, false>['name']]?: ReturnType<
      Extract<OnlyRouteParameters<T, false>, { name: key }>['parser']
    >;
  };

/** A container of functions to format and parse segments of a route. */
export type Route<TSegments extends RouteSegment[]> = {
  /**
   * Creates a **new** route by extending new string(s) and parameter(s) onto
   * the end of this route.
   *
   * @param segments - The new segments to concat to the end of this route.
   * @returns A new route that is this current route, with new segments on
   * the end. This route is not mutated.
   */
  readonly extend: <TSegments2 extends RouteSegment[]>(
    ...segments: TSegments2
  ) => Route<[...TSegments, ...TSegments2]>;

  /**
   * Formats the route with the named parameters and returns the result.
   *
   * @param parameters - The named parameters to use to format with.
   * @param options - Optional object of options.
   * @returns A string of the entire path with the values filled in.
   */
  readonly format: (
    parameters: ParametersObject<TSegments>,
    options?: {
      /** Optional character used to join all segments in the path. */
      joiner?: string;
      /**
       * Optional encoder to use _after_ parameters are formatted within the
       * route. Defaults to `encodeURIComponent`.
       */
      encoder?: (stringified: string) => string;
    },
  ) => string;

  /**
   * The default value(s) for parameters in this route.
   * This exists mostly as a way to check for key and types at runtime.
   */
  readonly defaults: Readonly<ParametersObject<TSegments>>;

  /**.
   * Parses an object of key/value strings into their expected types
   *
   * @param obj - Key value pairs to parse.
   * @param options - Optional object of options to use when parsing.
   * @returns A new object of key values pairs, where each value was
   * de-serialized.
   */
  readonly parse: (
    obj: Record<string, string>,
    options?: {
      /** If this should use default values for keys not present. */
      useDefaults?: boolean;
      /**
       * Optional encoder to use _before_ parameters are passed to their parser
       * functions. Defaults to `decodeURIComponent`.
       */
      decoder?: (encoded: string) => string;
    },
  ) => ParametersObject<TSegments>;

  /**
   * Creates the raw path for this route, using parameter name in place.
   *
   * @param options - Options to use when formatting the path.
   * @param options.formatter - An optional formatter to invoke on each
   * parameter name. By default adds a ':' in front, and a '?' behind if
   * optional.
   * E.g. `optionalParameterName` -> `:optionalParameterName?`.
   * @returns The route's path with parameter names in place.
   */
  readonly path: (options?: {
    formatter?: PathFormatter<TSegments>;
    joiner?: string;
  }) => string;
};

/**
 * Creates a route of static strings and parameters.
 *
 * @param segments - The segments of the route, a mix of static strings and
 * parameters.
 * @returns A route object to help you build paths for this route.
 */
export function route<TSegments extends RouteSegment[]>(
  ...segments: TSegments
): Route<TSegments> {
  type Parameters = ParametersObject<TSegments>;
  const asString = (
    formatParameter: (p: ParameterType) => string,
    joiner = '/',
  ) =>
    segments
      .map((segment) =>
        typeof segment === 'string' ? segment : formatParameter(segment),
      )
      .filter(Boolean)
      .join(joiner);

  const asObject = (
    reducer: (parameter: ParameterType) => Parameters[keyof Parameters],
  ) =>
    segments.reduce((parameters, segment) => {
      if (typeof segment !== 'string') {
        // it is a parameter segment, so get it's default value
        const key = segment.name as keyof Parameters;
        parameters[key] = reducer(segment);
      }
      return parameters;
    }, {} as Parameters);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const defaults = asObject((parameter) => parameter.parser(''));

  const defaultFormatter: PathFormatter<TSegments> = (
    parameterName,
    optional,
  ) => `:${parameterName}${optional ? '?' : ''}`;

  return {
    extend(...newSegments) {
      return route(...segments, ...newSegments);
    },

    format(parameters, options) {
      const encoder = options?.encoder || encodeURIComponent;
      return asString(
        (p) =>
          encoder(
            p.optional && !(p.name in parameters)
              ? ''
              : p.stringify(parameters[p.name as keyof Parameters]),
          ),
        options?.joiner,
      );
    },

    defaults,

    parse(obj, options) {
      return asObject((parameter) => {
        const key = parameter.name as keyof Parameters;
        const value = obj[key];
        if (!(key in obj)) {
          if (options?.useDefaults || parameter.optional) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return defaults[key];
          }

          throw new Error(
            `route '${asString((p) =>
              defaultFormatter(p.name, p.optional),
            )}' cannot parse '${JSON.stringify(
              obj,
            )}', missing expected key '${String(key)}'`,
          );
        }

        const decoder = options?.decoder || decodeURIComponent;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return parameter.parser(decoder(value));
      });
    },

    path(options) {
      const formatter = options?.formatter || defaultFormatter;
      return asString((p) => formatter(p.name, p.optional), options?.joiner);
    },
  };
}
