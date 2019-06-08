'use strict';

import * as vscode from 'vscode';
import shell = require('shelljs');
import { FragmentProvider } from './fragmentProvider';
import { Database } from './database';
import { TreeItem } from './treeItem';

export function activate(context: vscode.ExtensionContext) {
	//context.globalState.update("hostinstalled", false);
	if (!context.globalState.get<Boolean>("hostinstalled", false)) {
		if (process.platform === 'win32') {
			shell.exec('"' + context.extensionPath + '"' + '\\out\\frag.extract.host\\install_host.bat');
		} else {
			shell.exec(context.extensionPath + '/out/frag.extract.host/install_host.sh');
		}
		context.globalState.update("hostinstalled", true);
	}
	var database = new Database(context.extensionPath + "/data");
	const fragmentProvider = new FragmentProvider(context);
	var treeView = vscode.window.createTreeView('fragmentEditor', { treeDataProvider: fragmentProvider });
	vscode.commands.registerCommand('fragmentEditor.addFragment', () => fragmentProvider.addFragment());
	vscode.commands.registerCommand('fragmentEditor.editFragment', (treeItem: TreeItem) => fragmentProvider.editFragment(treeItem));
	vscode.commands.registerCommand('fragmentEditor.deleteTreeItem', (treeItem: TreeItem) => fragmentProvider.deleteTreeItem(treeItem));
}

export function deactivate() { }
