import * as vscode from 'vscode';
import { registerToolUserChatParticipant } from './toolParticipant';
import { registerChatTools } from './tools';
import { registerMCPServer } from './mcpServer';

export function activate(context: vscode.ExtensionContext) {
    registerMCPServer(context);

    registerToolUserChatParticipant(context);

    registerChatTools(context);
}

export function deactivate() { }
