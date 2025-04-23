import type { Access } from './set-access-control';
import type { Info } from './set-info';
import { defaults as infoDefaults } from './set-info';
import type { Upgradeable } from './set-upgradeable';

export const defaults: Required<CommonOptions> = {
  upgradeable: false,
  info: infoDefaults,
} as const;

export const contractDefaults: Required<CommonContractOptions> = {
  ...defaults,
  access: false,
} as const;

export interface CommonOptions {
  upgradeable?: Upgradeable;
  info?: Info;
}

export interface CommonContractOptions extends CommonOptions {
  access?: Access;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    upgradeable: opts.upgradeable ?? defaults.upgradeable,
    info: opts.info ?? defaults.info,
  };
}

export function withCommonContractDefaults(opts: CommonContractOptions): Required<CommonContractOptions> {
  return {
    ...withCommonDefaults(opts),
    access: opts.access ?? contractDefaults.access,
  };
}
