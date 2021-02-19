import { BaseParameter, optionalParameter, parameter } from '../src';

type ParameterFunction<TType = unknown, TName extends string = string> = (
  name: TName,
  parser?: (serialized: string) => TType,
  stringify?: (value: TType) => string,
) => BaseParameter<TName, TType, boolean>;

([optionalParameter, parameter] as ParameterFunction[]).forEach((param) =>
  describe(`${param.name} function`, () => {
    const optional = param.name.includes('optional');

    it('exists', () => {
      expect(param).toBeTruthy();
    });

    it('is a function', () => {
      expect(typeof param).toBe('function');
    });

    it('works with one argument', () => {
      const one = param('one');
      const expected: typeof one = {
        name: 'one',
        optional,
        parser: String,
        stringify: String,
      };

      expect(one).toMatchObject(expected);
    });

    it('works with two arguments', () => {
      const two = param('two', Number);
      const expected: typeof two = {
        name: 'two',
        optional,
        parser: Number,
        stringify: String,
      };

      expect(two).toMatchObject(expected);
    });

    it('works with three arguments', () => {
      const three = param('three', Boolean);
      const expected: typeof three = {
        name: 'three',
        optional,
        parser: Boolean,
        stringify: String,
      };

      expect(three).toMatchObject(expected);
    });
  }),
);
