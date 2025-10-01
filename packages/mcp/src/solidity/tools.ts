import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityAccount } from './tools/account';
import { registerSolidityCustom } from './tools/custom';
import { registerSolidityERC20 } from './tools/erc20';
import { registerSolidityERC721 } from './tools/erc721';
import { registerSolidityERC1155 } from './tools/erc1155';
import { registerSolidityGovernor } from './tools/governor';
import { registerSolidityStablecoin } from './tools/stablecoin';
import { registerSolidityRWA } from './tools/rwa';
import type { KindedOptions } from '@openzeppelin/wizard';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';

type SolidityToolRegisterFunctions = {
  [kind in keyof KindedOptions]: (server: McpServer) => RegisteredTool;
};

function getRegisterFunctions(server: McpServer): SolidityToolRegisterFunctions {
  return {
    ERC20: () => registerSolidityERC20(server),
    ERC721: () => registerSolidityERC721(server),
    ERC1155: () => registerSolidityERC1155(server),
    Stablecoin: () => registerSolidityStablecoin(server),
    RealWorldAsset: () => registerSolidityRWA(server),
    Account: () => registerSolidityAccount(server),
    Governor: () => registerSolidityGovernor(server),
    Custom: () => registerSolidityCustom(server),
  };
}

export function registerSolidityTools(server: McpServer) {
  Object.values(getRegisterFunctions(server)).forEach(registerTool => {
    registerTool(server);
  });
}
