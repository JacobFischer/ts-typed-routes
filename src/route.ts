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

export type Route<TSegments extends RouteSegment[]> = {
  /**
   * Creates a **new** route by extending new string(s) and parameter(s) onto
   * the end of this route.
   *
   * @param segments - The new segments to concat to the end of this route.
   * @returns A new route that is this current route, with new segments on
   * the end. This route is not mutated.
   */
  extend<TSegments2 extends RouteSegment[]>(
    ...segments: TSegments2
  ): Route<[...TSegments, ...TSegments2]>;

  /**
   * Formats the route with the named parameters and returns the result.
   *
   * @param parameters - The named parameters to use to format with.
   * @returns A string of the entire path with the values filled in.
   */
  with(parameters: ParametersObject<TSegments>): string;

  /**
   * The default value(s) for parameters in this route.
   * This exists mostly as a way to check for key and types at runtime.
   */
  defaults: Readonly<ParametersObject<TSegments>>;

  /**.
   * Parses an object of key/value strings into their expected types
   *
   * @param obj - Key value pairs to parse.
   * @returns A new object of key values pairs, where each value was
   * de-serialized.
   */
  parse(
    obj: Record<string, string>,
    options?: { useDefaults?: boolean },
  ): ParametersObject<TSegments>;

  /**
   * Creates the raw path for this route, using parameter name in place.
   *
   * @param formatter - An optional formatter to invoke on each parameter
   * name. By default adds a ':' in front, and a '?' behind if optional.
   * E.g. `optionalParameterName` -> `:optionalParameterName?`.
   * @returns The route's path with parameter names in place.
   */
  path(
    formatter?: (
      // {} & string allows any string type, but preserves the named parameter
      // segments for IDEs to show developers
      // eslint-disable-next-line @typescript-eslint/ban-types
      parameterName: AllRouteParameters<TSegments>['name'] | ({} & string),
      optional: boolean,
    ) => string,
  ): string;
};

/**
 * Creates a route of static strings and parameters.
 *
 * @param segments - The segments of the route, a mix of static strings and parameters.
 * @returns A route object to help you build paths for this route.
 */
export function route<TSegments extends RouteSegment[]>(
  ...segments: TSegments
): Route<TSegments> {
  type Parameters = ParametersObject<TSegments>;
  const asString = (
    formatParameter: (p: ParameterType) => string,
    joiner = '', // TODO: make '/'
  ) =>
    segments
      .map((segment) =>
        typeof segment === 'string' ? segment : formatParameter(segment),
      )
      // .filter(Boolean)
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

  return {
    extend<TSegments extends RouteSegment[]>(...newSegments: TSegments) {
      return route(...segments, ...newSegments);
    },

    with(parameters: ParametersObject<TSegments>) {
      return asString((p) =>
        encodeURIComponent(
          p.optional && !(p.name in parameters)
            ? ''
            : p.stringify(parameters[p.name as keyof Parameters]),
        ),
      );
    },

    defaults,

    parse(
      obj: { [key: string]: string | undefined },
      options?: { useDefaults?: boolean },
    ) {
      return asObject((parameter) => {
        const key = parameter.name as keyof Parameters;
        const value = obj[parameter.name];
        if (typeof value === 'undefined') {
          if (options && options.useDefaults) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return defaults[key];
          }
          throw new Error(
            `cannot parse '${JSON.stringify(
              obj,
            )}', missing expected key '${String(key)}'`,
          );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return parameter.parser(decodeURIComponent(value));
      });
    },

    path(
      formatter = (parameterName: string, optional: boolean) =>
        `:${parameterName}${optional ? '?' : ''}`,
    ) {
      return asString((p) => formatter(p.name, p.optional));
    },
  };
}
