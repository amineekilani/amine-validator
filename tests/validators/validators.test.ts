import { describe, expect, it } from 'vitest';

import {
  isAfterDate,
  isAlphanumeric,
  isAlpha,
  isBeforeDate,
  isEmail,
  isInRange,
  isInteger,
  isMaxLength,
  isMinLength,
  isNegative,
  isNumber,
  isPhone,
  isPositive,
  isRequired,
  isStrongPassword,
  isTunisianPhone,
  isURL,
  isValidDate,
  validate,
} from '../../src';

describe('email validation', () => {
  it('accepts standard emails', () => {
    expect(isEmail('amine@example.com')).toBe(true);
    expect(isEmail('name.surname+tag@example.io')).toBe(true);
  });

  it('rejects malformed values', () => {
    expect(isEmail('')).toBe(false);
    expect(isEmail('not-an-email')).toBe(false);
    expect(isEmail('user@')).toBe(false);
  });
});

describe('password validation', () => {
  it('accepts strong passwords', () => {
    expect(isStrongPassword('StrongPass1!')).toBe(true);
  });

  it('rejects weak passwords', () => {
    expect(isStrongPassword('weak')).toBe(false);
    expect(isStrongPassword('password')).toBe(false);
  });
});

describe('phone validation', () => {
  it('accepts international phone formats', () => {
    expect(isPhone('+1 (555) 123-4567')).toBe(true);
    expect(isPhone('5551234567')).toBe(true);
  });

  it('rejects non-phone strings', () => {
    expect(isPhone('hello')).toBe(false);
    expect(isPhone('123')).toBe(false);
  });
});

describe('Tunisian phone validation', () => {
  it('accepts common Tunisian formats', () => {
    expect(isTunisianPhone('+216 22 123 456')).toBe(true);
    expect(isTunisianPhone('22123456')).toBe(true);
    expect(isTunisianPhone('+21622123456')).toBe(true);
  });

  it('rejects unsupported numbers', () => {
    expect(isTunisianPhone('12345678')).toBe(false);
    expect(isTunisianPhone('not-a-phone')).toBe(false);
  });
});

describe('URL validation', () => {
  it('accepts valid https URLs', () => {
    expect(isURL('https://example.com')).toBe(true);
    expect(isURL('http://localhost:3000')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isURL('example.com')).toBe(false);
    expect(isURL('ftp://example.com')).toBe(false);
  });
});

describe('string validation', () => {
  it('checks required and length rules', () => {
    expect(isRequired('hello')).toBe(true);
    expect(isRequired('')).toBe(false);
    expect(isMinLength('hello', 3)).toBe(true);
    expect(isMaxLength('hello', 4)).toBe(false);
  });

  it('validates alpha and alphanumeric checks', () => {
    expect(isAlpha('hello')).toBe(true);
    expect(isAlpha('hello123')).toBe(false);
    expect(isAlphanumeric('hello123')).toBe(true);
  });
});

describe('number validation', () => {
  it('handles numeric strings and boundaries', () => {
    expect(isNumber('42')).toBe(true);
    expect(isNumber('Infinity')).toBe(false);
    expect(isInteger('42')).toBe(true);
    expect(isPositive('10')).toBe(true);
    expect(isNegative('-2')).toBe(true);
    expect(isInRange('5', 1, 10)).toBe(true);
    expect(isInRange('11', 1, 10)).toBe(false);
  });
});

describe('date validation', () => {
  it('validates and compares dates', () => {
    expect(isValidDate('2026-10-31')).toBe(true);
    expect(isAfterDate('2026-10-31', '2026-10-30')).toBe(true);
    expect(isBeforeDate('2026-10-30', '2026-10-31')).toBe(true);
  });

  it('rejects invalid dates', () => {
    expect(isValidDate('not-a-date')).toBe(false);
  });
});

describe('schema validation', () => {
  it('returns predictable results', () => {
    const result = validate({
      email: {
        value: 'amine@example.com',
        rules: ['required', 'email'],
      },
      password: {
        value: 'StrongPass1!',
        rules: ['required', 'strongPassword'],
      },
      age: {
        value: '18',
        rules: ['number', 'positive', 'min:18', 'max:65'],
      },
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('supports custom validators', () => {
    const result = validate({
      code: {
        value: 'ABC123',
        customValidators: [
          (value) => typeof value === 'string' && value.length >= 5,
          (value) => typeof value === 'string' && value.toUpperCase() === value,
        ],
      },
    });

    expect(result.isValid).toBe(true);
  });
});
