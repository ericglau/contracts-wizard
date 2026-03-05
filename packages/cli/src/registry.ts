import type { z } from 'zod';

import { erc20, erc721, erc1155, stablecoin, realWorldAsset, account, governor, custom } from '@openzeppelin/wizard';
import { solidityPrompts } from '@openzeppelin/wizard-common';
import {
  solidityERC20Schema,
  solidityERC721Schema,
  solidityERC1155Schema,
  solidityStablecoinSchema,
  solidityRWASchema,
  solidityAccountSchema,
  solidityGovernorSchema,
  solidityCustomSchema,
} from '@openzeppelin/wizard-common/schemas';

import {
  erc20 as cairoErc20,
  erc721 as cairoErc721,
  erc1155 as cairoErc1155,
  account as cairoAccount,
  multisig as cairoMultisig,
  governor as cairoGovernor,
  vesting as cairoVesting,
  custom as cairoCustom,
} from '@openzeppelin/wizard-cairo';
import { cairoPrompts } from '@openzeppelin/wizard-common';
import {
  cairoERC20Schema,
  cairoERC721Schema,
  cairoERC1155Schema,
  cairoAccountSchema,
  cairoMultisigSchema,
  cairoGovernorSchema,
  cairoVestingSchema,
  cairoCustomSchema,
} from '@openzeppelin/wizard-common/schemas';

import { fungible, stablecoin as stellarStablecoin, nonFungible } from '@openzeppelin/wizard-stellar';
import { stellarPrompts } from '@openzeppelin/wizard-common';
import {
  stellarFungibleSchema,
  stellarStablecoinSchema,
  stellarNonFungibleSchema,
} from '@openzeppelin/wizard-common/schemas';

import {
  erc20 as stylusErc20,
  erc721 as stylusErc721,
  erc1155 as stylusErc1155,
} from '@openzeppelin/wizard-stylus';
import { stylusPrompts } from '@openzeppelin/wizard-common';
import {
  stylusERC20Schema,
  stylusERC721Schema,
  stylusERC1155Schema,
} from '@openzeppelin/wizard-common/schemas';

import { erc7984 } from '@openzeppelin/wizard-confidential';
import { confidentialPrompts } from '@openzeppelin/wizard-common';
import { confidentialERC7984Schema } from '@openzeppelin/wizard-common/schemas';

import { hooks } from '@openzeppelin/wizard-uniswap-hooks';
import { uniswapHooksPrompts } from '@openzeppelin/wizard-common';
import { uniswapHooksHooksSchema } from '@openzeppelin/wizard-common/schemas';

export interface RegistryEntry {
  schema: z.ZodRawShape;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  print: (opts: any) => string;
  description: string;
}

export const registry: Record<string, RegistryEntry> = {
  // Solidity
  'solidity-erc20': { schema: solidityERC20Schema, print: opts => erc20.print(opts), description: solidityPrompts.ERC20 },
  'solidity-erc721': { schema: solidityERC721Schema, print: opts => erc721.print(opts), description: solidityPrompts.ERC721 },
  'solidity-erc1155': { schema: solidityERC1155Schema, print: opts => erc1155.print(opts), description: solidityPrompts.ERC1155 },
  'solidity-stablecoin': { schema: solidityStablecoinSchema, print: opts => stablecoin.print(opts), description: solidityPrompts.Stablecoin },
  'solidity-rwa': { schema: solidityRWASchema, print: opts => realWorldAsset.print(opts), description: solidityPrompts.RWA },
  'solidity-account': { schema: solidityAccountSchema, print: opts => account.print(opts), description: solidityPrompts.Account },
  'solidity-governor': { schema: solidityGovernorSchema, print: opts => governor.print(opts), description: solidityPrompts.Governor },
  'solidity-custom': { schema: solidityCustomSchema, print: opts => custom.print(opts), description: solidityPrompts.Custom },

  // Cairo
  'cairo-erc20': { schema: cairoERC20Schema, print: opts => cairoErc20.print(opts), description: cairoPrompts.ERC20 },
  'cairo-erc721': { schema: cairoERC721Schema, print: opts => cairoErc721.print(opts), description: cairoPrompts.ERC721 },
  'cairo-erc1155': { schema: cairoERC1155Schema, print: opts => cairoErc1155.print(opts), description: cairoPrompts.ERC1155 },
  'cairo-account': { schema: cairoAccountSchema, print: opts => cairoAccount.print(opts), description: cairoPrompts.Account },
  'cairo-multisig': { schema: cairoMultisigSchema, print: opts => cairoMultisig.print(opts), description: cairoPrompts.Multisig },
  'cairo-governor': { schema: cairoGovernorSchema, print: opts => cairoGovernor.print(opts), description: cairoPrompts.Governor },
  'cairo-vesting': { schema: cairoVestingSchema, print: opts => cairoVesting.print(opts), description: cairoPrompts.Vesting },
  'cairo-custom': { schema: cairoCustomSchema, print: opts => cairoCustom.print(opts), description: cairoPrompts.Custom },

  // Stellar
  'stellar-fungible': { schema: stellarFungibleSchema, print: opts => fungible.print(opts), description: stellarPrompts.Fungible },
  'stellar-stablecoin': { schema: stellarStablecoinSchema, print: opts => stellarStablecoin.print(opts), description: stellarPrompts.Stablecoin },
  'stellar-non-fungible': { schema: stellarNonFungibleSchema, print: opts => nonFungible.print(opts), description: stellarPrompts.NonFungible },

  // Stylus
  'stylus-erc20': { schema: stylusERC20Schema, print: opts => stylusErc20.print(opts), description: stylusPrompts.ERC20 },
  'stylus-erc721': { schema: stylusERC721Schema, print: opts => stylusErc721.print(opts), description: stylusPrompts.ERC721 },
  'stylus-erc1155': { schema: stylusERC1155Schema, print: opts => stylusErc1155.print(opts), description: stylusPrompts.ERC1155 },

  // Confidential
  'confidential-erc7984': { schema: confidentialERC7984Schema, print: opts => erc7984.print(opts), description: confidentialPrompts.ERC7984 },

  // Uniswap Hooks
  'uniswap-hooks': { schema: uniswapHooksHooksSchema, print: opts => hooks.print(opts), description: uniswapHooksPrompts.Hooks },
};
