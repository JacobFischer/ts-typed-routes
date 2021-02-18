import { parameter } from '../src';

describe('parameter', () => {
  it('exists', () => {
    expect(parameter).toBeTruthy();
  });

  it('is a function', () => {
    expect(typeof parameter).toBe('function');
  });

  it('works with one argument', () => {
    const one = parameter('one');
    const expected: typeof one = {
      name: 'one',
      parser: String,
      stringify: String,
    };

    expect(one).toMatchObject(expected);
  });

  it('works with two arguments', () => {
    const two = parameter('two', Number);
    const expected: typeof two = {
      name: 'two',
      parser: Number,
      stringify: String,
    };

    expect(two).toMatchObject(expected);
  });

  it('works with three arguments', () => {
    const three = parameter('three', Boolean);
    const expected: typeof three = {
      name: 'three',
      parser: Boolean,
      stringify: String,
    };

    expect(three).toMatchObject(expected);
  });
});
