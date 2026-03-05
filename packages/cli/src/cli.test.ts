import test from 'ava';
import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { erc20 } from '@openzeppelin/wizard';
import { erc20 as cairoErc20 } from '@openzeppelin/wizard-cairo';
import { fungible } from '@openzeppelin/wizard-stellar';
import { erc20 as stylusErc20 } from '@openzeppelin/wizard-stylus';
import { erc7984 } from '@openzeppelin/wizard-confidential';

const CLI = join(__dirname, '..', 'dist', 'index.js');
const PACKAGES_CORE_PATH = join(__dirname, '../../core');
const REGISTRY_TS_PATH = join(__dirname, 'registry.ts');
const CLI_EXCLUDED_LANGUAGES = ['cairo_alpha'];

function run(...args: string[]): string {
  return execFileSync('node', [CLI, ...args], { encoding: 'utf-8' });
}

function toKebabCase(value: string): string {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function kindsFromSource(source: string): string[] {
  return [...source.matchAll(/case '([^']+)'/g)]
    .map(match => match[1])
    .filter((kind): kind is string => kind !== undefined);
}

function coreKindToCommand(language: string, kind: string): string {
  if (language === 'uniswap-hooks' && kind === 'Hooks') {
    return language;
  }

  if (language === 'solidity' && kind === 'RealWorldAsset') {
    return 'solidity-rwa';
  }

  return `${language}-${toKebabCase(kind)}`;
}

// --- Top-level help ---

test('--help lists all commands', t => {
  const output = run('--help');
  t.true(output.includes('solidity-erc20'));
  t.true(output.includes('cairo-erc20'));
  t.true(output.includes('stellar-fungible'));
  t.true(output.includes('stylus-erc20'));
  t.true(output.includes('confidential-erc7984'));
  t.true(output.includes('uniswap-hooks'));
});

test('each core kind has cli registry entry', async t => {
  const coreEntries = await readdir(PACKAGES_CORE_PATH, { withFileTypes: true });
  const coreDirs = coreEntries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => !CLI_EXCLUDED_LANGUAGES.includes(name));

  const registryContent = await readFile(REGISTRY_TS_PATH, 'utf-8');

  for (const coreDir of coreDirs) {
    const kindSource = await readFile(join(PACKAGES_CORE_PATH, coreDir, 'src', 'kind.ts'), 'utf-8');

    for (const kind of kindsFromSource(kindSource)) {
      const expectedCommand = coreKindToCommand(coreDir, kind);

      t.true(
        registryContent.includes(`'${expectedCommand}':`),
        `Expected '${expectedCommand}' not found in registry.ts for core language '${coreDir}' and kind '${kind}'`,
      );
    }
  }
});

// --- Command-level help ---

test('solidity-erc20 --help shows options', t => {
  const output = run('solidity-erc20', '--help');
  t.true(output.includes('--name'));
  t.true(output.includes('--symbol'));
  t.true(output.includes('--mintable'));
});

// --- Solidity ---

test('solidity-erc20: basic', t => {
  const output = run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST');
  t.is(output, erc20.print({ name: 'TestToken', symbol: 'TST' }));
});

test('solidity-erc20: with options', t => {
  const output = run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--mintable', '--pausable', '--votes', 'blocknumber');
  t.is(output, erc20.print({ name: 'TestToken', symbol: 'TST', mintable: true, pausable: true, votes: 'blocknumber' }));
});

test('solidity-erc20: boolean --flag true/false', t => {
  const output = run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--mintable', 'true', '--pausable', 'false');
  t.is(output, erc20.print({ name: 'TestToken', symbol: 'TST', mintable: true, pausable: false }));
});

// --- Cairo ---

test('cairo-erc20: basic', t => {
  const output = run('cairo-erc20', '--name', 'TestToken', '--symbol', 'TST');
  t.is(output, cairoErc20.print({ name: 'TestToken', symbol: 'TST' }));
});

// --- Stellar ---

test('stellar-fungible: basic', t => {
  const output = run('stellar-fungible', '--name', 'TestToken', '--symbol', 'TST');
  t.is(output, fungible.print({ name: 'TestToken', symbol: 'TST' }));
});

// --- Stylus ---

test('stylus-erc20: basic', t => {
  const output = run('stylus-erc20', '--name', 'TestToken');
  t.is(output, stylusErc20.print({ name: 'TestToken' }));
});

// --- Confidential ---

test('confidential-erc7984: basic', t => {
  const output = run('confidential-erc7984', '--name', 'TestToken', '--symbol', 'TST', '--contractURI', 'https://example.com', '--networkConfig', 'zama-ethereum');
  t.is(output, erc7984.print({ name: 'TestToken', symbol: 'TST', contractURI: 'https://example.com', networkConfig: 'zama-ethereum' }));
});

// --- Error handling ---

test('unknown command exits with error', t => {
  t.throws(() => run('nonexistent-command'), { message: /Unknown command/ });
});

test('unknown option exits with error', t => {
  t.throws(() => run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--notreal'), {
    message: /Unknown option: --notreal/,
  });
});

test('missing required option exits with error', t => {
  t.throws(() => run('solidity-erc20', '--name', 'TestToken'), {
    message: /symbol/i,
  });
});

// --- Nested options ---

test('solidity-erc20: info options', t => {
  const output = run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--info.license', 'Apache-2.0');
  t.is(output, erc20.print({ name: 'TestToken', symbol: 'TST', info: { license: 'Apache-2.0' } }));
});
