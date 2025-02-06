import type { CommonOptions, CommonContractOptions } from './common-options';
import { printFungible, defaults as fungibledefaults, isAccessControlRequired as fungibleIsAccessControlRequired, FungibleOptions } from './fungible';

export interface WizardAccountAPI<Options extends CommonOptions>{
  /**
   * Returns a string representation of a contract generated using the provided options. If opts is not provided, uses `defaults`.
   */
  print: (opts?: Options) => string;

  /**
   * The default options that are used for `print`.
   */
  defaults: Required<Options>;
}

export interface WizardContractAPI<Options extends CommonContractOptions> {
  /**
   * Returns a string representation of a contract generated using the provided options. If opts is not provided, uses `defaults`.
   */
  print: (opts?: Options) => string;

  /**
   * The default options that are used for `print`.
   */
  defaults: Required<Options>;
}

export interface AccessControlAPI<Options extends CommonContractOptions> {
  /**
   * Whether any of the provided options require access control to be enabled. If this returns `true`, then calling `print` with the 
   * same options would cause the `access` option to default to `'ownable'` if it was `undefined` or `false`.
   */
  isAccessControlRequired: (opts: Partial<Options>) => boolean;
}

export type Fungible = WizardContractAPI<FungibleOptions> & AccessControlAPI<FungibleOptions>;

export const fungible: Fungible = {
  print: printFungible,
  defaults: fungibledefaults,
  isAccessControlRequired: fungibleIsAccessControlRequired,
};
