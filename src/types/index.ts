export type ValidationRule =
  | 'required'
  | 'email'
  | 'strongPassword'
  | 'phone'
  | 'tunisianPhone'
  | 'url'
  | 'alpha'
  | 'alphanumeric'
  | 'number'
  | 'integer'
  | 'positive'
  | 'negative'
  | 'date'
  | `min:${number}`
  | `max:${number}`
  | `minLength:${number}`
  | `maxLength:${number}`
  | `inRange:${number},${number}`
  | `afterDate:${string}`
  | `beforeDate:${string}`;

export interface StrongPasswordOptions {
  minLength?: number;
  minUppercase?: number;
  minLowercase?: number;
  minNumbers?: number;
  minSpecialChars?: number;
  allowWhitespace?: boolean;
}

export interface PhoneOptions {
  minDigits?: number;
  maxDigits?: number;
  allowLocal?: boolean;
}

export type CustomValidatorResult = boolean | { valid: boolean; message?: string };
export type CustomValidator<T = unknown> = (value: T) => CustomValidatorResult;
export interface NamedCustomValidator<T = unknown> {
  name: string;
  validate: CustomValidator<T>;
}

export interface SchemaFieldConfig<T = unknown> {
  value: T;
  rules?: ValidationRule[];
  customValidators?: Array<CustomValidator<T> | NamedCustomValidator<T>>;
}

export interface ValidationResultItem {
  field: string;
  rule: string;
  valid: boolean;
  message?: string;
}

export interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  results: ValidationResultItem[];
}
