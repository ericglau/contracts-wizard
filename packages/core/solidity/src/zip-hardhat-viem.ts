import type { GenericOptions } from './build-generic';
import type { Contract } from './contract';
import type { Lines } from './utils/format-lines';
import { Hardhat3TestGenerator, Hardhat3ZipGenerator } from './zip-hardhat';
import type JSZip from 'jszip';

const UPGRADES_IMPORT_SPECIFIER = '@openzeppelin/hardhat-upgrades/viem';

/**
 * Generates the `test/test.ts` file for a Hardhat 3 + viem project.
 *
 * Differs from the ethers variant in that viem deploys without a contract factory, exposes reads
 * under `instance.read.*` with bigint arguments, and returns an already-resolved `instance.address`.
 */
class Hardhat3ViemTestGenerator extends Hardhat3TestGenerator {
  protected getUpgradesImportSpecifier(): string {
    return UPGRADES_IMPORT_SPECIFIER;
  }

  protected getClientBinding(): string {
    return 'viem';
  }

  protected getFactoryLines(): Lines[] {
    return [];
  }

  protected getPostDeployLines(): string[] {
    return [];
  }

  protected getAddressExpression(): string {
    return 'instance.address';
  }

  protected getReadCall(name: string, args: string[]): string {
    const argsList = args.length > 0 ? `[${args.map(arg => `${arg}n`).join(', ')}]` : '';
    return `instance.read.${name}(${argsList})`;
  }

  protected getSignerAddressExpression(i: number): string {
    return `(await viem.getWalletClients())[${i}].account.address`;
  }
}

/**
 * Generates a Hardhat 3 sample project that uses viem instead of ethers.
 *
 * Non-upgradeable projects use `@nomicfoundation/hardhat-viem` and Hardhat Ignition's viem
 * extension. Upgradeable projects use `@openzeppelin/hardhat-upgrades/viem`.
 */
export class Hardhat3ViemZipGenerator extends Hardhat3ZipGenerator {
  protected getConfigPlugins(upgradeable: boolean): { imports: string; plugins: string } {
    const viemImport = 'import hardhatViem from "@nomicfoundation/hardhat-viem";\n';
    return upgradeable
      ? {
          imports: viemImport + `import hardhatUpgrades from "${UPGRADES_IMPORT_SPECIFIER}";`,
          plugins: '[hardhatViem, hardhatUpgrades]',
        }
      : {
          imports: viemImport + 'import hardhatIgnitionViem from "@nomicfoundation/hardhat-ignition-viem";',
          plugins: '[hardhatViem, hardhatIgnitionViem]',
        };
  }

  protected getTest(c: Contract, opts?: GenericOptions): string {
    return new Hardhat3ViemTestGenerator(this).getContent(c, opts);
  }

  public getDeploymentCall(c: Contract, args: string[]): string {
    const argsList = args.join(', ');

    if (!c.upgradeable) {
      return `viem.deployContract("${c.name}"${args.length > 0 ? `, [${argsList}]` : ''})`;
    }

    return this.needsUnsafeAllowConstructor(c)
      ? `upgradesApi.deployProxy("${c.name}", [${argsList}], { unsafeAllow: ['constructor'] })`
      : `upgradesApi.deployProxy("${c.name}", [${argsList}])`;
  }

  protected getScriptUpgradesImportSpecifier(): string {
    return UPGRADES_IMPORT_SPECIFIER;
  }

  // viem's deploy helpers take the connection's `viem` client implicitly via `upgradesApi`, so the
  // script needs neither a client binding nor a contract factory, and deploys resolve eagerly.
  protected getScriptClientLine(): string {
    return '';
  }

  protected getScriptFactorySection(): string {
    return '';
  }

  protected getScriptPostDeploySection(): string {
    return '';
  }

  protected getScriptAddressExpression(): string {
    return 'instance.address';
  }

  protected async getPackageJson(c: Contract): Promise<unknown> {
    const { default: packageJson } = c.upgradeable
      ? await import('./environments/hardhat-viem/upgradeable/package.json')
      : await import('./environments/hardhat-viem/package.json');
    packageJson.license = c.license;
    return packageJson;
  }

  protected async getPackageLock(c: Contract): Promise<unknown> {
    const { default: packageLock } = c.upgradeable
      ? await import('./environments/hardhat-viem/upgradeable/package-lock.json')
      : await import('./environments/hardhat-viem/package-lock.json');
    packageLock.packages[''].license = c.license;
    return packageLock;
  }
}

export async function zipHardhatViem(c: Contract, opts?: GenericOptions): Promise<JSZip> {
  return new Hardhat3ViemZipGenerator().zipHardhat(c, opts);
}
