import { route, parameter } from '../src';

// eslint-disable-next-line @typescript-eslint/ban-types
const keysOf = (obj: {}) => Object.keys(obj).sort();

describe('route()', () => {
  it('exists', () => {
    expect(route).toBeTruthy();
  });

  it('is a function', () => {
    expect(typeof route).toBe('function');
  });

  it('has the correct shape', () => {
    const test = route('test');

    const shape = {
      extend: 'function',
      parse: 'function',
      defaults: 'object',
      path: 'function',
      with: 'function',
    } as const;

    expect(keysOf(shape)).toMatchObject(keysOf(test));

    Object.entries(shape).forEach(([key, value]) => {
      expect(typeof test[key as keyof typeof shape]).toBe(value);
    });

    expect(keysOf(test)).toMatchObject(keysOf(shape));
  });

  it('works with parameters', () => {
    const routeWithParameters = route(
      'first/',
      parameter('someNumber', Number),
      '/third/parameter/',
      parameter('aString'),
    );
    expect(routeWithParameters).toBeTruthy();

    expect(keysOf(routeWithParameters.defaults)).toMatchObject(
      ['someNumber', 'aString'].sort(),
    );

    const expectedPath = 'first/:someNumber/third/parameter/:aString';
    expect(routeWithParameters.path()).toBe(expectedPath);

    const expectedWithParameters = 'first/1337/third/parameter/hello%20there';
    expect(
      routeWithParameters.with({
        aString: 'hello there',
        someNumber: 1337,
      }),
    ).toBe(expectedWithParameters);
  });

  it('works with just strings', () => {
    const strings = ['this/only/has', '/strings', '/in/it'] as const;
    const fullRoute = strings.join('');
    const routeOnlyStrings = route(...strings);
    expect(routeOnlyStrings).toBeTruthy();

    expect(keysOf(routeOnlyStrings.defaults)).toMatchObject([]);
    expect(routeOnlyStrings.path()).toBe(fullRoute);

    const formatter = jest.fn((s: string) => `---${s}---`);
    expect(routeOnlyStrings.path(formatter)).toBe(fullRoute);
    expect(formatter).toBeCalledTimes(0);

    expect(routeOnlyStrings.with({})).toBe(fullRoute);
  });

  it('works with a custom replacer', () => {
    const custom = route('test', parameter('one'), parameter('two'));

    expect(custom.path((s) => `>$-${s}-$<`)).toBe('test>$-one-$<>$-two-$<');
  });

  it('parses objects', () => {
    const test = route(
      'test',
      parameter('one', Number),
      parameter('two', Boolean),
    );

    const stringified = {
      one: '1337',
      two: 'true',
    };

    expect(test.parse(stringified)).toMatchObject({
      one: 1337,
      two: true,
    });
  });

  it('parses a partial object using default values', () => {
    const test = route(
      'test',
      parameter('three'),
      'hello',
      parameter('four', Boolean),
    );

    const stringified = {
      three: 'some%20string',
      // NOTE: four is missing on purpose for this test
    };

    expect(Object.prototype.hasOwnProperty.call(stringified, 'four')).toBe(
      false,
    );

    expect(test.parse(stringified, { useDefaults: true })).toMatchObject({
      three: 'some string',
      four: false,
    });
  });

  it('parses with other permutations of defaults', () => {
    const test = route('test', parameter('five'));

    const stringified = {
      five: 'hio',
      // NOTE: four is missing on purpose for this test
    };

    const expected = stringified;

    expect(test.parse(stringified, {})).toMatchObject(expected);
    expect(test.parse(stringified, { useDefaults: false })).toMatchObject(
      expected,
    );
  });

  it('throws on invalid objects to parse', () => {
    const test = route('test', parameter('six'));

    expect(() => test.parse({})).toThrow();
  });

  it('extends new routes', () => {
    const subRoute = route('test', parameter('seven'));
    expect(keysOf(subRoute.defaults)).toMatchObject(['seven']);

    const combined = subRoute.extend('another-test', parameter('eight'));

    expect(combined).toBeTruthy();
    expect(keysOf(combined.defaults)).toMatchObject(['seven', 'eight'].sort());

    // ensure it did not mutate
    expect(keysOf(subRoute.defaults)).toMatchObject(['seven']);

    expect(combined.with({ seven: '7', eight: '8' })).toContain(
      subRoute.with({ seven: '7' }),
    );
  });
});
