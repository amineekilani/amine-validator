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
} from '../../src';

describe('isEmail edge cases', () => {
  it.each(['user@example.com', 'first.last+tag@example.co.uk', ' user@example.com '])(
    'accepts %s',
    (value) => {
      expect(isEmail(value)).toBe(true);
    },
  );

  it.each([
    '',
    ' ',
    'user',
    'user@',
    '@example.com',
    'user@@example.com',
    '.user@example.com',
    'user.@example.com',
    'first..last@example.com',
    'user@example',
    'user@example.c',
    'user@-example.com',
    'user@example-.com',
    'user@example..com',
    'üser@example.com',
  ])('rejects malformed email %j', (value) => {
    expect(isEmail(value)).toBe(false);
  });

  it('rejects non-string values and overlong local parts', () => {
    expect(isEmail(null)).toBe(false);
    expect(isEmail(undefined)).toBe(false);
    expect(isEmail(1)).toBe(false);
    expect(isEmail({})).toBe(false);
    expect(isEmail(`${'a'.repeat(65)}@example.com`)).toBe(false);
  });
});

describe('isStrongPassword edge cases', () => {
  it('applies configurable requirements', () => {
    expect(
      isStrongPassword('letters only', {
        minLength: 8,
        minUppercase: 0,
        minLowercase: 1,
        minNumbers: 0,
        minSpecialChars: 0,
        allowWhitespace: true,
      }),
    ).toBe(true);
    expect(
      isStrongPassword('Ab1!', {
        minLength: 4,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSpecialChars: 1,
      }),
    ).toBe(true);
  });

  it('rejects invalid input and invalid policy bounds', () => {
    expect(isStrongPassword(null)).toBe(false);
    expect(isStrongPassword(undefined)).toBe(false);
    expect(isStrongPassword(123)).toBe(false);
    expect(isStrongPassword('Ab1!', { minLength: -1 })).toBe(false);
    expect(isStrongPassword('Ab1!', { minNumbers: 0.5 })).toBe(false);
    expect(isStrongPassword('Ab1!', { minSpecialChars: Number.NaN })).toBe(false);
    expect(isStrongPassword('Ab1!', { allowWhitespace: 'yes' as unknown as boolean })).toBe(false);
    expect(
      isStrongPassword('', {
        minLength: 0,
        minUppercase: 0,
        minLowercase: 0,
        minNumbers: 0,
        minSpecialChars: 0,
      }),
    ).toBe(false);
  });

  it('rejects a password missing each enabled character category', () => {
    expect(isStrongPassword('password1!')).toBe(false);
    expect(isStrongPassword('PASSWORD1!')).toBe(false);
    expect(isStrongPassword('Password!!')).toBe(false);
    expect(isStrongPassword('Password12')).toBe(false);
  });

  it('rejects whitespace by default and permits it when configured', () => {
    expect(isStrongPassword('Strong Pass1!')).toBe(false);
    expect(isStrongPassword('Strong Pass1!', { allowWhitespace: true })).toBe(true);
  });
});

describe('isPhone edge cases', () => {
  it('accepts well-formed international and local examples', () => {
    expect(isPhone('+1 (555) 123-4567')).toBe(true);
    expect(isPhone('555.123.4567')).toBe(true);
    expect(isPhone('1234567')).toBe(true);
  });

  it.each([
    '',
    ' ',
    '123456',
    '1234567890123456',
    '1)555(123)4567',
    '1 (555 123-4567',
    '1 (555) (123) 4567',
    '1) 555 123 4567',
    '1-555-123-4567-',
    '1+5551234567',
    'abc5551234',
    '+',
  ])('rejects malformed phone %j', (value) => {
    expect(isPhone(value)).toBe(false);
  });

  it('honors digit-count options and allowLocal', () => {
    expect(isPhone('12345', { minDigits: 5, maxDigits: 5 })).toBe(true);
    expect(isPhone('12345', { minDigits: 5, maxDigits: 4 })).toBe(false);
    expect(isPhone('1234567', { allowLocal: false })).toBe(false);
    expect(isPhone('+331234567', { allowLocal: false })).toBe(true);
    expect(isPhone('+331234567', { maxDigits: 16 })).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isPhone(null)).toBe(false);
    expect(isPhone(undefined)).toBe(false);
    expect(isPhone(21622123456)).toBe(false);
  });
});

describe('isTunisianPhone edge cases', () => {
  it.each([
    '22123456',
    '22 123 456',
    '22-123-456',
    '+21622123456',
    '+216 22 123 456',
    '00216-22-123-456',
    '40123456',
    '50123456',
    '70123456',
    '90123456',
  ])('accepts Tunisian phone %s', (value) => {
    expect(isTunisianPhone(value)).toBe(true);
  });

  it.each([
    '32123456',
    '60123456',
    '80123456',
    '12123456',
    '21622123456',
    '++21622123456',
    '+216 22 123 45',
    '+216 22 123 4567',
    '+216 abc 22 123 456',
    '(22) 123 456',
    '22.123.456',
    '22--123-456',
    '',
  ])('rejects invalid Tunisian phone %j', (value) => {
    expect(isTunisianPhone(value)).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isTunisianPhone(null)).toBe(false);
    expect(isTunisianPhone(undefined)).toBe(false);
    expect(isTunisianPhone(22123456)).toBe(false);
  });
});

