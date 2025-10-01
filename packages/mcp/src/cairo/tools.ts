import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoAccount } from './tools/account';
import { registerCairoCustom } from './tools/custom';
import { registerCairoERC20 } from './tools/erc20';
import { registerCairoERC721 } from './tools/erc721';
import { registerCairoERC1155 } from './tools/erc1155';
import { registerCairoGovernor } from './tools/governor';
import { registerCairoMultisig } from './tools/multisig';
import { registerCairoVesting } from './tools/vesting';
import type { KindedOptions } from '@openzeppelin/wizard-cairo';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type CairoToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): CairoToolRegisterFunctions {
  return {
    ERC20: () => registerCairoERC20(server),
    ERC721: () => registerCairoERC721(server),
    ERC1155: () => registerCairoERC1155(server),
    Account: () => registerCairoAccount(server),
    Multisig: () => registerCairoMultisig(server),
    Governor: () => registerCairoGovernor(server),
    Vesting: () => registerCairoVesting(server),
    Custom: () => registerCairoCustom(server),
  };
}

export function registerCairoTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
