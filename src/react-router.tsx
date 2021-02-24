/* NOTE: this part is VERY experimental */

try {
  require.resolve('react-router-dom');
} catch {
  throw new Error(`Cannot find module 'react-router-dom'.
You cannot use this part of 'ts-typed-routes' without these React packages installed too.`);
}

import * as React from 'react';
import {
  LinkProps,
  Link,
  NavLink,
  NavLinkProps,
  Redirect,
  RedirectProps,
  /*
  Route as ReactRouterRoute,
  RouteChildrenProps,
  RouteComponentProps,
  match,
  RouteProps,
  */
  useParams,
} from 'react-router-dom';
import type { BaseParameter } from './parameter';
import { route, Route } from './route';

// these are copy and pasted so they are not exported in the final bundle
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParameterType = BaseParameter<string, any, boolean>;
type RouteSegment = string | ParameterType;

type RouteFormatOptions<T extends RouteSegment[]> = NonNullable<
  Parameters<Route<T>['format']>[1]
>;

type RouteParseOptions<T extends RouteSegment[]> = NonNullable<
  Parameters<Route<T>['parse']>[1]
>;

type FilterString<T extends unknown[]> = T extends []
  ? []
  : T extends [infer H, ...infer R]
  ? H extends string
    ? FilterString<R>
    : [H, ...FilterString<R>]
  : T;

type RouteParameters<T extends RouteSegment[]> = Route<T>['defaults'];
type ParametersProps<
  T extends RouteSegment[]
> = FilterString<T> extends never[]
  ? {
      parameters?: RouteParameters<T>;
    }
  : {
      parameters: RouteParameters<T>;
    };

/*
type MatchOverrides<T extends RouteSegment[]> = {
  match: Omit<match<Record<string, never>>, 'params'> & {
    params: RouteParameters<T>;
  };
};

type RouteComponentPropsOverrides<
  T extends RouteSegment[]
> = RouteComponentProps<Record<string, never>> & MatchOverrides<T>;

type RouteChildrenPropsOverrides<
  T extends RouteSegment[]
> = RouteChildrenProps<Record<string, never>> & MatchOverrides<T>;

type RoutePropsOverrides<T extends RouteSegment[]> = {
  component?: React.ComponentType<RouteComponentPropsOverrides<T>>;
  render?: (props: RouteComponentPropsOverrides<T>) => React.ReactNode;
  children?:
    | ((props: RouteChildrenPropsOverrides<T>) => React.ReactNode)
    | React.ReactNode;
};
*/

export interface ReactRoute<T extends RouteSegment[] = RouteSegment[]>
  extends Route<T> {
  readonly Link: React.ComponentType<
    Omit<LinkProps, 'to'> & ParametersProps<T> & RouteFormatOptions<T>
  >;

  readonly NavLink: React.ComponentType<
    Omit<NavLinkProps, 'to'> & ParametersProps<T> & RouteFormatOptions<T>
  >;

  readonly RedirectFrom: React.ComponentType<Omit<RedirectProps, 'from'>>;
  readonly RedirectTo: React.ComponentType<Omit<RedirectProps, 'to'>>;

  /*
  readonly Route: React.ComponentType<
    Omit<RouteProps, 'path' | 'render'> & RoutePropsOverrides<T>
  >;
  */

  readonly useParams: (options?: RouteParseOptions<T>) => RouteParameters<T>;

  /**
   * Creates a **new** ReactRoute by extending new string(s) and parameter(s)
   * onto the end of this route.
   *
   * @param segments - The new segments to concat to the end of this route.
   * @returns A new ReactRoute that is this current route, with new segments on
   * the end. This route is not mutated.
   */
  readonly extend: <TSegments2 extends RouteSegment[]>(
    ...segments: TSegments2
  ) => Route<[...T, ...TSegments2]>;
}

/**.
 * Creates a route of static strings and parameters.
 * This includes additional react-router functionality.
 *
 * @param segments - The segments of the route, a mix of static strings and
 * parameters.
 * @returns A reactRoute object to help you build paths for this route.
 */
export function reactRoute<T extends RouteSegment[]>(
  ...segments: T
): ReactRoute<T> {
  const baseRoute = route(...segments);
  return {
    ...baseRoute,
    Link: ({
      parameters = {} as RouteParameters<T>,
      joiner,
      encoder,
      ...props
    }) => (
      <Link
        to={baseRoute.format(parameters, { encoder, joiner })}
        {...props}
      />
    ),

    NavLink: ({
      parameters = {} as RouteParameters<T>,
      joiner,
      encoder,
      ...props
    }) => (
      <NavLink
        to={baseRoute.format(parameters, { encoder, joiner })}
        {...props}
      />
    ),

    RedirectFrom: (props) => <Redirect from={baseRoute.path()} {...props} />,

    RedirectTo: (props) => <Redirect to={baseRoute.path()} {...props} />,

    /*
    Route: ({ component, render, ...props }) => {
      const renderWrapped = render && ((...args) => render(...args));

      return <ReactRouterRoute path={baseRoute.path()} {...props} />;
    },
    */

    useParams: (options) => baseRoute.parse(useParams(), options),

    extend(...newSegments) {
      return reactRoute(...segments, ...newSegments);
    },
  };
}

export * from './parameter'; // re-export
