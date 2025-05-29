import { solidityAccountAIFunctionDefinition, solidityCustomAIFunctionDefinition, solidityERC1155AIFunctionDefinition, solidityERC20AIFunctionDefinition, solidityERC721AIFunctionDefinition, solidityGovernorAIFunctionDefinition, solidityRealWorldAssetAIFunctionDefinition, solidityStablecoinAIFunctionDefinition } from '../../api/ai-assistant/function-definitions/solidity.ts';

function printFunctionParameters() {
  const solidityFunctionParameters = {
    erc20: solidityERC20AIFunctionDefinition.parameters,
    erc721: solidityERC721AIFunctionDefinition.parameters,
    erc1155: solidityERC1155AIFunctionDefinition.parameters,
    stablecoin: solidityStablecoinAIFunctionDefinition.parameters,
    rwa: solidityRealWorldAssetAIFunctionDefinition.parameters,
    account: solidityAccountAIFunctionDefinition.parameters,
    governor: solidityGovernorAIFunctionDefinition.parameters,
    custom: solidityCustomAIFunctionDefinition.parameters,
  };
  const jsonOutput = JSON.stringify(solidityFunctionParameters, null, 2);
  return jsonOutput;
}

async function printToFile() {
  const solidity = printFunctionParameters();
  const outDir = 'output';
  await Deno.mkdir(outDir, { recursive: true });
  await Deno.writeTextFile(`${outDir}/function-parameters-solidity.json`, solidity, { encoding: 'utf8' });
}

await printToFile();
