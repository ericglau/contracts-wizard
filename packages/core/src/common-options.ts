import type { Access } from "./set-access-control";
import type { Info } from "./set-info";
import { defaults as infoDefaults } from "./set-info";
import type { OpSec } from "./set-op-sec";
import type { Upgradeable } from "./set-upgradeable";
import { defaults as opSecDefaults } from "./set-op-sec";

export const defaults: Required<CommonOptions> = {
  access: false,
  upgradeable: false,
  info: infoDefaults,
  opSec: opSecDefaults,
} as const;

export interface CommonOptions {
  access?: Access;
  upgradeable?: Upgradeable;
  info?: Info;
  opSec?: OpSec;
}

export function withCommonDefaults(opts: CommonOptions): Required<CommonOptions> {
  return {
    access: opts.access ?? false,
    upgradeable: opts.upgradeable ?? false,
    info: opts.info ?? {},
    opSec: opts.opSec ?? {},
  };
}
