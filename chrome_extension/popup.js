// represents the user option to preset the selected language as a tag
var presetLanguage = false;
function setup(tagInstance, domainInstance, scopeInstance) {
    // get the previous state from storage
    chrome.storage.local.get({ url: "", label: "", scope: [""], body: "", description: "", tags: [["", false]], domain: [["", false]], jumpto: true, presetLanguage: false }, function (result) {
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
                document.getElementById('label').value = result.label;
                document.getElementById('body').value = result.body;
                document.getElementById('description').value = result.description;

                // set the tags as options for tagselect element
                let tagselect = document.getElementById('tagselect');
                result.tags.forEach(tag => {
                    let newOption = document.createElement('option');
                    // tag[0] contains the string (meaning the actual tag)
                    newOption.innerText = tag[0];
                    // tag[1] contains wether it is selected or not
                    newOption.selected = tag[1];
                    tagselect.add(newOption);
                });

                // set the domain contents as options for domainselect element
                let domainselect = document.getElementById('domainselect');
                result.domain.forEach(domain => {
                    let newOption = document.createElement('option');
                    // domain[0] contains the string (meaning the actual tag)
                    newOption.innerText = domain[0];
                    // domain[1] contains wether it is selected or not
                    newOption.selected = domain[1];
                    domainselect.add(newOption);
                });

                // set the select options for scope and preselect the first language
                let scopeselect = document.getElementById('scopeselect');
                for (let i = 0; i < result.scope.length; i++) {
                    let newOption = document.createElement('option');
                    newOption.innerText = result.scope[i];
                    scopeselect.add(newOption);
                }
                scopeselect.options[0].selected = true;

                // update tagselect, domainselect, scopeselect elements
                tagInstance = M.FormSelect.init(document.getElementById('tagselect'));
                domainInstance = M.FormSelect.init(document.getElementById('domainselect'));
                scopeInstance = M.FormSelect.init(document.getElementById('scopeselect'));

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
                        // response contains all the fragment attributes that were extracted from the question page by content script
                        document.getElementById('label').value = response.label;
                        document.getElementById('body').value = response.body;
                        document.getElementById('description').value = response.description;

                        // set the tags as options for tagselect element
                        let tagselect = document.getElementById('tagselect');
                        response.tags.forEach(tag => {
                            let newOption = document.createElement('option');
                            // tag[0] contains the string (meaning the actual tag)
                            newOption.innerText = tag[0];
                            // tag[1] contains wether it is selected or not
                            newOption.selected = tag[1];
                            tagselect.add(newOption);
                        });

                        // set the tags as not selected options for domainselect element
                        // copy response.tags by value
                        let responseDomain = [...response.tags];
                        let domainselect = document.getElementById('domainselect');
                        responseDomain.forEach(domain => {
                            let newOption = document.createElement('option');
                            // domain[0] contains the string (meaning the actual tag)
                            newOption.innerText = domain[0];
                            domainselect.add(newOption);
                        });

                        // set the scope as option as well, if user selected that option
                        if (presetLanguage && response.scope[0]) {
                            response.tags.push([response.scope[0], true]);
                            let newOption = document.createElement('option');
                            newOption.innerText = response.scope[0];
                            newOption.selected = true;
                            tagselect.add(newOption);
                        }

                        // set the select options for scope and preselect the first language
                        let scopeselect = document.getElementById('scopeselect');
                        for (let i = 0; i < response.scope.length; i++) {
                            let newOption = document.createElement('option');
                            newOption.innerText = response.scope[i];
                            scopeselect.add(newOption);
                        }
                        scopeselect.options[0].selected = true;

                        // update tagselect, domainselect, scopeselect elements
                        tagInstance = M.FormSelect.init(document.getElementById('tagselect'));
                        domainInstance = M.FormSelect.init(document.getElementById('domainselect'));
                        scopeInstance = M.FormSelect.init(document.getElementById('scopeselect'));

                        // if no codeblock was found, grey out jump to codeblock button
                        if (!response.body) {
                            document.getElementById('jumpto').disabled = true;
                            // set the url, so when you reopen the popup without opening it on another site in between, your changes get restored
                            chrome.storage.local.set({
                                url: tabs[0].url,
                                label: response.label,
                                scope: response.scope,
                                body: response.body,
                                description: response.description,
                                tags: response.tags,
                                domain: responseDomain,
                                // so that jump to codeblock button gets greyed out again upon reopening of the popup
                                jumpto: false
                            });
                        } else {
                            // set the url, so when you reopen the popup without opening it on another site in between, your changes get restored
                            chrome.storage.local.set({
                                url: tabs[0].url,
                                label: response.label,
                                scope: response.scope,
                                body: response.body,
                                description: response.description,
                                tags: response.tags,
                                domain: responseDomain
                            });
                        }
                    }
                });
            }

            /*
             * Opening popup on NOT a question page -> don't load last state and no suggested fragment
             */
            // if you're on a different site (not a SO question page), clear last state and load empty editor
            else {
                chrome.storage.local.remove(['url', 'label', 'scope', 'body', 'description', 'tags', 'domain', 'jumpto']);
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



document.addEventListener('DOMContentLoaded', function () {
    // initialize select elements
    let tagInstance = M.FormSelect.init(document.getElementById('tagselect'));
    let domainInstance = M.FormSelect.init(document.getElementById('domainselect'));
    let scopeInstance = M.FormSelect.init(document.getElementById('scopeselect'));

    // restores previous state / sets up new state
    setup(tagInstance, domainInstance, scopeInstance);

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
        chrome.storage.local.remove(['url', 'label', 'scope', 'body', 'description', 'tags', 'domain', 'jumpto'], function () {
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
    /*
    document.getElementById('scope').addEventListener('input', function () {
        chrome.storage.local.set({ scope: document.getElementById('scope').value });
    });
    */
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