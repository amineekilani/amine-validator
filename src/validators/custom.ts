import type { CustomValidator, CustomValidatorResult, NamedCustomValidator } from '../types';

export function createValidator<T>(
  name: string,
  validator: CustomValidator<T>,
): NamedCustomValidator<T> {
  const normalizedName = typeof name === 'string' ? name.trim() : '';

  if (!normalizedName || typeof validator !== 'function') {
    throw new TypeError('Custom validator requires a non-empty name and a function.');
  }

  return {
    name: normalizedName,
    validate: validator,
  };
}

export function runCustomValidator<T>(
  value: T,
  validator: CustomValidator<T> | NamedCustomValidator<T>,
): CustomValidatorResult {
  if (typeof validator === 'function') {
    return validator(value);
  }

  if (validator && typeof validator.validate === 'function') {
    return validator.validate(value);
  }

  throw new TypeError('Custom validator must be a function or a named validator.');
}
