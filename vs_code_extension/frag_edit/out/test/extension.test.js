"use strict";
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';
// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {
    test("fragmentProvider Test", function () {
        var database = new database_1.Database("./testdata");
    });
});
//# sourceMappingURL=extension.test.js.map