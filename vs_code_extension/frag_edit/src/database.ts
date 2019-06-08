import { Fragment } from "./fragment";
import sql = require('sql.js');
import fs = require("fs");
import { TreeItem } from "./treeItem";
import * as vscode from 'vscode';

export class Database {
    private static _fragmentDatabase: any;
    private static _fragmentDirectory: string;
    private static _loadedFragments: Map<string, Fragment>;
    private static _loadedTreeItems: Map<string, TreeItem>;

    constructor(path: string) {
        Database._fragmentDirectory = path;
        Database.createFragmentDatabase();
        Database._loadedFragments = new Map();
        Database.loadFragments();
        Database._loadedTreeItems = new Map();
    }

    static createFragmentDatabase(): void {
        if (!fs.existsSync(Database._fragmentDirectory)) {
            fs.mkdirSync(Database._fragmentDirectory);
        }

        if (!fs.existsSync(Database._fragmentDirectory + "/fragments.fragmentDatabase")) {
            const bufferfragmentDatabase = new sql.Database();
            const data = bufferfragmentDatabase.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(Database._fragmentDirectory + '/fragments.fragmentDatabase', buffer);
        }

        const filebuffer = fs.readFileSync(Database._fragmentDirectory + '/fragments.fragmentDatabase');
        Database._fragmentDatabase = new sql.Database(filebuffer);
        Database._fragmentDatabase.run("CREATE TABLE IF NOT EXISTS fragments (label TEXT PRIMARY KEY, prefix TEXT, scope TEXT, body TEXT, description TEXT, keywords TEXT, tags TEXT, domain TEXT, placeholders TEXT, snippet TEXT)");
        Database.persist();
    }

    private static loadFragments(): void {
        const filebuffer = fs.readFileSync(Database._fragmentDirectory + '/fragments.fragmentDatabase');
        Database._fragmentDatabase = new sql.Database(filebuffer);
        const res = Database._fragmentDatabase.exec("SELECT * FROM fragments")[0];
        if (res === undefined) {
            return;
        }

        res.values.forEach((element: any[]) => {
            var label = element[0];
            var prefix = element[1];
            var scope = element[2];
            var body = element[3];
            var description = element[4];
            var keywords = element[5];
            var tags = element[6];
            var domain = element[7];
            var placeholders = element[8];
            var newFragment = new Fragment({ label: label, prefix: prefix, scope: scope, body: body, description: description, keywords: keywords, tags: tags, domain: domain, placeholders: placeholders });
            Database._loadedFragments.set(label, newFragment);
        });
    }

    private static persist(): void {
        const data1 = Database._fragmentDatabase.export();
        const buffer1 = Buffer.from(data1);
        fs.writeFileSync(Database._fragmentDirectory + '/fragments.fragmentDatabase', buffer1);
    }

    static get loadedFragments(): Fragment[] {
        Database.loadFragments();
        return Array.from(Database._loadedFragments.values());
    }

    /**
     * Return all fragments or the ones which labels were given
     * @param labels Labels for which fragments should be returned
     */
    static getFragments(labels?: (string | undefined)[]): Fragment[] {
        Database.loadFragments();
        if (labels !== undefined) {
            var fragments: Fragment[] = [];
            labels.forEach((label: string | undefined) => {
                var occuredLabels: string[] = [];
                if (label !== undefined && !occuredLabels.includes(label)) {
                    occuredLabels.push(label);
                    var fragment = Database._loadedFragments.get(label);
                    if (fragment !== undefined) {
                        fragments.push(fragment);
                    }
                }
            });
            return fragments;
        }
        else {
            return Array.from(Database._loadedFragments.values());
        }
    }

    /**
     * Return the Fragment with the given label
     * @param label Label of the Fragment
     */
    static getFragment(label: string): Fragment | undefined {
        Database.loadFragments();
        var fragment = Database._loadedFragments.get(label);
        if (fragment !== undefined) {
            return fragment;
        }
        else {
            console.log("[W] | [Database | getFragment]: Failed for parameter: " + label);
            return undefined;
        }
    }

    /**
     * Adds the given Fragment to the Database
     * @param fragment Fragment to be added
     */
    static addFragment(fragment: Fragment | undefined): boolean {
        Database.loadFragments();
        if (fragment === undefined || Database._loadedFragments.has(fragment.label)) {
            console.log("[W] | [Database | addFragment]: Failed for fragment: " + fragment);
            return false;
        }
        else {
            Database._loadedFragments.set(fragment.label, fragment);
            Database._fragmentDatabase.run("INSERT INTO fragments VALUES (?,?,?,?,?,?,?,?,?,?)", [fragment.label, fragment.prefix, fragment.scope, fragment.body, fragment.description, fragment.keywords, fragment.tags, fragment.domain, fragment.placeholders, fragment.snippet]);
            Database.persist();
            return true;
        }
    }

    /**
     * Delete a Fragment from the Database
     * @param label Label of Fragment
     */
    static deleteFragment(label: string | undefined): boolean {
        Database.loadFragments();
        if (label !== undefined && Database._loadedFragments.has(label)) {
            Database._loadedFragments.delete(label);
            Database._fragmentDatabase.run("DELETE FROM fragments WHERE label=?", [label]);
            Database.persist();
            return true;
        }
        else {
            console.log("[W] | [Database | deleteFragment]: Failed for label: " + label);
            return false;
        }
    }