describe('isURL edge cases', () => {
  it.each([
    'https://example.com',
    'http://localhost:3000/path',
    'https://127.0.0.1',
    'http://[::1]:8080',
    ' https://example.com/path?q=1 ',
    'https://xn--bcher-kva.example',
  ])('accepts URL %s', (value) => {
    expect(isURL(value)).toBe(true);
  });

  it.each([
    '',
    ' ',
    'example.com',
    'ftp://example.com',
    'https://',
    'https://example..com',
    'https://-example.com',
    'https://example-.com',
    'https://bad_domain.com',
    'https://example.c',
    'https://example.com:99999',
    'javascript:alert(1)',
  ])('rejects malformed URL %j', (value) => {
    expect(isURL(value)).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isURL(null)).toBe(false);
    expect(isURL(undefined)).toBe(false);
    expect(isURL({})).toBe(false);
  });
});

describe('string validators edge cases', () => {
  it('defines required behavior for empty and unexpected values', () => {
    expect(isRequired(null)).toBe(false);
    expect(isRequired(undefined)).toBe(false);
    expect(isRequired(' \t ')).toBe(false);
    expect(isRequired([])).toBe(false);
    expect(isRequired(Number.NaN)).toBe(false);
    expect(isRequired(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isRequired('0')).toBe(true);
    expect(isRequired(0)).toBe(true);
    expect(isRequired(false)).toBe(true);
    expect(isRequired({})).toBe(true);
  });

  it('checks exact string lengths and rejects invalid bounds', () => {
    expect(isMinLength('abc', 3)).toBe(true);
    expect(isMinLength('abc', 4)).toBe(false);
    expect(isMaxLength('abc', 3)).toBe(true);
    expect(isMaxLength('abc', 2)).toBe(false);
    expect(isMinLength('', 0)).toBe(true);
    expect(isMaxLength('', 0)).toBe(true);
    expect(isMinLength('abc', -1)).toBe(false);
    expect(isMaxLength('abc', Number.NaN)).toBe(false);
    expect(isMinLength(123, 1)).toBe(false);
  });

  it('checks ASCII content without trimming', () => {
    expect(isAlpha('Hello')).toBe(true);
    expect(isAlpha(' Hello')).toBe(false);
    expect(isAlpha('café')).toBe(false);
    expect(isAlpha('')).toBe(false);
    expect(isAlphanumeric('Hello123')).toBe(true);
    expect(isAlphanumeric('Hello 123')).toBe(false);
    expect(isAlphanumeric('')).toBe(false);
    expect(isAlpha(null)).toBe(false);
    expect(isAlphanumeric(undefined)).toBe(false);
  });
});

describe('number validators edge cases', () => {
  it('accepts finite decimal strings and rejects non-decimal inputs', () => {
    expect(isNumber('42')).toBe(true);
    expect(isNumber(' -3.25 ')).toBe(true);
    expect(isNumber('.5')).toBe(true);
    expect(isNumber('1e3')).toBe(true);
    expect(isNumber('')).toBe(false);
    expect(isNumber('   ')).toBe(false);
    expect(isNumber('0x10')).toBe(false);
    expect(isNumber('0b10')).toBe(false);
    expect(isNumber('NaN')).toBe(false);
    expect(isNumber('Infinity')).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber(true)).toBe(false);
    expect(isNumber(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it('checks integer and sign boundaries', () => {
    expect(isInteger('42')).toBe(true);
    expect(isInteger('42.5')).toBe(false);
    expect(isInteger(Number.NaN)).toBe(false);
    expect(isPositive(0)).toBe(false);
    expect(isPositive('0.01')).toBe(true);
    expect(isNegative(0)).toBe(false);
    expect(isNegative('-0.01')).toBe(true);
  });

  it('checks inclusive ranges and rejects invalid bounds', () => {
    expect(isInRange(1, 1, 10)).toBe(true);
    expect(isInRange('10', 1, 10)).toBe(true);
    expect(isInRange(11, 1, 10)).toBe(false);
    expect(isInRange(5, 10, 1)).toBe(false);
    expect(isInRange(5, Number.NaN, 10)).toBe(false);
    expect(isInRange(Number.POSITIVE_INFINITY, 1, 10)).toBe(false);
  });
});

describe('date validators edge cases', () => {
  it('accepts valid date inputs and rejects invalid calendar dates', () => {
    expect(isValidDate('2024-02-29')).toBe(true);
    expect(isValidDate('2026-10-31')).toBe(true);
    expect(isValidDate(new Date('2026-10-31T12:00:00Z'))).toBe(true);
    expect(isValidDate(0)).toBe(true);
    expect(isValidDate('2026-02-29')).toBe(false);
    expect(isValidDate('2026-02-31')).toBe(false);
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('  ')).toBe(false);
    expect(isValidDate('not a date')).toBe(false);
    expect(isValidDate(new Date(Number.NaN))).toBe(false);
    expect(isValidDate(Number.NaN)).toBe(false);
    expect(isValidDate(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
    expect(isValidDate({})).toBe(false);
  });

  it('uses strict chronological comparisons', () => {
    expect(isAfterDate('2026-01-02', '2026-01-01')).toBe(true);
    expect(isAfterDate('2026-01-01', '2026-01-01')).toBe(false);
    expect(isBeforeDate('2025-12-31', '2026-01-01')).toBe(true);
    expect(isBeforeDate('2026-01-01', '2026-01-01')).toBe(false);
    expect(isAfterDate('invalid', '2026-01-01')).toBe(false);
    expect(isBeforeDate('2026-01-01', 'invalid')).toBe(false);
  });
});
