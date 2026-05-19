import { OptionsError } from '../error';

/**
 * Throws an OptionsError if `str` cannot round-trip through Solidity's lexer:
 *
 *  - ASCII control characters 0x00-0x1F (including TAB, LF, CR, VT, FF) and
 *    DEL (0x7F).
 *  - Unicode line terminators that Solidity's scanner recognises outside the
 *    ASCII control range: NEL (U+0085), LS (U+2028), PS (U+2029).
 *    See liblangutil/Scanner.cpp::isUnicodeLinebreak in the Solidity source.
 *  - Lone UTF-16 surrogates (U+D800-U+DFFF without a pair) — not representable
 *    as valid UTF-8.
 *
 * The error attributes to `fieldName`, so callers should pass the option key
 * the input came from (e.g. 'name', 'symbol', 'uri').
 */
export function validateSolidityString(str: string, fieldName: string): void {
  for (const ch of str) {
    const cp = ch.codePointAt(0)!;
    if (cp <= 0x1f || cp === 0x7f || cp === 0x85 || cp === 0x2028 || cp === 0x2029) {
      throw new OptionsError({
        [fieldName]: `Unsupported character U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
      });
    }
    if (cp >= 0xd800 && cp <= 0xdfff) {
      throw new OptionsError({
        [fieldName]: `Unpaired surrogate U+${cp.toString(16).toUpperCase()}`,
      });
    }
  }
}

/**
 * Returns a Solidity string literal whose decoded value equals `str`.
 *
 * Assumes `str` has already been validated via `validateSolidityString` at the
 * option-receiving layer. The form is chosen from Solidity's grammar
 * (https://docs.soliditylang.org/en/latest/grammar.html):
 *
 *  - Regular `"..."` when `str` fits DoubleQuotedPrintable (printable ASCII
 *    0x20-0x7E minus `"` and `\`).
 *  - `unicode"..."` otherwise. Non-BMP code points pass through as raw UTF-8.
 *
 * Only `"` and `\` are escaped; everything else is emitted raw.
 */
export function stringifyUnicodeSafe(str: string): string {
  const needsUnicode = /[^\x20-\x7E]/u.test(str);
  const body = str.replace(/[\\"]/g, c => (c === '"' ? '\\"' : '\\\\'));
  return needsUnicode ? `unicode"${body}"` : `"${body}"`;
}
