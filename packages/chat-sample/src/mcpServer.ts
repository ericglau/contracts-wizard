import * as vscode from 'vscode';

export function registerMCPServer(_context: vscode.ExtensionContext) {
	// This isn't supported yet in VS Code.

	// const didChangeEmitter = new vscode.EventEmitter<void>();

	// context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider('openzeppelin-wizard-mcp', {
	// 	onDidChangeMcpServerDefinitions: didChangeEmitter.event,
	// 	provideMcpServerDefinitions: async () => {
	// 		let servers: vscode.McpServerDefinition[] = [];

  //     servers.push(new vscode.McpStdioServerDefinition(
  //     {
  //       label: 'OpenZeppelin Contracts Wizard',
  //       command: 'npx',
  //       args: ['@ericglau/wizard-mcp'],
  //       version: '0.0.1-alpha.6'
  //     }));

	// 		return servers;
	// 	}
	// }));
}