'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const shell = require("shelljs");
const fragmentProvider_1 = require("./fragmentProvider");
const database_1 = require("./database");
function activate(context) {
    //context.globalState.update("hostinstalled", false);
    if (!context.globalState.get("hostinstalled", false)) {
        if (process.platform === 'win32') {
            shell.exec('"' + context.extensionPath + '"' + '\\out\\frag.extract.host\\install_host.bat');
        }
        else {
            shell.exec(context.extensionPath + '/out/frag.extract.host/install_host.sh');
        }
        context.globalState.update("hostinstalled", true);
    }
    var database = new database_1.Database(context.extensionPath + "/data");
    const fragmentProvider = new fragmentProvider_1.FragmentProvider(context);
    var treeView = vscode.window.createTreeView('fragmentEditor', { treeDataProvider: fragmentProvider });
    vscode.commands.registerCommand('fragmentEditor.addFragment', () => fragmentProvider.addFragment());
    vscode.commands.registerCommand('fragmentEditor.editFragment', (treeItem) => fragmentProvider.editFragment(treeItem));
    vscode.commands.registerCommand('fragmentEditor.deleteTreeItem', (treeItem) => fragmentProvider.deleteTreeItem(treeItem));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map