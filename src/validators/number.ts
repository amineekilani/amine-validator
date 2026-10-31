function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function isNumber(value: unknown): boolean {
  return toFiniteNumber(value) !== null;
}

export function isInteger(value: unknown): boolean {
  const number = toFiniteNumber(value);
  return number !== null && Number.isInteger(number);
}

export function isPositive(value: unknown): boolean {
  const number = toFiniteNumber(value);
  return number !== null && number > 0;
}

export function isNegative(value: unknown): boolean {
  const number = toFiniteNumber(value);
  return number !== null && number < 0;
}

export function isInRange(value: unknown, min: number, max: number): boolean {
  const number = toFiniteNumber(value);

  if (number === null || !Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    return false;
  }

  return number >= min && number <= max;
}
