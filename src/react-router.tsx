/* NOTE: this part is VERY experimental */
import * as React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { route, Route, RouteSegments } from './route';

export type RouteFormatOptions<T extends RouteSegments> = NonNullable<
  Parameters<Route<T>['format']>[1]
>;

export type RouteParseOptions<T extends RouteSegments> = NonNullable<
  Parameters<Route<T>['parse']>[1]
>;

type FilterString<T extends readonly unknown[]> = T extends []
  ? []
  : T extends [infer H, ...infer R]
  ? H extends string
    ? FilterString<R>
    : [H, ...FilterString<R>]
  : T;

export type RouteParameters<T extends RouteSegments> = Route<T>['defaults'];
export type ParametersProps<
  T extends RouteSegments
> = FilterString<T> extends ReadonlyArray<never>
  ? {
      parameters?: RouteParameters<T>;
    }
  : {
      parameters: RouteParameters<T>;
    };

export type RouteFormatProps<T extends RouteSegments> = ParametersProps<T> &
  RouteFormatOptions<T>;

/*
type MatchOverrides<T extends RouteSegments> = {
  match: Omit<match<Record<string, never>>, 'params'> & {
    params: RouteParameters<T>;
  };
};

type RouteComponentPropsOverrides<
  T extends RouteSegments
> = RouteComponentProps<Record<string, never>> & MatchOverrides<T>;

type RouteChildrenPropsOverrides<
  T extends RouteSegments
> = RouteChildrenProps<Record<string, never>> & MatchOverrides<T>;

type RoutePropsOverrides<T extends RouteSegments> = {
  component?: React.ComponentType<RouteComponentPropsOverrides<T>>;
  render?: (props: RouteComponentPropsOverrides<T>) => React.ReactNode;
  children?:
    | ((props: RouteChildrenPropsOverrides<T>) => React.ReactNode)
    | React.ReactNode;
};
*/

export type LinkProps<T extends RouteSegments> = Omit<
  ReactRouterDOM.LinkProps,
  'to'
> &
  RouteFormatProps<T>;

export type NavLinkProps<T extends RouteSegments> = Omit<
  ReactRouterDOM.NavLinkProps,
  'to'
> &
  RouteFormatProps<T>;

export type RedirectFromPathProps = Omit<ReactRouterDOM.RedirectProps, 'from'>;

export type RedirectToPathProps = Omit<ReactRouterDOM.RedirectProps, 'to'>;

export type RedirectFromProps<T extends RouteSegments> = Omit<
  ReactRouterDOM.RedirectProps,
  'from'
> &
  RouteFormatProps<T>;

export type RedirectToProps<T extends RouteSegments> = Omit<
  ReactRouterDOM.RedirectProps,
  'to'
> &
  RouteFormatProps<T>;

export type RouteProps = Omit<ReactRouterDOM.RouteProps, 'path'>;

export type RouteFormattedProps<T extends RouteSegments> = Omit<
  RouteProps,
  'path'
> &
  RouteFormatProps<T>;

/**
 * An extension of the base `route` that exposes some useful `react-router`
 * wrapper components.
 *
 * @see route
 */
export interface ReactRoute<T extends RouteSegments = RouteSegments>
  extends Route<T> {
  /**
   * A wrapper around a <Link>, but with the `to` prop directed at this
   * formatted route.
   */
  readonly Link: React.ComponentType<LinkProps<T>>;

  /**
   * A wrapper around a <NavLink>, but with the `to` prop directed at this
   * formatted route.
   */
  readonly NavLink: React.ComponentType<NavLinkProps<T>>;

  /**
   * A wrapper around a <Redirect>, but with the `from` prop directed at this
   * route's raw path.
   */
  readonly RedirectFromPath: React.ComponentType<RedirectFromPathProps>;

  /**
   * A wrapper around a <Redirect>, but with the `to` prop directed at this
   * route's raw path.
   */
  readonly RedirectToPath: React.ComponentType<RedirectToPathProps>;

  /**
   * A wrapper around a <Redirect>, but with the `from` prop directed at this
   * formatted route.
   */
  readonly RedirectFrom: React.ComponentType<RedirectFromProps<T>>;

  /**
   * A wrapper around a <Redirect>, but with the `to` prop directed at this
   * formatted route.
   */
  readonly RedirectTo: React.ComponentType<RedirectToProps<T>>;

  /*
  readonly Route: React.ComponentType<
    Omit<RouteProps, 'path'> & RoutePropsOverrides<T>
  >;
  */

  /**
   * A wrapper around a <Route>, with the `path` prop automatically set to the
   * route's raw path.
   *
   * **Note**: the props route exposes via `match` are not transformed at this
   * time.
   */
  readonly Route: React.ComponentType<RouteProps>;

  /**
   * A wrapper around a <Route>, with the `path` prop set to a formatted route.
   */
  readonly RouteFormatted: React.ComponentType<RouteFormattedProps<T>>;

  /**
   * A wrapper around the `useParams` hook, but with all usually string values
   * transformed via the decoder function for each parameter.
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
  readonly extend: <TSegments2 extends RouteSegments>(
    ...segments: TSegments2
  ) => ReactRoute<[...T, ...TSegments2]>;
}

/**.
 * Creates a route of static strings and parameters.
 * This includes additional react-router functionality.
 *
 * @param segments - The segments of the route, a mix of static strings and
 * parameters.
 * @returns A reactRoute object to help you build paths for this route.
 */
export function reactRoute<T extends RouteSegments>(
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
      <ReactRouterDOM.Link
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
      <ReactRouterDOM.NavLink
        to={baseRoute.format(parameters, { encoder, joiner })}
        {...props}
      />
    ),

    RedirectFromPath: (props) => (
      <ReactRouterDOM.Redirect from={baseRoute.path()} {...props} />
    ),

    RedirectToPath: (props) => (
      <ReactRouterDOM.Redirect to={baseRoute.path()} {...props} />
    ),

    RedirectFrom: ({
      parameters = {} as RouteParameters<T>,
      joiner,
      encoder,
      ...props
    }) => (
      <ReactRouterDOM.Redirect
        from={baseRoute.format(parameters, { encoder, joiner })}
        {...props}
      />
    ),

    RedirectTo: ({
      parameters = {} as RouteParameters<T>,
      joiner,
      encoder,
      ...props
    }) => (
      <ReactRouterDOM.Redirect
        to={baseRoute.format(parameters, { encoder, joiner })}
        {...props}
      />
    ),

    /*
    Route: ({ component, render, children, ...props }) => {
      const renderWrapped =
        render && ((...args: Parameters<typeof render>) => render(...args));
      const componentWrapped =
        component &&
        ((...args: Parameters<typeof component>) => component(...args));

      return <ReactRouterRoute path={baseRoute.path()} {...props} />;
    },
    */

    Route: (props) => (
      <ReactRouterDOM.Route path={baseRoute.path()} {...props} />
    ),

    RouteFormatted: ({
      parameters = {} as RouteParameters<T>,
      joiner,
      encoder,
      ...props
    }) => (
      <ReactRouterDOM.Route
        path={baseRoute.format(parameters, { encoder, joiner })}
        {...(props as RouteProps)}
      />
    ),

    useParams: (options) =>
      baseRoute.parse(ReactRouterDOM.useParams(), options),

    extend(...newSegments) {
      return reactRoute(...segments, ...newSegments);
    },
  };
}

export * from './parameter'; // re-export
export * from './route';
