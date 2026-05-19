import test from 'ava';
import { stringifyUnicodeSafe, validateSolidityString } from './sanitize';
import { OptionsError } from '../error';

test('stringifyUnicodeSafe encodes inputs into a Solidity string literal', t => {
  const cases = [
    {
      input: 'My Token',
      expected: '"My Token"',
      description: 'plain ASCII uses the regular literal form',
    },
    {
      input: 'MyToke"ć"',
      expected: 'unicode"MyToke\\"ć\\""',
      description: 'escapes double quotes and switches to unicode literal when non-ASCII present',
    },
    {
      input: '',
      expected: '""',
      description: 'empty string',
    },
    {
      input: 'ć',
      expected: 'unicode"ć"',
      description: 'BMP non-ASCII passes through raw inside unicode literal',
    },
    {
      input: 'MyTok"e"n',
      expected: '"MyTok\\"e\\"n"',
      description: 'escapes double quotes in regular literal',
    },
    {
      input: 'Path\\file',
      expected: '"Path\\\\file"',
      description: 'escapes backslash in regular literal',
    },
    {
      input: 'é\\");',
      expected: 'unicode"é\\\\\\");"',
      description: 'escapes backslash and quote together — closes the unicode breakout',
    },
    {
      input: '😀',
      expected: 'unicode"😀"',
      description: 'non-BMP code points pass through as raw UTF-8 (no surrogate escapes)',
    },
    {
      input: 'a\x0bb',
      expected: 'unicode"a\\x0bb"',
      description: 'should escape vertical tab (Solidity lexer treats it as a line terminator)',
    },
  ];

  for (const { input, expected, description } of cases) {
    t.is(stringifyUnicodeSafe(input), expected, description);
  }
});

test('validateSolidityString rejects characters that cannot round-trip', t => {
  const cases = [
    { input: '\x00', description: 'NUL' },
    { input: '\x08', description: 'backspace' },
    { input: '\t', description: 'tab' },
    { input: '\n', description: 'LF' },
    { input: '\x0b', description: 'VT' },
    { input: '\x0c', description: 'FF' },
    { input: '\r', description: 'CR' },
    { input: '\x1f', description: 'unit separator (last ASCII control)' },
    { input: '\x7f', description: 'DEL' },
    { input: '', description: 'NEL (Solidity line terminator)' },
    { input: ' ', description: 'LS (Solidity line terminator)' },
    { input: ' ', description: 'PS (Solidity line terminator)' },
    { input: '\ud800', description: 'lone high surrogate' },
    { input: '\udfff', description: 'lone low surrogate' },
    { input: 'foo\ud800bar', description: 'lone surrogate inside otherwise-valid text' },
  ];

  for (const { input, description } of cases) {
    const err = t.throws(() => validateSolidityString(input, 'name'), { instanceOf: OptionsError }, description);
    t.truthy(err?.messages.name, `${description}: error attributes to 'name'`);
  }
});

test('validateSolidityString accepts inputs Solidity can store', t => {
  const cases = ['', 'My Token', 'MyToke"ć"', 'ć', '😀', 'é\\");', 'Path\\file'];
  for (const input of cases) {
    t.notThrows(() => validateSolidityString(input, 'name'), `accepts ${JSON.stringify(input)}`);
  }
});

test('validateSolidityString attributes errors to the supplied field name', t => {
  const err = t.throws(() => validateSolidityString('bad\x00', 'uri'), { instanceOf: OptionsError });
  t.truthy(err?.messages.uri);
  t.falsy(err?.messages.name);
});
