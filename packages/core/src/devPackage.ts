import type JSZip from 'jszip';
import type { Contract } from './contract';

import { packageHardhat } from './environments/hardhat'

export function packageContract(c: Contract): JSZip {
  return packageHardhat(c);
}
