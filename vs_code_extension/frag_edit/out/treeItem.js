"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class TreeItem extends vscode.TreeItem {
    constructor(parameter) {
        super(parameter.label);
        this.contextValue = parameter.contextValue;
        if (this.contextValue === "tag") {
            if (parameter.childs !== undefined) {
                this._childs = parameter.childs;
            }
            else {
                this._childs = [];
            }
            this._tag = undefined;
            this._fragment = undefined;
            this.collapsibleState = 1;
            this.command = { command: "fragmentEditor.edittag", title: "Edit tag", arguments: [this] };
        }
        else if (this.contextValue === "fragment") {
            this._childs = undefined;
            if (parameter.tag !== undefined) {
                this._tag = parameter.tag;
            }
            else {
                this._tag = undefined;
            }
            if (parameter.fragment !== undefined) {
                this._fragment = parameter.fragment;
            }
            else {
                this._fragment = undefined;
            }
            this.collapsibleState = 0;
            this.command = { command: "fragmentEditor.editFragment", title: "Edit Fragment", arguments: [this] };
        }
        else {
            console.log("[W] | [TreeItem | constructor]: Failed");
        }
    }
    get childs() {
        if (this.contextValue === "tag" && this._childs !== undefined) {
            return this._childs;
        }
        else {
            console.log("[W] | [TreeItem | get childs]: Failed");
            return undefined;
        }
    }
    set childs(childs) {
        if (this.contextValue === "tag" && childs !== undefined) {
            this._childs = childs;
        }
        else {
            console.log("[W] | [TreeItem | set childs]: Failed for parameter: " + childs);
        }
    }
    get tag() {
        if (this.contextValue === "fragment") {
            return this._tag;
        }
        else {
            console.log("[W] | [TreeItem | get tag]: Failed for TreeItem: " + this.label);
            return undefined;
        }
    }
    set tag(tag) {
        if (this.contextValue === "fragment" && tag !== undefined) {
            this._tag = tag;
        }
        else {
            console.log("[W] | [TreeItem | set tag]: Failed for parameter: " + tag);
        }
    }
    get fragment() {
        if (this.contextValue === "fragment") {
            return this._fragment;
        }
        else {
            console.log("[W] | [TreeItem | get fragment]: Failed for parameter: ");
        }
    }
    /**
     * Adds the given label to the list of chlds
     * @param child Label of child
     */
    addChild(child) {
        if (this.contextValue === "tag" && child !== undefined && this._childs !== undefined) {
            this._childs.push(child);
        }
        else {
            console.log("[W] | [TreeItem | addChild]: Failed for parameter: " + child);
        }
    }
    /**
     * Deletes the given label from the list of childs
     * @param newChild Label of child
     */
    removeChild(newChild) {
        if (this.contextValue === "tag" && newChild !== undefined && this._childs !== undefined) {
            var newChilds = [];
            this._childs.forEach((child) => {
                if (child !== newChild) {
                    newChilds.push(child);
                }
            });
            this._childs = newChilds;
        }
        else {
            console.log("[W] | [TreeItem | removeChild]: Failed for parameter: " + newChild);
        }
    }
}
exports.TreeItem = TreeItem;
//# sourceMappingURL=treeItem.js.map