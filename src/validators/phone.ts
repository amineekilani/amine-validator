import type { PhoneOptions } from '../types';

export function isPhone(value: unknown, options: PhoneOptions = {}): boolean {
  if (typeof value !== 'string' || options === null || typeof options !== 'object') {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (!/^\+?[\d\s().-]+$/.test(trimmed)) {
    return false;
  }

  const digits = trimmed.replace(/\D/g, '');
  const minDigits = options.minDigits ?? 7;
  const maxDigits = options.maxDigits ?? 15;

  if (
    !Number.isSafeInteger(minDigits) ||
    !Number.isSafeInteger(maxDigits) ||
    minDigits < 1 ||
    maxDigits > 15 ||
    minDigits > maxDigits ||
    digits.length < minDigits ||
    digits.length > maxDigits
  ) {
    return false;
  }

  if (options.allowLocal === false && !trimmed.startsWith('+')) {
    return false;
  }

  const parenthesizedGroups = trimmed.match(/\(\d+\)/g) ?? [];
  const withoutValidGroups = trimmed.replace(/\(\d+\)/g, '');

  return (
    parenthesizedGroups.length <= 1 &&
    !/[()]/.test(withoutValidGroups) &&
    !/^[\s.-]|[\s.-]$/.test(trimmed) &&
    !/(?:--|\.\.)/.test(trimmed) &&
    (!trimmed.includes('+') || trimmed.startsWith('+'))
  );
}
