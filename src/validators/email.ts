const LOCAL_PART_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const DOMAIN_LABEL_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

export function isEmail(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > 254) {
    return false;
  }

  const separator = trimmed.lastIndexOf('@');

  if (separator <= 0 || separator === trimmed.length - 1) {
    return false;
  }

  const localPart = trimmed.slice(0, separator);
  const domain = trimmed.slice(separator + 1);

  if (localPart.length > 64 || domain.length > 253 || !LOCAL_PART_PATTERN.test(localPart)) {
    return false;
  }

  const labels = domain.split('.');

  if (
    labels.length < 2 ||
    labels.some((label) => label.length > 63 || !DOMAIN_LABEL_PATTERN.test(label))
  ) {
    return false;
  }

  const topLevelDomain = labels[labels.length - 1];
  return /^[A-Za-z]{2,63}$/.test(topLevelDomain) || /^xn--[A-Za-z0-9-]{2,59}$/.test(topLevelDomain);
}