    /**
     * Replace a Fragment with the same label as the given Fragment
     * @param fragment Fragment as it should be in the Database
     */
    static updateFragment(fragment: Fragment | undefined): boolean {
        Database.loadFragments();
        if (fragment !== undefined && Database._loadedFragments.get(fragment.label) !== undefined) {
            Database._loadedFragments.set(fragment.label, fragment);
            Database._fragmentDatabase.run("UPDATE fragments SET prefix=? , scope=?, body=?, description=?, keywords=?, tags=?, domain=?, placeholders=? WHERE label=?", [fragment.prefix, fragment.scope, fragment.body, fragment.description, fragment.keywords, fragment.tags, fragment.domain, fragment.placeholders, fragment.label]);
            Database.persist();
            return true;
        }
        else {
            console.log("[W] | [Database | updateFragment]: Failed for fragment: " + fragment);
            return false;
        }
    }

    static get loadedTreeItems(): TreeItem[] {
        return Array.from(Database._loadedTreeItems.values());
    }

    static set loadedTreeItems(treeItems: TreeItem[]) {
        this._loadedTreeItems.clear();
        treeItems.forEach((treeItem: TreeItem) => {
            if (treeItem.label !== undefined) {
                this._loadedTreeItems.set(treeItem.label, treeItem);
            }
        });
    }

    /**
     * Adds the TreeItem to the database
     * @param treeItem TreeItem to be added
     */
    static addTreeItem(treeItem: TreeItem | undefined): boolean {
        if (treeItem !== undefined && treeItem.label !== undefined && !this._loadedTreeItems.has(treeItem.label)) {
            this._loadedTreeItems.set(treeItem.label, treeItem);
            return true;
        }
        else {
            console.log("[W] | [Database | addTreeItem]: Failed for TreeItem: " + treeItem);
            return false;
        }
    }

    /**
     * Deletes the TreeItem from the database
     * @param label Label of TreeItem to be deleted
     */
    static deleteTreeItem(label: string | undefined): boolean {
        if (label !== undefined && Database._loadedTreeItems.has(label)) {
            Database._loadedTreeItems.delete(label);
            return true;
        }
        else {
            console.log("[W] | [Database | deleteTreeItem]: Failed for label: " + label);
            return false;
        }
    }

    /**
     * Replaces TreeItem with the same label as the given TreeItem
     * @param treeItem TreeItem as it should be in the Database
     */
    static updateTreeItem(treeItem: TreeItem | undefined): boolean {
        if (treeItem !== undefined && treeItem.label !== undefined && Database._loadedTreeItems.has(treeItem.label)) {
            Database._loadedTreeItems.set(treeItem.label, treeItem);
            return true;
        }
        else {
            console.log("[W] | [Database | updateTreeItem]: Failed for TreeItem: " + treeItem);
            return false;
        }
    }

    /**
     * Return the TreeItem with the given label
     * @param label Label of the TreeItem
     */
    static getTreeItem(label: string | undefined): TreeItem | undefined {
        console.log("############");
        Array.from(this._loadedTreeItems.values()).forEach((treeItem: TreeItem) => {
            console.log(treeItem);
        });


        if (label !== undefined && this._loadedTreeItems.has(label)) {
            return this._loadedTreeItems.get(label);
        }
        else {
            console.log("[W] | [Database | getTreeItem]: Failed for label: " + label);
            return undefined;
        }
    }

    /**
     * Return all Treeitems or the ones which labels were given
     * @param labels List of labels for TreeItems to be returned
     */
    static getTreeItems(labels?: (string | undefined)[] | undefined): TreeItem[] {
        if (labels !== undefined) {
            var treeItems: TreeItem[] = [];
            labels.forEach((label: string | undefined) => {
                var occuredLabels: string[] = [];
                if (label !== undefined && !occuredLabels.includes(label)) {
                    occuredLabels.push(label);
                    var treeItem = Database._loadedTreeItems.get(label);
                    if (treeItem !== undefined) {
                        treeItems.push(treeItem);
                    }
                }
            });
            return treeItems;
        }
        else {
            return Array.from(Database._loadedTreeItems.values());
        }
    }


    static getFilteredFragments(filter: string): Fragment[] {
        Database.loadFragments();
        if (filter === "") {
            return Array.from(Database._loadedFragments.values());
        }

        var filterList = filter.split(",");

        let fragmentList: Fragment[] = Array.from(Database._loadedFragments.values());

        filterList.forEach((filterElement: string) => {
            if (filterElement.includes("label:") && filterElement.indexOf("label:") === 0)     // Filtern nach Fragmenten, die die gesuchte Label als Substring haben
            {
                filterElement = filterElement.split(":")[1];
                fragmentList = fragmentList.filter(fragment => fragment.label.toLowerCase().includes(filterElement.toLowerCase()));
            }
            if (filterElement.includes("scope:") && filterElement.indexOf("scope:") === 0)     // Filtern nach Fragmenten, die die gesuchte Sprache als Substring haben
            {
                filterElement = filterElement.split(":")[1];
                fragmentList = fragmentList.filter(fragment => {
                    if (fragment.scope !== undefined) {
                        return fragment.scope.toLowerCase().includes(filterElement.toLowerCase());
                    }
                });
            }
            if (filterElement.includes("domain:") && filterElement.indexOf("domain:") === 0)     // Filtern nach Fragmenten, die die gesuchte Domäne als Substring haben
            {
                filterElement = filterElement.split(":")[1];
                fragmentList = fragmentList.filter(fragment => {
                    if (fragment.domain !== undefined) {
                        return fragment.domain.toLowerCase().includes(filterElement.toLowerCase());
                    }
                });
            }
            if (filterElement.includes("keyword:") && filterElement.indexOf("keyword:") === 0)   // Filtern nach Fragmenten, die das exakte gesuchte Keyword besitzen
            {
                filterElement = filterElement.split(":")[1];
                fragmentList = fragmentList.filter(fragment => {
                    if (fragment.keywords !== undefined) {
                        return fragment.keywords.includes(filterElement);
                    }
                });
            }
        });
        return fragmentList;
    }
}