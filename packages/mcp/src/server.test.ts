import _test from 'ava';
import { createServer } from './server';
import { version as pkgVersion } from '../package.json';

const test = _test;

test('should set server name and version from package.json', t => {
  const server = createServer();
  const info = (server.server as unknown as { [k: string]: any })['_serverInfo'];

  t.truthy(info, 'Underlying server info should be present');
  t.is(info.name, 'OpenZeppelin Contracts Wizard');
  t.is(info.version, pkgVersion);
});

test('should set usage instructions on the underlying server', t => {
  const server = createServer();
  const instructions = (server.server as unknown as { [k: string]: any })['_instructions'];

  t.truthy(instructions);
  t.true(typeof instructions === 'string');
  t.true(
    (instructions as string).includes('Tools are provided for different smart contract languages'),
    'Instructions should contain the expected usage guidance',
  );
});

test('should register all expected tools across ecosystems', t => {
  const server = createServer();
  const tools = (server as unknown as { [k: string]: any })['_registeredTools'] as Record<string, any>;

  t.truthy(tools, 'Registered tools map should exist');

  const expectedTools = [
    // Solidity
    'solidity-erc20',
    'solidity-erc721',
    'solidity-erc1155',
    'solidity-stablecoin',
    'solidity-rwa',
    'solidity-account',
    'solidity-governor',
    'solidity-custom',
    // Cairo
    'cairo-erc20',
    'cairo-erc721',
    'cairo-erc1155',
    'cairo-account',
    'cairo-multisig',
    'cairo-governor',
    'cairo-vesting',
    'cairo-custom',
    // Stellar
    'stellar-fungible',
    'stellar-stablecoin',
    'stellar-non-fungible',
    // Stylus
    'stylus-erc20',
    'stylus-erc721',
    'stylus-erc1155',
    // Confidential
    'confidential-fungible',
  ];

  const names = Object.keys(tools);
  for (const name of expectedTools) {
    t.true(names.includes(name), `Expected tool "${name}" to be registered`);
  }

  t.true(names.length >= expectedTools.length, 'Should not register fewer tools than expected');
});

test('registered tools should be enabled and have an input schema', t => {
  const server = createServer();
  const tools = (server as unknown as { [k: string]: any })['_registeredTools'] as Record<string, any>;

  // Sample a few representative tools from different ecosystems
  const sampleNames = [
    'solidity-erc20',
    'cairo-erc20',
    'stellar-fungible',
    'stylus-erc20',
    'confidential-fungible',
  ];

  for (const name of sampleNames) {
    const tool = tools[name];
    t.truthy(tool, `Tool ${name} should exist`);
    t.true(tool.enabled, `Tool ${name} should be enabled by default`);
    t.truthy(tool.inputSchema, `Tool ${name} should have an input schema`);
    t.true(typeof tool.inputSchema.safeParse === 'function', `Tool ${name} inputSchema should be a Zod object`);
    t.true(typeof tool.callback === 'function', `Tool ${name} should have a callback`);
  }
});

test('registered tool enable/disable toggles state', t => {
  const server = createServer();
  const tools = (server as unknown as { [k: string]: any })['_registeredTools'] as Record<string, any>;

  const name = 'solidity-erc20';
  const tool = tools[name];
  t.truthy(tool, `Tool ${name} should exist`);

  // Disable then enable and assert state changes
  tool.disable();
  t.false(tool.enabled, `Tool ${name} should be disabled after disable()`);
  tool.enable();
  t.true(tool.enabled, `Tool ${name} should be enabled after enable()`);
});

