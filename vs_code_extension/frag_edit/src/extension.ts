'use strict';

import * as vscode from 'vscode';
import shell = require('shelljs');
import fs = require('fs');
import { FragmentProvider } from './fragmentProvider';
import { Database } from './database';
import { TreeItem } from './treeItem';

export function activate(context: vscode.ExtensionContext) {
	// install process upon first activation
	if (!fs.existsSync(context.globalStoragePath)) {
		fs.mkdirSync(context.globalStoragePath);
	}
	if (!fs.existsSync(context.extensionPath + "/out/frag.extract.host/extract.py")) {
		fs.readFile(context.extensionPath + "/out/frag.extract.host/raw.py", 'utf8', function (err, data) {
			if (err) {
				return console.log(err);
			}
			var result = data.replace(/path/, context.globalStoragePath.replace(/\\/g, '/') + "/fragments.fragmentDatabase");

			var myFile = context.extensionPath + "/out/frag.extract.host/extract.py";

			fs.writeFile(myFile, result, 'utf8', (err) => {
				fs.chmod(myFile, 0o0755, (err) => {
				console.log('Changed file permissions');
				});
			});
		});
		if (process.platform === 'win32') {
			shell.exec('"' + context.extensionPath + '"' + '\\out\\frag.extract.host\\install_host.bat');
		} else {
			shell.exec(context.extensionPath + '/out/frag.extract.host/install_host.sh');
		}
	}

	var database = new Database(context.globalStoragePath);
	const fragmentProvider = new FragmentProvider(context);
	var treeView = vscode.window.createTreeView('fragmentEditor', { treeDataProvider: fragmentProvider });
	vscode.commands.registerCommand('fragmentEditor.addFragment', () => fragmentProvider.addFragment());
	vscode.commands.registerCommand('fragmentEditor.editFragment', (treeItem: TreeItem) => fragmentProvider.editFragment(treeItem));
	vscode.commands.registerCommand('fragmentEditor.deleteTreeItem', (treeItem: TreeItem) => fragmentProvider.deleteTreeItem(treeItem));
}

export function deactivate() { }
