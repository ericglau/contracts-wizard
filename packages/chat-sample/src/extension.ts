import * as vscode from 'vscode';
import { registerToolUserChatParticipant } from './toolParticipant';
import { registerChatTools } from './tools';

export function activate(context: vscode.ExtensionContext) {
    registerToolUserChatParticipant(context);

    registerChatTools(context);
}

export function deactivate() { }
