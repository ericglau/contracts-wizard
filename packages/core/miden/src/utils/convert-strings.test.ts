import test from 'ava';

import {
  escapeString,
  toBaseUnits,
  toIdentifier,
  toRustIntegerLiteral,
  toSnakeCase,
  utf8ByteLength,
} from './convert-strings';
import type { OptionsError } from '../error';

test('toIdentifier', t => {
  t.is(toIdentifier('My Token', true), 'MyToken');
  t.is(toIdentifier('my token'), 'myToken');
  t.is(toIdentifier('123 Token', true), 'Token');
  t.is(toIdentifier('Ünïcödé Tökén', true), 'UnicodeToken');
  t.throws(() => toIdentifier('$$$'));
});

test('toSnakeCase', t => {
  t.is(toSnakeCase('MyToken'), 'my_token');
  t.is(toSnakeCase('My Token'), 'my_token');
  t.is(toSnakeCase('MyNFTCollection'), 'my_nft_collection');
  t.is(toSnakeCase('token'), 'token');
});

test('escapeString', t => {
  t.is(escapeString('plain'), 'plain');
  t.is(escapeString('say "hi"'), 'say \\"hi\\"');
  t.is(escapeString('back\\slash'), 'back\\\\slash');
  t.is(escapeString('line\nbreak\r\ttab'), 'line\\nbreak\\r\\ttab');
  t.is(escapeString('a b'), 'a\\u{2028}b');
});

test('utf8ByteLength', t => {
  t.is(utf8ByteLength('abc'), 3);
  t.is(utf8ByteLength('é'), 2);
  t.is(utf8ByteLength('🪙'), 4);
});

test('toRustIntegerLiteral', t => {
  t.is(toRustIntegerLiteral(0n), '0');
  t.is(toRustIntegerLiteral(999n), '999');
  t.is(toRustIntegerLiteral(1000n), '1_000');
  t.is(toRustIntegerLiteral(100000000000000000n), '100_000_000_000_000_000');
});

test('toBaseUnits', t => {
  t.is(toBaseUnits('1000', 8, 'maxSupply'), '100000000000');
  t.is(toBaseUnits('1.5', 2, 'maxSupply'), '150');
  t.is(toBaseUnits('0.5', 1, 'maxSupply'), '5');
  t.is(toBaseUnits('.5', 1, 'maxSupply'), '5');
  t.is(toBaseUnits('0', 8, 'maxSupply'), '0');
  t.is(toBaseUnits('42', 0, 'maxSupply'), '42');
  t.is(toBaseUnits(' 7 ', 0, 'maxSupply'), '7');
  for (const invalid of ['', '.', '1.2.3', 'abc', '-1', '1e5']) {
    const error = t.throws(() => toBaseUnits(invalid, 8, 'maxSupply')) as OptionsError;
    t.is(error.messages.maxSupply, 'Not a valid number');
  }
  const error = t.throws(() => toBaseUnits('1.123', 2, 'maxSupply')) as OptionsError;
  t.is(error.messages.maxSupply, 'Too many decimals');
});
