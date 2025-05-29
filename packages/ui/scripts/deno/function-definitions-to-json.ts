import { solidityERC20AIFunctionDefinition } from '../../api/ai-assistant/function-definitions/solidity.ts';

function convertFunctionDefinitionsToJSON() {
  const functionDefinitions = solidityERC20AIFunctionDefinition;
  const jsonOutput = JSON.stringify(functionDefinitions, null, 2);
  return jsonOutput;
}

async function printToFile() {
  const output = convertFunctionDefinitionsToJSON();
  await Deno.writeTextFile('function-definitions.json', output, { encoding: 'utf8' });
}

await printToFile();
