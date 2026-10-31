import { describe, expect, it } from 'vitest';

import { createValidator, runCustomValidator, validate } from '../../src';

describe('schema validation', () => {
  it('reports all passing rules with a stable result shape', () => {
    const result = validate({
      email: { value: 'user@example.com', rules: ['required', 'email'] },
      age: { value: '18', rules: ['number', 'min:18', 'max:65', 'inRange:18,65'] },
      displayName: { value: 'Amine', rules: ['minLength:2', 'maxLength:20', 'alpha'] },
    });

    expect(result).toEqual({
      isValid: true,
      errors: [],
      results: [
        { field: 'email', rule: 'required', valid: true, message: undefined },
        { field: 'email', rule: 'email', valid: true, message: undefined },
        { field: 'age', rule: 'number', valid: true, message: undefined },
        { field: 'age', rule: 'min:18', valid: true, message: undefined },
        { field: 'age', rule: 'max:65', valid: true, message: undefined },
        { field: 'age', rule: 'inRange:18,65', valid: true, message: undefined },
        { field: 'displayName', rule: 'minLength:2', valid: true, message: undefined },
        { field: 'displayName', rule: 'maxLength:20', valid: true, message: undefined },
        { field: 'displayName', rule: 'alpha', valid: true, message: undefined },
      ],
    });
  });

  it('fails unsupported parameter shapes and missing rule arguments', () => {
    const result = validate({
      value: {
        value: 'abc',
        rules: [
          'min' as 'min:1',
          'max' as 'max:1',
          'inRange:one,two' as 'inRange:1,2',
          'afterDate' as 'afterDate:',
          'beforeDate' as 'beforeDate:',
          '' as 'email',
          'inRange:,2' as 'inRange:1,2',
        ],
      },
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(7);
  });

  it('reports malformed runtime field configuration without throwing', () => {
    const schema = {
      nullConfig: null,
      invalidRules: { value: 1, rules: 'email' },
      invalidRule: { value: 1, rules: [null] },
      invalidCustomList: { value: 1, customValidators: 'validator' },
      invalidCustom: { value: 1, customValidators: [{ name: 'invalid', validate: null }] },
      unnamedCustom: { value: 1, customValidators: [{ name: '', validate: () => false }] },
      invalidResult: { value: 1, customValidators: [() => null] },
    } as unknown as Record<string, never>;
    const result = validate(schema);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('nullConfig has an invalid field configuration.');
    expect(result.errors).toContain('invalidRules has an invalid rules list.');
    expect(result.errors).toContain('invalidRule has a rule that is not a string.');
    expect(result.errors).toContain('invalidCustomList has an invalid custom validators list.');
    expect(result.errors).toContain('invalidCustom has an invalid custom validator.');
    expect(result.errors).toContain('unnamedCustom has an invalid custom validator.');
    expect(result.errors).toContain('invalidResult failed custom validation: custom.');
  });

  it('reports useful messages for failed, unknown, and malformed rules', () => {
    const result = validate({
      user: {
        value: 'not-an-email',
        rules: ['email', 'unknownRule' as 'email', 'inRange:1,2,3' as 'inRange:1,2'],
      },
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      'user failed rule: email',
      'user failed rule: unknownRule',
      'user failed rule: inRange:1,2,3',
    ]);
    expect(result.results.every((item) => item.message)).toBe(true);
  });

  it('validates numeric and string bounds with their matching value types', () => {
    expect(validate({ text: { value: 'abcd', rules: ['min:4', 'max:4'] } }).isValid).toBe(true);
    expect(validate({ number: { value: '4', rules: ['min:4', 'max:5'] } }).isValid).toBe(true);
    expect(validate({ number: { value: '4', rules: ['min:5'] } }).isValid).toBe(false);
    expect(validate({ text: { value: 'x', rules: ['inRange:1,3'] } }).isValid).toBe(false);
    expect(validate({ text: { value: '2', rules: ['inRange:3,1'] } }).isValid).toBe(false);
  });

  it('supports named and anonymous custom validators with messages', () => {
    const isEven = createValidator('even', (value) => typeof value === 'number' && value % 2 === 0);
    const result = validate({
      count: { value: 3, customValidators: [isEven] },
      code: {
        value: 'abc',
        customValidators: [() => ({ valid: false, message: 'Code must be verified.' })],
      },
      note: { value: 'ok', customValidators: [() => true] },
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      'count failed custom validation: even.',
      'Code must be verified.',
    ]);
    expect(result.results.map(({ rule, valid, message }) => ({ rule, valid, message }))).toEqual([
      { rule: 'even', valid: false, message: 'count failed custom validation: even.' },
      { rule: 'custom', valid: false, message: 'Code must be verified.' },
      { rule: 'custom', valid: true, message: undefined },
    ]);
  });

  it('trims validator names and rejects an empty name', () => {
    expect(createValidator(' even ', () => true).name).toBe('even');
    expect(() => createValidator('  ', () => true)).toThrow(
      new TypeError('Custom validator requires a non-empty name and a function.'),
    );
  });

  it('passes through custom validator results and surfaces thrown errors', () => {
    expect(runCustomValidator(2, (value) => value === 2)).toBe(true);
    expect(runCustomValidator(2, { name: 'even', validate: () => ({ valid: true }) })).toEqual({
      valid: true,
    });
    expect(() =>
      runCustomValidator(2, () => {
        throw new Error('validator failure');
      }),
    ).toThrow('validator failure');
    expect(() => runCustomValidator(2, null as never)).toThrow(
      new TypeError('Custom validator must be a function or a named validator.'),
    );
  });

  it('returns an explicit result for invalid schema inputs', () => {
    const result = validate(null as unknown as Record<string, never>);

    expect(result).toEqual({
      isValid: false,
      errors: ['Schema must be an object.'],
      results: [{ field: '', rule: 'schema', valid: false, message: 'Schema must be an object.' }],
    });
  });

  it('returns true for an empty schema', () => {
    expect(validate({})).toEqual({ isValid: true, errors: [], results: [] });
  });
});
