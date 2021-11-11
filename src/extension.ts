// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {
	vscodeLoremImage as loremImage
} from "./lorem";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('"lorem-space" is now active!');
	context.subscriptions.push(vscode.commands.registerCommand('lorem-space.image', loremImage));
}

// this method is called when your extension is deactivated
export function deactivate() {}
