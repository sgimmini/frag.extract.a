// represents the user option to preset the selected language as a tag
let presetLanguage = false;

document.addEventListener('DOMContentLoaded', function () {
    // restores previous state / sets up new state
    setup();

    // save button
    document.getElementById('form').addEventListener('submit', function () {
        // saves fragment to database via python script in frag.edit vsc extension
        chrome.runtime.sendMessage({ content: 'sendNativeMessage' }, function () {
            window.close();
        });
    });

    // cancel button
    document.getElementById('cancel').addEventListener('click', function () {
        // clears current state, when popup is reopened it will fetch automatically extracted fragment from content script
        chrome.storage.local.remove(['url', 'label', 'scope', 'scopeArray', 'body', 'description', 'tags', 'domain', 'jumpto'], function () {
            window.close();
        });
    });

    // jump to codeblock button
    document.getElementById('jumpto').addEventListener('click', function () {
        // scroll the page to the position of the codeblock that's in the editor on page
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { content: 'scroll' });
        });
    });

    // working hyperlinks, only used for the "More information on creating VS Code Snippets" at the bottom
    window.addEventListener('click', function (event) {
        if (event.target.href !== undefined) {
            chrome.tabs.create({ url: event.target.href });
        }
    });

    // save content of input fields
    document.getElementById('label').addEventListener('input', function () {
        chrome.storage.local.set({ label: document.getElementById('label').value });
    });
    document.getElementById('scope').addEventListener('input', function () {
        /*
        // index of the selected language, is -1 if that language not yet in scopeArray
        const index = scopeArray.indexOf(scope.value);
        if (index > -1) {
            // remove the selected language from it's current position
            scopeArray.splice(index, 1);
        }
        // add the selected language to array position 0
        scopeArray.unshift(scope.value);
        // save the changed scopeArray
        chrome.storage.local.set({ scope: scopeArray });
        */
        //scopeArray.pop();
        //scopeArray.push(document.getElementById('scope').value);
        chrome.storage.local.set({ scope: document.getElementById('scope').value });
    });
    document.getElementById('body').addEventListener('input', function () {
        chrome.storage.local.set({ body: document.getElementById('body').value });
    });
    document.getElementById('description').addEventListener('input', function () {
        chrome.storage.local.set({ description: document.getElementById('description').value });
    });
    /*
    document.getElementById('tags').addEventListener('input', function () {
        chrome.storage.local.set({ tags: document.getElementById('tags').value });
    });
    */
    /*
    document.getElementById('domain').addEventListener('input', function () {
        chrome.storage.local.set({ domain: document.getElementById('domain').value });
    });
    */
});

function setup() {
    // get the previous state from storage
    chrome.storage.local.get({ url: "", label: "", scope: "", scopeArray: [""], body: "", description: "", tags: [["", false]], domain: [["", false]], jumpto: true, presetLanguage: false }, function (result) {
        // save wether user has selected to add the language to tags or not
        presetLanguage = result.presetLanguage;
        // returns array of length 1 with the currently viewed tab
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

            /*
             * Reopening popup on last site -> state is restored
             */
            // if you're still on the site the poup was last opened, load last state with your changes from the automatically extracted fragment
            // also true when real popup is opened after clicking an Add to Fragment on SO question page, correct data in storage in this case guaranteed by content script
            if (tabs[0].url == result.url || tabs[0].url == "chrome-extension://faoicolglehmgplpccapgobineahofjh/popup.html") {
                // load saved state as input
                loadState(result);

                // jump to codeblock gets greyed out if no codeblock was found on SO page or real popup is opened, because addressing the content script from there does not work
                if (!result.jumpto || tabs[0].url == "chrome-extension://faoicolglehmgplpccapgobineahofjh/popup.html") {
                    document.getElementById('jumpto').disabled = true;
                }
            }

            /*
             * Opening popup on new SO question page -> collecting fragment from content script
             */
            // if you're on a different SO question page (where the content script was injected), load automatically extracted fragment
            else if (/https:\/\/stackoverflow.com\/questions\/\d*\/.*/.test(tabs[0].url)) {
                chrome.tabs.sendMessage(tabs[0].id, { content: 'setPopup' }, function (response) {

                    // error handling, if extension is installed and tab is not reloaded (meaning the content script has not been injected)
                    if (chrome.runtime.lastError) {
                        // replace entire popup with message to reload tab
                        let body = document.createElement('body');
                        let header = document.createElement('H4');
                        header.innerText = "Please reload this tab";
                        body.appendChild(header);
                        document.body = body;
                    } else {
                        // set the scope as preselected option for tags as well, if user selected that option
                        // the scope is always at tags[0]
                        if (presetLanguage && response.scope) {
                            response.tags.unshift([response.scope, true]);
                        }
                        // load response from content script as input
                        loadState(response);

                        // if no codeblock was found, grey out jump to codeblock button
                        if (!response.body) {
                            document.getElementById('jumpto').disabled = true;
                            result.jumpto = false;
                        }
                        // set the url, so when you reopen the popup without opening it on another site in between, your changes get restored
                        chrome.storage.local.set({
                            url: tabs[0].url,
                            label: response.label,
                            scope: response.scope,
                            scopeArray: response.scopeArray,
                            body: response.body,
                            description: response.description,
                            tags: response.tags,
                            domain: response.domain,
                            // so that jump to codeblock button gets greyed out again upon reopening of the popup
                            jumpto: result.jumpto
                        });
                    }
                });
            }

            /*
             * Opening popup on NOT a question page -> don't load last state and no suggested fragment
             */
            // if you're on a different site (not a SO question page), clear last state and load empty editor
            else {
                chrome.storage.local.remove(['label', 'scope', 'scopeArray', 'body', 'description', 'tags', 'domain']);
                // so that state is restored upon reopening of the popup
                chrome.storage.local.set({ url: tabs[0].url, jumpto: false });
                // also change title to no longer say "Suggested Fragment"
                document.getElementById('title').innerText = "No Fragment found";
                // grey out jump to codeblock
                document.getElementById('jumpto').disabled = true;
            }
        });
    });
};

function loadState(input) {
    // input contains all the fragment attributes that were extracted from the question page by content script
    document.getElementById('label').value = input.label;
    document.getElementById('body').value = input.body;
    document.getElementById('description').value = input.description;
    document.getElementById('scope').value = input.scope;

    // sets all initial tag chips and adds the rest as autocomplete options
    const tagchips = document.getElementById('tagchips');
    setChips(input.tags, tagchips);

    // sets all initial domain chips and adds the rest as autocomplete options
    const domainchips = document.getElementById('domainchips');
    setChips(input.domain, domainchips);

    // set the select options for scope
    const scopelist = document.getElementById('scopelist');
    input.scopeArray.forEach(language => {
        let newOption = document.createElement('option');
        newOption.value = language;
        scopelist.appendChild(newOption);
    });
};

function setChips(tags, domElement) {
    // array containing all initial tags
    let tagData = [];
    // object containing all other tags as autocomplete options
    let autocompleteTags = {};
    // popuplate above data structures
    tags.forEach(entry => {
        // if second attribute is true, the entry will be preselected
        if (entry[1]) {
            tagData.push({ tag: entry[0] });
        } else {
            autocompleteTags[entry[0]] = null;
        }
    });

    // initialize chips element
    M.Chips.init(domElement, {
        data: tagData,
        placeholder: 'Press Enter after input to create a Tag',
        secondaryPlaceholder: '+',
        autocompleteOptions: {
            data: autocompleteTags,
            limit: Infinity,
            // offers list of all autocomplete options even before one starts typing
            minLength: 0,
        }
    });
}