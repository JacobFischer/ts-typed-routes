import { route, parameter, optionalParameter } from '../src';

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
      format: 'function',
      parse: 'function',
      defaults: 'object',
      path: 'function',
    } as const;

    expect(keysOf(shape)).toMatchObject(keysOf(test));

    Object.entries(shape).forEach(([key, value]) => {
      expect(typeof test[key as keyof typeof shape]).toBe(value);
    });

    expect(keysOf(test)).toMatchObject(keysOf(shape));
  });

  describe('.extend()', () => {
    it('extends route', () => {
      const { extend } = route('one', 'two', 'three');
      const extended = extend('four', 'five', 'six');
      expect(extended.path()).toBe('one/two/three/four/five/six');
    });

    it('extends without dropping parameters', () => {
      const { extend } = route(
        parameter('baseReq', Boolean),
        optionalParameter('baseOpt'),
      );
      const extended = extend(
        optionalParameter('extOpt', Number),
        parameter('extReq'),
      );

      expect(extended.defaults).toMatchObject({
        baseReq: false,
        baseOpt: '',
        extOpt: 0,
        extReq: '',
      });

      expect(
        extended.format({
          baseReq: true,
          baseOpt: 'hello',
          extReq: 'world',
          extOpt: 1337,
        }),
      ).toBe('true/hello/1337/world');

      expect(
        extended.format({
          baseReq: true,
          extReq: 'world',
        }),
      ).toBe('true/world');
    });
  });

  describe('.parse()', () => {
    it('can parse objects', () => {
      const { parse } = route(
        'one',
        parameter('two', Number),
        parameter('three', Boolean),
        'four',
      );

      expect(typeof parse).toBe('function');
      expect(parse({ two: '2', three: '' })).toMatchObject({
        two: 2,
        three: false,
      });
    });

    it('throws when missing expected keys', () => {
      const { parse } = route('one', parameter('two'));

      expect(() => parse({})).toThrow();
    });

    it('throws when missing defaults and not using defaults', () => {
      const { parse } = route('one', parameter('two'));

      expect(() => parse({}, { useDefaults: false })).toThrow();
    });

    it('does not throw when missing optional parameters', () => {
      const { parse } = route(optionalParameter('num', Number));
      expect(parse({})).toMatchObject({ num: 0 });
    });

    it('useDefaults to restore default values', () => {
      const { parse } = route('you', parameter('them'));

      expect(parse({}, { useDefaults: true })).toMatchObject({ them: '' });
    });

    it('decodes strings that are URL encoded by default', () => {
      const { parse } = route('start', parameter('part'));

      const str = '/-$-^-%';
      const encoded = encodeURIComponent(str);
      expect(parse({ part: encoded })).toMatchObject({ part: str });
    });

    it('decodes strings using custom decoders', () => {
      const { parse } = route(parameter('custom'));

      const str = 'ENCODED-IN-UPPER-CASE';
      const decoder = (s: string) => s.toLowerCase();
      expect(parse({ custom: str }, { decoder })).toMatchObject({
        custom: str.toLowerCase(),
      });
    });
  });

  describe('.defaults', () => {
    it('has defaults', () => {
      expect(route('empty').defaults).toMatchObject({});
    });

    it('has defaults for all parameters', () => {
      const { defaults } = route(
        'start',
        parameter('str'),
        parameter('bool', Boolean),
        optionalParameter('num', Number),
      );
      expect(defaults).toMatchObject({ str: '', num: 0, bool: false });
    });
  });

  describe('.path()', () => {
    it('has a path function', () => {
      const { path } = route();
      expect(typeof path).toBe('function');
    });

    it('formats a path', () => {
      const { path } = route(
        'one',
        parameter('two'),
        optionalParameter('three'),
      );

      expect(path()).toBe('one/:two/:three?');
    });

    it('can set options.joiner', () => {
      const { path } = route('foo', 'bar', 'baz');

      expect(path({ joiner: '-+-' })).toBe('foo-+-bar-+-baz');
    });

    it('can set options.formatter', () => {
      const { path } = route(parameter('parm'), parameter('last'));

      expect(path({ formatter: (name) => `<${name} />` })).toBe(
        '<parm />/<last />',
      );
    });

    it('can set options.formatter and options.joiner', () => {
      const { path } = route(parameter('alpha'), parameter('omega'));

      expect(
        path({
          formatter: (name) => `_[${name}]_`,
          joiner: '---',
        }),
      ).toBe('_[alpha]_---_[omega]_');
    });

    it('has options.formatter with correct args', () => {
      const { path } = route(
        optionalParameter('optional'),
        parameter('required'),
        optionalParameter('also-optional'),
        parameter('also-required'),
      );

      expect(
        path({
          formatter: (name, optional) => {
            expect(typeof name).toBe('string');
            expect(typeof optional).toBe('boolean');
            expect(optional).toBe(name.includes('optional'));

            return 'X';
          },
        }),
      ).toBe('X/X/X/X');
    });
  });

  describe('.format()', () => {
    it('is a function', () => {
      expect(typeof route().format).toBe('function');
    });

    it('formats the path with given values', () => {
      const { format } = route(
        'root',
        parameter('user'),
        parameter('page', Number),
        optionalParameter('count', Number),
      );

      expect(
        format({
          user: 'alice',
          page: 2,
          count: 10,
        }),
      ).toBe('root/alice/2/10');
    });

    it('does not require optional parameters', () => {
      const { format } = route(
        'start',
        parameter('req'),
        optionalParameter('opt'),
        optionalParameter('alsoOpt'),
        parameter('alsoReq'),
        'end',
      );

      expect(
        format({
          alsoReq: 'also_exists',
          req: 'some-string',
        }),
      ).toBe('start/some-string/also_exists/end');
    });

    it('drops optional paths', () => {
      const { format } = route(
        optionalParameter('alpha'),
        optionalParameter('beta'),
        optionalParameter('charlie'),
        optionalParameter('delta'),
      );

      expect(format({})).toBe('');
    });

    it('is identical with no parameter paths', () => {
      const r = route('first', 'second', 'third');
      expect(r.format({})).toBe(r.path());
    });

    it('has options.joiner for custom joiners', () => {
      const { format } = route('root', 'sub', 'end');
      expect(format({}, { joiner: '~' })).toBe('root~sub~end');
      expect(format({}, { joiner: '' })).toBe('rootsubend');
    });

    it('encodes url results', () => {
      const { format } = route('start', parameter('val'));

      const val = '/-$-^-%';
      const encoded = encodeURIComponent(val);
      expect(format({ val })).toBe(`start/${encoded}`);
    });

    it('has options.encoder for custom encoded strings', () => {
      const { format } = route(parameter('one'), parameter('two'));

      const val = '#-@-+-=';
      expect(format({ one: val, two: val }, { encoder: (s) => s })).toBe(
        `${val}/${val}`,
      );
    });
  });
});
