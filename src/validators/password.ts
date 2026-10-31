import type { StrongPasswordOptions } from '../types';

const DEFAULT_OPTIONS: Required<StrongPasswordOptions> = {
  minLength: 8,
  minUppercase: 1,
  minLowercase: 1,
  minNumbers: 1,
  minSpecialChars: 1,
  allowWhitespace: false,
};

export function isStrongPassword(value: unknown, options: StrongPasswordOptions = {}): boolean {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    options === null ||
    typeof options !== 'object'
  ) {
    return false;
  }

  const settings: Required<StrongPasswordOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const minimums = [
    settings.minLength,
    settings.minUppercase,
    settings.minLowercase,
    settings.minNumbers,
    settings.minSpecialChars,
  ];

  if (
    minimums.some((minimum) => !Number.isSafeInteger(minimum) || minimum < 0) ||
    typeof settings.allowWhitespace !== 'boolean'
  ) {
    return false;
  }

  if (!settings.allowWhitespace && /\s/.test(value)) {
    return false;
  }

  if (value.length < settings.minLength) {
    return false;
  }

  const uppercaseCount = (value.match(/[A-Z]/g) ?? []).length;
  const lowercaseCount = (value.match(/[a-z]/g) ?? []).length;
  const numberCount = (value.match(/[0-9]/g) ?? []).length;
  const specialCharCount = (value.match(/[^A-Za-z0-9]/g) ?? []).length;

  if (uppercaseCount < settings.minUppercase) {
    return false;
  }

  if (lowercaseCount < settings.minLowercase) {
    return false;
  }

  if (numberCount < settings.minNumbers) {
    return false;
  }

  if (specialCharCount < settings.minSpecialChars) {
    return false;
  }

  return true;
}
