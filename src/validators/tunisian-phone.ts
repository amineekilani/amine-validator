export function isTunisianPhone(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  const match = /^(?:(?:\+216|00216)[ -]?)?(\d{2})[ -]?(\d{3})[ -]?(\d{3})$/.exec(trimmed);

  if (!match) {
    return false;
  }

  return /^[24579]\d$/.test(match[1]);
}
