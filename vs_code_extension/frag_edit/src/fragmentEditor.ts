import { Fragment } from "./fragment";
import * as vscode from 'vscode';
import { Database } from "./database";
import { FragmentProvider } from "./fragmentProvider";
import { FOEF } from "./parametrization";

export class FragmentEditor {
    panel: any;
    context: vscode.ExtensionContext;
    fragmentProvider: FragmentProvider;
    fragment: Fragment | undefined;

    constructor(context: vscode.ExtensionContext, fragmentProvider: FragmentProvider) {
        this.context = context;
        this.fragmentProvider = fragmentProvider;
        this.fragment = undefined;
    }

    createPanel() {
        this.panel = vscode.window.createWebviewPanel(
            "",
            "",
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        this.panel.webview.onDidReceiveMessage((message: any) => {
            switch (message.command) {
                case 'cancel':
                    this.panel.dispose();
                    this.panel.onDidDispose();
                    return;
                case 'submit':
                    var newFragment = new Fragment({ label: message.text.label, prefix: message.text.prefix, scope: message.text.scope, body: message.text.body, description: message.text.description, keywords: message.text.keywords, tags: message.text.tags, domain: message.text.domain, placeholders: message.text.placeholders });
                    Database.updateFragment(newFragment);
                    this.fragmentProvider.refresh();
                    this.panel.dispose();
                    this.panel.onDidDispose();
                    return;
                case 'parametrize':
                    this.panel.postMessage({ command: 'parametrize', text: FOEF.parametrize(message.text) });
                    return;
            }
        },
            undefined,
            this.context.subscriptions
        );
    }

    showFragment(fragment: Fragment | undefined) {
        if (fragment === undefined) {
            return;
        }
        this.fragment = fragment;
        if (this.panel === undefined) {
            this.createPanel();
        }

        this.panel.title = fragment.label;

        const path = require("path");
        const onDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'external/materialize', 'materialstyle.css'));

        const style = onDiskPath.with({ scheme: 'vscode-resource' });

        this.panel.webview.html = this.getWebviewContent(fragment, style);
        this.panel.reveal();
    }

    onDelete(label: string) {
        if (this.panel.title === label) {
            this.panel.dispose();
        }
    }

    private getWebviewContent(fragment: Fragment, style: vscode.Uri) {
        return `<!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${fragment.label}</title>
            <link rel="stylesheet" href="${style}">
            <style>
                input { width:100%; color:white; font-size: 15px; border: none }
                textarea { width:100%; color:white; font-size: 15px; height: auto; resize: none; }
            </style>
        </head>
        <body>
            <h3 style="float: left; max-width: 70%; overflow: hidden;" id="label" >${fragment.label}</h3>
            <button style="float: right; margin: 10px; margin-top: 35px" onclick="cancelFunction()" class="btn waves-effect waves-light" type="submit" name="action">Cancel</button>
            <button style="float: right; margin: 10px; margin-top: 35px" onclick="submitFunction()" class="btn waves-effect waves-light" type="submit" name="action">Save</button>
            <br><br><br><br><br>
            Description: <input id="description" type="text" value="${fragment.description}">
            Keywords: <input id="keywords" type="text" value="${fragment.keywords}">
            Tags: <input id="tags" type="text" value="${fragment.tags}">
            Prefix: <input id="prefix" type="text" value="${fragment.prefix}">
            Body: <textarea id="body" rows="16">${fragment.body}</textarea>
            <button title="Replaces Keywords, Body and Placeholders" style="float: right; margin: 10px; margin-top: 5px" onclick="parametrize()" class="btn waves-effect waves-light" type="submit" name="action">Parametrize</button>
            <br><br><br>
            Scope: <input id="scope" type="text" value="${fragment.scope}">
            Domain: <input id="domain" type="text" value="${fragment.domain}">
            Placeholders: <input id="placeholders" type="text" value="${fragment.placeholders}" disabled>

            <script>
                const vscode = acquireVsCodeApi();
                function submitFunction()
                {
                    vscode.postMessage({command: 'submit', text: {
                        "label":  document.getElementById("label").innerHTML ,
                        "description": document.getElementById("description").value, 
                        "keywords": document.getElementById("keywords").value,
                        "tags": document.getElementById("tags").value,
                        "prefix": document.getElementById("prefix").value, 
                        "body": document.getElementById("body").value,
                        "scope": document.getElementById("scope").value,
                        "domain": document.getElementById("domain").value,
                        "placeholders": document.getElementById("placeholders").value
                    }});    
                }

                function cancelFunction()
                {
                    vscode.postMessage({command: 'cancel', text: ''});
                }

                function parametrize()
                {
                    vscode.postMessage({command: 'parametrize', text: document.getElementById("body").value});
                }

                window.addEventListener('message', event =>
                {
                    const message = event.data;
                    switch(message.command)
                    {
                        case 'parametrize':
                            document.getElementById("body").value = message.text.body;
                            document.getElementById("keywords").value = message.text.keywords;
                            document.getElementById("placeholders").value = message.text.placeholders;
                            return;
                    }
                });
            </script>

          </body>
          </html>`;
    }
}