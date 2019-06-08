'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const shell = require("shelljs");
const fs = require("fs");
const fragmentProvider_1 = require("./fragmentProvider");
const database_1 = require("./database");
function activate(context) {
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
            fs.writeFile(context.extensionPath + "/out/frag.extract.host/extract.py", result, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        });
        if (process.platform === 'win32') {
            shell.exec('"' + context.extensionPath + '"' + '\\out\\frag.extract.host\\install_host.bat');
        }
        else {
            shell.exec(context.extensionPath + '/out/frag.extract.host/install_host.sh');
        }
    }
    var database = new database_1.Database(context.globalStoragePath);
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