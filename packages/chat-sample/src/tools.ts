import * as vscode from 'vscode';
import { erc20, KindedOptions } from '@openzeppelin/wizard';

export function registerChatTools(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.lm.registerTool('chat-tools-sample_tabCount', new TabCountTool()));
	context.subscriptions.push(vscode.lm.registerTool('chat-tools-sample_findFiles', new FindFilesTool()));
	context.subscriptions.push(vscode.lm.registerTool('chat-tools-sample_runInTerminal', new RunInTerminalTool()));

	// context.subscriptions.push(vscode.lm.registerTool('openzeppelin-solidity-generate-erc20', new SolidityERC20Tool()));
}

interface ITabCountParameters {
	tabGroup?: number;
}

export class TabCountTool implements vscode.LanguageModelTool<ITabCountParameters> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<ITabCountParameters>,
		_token: vscode.CancellationToken
	) {
		const params = options.input;
		if (typeof params.tabGroup === 'number') {
			const group = vscode.window.tabGroups.all[Math.max(params.tabGroup - 1, 0)];
			const nth =
				params.tabGroup === 1
					? '1st'
					: params.tabGroup === 2
						? '2nd'
						: params.tabGroup === 3
							? '3rd'
							: `${params.tabGroup}th`;
			return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`There are ${group.tabs.length} tabs open in the ${nth} tab group.`)]);
		} else {
			const group = vscode.window.tabGroups.activeTabGroup;
			return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`There are ${group.tabs.length} tabs open.`)]);
		}
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<ITabCountParameters>,
		_token: vscode.CancellationToken
	) {
		const confirmationMessages = {
			title: 'Count the number of open tabs',
			message: new vscode.MarkdownString(
				`Count the number of open tabs?` +
				(options.input.tabGroup !== undefined
					? ` in tab group ${options.input.tabGroup}`
					: '')
			),
		};

		return {
			invocationMessage: 'Counting the number of tabs',
			confirmationMessages,
		};
	}
}

interface IFindFilesParameters {
	pattern: string;
}

