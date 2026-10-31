# amine-validator

`amine-validator` is a lightweight TypeScript validation library for JavaScript and TypeScript applications. It is framework-independent, has no runtime dependencies, and supports ESM and CommonJS consumers.

## Features

- Email validation
- Strong password validation
- Phone validation (international formats)
- Tunisian phone validation
- URL validation
- Required and string length checks
- Numeric validation helpers
- Date validation helpers
- Reusable custom validators
- Lightweight schema validation API

## Installation

```bash
npm install amine-validator
```

## Quick usage

```ts
import {
  isEmail,
  isStrongPassword,
  isPhone,
  isTunisianPhone,
  isURL,
  isNumber,
  isValidDate,
  validate,
} from 'amine-validator';

isEmail('amine@example.com'); // true
isStrongPassword('Abcde123!'); // true
isPhone('+1 (555) 123-4567'); // true
isTunisianPhone('+216 22 123 456'); // true
isURL('https://example.com'); // true
isNumber('42'); // true
isValidDate('2026-02-15'); // true

const result = validate({
  email: {
    value: 'amine@example.com',
    rules: ['required', 'email'],
  },
  age: {
    value: 30,
    rules: ['number', 'min:18', 'max:65'],
  },
});

console.log(result.isValid); // true
```

For CommonJS:

```js
const { isEmail, validate } = require('amine-validator');

console.log(isEmail('amine@example.com')); // true
```

## API reference

### Email

```ts
isEmail(value: unknown): boolean
```

Validates common ASCII email addresses and rejects malformed or empty input. Surrounding whitespace is trimmed. The local part uses an unquoted dot-atom format, and the domain must contain at least two valid labels with a letter-based or punycode final label. This intentionally does not implement every RFC edge case or internationalized email local parts.

### Password

```ts
isStrongPassword(value: unknown, options?: StrongPasswordOptions): boolean
```

Default requirements:

- minimum length: 8
- at least 1 uppercase letter
- at least 1 lowercase letter
- at least 1 number
- at least 1 special character
- whitespace is disallowed by default

Each minimum must be a non-negative integer. Set a minimum to `0` to disable that character-class requirement. Password checks are format policies only; they do not estimate password entropy or check breached-password lists. Character classes are ASCII-based.
An empty password is always rejected, including when all minimums are set to `0`.

### Phone

```ts
isPhone(value: unknown, options?: PhoneOptions): boolean
isTunisianPhone(value: unknown): boolean
```

`isPhone` checks a phone-like format and a configurable digit count (7 to 15 digits by default); it does not verify country calling codes or number assignment. It accepts spaces, parentheses, periods, and hyphens, with at most one balanced parenthesized digit group. `allowLocal: false` requires a leading `+`.

`isTunisianPhone` accepts an eight-digit Tunisian number beginning with `2`, `4`, `5`, `7`, or `9`, in compact or `2-3-3` grouping. A number may be local (`22 123 456`) or use the `+216` or `00216` country prefix (`+216 22 123 456`). Only spaces and hyphens are accepted as separators. This checks numbering-plan format only, not current allocation, activity, or ownership.

The default `isPhone` digit bounds are inclusive: 7–15. `minDigits` and `maxDigits` can narrow that range, but configured bounds must be integers between 1 and 15 with `minDigits <= maxDigits`.

### URL

```ts
isURL(value: unknown): boolean
```

Only `http:` and `https:` URLs with a syntactically valid host are accepted. Domain names, IP addresses, and `localhost` are supported; a URL is not fetched, so this does not establish that its destination exists or is safe.

### String validation

```ts
isRequired(value: unknown): boolean
isMinLength(value: unknown, min: number): boolean
isMaxLength(value: unknown, max: number): boolean
isAlpha(value: unknown): boolean
isAlphanumeric(value: unknown): boolean
```

Length checks use the exact string (no trimming) and require a non-negative integer bound. `isAlpha` and `isAlphanumeric` accept non-empty ASCII letters and ASCII letters/digits respectively; surrounding spaces are not ignored.

`isRequired` returns `false` for `null`, `undefined`, blank strings, empty arrays, `NaN`, and infinities. Other values—including `false`, `0`, and empty objects—are considered present.

### Number validation

```ts
isNumber(value: unknown): boolean
isInteger(value: unknown): boolean
isPositive(value: unknown): boolean
isNegative(value: unknown): boolean
isInRange(value: unknown, min: number, max: number): boolean
```

Finite numbers and trimmed decimal numeric strings are accepted; hexadecimal, binary, blank, `NaN`, and infinite values are rejected. `isInRange` includes both endpoints and returns `false` if the bounds are non-finite or reversed.

### Date validation

```ts
isValidDate(value: unknown): boolean
isAfterDate(value: unknown, reference: Date | string | number): boolean
isBeforeDate(value: unknown, reference: Date | string | number): boolean
```

`Date` objects, finite millisecond timestamps, and strings parseable by JavaScript's `Date` are supported. ISO calendar dates are checked for invalid day/month combinations. Date-only ISO strings are interpreted as UTC; date-time strings without an offset follow JavaScript's local-time parsing behavior. Comparisons use millisecond timestamps and are strict (`>` / `<`).

### Custom validation

```ts
import { createValidator, validate } from 'amine-validator';

const isEven = createValidator('even', (value) => typeof value === 'number' && value % 2 === 0);

const result = validate({
  count: {
    value: 4,
    customValidators: [isEven],
  },
});
```

Custom validators can return a boolean or `{ valid, message? }`. A named validator created by `createValidator` uses its name in the result. Validator exceptions are not swallowed.

### Schema validation

```ts
import { validate } from 'amine-validator';

const result = validate({
  password: {
    value: 'StrongPass1!',
    rules: ['required', 'strongPassword'],
  },
  email: {
    value: 'test@example.com',
    rules: ['required', 'email'],
  },
  age: {
    value: 30,
    rules: ['number', 'inRange:18,120'],
  },
});
```

The result contains:

```ts
{
  isValid: boolean;
  errors: string[];
  results: Array<{
    field: string;
    rule: string;
    valid: boolean;
    message?: string;
  }>;
}
```

Unknown rule names fail validation. Built-in rule names are case-insensitive; parameterized rules include `min:`, `max:`, `minLength:`, `maxLength:`, `inRange:min,max`, `afterDate:`, and `beforeDate:`.
Schema `min` and `max` compare finite numeric values (including decimal numeric strings) numerically; for non-numeric strings they compare the exact string length.

## Notes and limitations

- Validators check format and content, not real-world existence, ownership, activity, or endpoint safety.
- Email, phone, URL, and date rules intentionally cover common inputs rather than every possible standard edge case.
- Password and phone constraints are documented and configurable; no network lookups are performed.

## License

MIT
