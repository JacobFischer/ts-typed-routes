import * as React from 'react';
import { Route, StaticRouter, StaticRouterContext } from 'react-router';
import { create } from 'react-test-renderer';
import { optionalParameter, parameter, reactRoute } from '../src/react-router';
import * as reactRouterExports from '../src/react-router';
import * as parameterExports from '../src/parameter';

describe('react-router', () => {
  it("should re-export parameter's exports", () => {
    const reactRouterExportsObj: Record<string, unknown> = reactRouterExports;
    for (const [key, value] of Object.entries(parameterExports)) {
      expect(key in reactRouterExportsObj).toBe(true);
      expect(reactRouterExportsObj[key]).toBe(value);
    }
  });

  describe('useParams hook', () => {
    it('should exist', () => {
      const simpleRoute = reactRoute('cars');
      expect(typeof simpleRoute.useParams).toBe('function');
    });

    it('should parse parameters via the hook', () => {
      const parameterRoute = reactRoute(
        '',
        parameter('str'),
        parameter('num', Number),
        optionalParameter('bool', Boolean),
      );

      const testValues: typeof parameterRoute.defaults = {
        str: 'some-string',
        num: 1337,
        bool: true,
      };

      const jestComponent = jest.fn(() => {
        const values = parameterRoute.useParams();

        expect(values.str).toStrictEqual(testValues.str);
        expect(values.num).toStrictEqual(testValues.num);
        expect(values.bool).toStrictEqual(testValues.bool);
        expect(values).toMatchObject(testValues);
        expect(values === testValues).toBe(false);

        return <>{JSON.stringify(values)}</>;
      });

      const Component: React.ComponentType = jestComponent;
      const rendered = create(
        <StaticRouter location={parameterRoute.format(testValues)}>
          <Route path={parameterRoute.path()}>
            <Component />
          </Route>
        </StaticRouter>,
      );

      expect(rendered.toJSON()).toMatchSnapshot();
      expect(jestComponent).toBeCalled();
    });
  });

  (['Link', 'NavLink'] as const).forEach((keyLink) =>
    describe(`<${keyLink} />`, () => {
      it('should exist', () => {
        const simpleRoute = reactRoute('foo', 'bar');
        expect(typeof simpleRoute[keyLink]).toBe('function');
      });

      it('should render a link', () => {
        const simpleRoute = reactRoute('foo', 'bar');
        const Component = simpleRoute[keyLink];
        const rendered = create(
          <StaticRouter>
            <Component />
          </StaticRouter>,
        );
        expect(rendered.toJSON()).toMatchSnapshot();

        const anchors = rendered.root.findAllByType('a');
        expect(anchors.length).toBe(1);
        const [anchor] = anchors;
        expect(anchor).toBeTruthy();
        expect(anchor.props.href).toBe('/foo/bar');
      });

      it('should not require parameters for string only routes', () => {
        const parameterRoute = reactRoute('alpha', 'beta', 'gamma');

        const Component = parameterRoute[keyLink];
        const rendered = create(
          <StaticRouter>
            <Component />
          </StaticRouter>,
        );

        expect(rendered.toJSON()).toMatchSnapshot();

        const anchors = rendered.root.findAllByType('a');
        expect(anchors.length).toBe(1);
        const [anchor] = anchors;
        expect(anchor).toBeTruthy();
        expect(anchor.props.href).toBe('/alpha/beta/gamma');
      });

      it('should require parameters', () => {
        const parameterRoute = reactRoute(
          'blog',
          parameter('post', String),
          optionalParameter('page', Number),
        );

        const Component = parameterRoute[keyLink];
        const rendered = create(
          <StaticRouter>
            <Component parameters={{ post: 'cool-id', page: 1 }} />
          </StaticRouter>,
        );

        expect(rendered.toJSON()).toMatchSnapshot();

        const anchors = rendered.root.findAllByType('a');
        expect(anchors.length).toBe(1);
        const [anchor] = anchors;
        expect(anchor).toBeTruthy();
        expect(anchor.props.href).toBe('/blog/cool-id/1');
      });
    }),
  );

  describe('<RedirectFrom />', () => {
    it('should exist', () => {
      const route = reactRoute();
      expect(typeof route.RedirectFrom).toBe('function');
    });

    it('should redirect from a formatted route', () => {
      const route = reactRoute('api', parameter('version'));
      const redirectTo = 'new-api/v2';
      const context: StaticRouterContext = {};
      const rendered = create(
        <StaticRouter location="/api/v1" context={context}>
          <route.RedirectFrom parameters={{ version: 'v1' }} to={redirectTo} />
        </StaticRouter>,
      );

      expect(rendered.toJSON()).toMatchSnapshot();
      expect(context.url).toStrictEqual(redirectTo);
    });

    it('should not require parameters when they are optional', () => {
      const route = reactRoute('', 'foo');
      const redirectTo = '/bar';
      const context: StaticRouterContext = {};
      const rendered = create(
        <StaticRouter location="/foo" context={context}>
          <route.RedirectFrom to={redirectTo} />
        </StaticRouter>,
      );

      expect(rendered.toJSON()).toMatchSnapshot();
      expect(context.url).toStrictEqual(redirectTo);
    });
  });

  describe('<RedirectFromPath />', () => {
    it('should exist', () => {
      const route = reactRoute();
      expect(typeof route.RedirectFromPath).toBe('function');
    });

    it('should redirect from a path', () => {
      const route = reactRoute(
        'anything',
        parameter('on'),
        parameter('thisPath'),
      );
      const redirectTo = 'new-path';
      const context: StaticRouterContext = {};
      const rendered = create(
        <StaticRouter location="/anything/var1/var2" context={context}>
          <route.RedirectFromPath to={redirectTo} />
        </StaticRouter>,
      );

      expect(rendered.toJSON()).toMatchSnapshot();
      expect(context.url).toStrictEqual(redirectTo);
    });
  });

  describe('<RedirectTo />', () => {
    it('should exist', () => {
      const route = reactRoute();
      expect(typeof route.RedirectTo).toBe('function');
    });

    it('should redirect to a formatted route', () => {
      const route = reactRoute('pizza', parameter('topping'));
      const redirectFrom = '/pepperoni-pizza';
      const context: StaticRouterContext = {};
      const rendered = create(
        <StaticRouter location={redirectFrom} context={context}>
          <route.RedirectTo
            from={redirectFrom}
            parameters={{ topping: 'pepperoni' }}
          />
        </StaticRouter>,
      );

      expect(rendered.toJSON()).toMatchSnapshot();
      expect(context.url).toStrictEqual('pizza/pepperoni');
    });

    it('should not require parameters when optional', () => {
      const route = reactRoute('', 'test');
      const redirectFrom = '/some-other-path';
      const context: StaticRouterContext = {};
      const rendered = create(
        <StaticRouter location={redirectFrom} context={context}>
          <route.RedirectTo from={redirectFrom} />
        </StaticRouter>,
      );

      expect(rendered.toJSON()).toMatchSnapshot();
      expect(context.url).toStrictEqual('/test');
    });
  });

  describe('<RedirectToPath />', () => {
    it('should exist', () => {
      const route = reactRoute();
      expect(typeof route.RedirectToPath).toBe('function');
    });

    it('should redirect to a path', () => {
      const route = reactRoute('users', 'new');
      const redirectFrom = 'new-user';
      const context: StaticRouterContext = {};
      const rendered = create(
        <StaticRouter location={redirectFrom} context={context}>
          <route.RedirectToPath from={redirectFrom} />
        </StaticRouter>,
      );

      expect(rendered.toJSON()).toMatchSnapshot();
      expect(context.url).toStrictEqual(route.path());
    });
  });

  describe('<Route />', () => {
    it('should exist', () => {
      expect(typeof reactRoute().Route).toBe('function');
    });

    it('should be the rendered route', () => {
      const route = reactRoute(
        '',
        'car',
        parameter('brand'),
        parameter('make'),
      );
      const rendered = create(
        <StaticRouter location="/car/tesla/model-3">
          <Route path="/car/tesla/model-s" />
          <route.Route>
            <strong>Found me!</strong>
          </route.Route>
          <Route>
            <span>Catch call route!</span>
          </Route>
        </StaticRouter>,
      );

      expect(rendered.toJSON()).toMatchSnapshot();

      const strongTags = rendered.root.findAllByType('strong');
      expect(strongTags.length).toBe(1);
      const [strongTag] = strongTags;
      expect(strongTag).toBeTruthy();
    });
  });

  describe('<RouteFormatted />', () => {
    it('should exist', () => {
      expect(typeof reactRoute().RouteFormatted).toBe('function');
    });

    it('should be the rendered route', () => {
      const route = reactRoute('/article', parameter('date'));
      const rendered = create(
        <StaticRouter location="/article/13-13-2033">
          <route.RouteFormatted parameters={{ date: '13-13-2033' }}>
            <em>Found me!</em>
          </route.RouteFormatted>
          <route.Route />
          <Route>
            <span>Catch call route!</span>
          </Route>
        </StaticRouter>,
      );

      expect(rendered.toJSON()).toMatchSnapshot();

      const emTags = rendered.root.findAllByType('em');
      expect(emTags.length).toBe(1);
      const [emTag] = emTags;
      expect(emTag).toBeTruthy();
    });

    it('should not require parameters when they are optional', () => {
      const route = reactRoute('', 'alpha');
      const rendered = create(
        <StaticRouter location="/alpha">
          <route.RouteFormatted>
            <em>Found me!</em>
          </route.RouteFormatted>
          <route.Route />
          <Route>
            <span>Catch call route!</span>
          </Route>
        </StaticRouter>,
      );

      expect(rendered.toJSON()).toMatchSnapshot();

      const emTags = rendered.root.findAllByType('em');
      expect(emTags.length).toBe(1);
      const [emTag] = emTags;
      expect(emTag).toBeTruthy();
    });
  });
});
