"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fragment_1 = require("./fragment");
const database_1 = require("./database");
const fragmentEditor_1 = require("./fragmentEditor");
const parametrization_1 = require("./parametrization");
const treeItem_1 = require("./treeItem");
/**
 * Provides TreeItems that should be displayed in a tree view
 */
class FragmentProvider {
    constructor(context) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.createTreeStructure();
        this._fragmentEditor = new fragmentEditor_1.FragmentEditor(context, this);
    }
    /**
     * Creates all necessary TreeItems after it deletes all previous TreeItems
     */
    createTreeStructure() {
        // Clear existing TreeItems
        database_1.Database.loadedTreeItems = [];
        var fragments = database_1.Database.getFragments();
        if (fragments !== undefined) {
            fragments.forEach((fragment) => {
                if (fragment !== undefined) {
                    var tags = fragment.tags;
                    if (tags !== undefined && tags.length !== 0) {
                        var tagList = tags.split(',');
                        tagList.forEach((tag) => {
                            if (tag.length !== 0 && tag !== ',') {
                                if (database_1.Database.getTreeItem(tag) === undefined) {
                                    var newTag = new treeItem_1.TreeItem({ label: tag, contextValue: "tag" });
                                    database_1.Database.addTreeItem(newTag);
                                }
                                var newFragment = new treeItem_1.TreeItem({ label: fragment.label + " [TAG:" + tag.toUpperCase() + "]", contextValue: "fragment", tag: tag, fragment: fragment.label });
                                database_1.Database.addTreeItem(newFragment);
                                var tagTreeItem = database_1.Database.getTreeItem(tag);
                                if (tagTreeItem !== undefined) {
                                    tagTreeItem.addChild(newFragment.label);
                                }
                            }
                        });
                    }
                    else {
                        var treeItem = new treeItem_1.TreeItem({ label: fragment.label, contextValue: "fragment", fragment: fragment.label });
                        database_1.Database.addTreeItem(treeItem);
                    }
                }
            });
        }
    }
    getTreeItem(element) {
        return element;
    }
    /**
     * Return list of fragments that are displayed in the tree
     */
    getChildren(element) {
        if (element !== undefined) {
            var elementList = database_1.Database.getTreeItems(element.childs);
            if (elementList !== undefined) {
                return Promise.resolve(elementList);
            }
            else {
                console.log("[E] | [FragmentProvider | getChildren]: List of childs for TreeItem undefined");
                return Promise.resolve([]);
            }
        }
        else {
            var rootList = database_1.Database.getTreeItems();
            if (rootList !== undefined) {
                return Promise.resolve(rootList.filter((treeItem) => {
                    if (treeItem !== undefined && treeItem.label !== undefined && treeItem.tag === undefined) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }));
            }
            else {
                console.log("[E] | [FragmentProvider | getChildren]: List of TreeItems undefined");
                return Promise.resolve([]);
            }
        }
    }
    /**
     * Refresh the displayed list of fragments
     */
    refresh() {
        this.createTreeStructure();
        this._onDidChangeTreeData.fire();
    }
    /**
     * Opens the editor for the given fragment
     * @param fragment Fragment that should be edited
     */
    editFragment(treeItem) {
        if (treeItem !== undefined && treeItem.contextValue === "fragment" && treeItem.fragment !== undefined && database_1.Database.getFragment(treeItem.fragment) !== undefined) {
            this._fragmentEditor.showFragment(database_1.Database.getFragment(treeItem.fragment));
            this.refresh();
        }
        else {
            console.log("[W] | [FragmentProvider | editFragment]: Can not edit Fragment with the label: " + treeItem.label);
        }
    }
    /**
     * Creates a new fragment by opening a input dialog to enter a new label
     */
    addFragment() {
        var editor = vscode.window.activeTextEditor;
        var selection;
        var textDocument;
        var text = "";
        if (editor) {
            selection = editor.selection;
            textDocument = editor.document;
            text = textDocument.getText(new vscode.Range(selection.start, selection.end));
        }
        var input = vscode.window.showInputBox({ prompt: "Input a label for the Fragment" });
        input.then((label) => {
            if (label === "") {
                vscode.window.showErrorMessage("Fragment Not Added (no empty label allowed)");
                console.log("[W] | [FragmentProvider | addFragment]: Failed");
            }
            else if (label === undefined) {
                vscode.window.showErrorMessage("Fragment Not Added");
                console.log("[W] | [FragmentProvider | addFragment]: Failed");
            }
            else if (database_1.Database.getTreeItem(label)) {
                vscode.window.showErrorMessage("Fragment Not Added (label has to be unique)");
                console.log("[W] | [FragmentProvider | addFragment]: Failed");
            }
            else {
                var obj = parametrization_1.FOEF.parametrize(text);
                var newFragment = new fragment_1.Fragment(Object.assign({ label: label }, obj));
                database_1.Database.addFragment(newFragment);
            }
            this.refresh();
        });
    }
    /**
     * Deletes a TreeItemcorresponding to a Fragment. This deletes the tag corresponding to this TreeItem in the properties of the Fragment.
     * @param fragment Fragment that should be deleted
     */
    deleteTreeItem(treeItem) {
        if (treeItem.contextValue === "fragment" && treeItem.fragment !== undefined && database_1.Database.getFragment(treeItem.fragment) !== undefined) {
            var fragment = database_1.Database.getFragment(treeItem.fragment);
            if (fragment !== undefined) {
                if (fragment.tags !== undefined && fragment.tags.length === 0) {
                    database_1.Database.deleteFragment(fragment.label);
                }
                else if (fragment.tags !== undefined) {
                    fragment.removeTag(treeItem.tag);
                    database_1.Database.updateFragment(fragment);
                }
                this.refresh();
            }
            else {
                console.log("[W] | [FragmentProvider | deleteTreeItem]: Can not delete tag: " + treeItem.tag);
            }
        }
        else {
            console.log("[W] | [FragmentProvider | deleteTreeItem]: Can not delete TreeItem with the label: " + treeItem.label);
        }
    }
}
exports.FragmentProvider = FragmentProvider;
//# sourceMappingURL=fragmentProvider.js.map