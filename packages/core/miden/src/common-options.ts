import type { Info } from './set-info';
import { defaults as infoDefaults } from './set-info';

export const accessOptions = [false, 'ownable', 'roles'] as const;

/**
 * How privileged operations of the faucet account are authorized.
 *
 * - `false`: the faucet is a user account authenticated by a single signature. The key holder is the sole
 *   authority over the faucet.
 * - `'ownable'`: the faucet is a network account whose privileged procedures are gated by an owner account,
 *   with two-step ownership transfer.
 * - `'roles'`: the faucet is a network account with role-based access control.
 */
export type Access = (typeof accessOptions)[number];

export const DEFAULT_ACCESS_CONTROL = 'ownable';

export const restrictionsOptions = [false, 'allowlist', 'blocklist'] as const;

/**
 * Transfer restrictions enforced through the faucet's send and receive policies.
 */
export type Restrictions = (typeof restrictionsOptions)[number];

export const defaults: Required<CommonOptions> = {
  info: infoDefaults,
} as const;

export const contractDefaults: Required<CommonContractOptions> = {
  ...defaults,
  access: false,
} as const;

export interface CommonOptions {
  info?: Info;
}

export interface CommonContractOptions extends CommonOptions {
  access?: Access;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    info: opts.info ?? defaults.info,
  };
}

export function withCommonContractDefaults(opts: CommonContractOptions): Required<CommonContractOptions> {
  return {
    ...withCommonDefaults(opts),
    access: opts.access ?? contractDefaults.access,
  };
}
