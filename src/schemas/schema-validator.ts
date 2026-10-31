import { isEmail } from '../validators/email';
import { isStrongPassword } from '../validators/password';
import { isPhone } from '../validators/phone';
import { isTunisianPhone } from '../validators/tunisian-phone';
import { isURL } from '../validators/url';
import { isRequired } from '../validators/required';
import { isAlpha, isAlphanumeric, isMaxLength, isMinLength } from '../validators/string';
import { isInRange, isInteger, isNegative, isNumber, isPositive } from '../validators/number';
import { isAfterDate, isBeforeDate, isValidDate } from '../validators/date';
import { runCustomValidator } from '../validators/custom';
import type { SchemaFieldConfig, SchemaValidationResult, ValidationResultItem } from '../types';

type SchemaCustomValidator = NonNullable<SchemaFieldConfig['customValidators']>[number];

function parseRule(rawRule: string): { name: string; argument?: number | string } {
  const trimmed = rawRule.trim();

  if (!trimmed) {
    return { name: '' };
  }

  const [name, ...rest] = trimmed.split(':');

  if (rest.length === 0) {
    return { name: name.toLowerCase() };
  }

  const argument = rest.join(':');
  const numericArgument = argument.trim() ? Number(argument) : Number.NaN;

  return {
    name: name.toLowerCase(),
    argument: Number.isFinite(numericArgument) ? numericArgument : argument,
  };
}

function evaluateRule(value: unknown, name: string, argument?: number | string): boolean {
  switch (name) {
    case 'required':
      return isRequired(value);
    case 'email':
      return isEmail(value);
    case 'strongpassword':
      return isStrongPassword(value);
    case 'phone':
      return isPhone(value);
    case 'tunisianphone':
      return isTunisianPhone(value);
    case 'url':
      return isURL(value);
    case 'minlength':
      return typeof argument === 'number' && isMinLength(value, argument);
    case 'maxlength':
      return typeof argument === 'number' && isMaxLength(value, argument);
    case 'min': {
      if (typeof argument !== 'number') {
        return false;
      }

      if (typeof value === 'string') {
        if (isNumber(value)) {
          const numericValue = Number(value.trim());
          return numericValue >= argument;
        }

        return value.length >= argument;
      }

      const numericValue = Number(value);
      return Number.isFinite(numericValue) && numericValue >= argument;
    }
    case 'max': {
      if (typeof argument !== 'number') {
        return false;
      }

      if (typeof value === 'string') {
        if (isNumber(value)) {
          const numericValue = Number(value.trim());
          return numericValue <= argument;
        }

        return value.length <= argument;
      }

      const numericValue = Number(value);
      return Number.isFinite(numericValue) && numericValue <= argument;
    }
    case 'alpha':
      return isAlpha(value);
    case 'alphanumeric':
      return isAlphanumeric(value);
    case 'number':
      return isNumber(value);
    case 'integer':
      return isInteger(value);
    case 'positive':
      return isPositive(value);
    case 'negative':
      return isNegative(value);
    case 'inrange': {
      if (typeof argument !== 'string') {
        return false;
      }

      const range = argument.split(/[,:]/);

      if (range.length !== 2 || !isNumber(range[0]) || !isNumber(range[1])) {
        return false;
      }

      const min = Number(range[0].trim());
      const max = Number(range[1].trim());
      return Number.isFinite(min) && Number.isFinite(max) && isInRange(value, min, max);
    }
    case 'date':
      return isValidDate(value);
    case 'afterdate':
      return typeof argument !== 'undefined' && isAfterDate(value, String(argument));
    case 'beforedate':
      return typeof argument !== 'undefined' && isBeforeDate(value, String(argument));
    default:
      return false;
  }
}

function getCustomValidatorName(validator: SchemaCustomValidator): string {
  if (typeof validator === 'function') {
    return 'custom';
  }

  return validator.name.trim() || 'custom';
}

export function validate(schema: Record<string, SchemaFieldConfig>): SchemaValidationResult {
  const results: ValidationResultItem[] = [];
  const errors: string[] = [];

  if (schema === null || typeof schema !== 'object' || Array.isArray(schema)) {
    return {
      isValid: false,
      errors: ['Schema must be an object.'],
      results: [{ field: '', rule: 'schema', valid: false, message: 'Schema must be an object.' }],
    };
  }

  for (const [field, config] of Object.entries(schema)) {
    if (config === null || typeof config !== 'object' || Array.isArray(config)) {
      const message = `${field} has an invalid field configuration.`;
      errors.push(message);
      results.push({ field, rule: 'configuration', valid: false, message });
      continue;
    }

    if (config.rules !== undefined && !Array.isArray(config.rules)) {
      const message = `${field} has an invalid rules list.`;
      errors.push(message);
      results.push({ field, rule: 'configuration', valid: false, message });
    }

    const rules = Array.isArray(config.rules) ? config.rules : [];

    for (const rule of rules) {
      if (typeof rule !== 'string') {
        const message = `${field} has a rule that is not a string.`;
        errors.push(message);
        results.push({ field, rule: 'invalid-rule', valid: false, message });
        continue;
      }

      const { name, argument } = parseRule(rule);
      const valid = evaluateRule(config.value, name, argument);
      const displayRule = rule.trim() || '(empty rule)';
      const message = valid ? undefined : `${field} failed rule: ${displayRule}`;
      const result: ValidationResultItem = {
        field,
        rule: displayRule,
        valid,
        message,
      };

      if (!valid) {
        errors.push(message ?? `${field} failed rule: ${displayRule}`);
      }

      results.push(result);
    }

    if (config.customValidators !== undefined && !Array.isArray(config.customValidators)) {
      const message = `${field} has an invalid custom validators list.`;
      errors.push(message);
      results.push({ field, rule: 'configuration', valid: false, message });
    }

    const customValidators = Array.isArray(config.customValidators) ? config.customValidators : [];

    for (const customValidator of customValidators) {
      if (
        typeof customValidator !== 'function' &&
        (!customValidator ||
          typeof customValidator.name !== 'string' ||
          customValidator.name.trim().length === 0 ||
          typeof customValidator.validate !== 'function')
      ) {
        const message = `${field} has an invalid custom validator.`;
        errors.push(message);
        results.push({ field, rule: 'custom', valid: false, message });
        continue;
      }

      const evaluation = runCustomValidator(config.value, customValidator);
      const valid =
        typeof evaluation === 'boolean'
          ? evaluation
          : typeof evaluation === 'object' &&
              evaluation !== null &&
              typeof evaluation.valid === 'boolean'
            ? evaluation.valid
            : false;
      const validatorName = getCustomValidatorName(customValidator);
      const defaultMessage = `${field} failed custom validation: ${validatorName}.`;
      const message =
        typeof evaluation === 'boolean'
          ? valid
            ? undefined
            : defaultMessage
          : typeof evaluation === 'object' &&
              evaluation !== null &&
              typeof evaluation.message === 'string'
            ? evaluation.message.trim()
              ? evaluation.message
              : valid
                ? undefined
                : defaultMessage
            : valid
              ? undefined
              : defaultMessage;
      const result: ValidationResultItem = {
        field,
        rule: validatorName,
        valid,
        message,
      };

      results.push(result);

      if (!valid) {
        errors.push(message ?? defaultMessage);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    results,
  };
}
