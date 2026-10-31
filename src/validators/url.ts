function isValidHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, '');

  if (normalized === 'localhost' || (normalized.startsWith('[') && normalized.endsWith(']'))) {
    return true;
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) {
    return true;
  }

  if (normalized.length > 253) {
    return false;
  }

  const labels = normalized.split('.');

  if (
    labels.length < 2 ||
    labels.some((label) => label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))
  ) {
    return false;
  }

  const topLevelDomain = labels[labels.length - 1];
  return /^[a-z]{2,63}$/.test(topLevelDomain) || /^xn--[a-z0-9-]{2,59}$/.test(topLevelDomain);
}

export function isURL(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      isValidHostname(parsed.hostname)
    );
  } catch {
    return false;
  }
}
