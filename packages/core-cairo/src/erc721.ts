import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { addPausable, setPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, withImplicitArgs } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { defineModules } from './utils/define-modules';

export interface ERC721Options extends CommonOptions {
  name: string;
  symbol: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
}

export function buildERC721(opts: ERC721Options): Contract {
  const c = new ContractBuilder();

  const { access, upgradeable, info } = withCommonDefaults(opts);

  addBase(c, opts.name, opts.symbol);
  addSupportsInterface(c);

  c.addFunction(functions.name);
  c.addFunction(functions.symbol);
  c.addFunction(functions.balanceOf);
  c.addFunction(functions.ownerOf);
  c.addFunction(functions.getApproved);
  c.addFunction(functions.isApprovedForAll);
  c.addFunction(functions.tokenURI);

  c.addFunction(functions.approve);
  c.addFunction(functions.setApprovalForAll);
  c.addFunction(functions.transferFrom);
  c.addFunction(functions.safeTransferFrom);

  if (opts.pausable) {
    addPausable(c, access, [functions.approve, functions.setApprovalForAll, functions.transferFrom, functions.safeTransferFrom]);
    if (opts.burnable) {
      setPausable(c, functions.burn);
    }
    if (opts.mintable) {
      setPausable(c, functions.safeMint);
    }
  }

  if (opts.burnable) {
    addBurnable(c);
  }

  if (opts.mintable) {
    addMintable(c, access);
  }

  setUpgradeable(c, upgradeable);

  setInfo(c, info);

  return c;
}

function addSupportsInterface(c: ContractBuilder) {
  c.addParentLibrary(
    modules.ERC165, [], [], false
  );
  c.addFunction(functions.supportsInterface);
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addParentLibrary(
    modules.ERC721,
    [name, symbol],
    ['ERC721_approve', 'ERC721_setApprovalForAll', 'ERC721_transferFrom', 'ERC721_safeTransferFrom', 'ERC721_initializer', ],
    // TODO use initializable boolean to determine if parent initializer is imported
  );
}

function addBurnable(c: ContractBuilder) {
  c.addFunction(functions.burn);
  c.addParentFunctionImport(
    // TODO have a way when defining the function to specify that this has multiple "base" functions (e.g. multiple parents)
    modules.ERC721,
    'ERC721_only_token_owner',
  );
  c.setFunctionBody(
    [
      'ERC721_only_token_owner(tokenId)',
      'ERC721_burn(tokenId)'
    ],
    functions.burn
  );
}

function addMintable(c: ContractBuilder, access: Access) {
  setAccessControl(c, functions.safeMint, access);
  c.addParentFunctionImport(
    // TODO have a way when defining the function to specify that this has multiple "base" functions (e.g. multiple parents)
    modules.ERC721,
    'ERC721_setTokenURI',
  );
  c.setFunctionBody(
    [
      'ERC721_safeMint(to, tokenId, data_len, data)', 
      'ERC721_setTokenURI(tokenId, tokenURI)'
    ],
    functions.safeMint
  );
}

const modules = defineModules( {
  ERC165: {
    path: 'openzeppelin.introspection.ERC165',
    usePrefix: true
  },

  ERC721: {
    path: 'openzeppelin/token/erc721/library',
    usePrefix: true
  },
})

const functions = defineFunctions({

  // --- view functions ---

  supportsInterface: {
    module: modules.ERC165,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'interfaceId', type: 'felt' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    passthrough: true,
    parentFunctionName: 'supports_interface',
  },

  name: {
    module: modules.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'name', type: 'felt' }],
    passthrough: true,
  },

  symbol: {
    module: modules.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'symbol', type: 'felt' }],
    passthrough: true,
  },

  balanceOf: {
    module: modules.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'owner', type: 'felt' },
    ],
    returns: [{ name: 'balance', type: 'Uint256' }],
    passthrough: true,
  },

  ownerOf: {
    module: modules.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'token_id', type: 'Uint256' },
    ],
    returns: [{ name: 'owner', type: 'felt' }],
    passthrough: true,
  },

  getApproved: {
    module: modules.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'token_id', type: 'Uint256' },
    ],
    returns: [{ name: 'approved', type: 'felt' }],
    passthrough: true,
  },

  isApprovedForAll: {
    module: modules.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'owner', type: 'felt' },
      { name: 'operator', type: 'felt' },
    ],
    returns: [{ name: 'isApproved', type: 'felt' }],
    passthrough: true,
  },

  tokenURI: {
    module: modules.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'tokenId', type: 'Uint256' },
    ],
    returns: [{ name: 'tokenURI', type: 'felt' }],
    passthrough: true,
  },

  // --- external functions ---

  approve: {
    module: modules.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
    ],
  },

  setApprovalForAll: {
    module: modules.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'operator', type: 'felt' },
      { name: 'approved', type: 'felt' },
    ],
  },

  transferFrom: {
    module: modules.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'from_', type: 'felt' },
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
    ],
  },

  safeTransferFrom: {
    module: modules.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'from_', type: 'felt' },
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
      { name: 'data_len', type: 'felt' },
      { name: 'data', type: 'felt*' },
    ],
  },

  safeMint: {
    module: modules.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
      { name: 'data_len', type: 'felt' },
      { name: 'data', type: 'felt*' },
      { name: 'tokenURI', type: 'felt' },
    ],
  },
  
  burn: {
    module: modules.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'tokenId', type: 'Uint256' },
    ],
  },

});