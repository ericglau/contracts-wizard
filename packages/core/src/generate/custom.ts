import type { CustomOptions } from '../custom';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';
import { opSecOptions } from '../set-op-sec';

const booleans = [true, false];

const blueprint = {
  name: ['MyContract'],
  pausable: booleans,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
  opSec: opSecOptions,
};

export function* generateCustomOptions(): Generator<Required<CustomOptions>> {
  yield* generateAlternatives(blueprint);
}
