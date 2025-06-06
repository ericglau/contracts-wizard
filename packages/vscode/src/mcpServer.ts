import * as vscode from 'vscode';

export function registerMCPServer(context: vscode.ExtensionContext) {
	/**
	 * You can use proposed API here. `vscode.` should start auto complete
	 * Proposed API as defined in vscode.proposed.<proposalName>.d.ts.
	 */

	const didChangeEmitter = new vscode.EventEmitter<void>();

	context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider('openzeppelin-vscode-wizard.mcp', {
		onDidChangeMcpServerDefinitions: didChangeEmitter.event,
		provideMcpServerDefinitions: async () => {
			let servers: vscode.McpServerDefinition[] = [];

			servers.push(new vscode.McpStdioServerDefinition(
				'openzeppelin-wizard-mcp',
				'npx',
				['@ericglau/wizard-mcp'],
			));

			console.log('MCP registered!');

			return servers;
		}
	}));
}