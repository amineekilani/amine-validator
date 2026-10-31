export function isMinLength(value: unknown, min: number): boolean {
  if (typeof value !== 'string' || !Number.isSafeInteger(min) || min < 0) {
    return false;
  }

  return value.length >= min;
}

export function isMaxLength(value: unknown, max: number): boolean {
  if (typeof value !== 'string' || !Number.isSafeInteger(max) || max < 0) {
    return false;
  }

  return value.length <= max;
}

export function isAlpha(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  return /^[A-Za-z]+$/.test(value);
}

export function isAlphanumeric(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  return /^[A-Za-z0-9]+$/.test(value);
}
