import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import type { StablecoinOptions } from '../stablecoin';
import { generateAlternatives } from './alternatives';
import { bridgeableOptions } from './erc20';

const booleans = [true, false];

const erc20Basic = {
  name: ['MyStablecoin'],
  symbol: ['MST'],
  burnable: [false] as const,
  pausable: [false] as const,
  mintable: [false] as const,
  permit: [false] as const,
  votes: [false] as const,
  flashmint: [false] as const,
  premint: ['1'],
  bridgeable: [false] as const,
  access: [false] as const,
  info: [{}] as const,
}

const erc20Full = {
  name: ['MyStablecoin'],
  symbol: ['MST'],
  burnable: [true] as const,
  pausable: [true] as const,
  mintable: [true] as const,
  permit: [true] as const,
  votes: ['timestamp'] as const,
  flashmint: [true] as const,
  premint: ['1'],
  bridgeable: bridgeableOptions,
  access: accessOptions,
  info: infoOptions,
};

const stablecoinExtensions = {
  limitations: [false, 'allowlist', 'blocklist'] as const,
  custodian: booleans,
  upgradeable: [false] as const,
};

export function* generateStablecoinOptions(): Generator<Required<StablecoinOptions>> {
  yield* generateAlternatives({ ...erc20Basic, ...stablecoinExtensions });
  yield* generateAlternatives({ ...erc20Full, ...stablecoinExtensions });
}
