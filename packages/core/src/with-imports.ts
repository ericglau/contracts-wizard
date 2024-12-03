import type { Contract } from './contract';
import { printContract } from './print';
import { reachable } from './utils/transitive-closure';

import contracts from '../openzeppelin-contracts';
import { withHelpers } from './options';

export function withImports(c: Contract): Record<string, string> {
  const { transformImport } = withHelpers(c);

  const result: Record<string, string> = {};

  const fileName = c.name + '.sol';

  const dependencies = {
    [fileName]: c.imports.map(i => transformImport(i).path),
    ...contracts.dependencies,
  };

  const allImports = reachable(dependencies, fileName);

  const mainContract = printContract(c);

  result[fileName] = mainContract;

  for (const importPath of allImports) {
    const source = contracts.sources[importPath];
    if (source === undefined) {
      throw new Error(`Source for ${importPath} not found`);
    }
    result[importPath] = source;
  }

  return result;
}