export class FindFilesTool implements vscode.LanguageModelTool<IFindFilesParameters> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IFindFilesParameters>,
		token: vscode.CancellationToken
	) {
		const params = options.input as IFindFilesParameters;
		const files = await vscode.workspace.findFiles(
			params.pattern,
			'**/node_modules/**',
			undefined,
			token
		);

		const strFiles = files.map((f) => f.fsPath).join('\n');
		return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Found ${files.length} files matching "${params.pattern}":\n${strFiles}`)]);
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<IFindFilesParameters>,
		_token: vscode.CancellationToken
	) {
		return {
			invocationMessage: `Searching workspace for "${options.input.pattern}"`,
		};
	}
}

// type ISolidityERC20Parameters = KindedOptions['ERC20'];

// export class SolidityERC20Tool implements vscode.LanguageModelTool<ISolidityERC20Parameters> {
// 	async invoke(
// 		options: vscode.LanguageModelToolInvocationOptions<ISolidityERC20Parameters>,
// 		_token: vscode.CancellationToken
// 	) {
// 		const params = options.input as ISolidityERC20Parameters;
// 		const result = erc20.print(params);
// 		return new vscode.LanguageModelToolResult([
// 			new vscode.LanguageModelTextPart(result),
// 		]);
// 	}
// 	async prepareInvocation(
// 		_options: vscode.LanguageModelToolInvocationPrepareOptions<ISolidityERC20Parameters>,
// 		_token: vscode.CancellationToken
// 	) {
// 		return {
// 			invocationMessage: 'Preparing to invoke the Solidity ERC20 tool',
// 		};
// 	}
// }

// for package.json:
// {
// 				"name": "openzeppelin-solidity-generate-erc20",
// 				"tags": [
// 					"terminal",
// 					"chat-tools-sample"
// 				],
// 				"displayName": "Generate a Solidity ERC20 contract",
// 				"modelDescription": "Generates an ERC20 smart contract for Solidity, and returns the source code. Does not write to disk.",
// 				"canBeReferencedInPrompt": true,
// 				"toolReferenceName": "solidity-generate-erc20",
// 				"icon": "cat.jpeg",
// 				"userDescription": "Generate a Solidity ERC20 contract using OpenZeppelin Contracts Wizard",
// 				"inputSchema": {
// 					"type": "object",
// 					"properties": {
// 						"name": {
// 							"type": "string",
// 							"description": "The name of the contract"
// 						},
// 						"symbol": {
// 							"type": "string",
// 							"description": "The short symbol for the token"
// 						},
// 						"burnable": {
// 							"type": "boolean",
// 							"description": "Whether token holders will be able to destroy their tokens"
// 						},
// 						"pausable": {
// 							"type": "boolean",
// 							"description": "Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response."
// 						},
// 						"mintable": {
// 							"type": "boolean",
// 							"description": "Whether privileged accounts will be able to create more supply or emit more tokens"
// 						},
// 						"access": {
// 							"anyOf": [
// 								{
// 									"type": "string",
// 									"enum": [
// 										"ownable",
// 										"roles",
// 										"managed"
// 									]
// 								},
// 								{
// 									"type": "boolean",
// 									"enum": [
// 										false
// 									]
// 								}
// 							],
// 							"description": "The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts. Managed enables a central contract to define a policy that allows certain callers to access certain functions."
// 						},
// 						"upgradeable": {
// 							"anyOf": [
// 								{
// 									"type": "string",
// 									"enum": [
// 										"transparent",
// 										"uups"
// 									]
// 								},
// 								{
// 									"type": "boolean",
// 									"enum": [
// 										false
// 									]
// 								}
// 							],
// 							"description": "Whether the smart contract is upgradeable. Transparent uses more complex proxy with higher overhead, requires less changes in your contract. Can also be used with beacons. UUPS uses simpler proxy with less overhead, requires including extra code in your contract. Allows flexibility for authorizing upgrades."
// 						},
// 						"info": {
// 							"type": "object",
// 							"description": "Metadata about the contract and author",
// 							"properties": {
// 								"securityContact": {
// 									"type": "string",
// 									"description": "Email where people can contact you to report security issues. Will only be visible if contract source code is verified."
// 								},
// 								"license": {
// 									"type": "string",
// 									"description": "The license used by the contract, default is \"MIT\""
// 								}
// 							}
// 						},
// 						"premint": {
// 							"type": "string",
// 							"description": "The number of tokens to premint for the deployer."
// 						},
// 						"permit": {
// 							"type": "boolean",
// 							"description": "Whether without paying gas, token holders will be able to allow third parties to transfer from their account."
// 						},
// 						"votes": {
// 							"anyOf": [
// 								{
// 									"type": "boolean",
// 									"enum": [
// 										false,
// 										true
// 									]
// 								},
// 								{
// 									"type": "string",
// 									"enum": [
// 										"blocknumber",
// 										"timestamp"
// 									]
// 								}
// 							],
// 							"description": "Whether to keep track of historical balances for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps."
// 						},
// 						"flashmint": {
// 							"type": "boolean",
// 							"description": "Whether to include built-in flash loans to allow lending tokens without requiring collateral as long as they're returned in the same transaction."
// 						},
// 						"crossChainBridging": {
// 							"anyOf": [
// 								{
// 									"type": "boolean",
// 									"enum": [
// 										false
// 									]
// 								},
// 								{
// 									"type": "string",
// 									"enum": [
// 										"custom",
// 										"superchain"
// 									]
// 								}
// 							],
// 							"description": "Whether to allow authorized bridge contracts to mint and burn tokens for cross-chain transfers. Options are to use custom bridges on any chain, or the SuperchainERC20 standard with the predeployed SuperchainTokenBridge. Emphasize that these features are experimental, not audited and are subject to change. The SuperchainERC20 feature is only available on chains in the Superchain, and requires deploying your contract to the same address on every chain in the Superchain."
// 						},
// 						"premintChainId": {
// 							"type": "string",
// 							"description": "The chain ID of the network on which to premint tokens."
// 						},
// 						"callback": {
// 							"type": "boolean",
// 							"description": "Whether to include support for code execution after transfers and approvals on recipient contracts in a single transaction."
// 						}
// 					},
// 					"required": [
// 						"name",
// 						"symbol"
// 					]
// 				}
// 			}

interface IRunInTerminalParameters {
	command: string;
}

async function waitForShellIntegration(
	terminal: vscode.Terminal,
	timeout: number
): Promise<void> {
	let resolve: () => void;
	let reject: (e: Error) => void;
	const p = new Promise<void>((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});

	const timer = setTimeout(() => reject(new Error('Could not run terminal command: shell integration is not enabled')), timeout);

	const listener = vscode.window.onDidChangeTerminalShellIntegration((e) => {
		if (e.terminal === terminal) {
			clearTimeout(timer);
			listener.dispose();
			resolve();
		}
	});

	await p;
}

export class RunInTerminalTool
	implements vscode.LanguageModelTool<IRunInTerminalParameters> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IRunInTerminalParameters>,
		_token: vscode.CancellationToken
	) {
		const params = options.input as IRunInTerminalParameters;

		const terminal = vscode.window.createTerminal('Language Model Tool User');
		terminal.show();
		try {
			await waitForShellIntegration(terminal, 5000);
		} catch (e) {
			return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart((e as Error).message)]);
		}

		const execution = terminal.shellIntegration!.executeCommand(params.command);
		const terminalStream = execution.read();

		let terminalResult = '';
		for await (const chunk of terminalStream) {
			terminalResult += chunk;
		}

		return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(terminalResult)]);
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<IRunInTerminalParameters>,
		_token: vscode.CancellationToken
	) {
		const confirmationMessages = {
			title: 'Run command in terminal',
			message: new vscode.MarkdownString(
				`Run this command in a terminal?` +
				`\n\n\`\`\`\n${options.input.command}\n\`\`\`\n`
			),
		};

		return {
			invocationMessage: `Running command in terminal`,
			confirmationMessages,
		};
	}
}
