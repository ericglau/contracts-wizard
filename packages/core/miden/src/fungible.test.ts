import test from 'ava';

import type { FungibleOptions } from './fungible';
import { buildFungible } from './fungible';
import { printContract } from './print';
import type { OptionsError } from './error';

import { fungible } from '.';

function testFungible(title: string, opts: Partial<FungibleOptions>) {
  test(title, t => {
    const c = buildFungible({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: FungibleOptions) {
  test(title, t => {
    t.is(
      fungible.print(opts),
      printContract(
        buildFungible({
          name: 'MyToken',
          symbol: 'MTK',
          ...opts,
        }),
      ),
    );
  });
}

function testFungibleError(title: string, opts: Partial<FungibleOptions>, field: string) {
  test(title, t => {
    const error = t.throws(() =>
      buildFungible({
        name: 'MyToken',
        symbol: 'MTK',
        ...opts,
      }),
    ) as OptionsError;
    t.truthy(error.messages[field], `expected an error on field '${field}': ${JSON.stringify(error.messages)}`);
    t.snapshot(error.messages);
  });
}

testFungible('basic fungible', {});

testFungible('fungible with decimals and max supply', {
  decimals: '2',
  maxSupply: '21000000.5',
});

testFungible('fungible with metadata', {
  description: 'A token issued on Miden',
  logoUri: 'https://example.com/logo.png',
  externalLink: 'https://example.com',
});

testFungible('fungible updatable metadata and max supply', {
  updatableMetadata: true,
  updatableMaxSupply: true,
});

testFungible('fungible not burnable defaults to ownable', {
  burnable: false,
});

testFungible('fungible pausable', {
  pausable: true,
});

testFungible('fungible allowlist', {
  restrictions: 'allowlist',
});

testFungible('fungible blocklist', {
  restrictions: 'blocklist',
});

testFungible('fungible ownable', {
  access: 'ownable',
});

testFungible('fungible ownable pausable blocklist', {
  access: 'ownable',
  pausable: true,
  restrictions: 'blocklist',
  burnable: false,
});

testFungible('fungible roles', {
  access: 'roles',
});

testFungible('fungible roles pausable allowlist', {
  access: 'roles',
  pausable: true,
  restrictions: 'allowlist',
});

testFungible('fungible full - complex name', {
  name: 'Custom  $ Token',
  symbol: 'CTK',
  decimals: '12',
  maxSupply: '1000',
  description: 'A "quoted" description',
  logoUri: 'https://example.com/logo.png',
  externalLink: 'https://example.com',
  updatableMetadata: true,
  updatableMaxSupply: true,
  burnable: false,
  pausable: true,
  restrictions: 'blocklist',
  access: 'roles',
  info: {
    securityContact: 'security@example.com',
    license: 'WTFPL',
  },
});

testFungibleError('fungible name too long', { name: 'A'.repeat(33) }, 'name');
testFungibleError('fungible lowercase symbol', { symbol: 'mtk' }, 'symbol');
testFungibleError('fungible symbol too long', { symbol: 'ABCDEFGHIJKLM' }, 'symbol');
testFungibleError('fungible too many decimals', { decimals: '13' }, 'decimals');
testFungibleError('fungible invalid decimals', { decimals: 'abc' }, 'decimals');
testFungibleError('fungible max supply zero', { maxSupply: '0' }, 'maxSupply');
testFungibleError('fungible max supply too precise', { maxSupply: '1.123', decimals: '2' }, 'maxSupply');
testFungibleError('fungible max supply too large', { maxSupply: '92233720368', decimals: '8' }, 'maxSupply');
testFungibleError('fungible description too long', { description: 'x'.repeat(196) }, 'description');
testFungibleError('fungible multiple errors', { symbol: 'mtk', decimals: '99', logoUri: 'x'.repeat(196) }, 'symbol');

testAPIEquivalence('fungible API default');

testAPIEquivalence('fungible API basic', {
  name: 'CustomToken',
  symbol: 'CTK',
});

testAPIEquivalence('fungible API full', {
  name: 'CustomToken',
  symbol: 'CTK',
  decimals: '6',
  maxSupply: '500000',
  description: 'A token',
  logoUri: 'https://example.com/logo.png',
  externalLink: 'https://example.com',
  updatableMetadata: true,
  updatableMaxSupply: true,
  burnable: false,
  pausable: true,
  restrictions: 'allowlist',
  access: 'roles',
});

test('fungible API assert defaults', async t => {
  t.is(fungible.print(fungible.defaults), fungible.print());
});

test('fungible API isAccessControlRequired', async t => {
  t.is(fungible.isAccessControlRequired({ burnable: false }), true);
  t.is(fungible.isAccessControlRequired({ burnable: true }), false);
  t.is(fungible.isAccessControlRequired({ pausable: true, restrictions: 'blocklist' }), false);
});
