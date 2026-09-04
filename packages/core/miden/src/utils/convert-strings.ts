import { OptionsError } from '../error';

/**
 * Converts to a Rust identifier: removes accents and any character that is not alphanumeric or an underscore,
 * and strips leading characters that cannot start an identifier.
 */
export function toIdentifier(str: string, capitalize = false): string {
  const result = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/^[^a-zA-Z_]+/, '')
    .replace(/^(.)/, c => (capitalize ? c.toUpperCase() : c))
    .replace(/[^\w]+(.?)/g, (_, c) => c.toUpperCase());

  if (result.length === 0) {
    throw new OptionsError({
      name: 'Identifier is empty or does not have valid characters',
    });
  } else {
    return result;
  }
}

/**
 * Converts to a snake_case identifier suitable for a Rust module or file name.
 */
export function toSnakeCase(str: string): string {
  return toIdentifier(str)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/_+/g, '_')
    .toLowerCase();
}

/**
 * Escapes a string so that it can be printed inside a double-quoted Rust string literal on a single line.
 */
export function escapeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/[\u2028\u2029]/g, c => `\\u{${c.charCodeAt(0).toString(16)}}`);
}

/**
 * Returns the number of bytes of the UTF-8 encoding of a string.
 */
export function utf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Checks that a string is at most `maxBytes` long when encoded as UTF-8.
 */
export function validateMaxBytes(value: string, field: string, maxBytes: number): void {
  if (utf8ByteLength(value) > maxBytes) {
    throw new OptionsError({
      [field]: `Must be at most ${maxBytes} bytes when encoded as UTF-8`,
    });
  }
}

function maxValueOfUint(bits: number): bigint {
  if (bits <= 0) {
    throw new Error(`Number of bits must be positive (actual '${bits}').`);
  }
  if (bits % 8 !== 0) {
    throw new Error(`The number of bits must be a multiple of 8 (actual '${bits}').`);
  }
  const bytes = bits / 8;
  return BigInt('0x' + 'ff'.repeat(bytes));
}

const UINT_MAX_VALUES = {
  u8: maxValueOfUint(8),
  u16: maxValueOfUint(16),
  u32: maxValueOfUint(32),
  u64: maxValueOfUint(64),
} as const;

export type UintType = keyof typeof UINT_MAX_VALUES;

/**
 * Checks that a string/number value is a valid `uint` value and converts it to bigint
 */
export function toUint(value: number | string, field: string, type: UintType): bigint {
  const valueAsStr = value.toString().trim();
  const isValidNumber = /^\d+$/.test(valueAsStr);
  if (!isValidNumber) {
    throw new OptionsError({
      [field]: 'Not a valid number',
    });
  }
  const numValue = BigInt(valueAsStr);
  if (numValue > UINT_MAX_VALUES[type]) {
    throw new OptionsError({
      [field]: `Value is greater than ${type} max value`,
    });
  }
  return numValue;
}

/**
 * Formats an unsigned integer as a Rust literal with `_` separators every three digits.
 */
export function toRustIntegerLiteral(value: bigint): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_');
}

export const amountPattern = /^(\d*\.?\d*)$/;

/**
 * Scales an amount given in token units (possibly fractional) to base units according to the number of decimals.
 *
 * @param amount Amount in token units, may be fractional
 * @param decimals The number of decimals of the token
 * @param field The name of the option, used in error messages
 * @returns `amount` with zeros padded or removed based on `decimals`, as a string without leading zeros.
 * @throws OptionsError if `amount` is not a valid number or is more precise than allowed by `decimals`.
 */
export function toBaseUnits(amount: string, decimals: number, field: string): string {
  const trimmed = amount.trim();
  if (trimmed.length === 0 || trimmed === '.' || !amountPattern.test(trimmed)) {
    throw new OptionsError({
      [field]: 'Not a valid number',
    });
  }

  const [integerPart = '', fractionalPart = ''] = trimmed.split('.');
  if (fractionalPart.length > decimals) {
    throw new OptionsError({
      [field]: 'Too many decimals',
    });
  }

  const result = (integerPart + fractionalPart.padEnd(decimals, '0')).replace(/^0+/, '');
  return result.length === 0 ? '0' : result;
}
