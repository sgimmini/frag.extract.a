/* Contains the relevant changes to frag.edit's VSC extension
 * that enables support for communication with our Chrome extension
 * and adding fragments from that Chrome extension to the fragment database
 * Requires the frag.extract.host folder to be located in /out and "shelljs": "^0.8.3"
 * be declared under "dependencies" in package.json
 * Also requires extract.py to be ignored by vsce packaging tool and that
 * packaging happens on a machine running Linux
 * For proper cleanup add "vscode:uninstall": "node ./out/frag.extract.host/uninstall"
 * under "scripts" in package.json
 */

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

			var path = context.extensionPath + "/out/frag.extract.host/extract.py";

			fs.writeFile(path, result, 'utf8', function (err) {
				fs.chmod(path, 0o0755, function (err) {
					if (err) {
						return console.log(err);
					}
				});
			});
		});
		if (process.platform === 'win32') {
			shell.exec('"' + context.extensionPath + '"' + '\\out\\frag.extract.host\\install_host.bat');
		} else {
			shell.exec(context.extensionPath + '/out/frag.extract.host/install_host.sh');
		}
	}

	// (possibly old) stuff thats used by frag.edit extension, not relevant to integration of native messaging host
	var database = new Database(context.globalStoragePath + '/fragments.fragmentDatabase');
	const fragmentProvider = new FragmentProvider(context);
	var treeView = vscode.window.createTreeView('fragmentEditor', { treeDataProvider: fragmentProvider });
	vscode.commands.registerCommand('fragmentEditor.addFragment', () => fragmentProvider.addFragment());
	vscode.commands.registerCommand('fragmentEditor.editFragment', (treeItem: TreeItem) => fragmentProvider.editFragment(treeItem));
	vscode.commands.registerCommand('fragmentEditor.deleteTreeItem', (treeItem: TreeItem) => fragmentProvider.deleteTreeItem(treeItem));

	// refreshes the Fragmentlist everytime a change in the database is detected (5 sec intervall)
	fs.watchFile(context.globalStoragePath + '/fragments.fragmentDatabase', (curr, prev) => {
		// requires that loadFragments() actually loads a new in memory copy of the database to get the newly added fragments by the native messaging host
		Database.loadFragments();
		fragmentProvider.refresh();
	});
}

export function deactivate() { }
