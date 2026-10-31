function parseDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const datePart = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(trimmed);

    if (datePart) {
      const [, yearText, monthText, dayText] = datePart;
      const year = Number(yearText);
      const month = Number(monthText);
      const day = Number(dayText);
      const calendarDate = new Date(`${yearText}-${monthText}-${dayText}T00:00:00.000Z`);

      if (
        month < 1 ||
        month > 12 ||
        day < 1 ||
        calendarDate.getUTCFullYear() !== year ||
        calendarDate.getUTCMonth() + 1 !== month ||
        calendarDate.getUTCDate() !== day
      ) {
        return null;
      }
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

export function isValidDate(value: unknown): boolean {
  return parseDate(value) !== null;
}

export function isAfterDate(value: unknown, reference: Date | string | number): boolean {
  const candidate = parseDate(value);
  const referenceDate = parseDate(reference);

  if (!candidate || !referenceDate) {
    return false;
  }

  return candidate.getTime() > referenceDate.getTime();
}

export function isBeforeDate(value: unknown, reference: Date | string | number): boolean {
  const candidate = parseDate(value);
  const referenceDate = parseDate(reference);

  if (!candidate || !referenceDate) {
    return false;
  }

  return candidate.getTime() < referenceDate.getTime();
}
