// these variables need to be accessible through the entire life of the page this script was injected in
var scrollpos = 0;
var scope = "", body = "", description = "", tags = "";

function setup() {
    // all codeblocks in all answers without inline code
    const codeblocks = Array.from(document.getElementById('answers').getElementsByTagName('code')).filter(codeblock => codeblock.parentElement.tagName == 'PRE');
    // determine which codeblock is the best for fragment in here
    if (codeblocks.length) {
        body = codeblocks[0].innerText;
        // set scrollpos
        scrollpos = window.pageYOffset - codeblocks[0].getBoundingClientRect().y;
    }
    // get description
    const questionHeader = document.getElementById('question-header');
    if (questionHeader) {
        description = questionHeader.innerText.replace(/(?: \[closed\])?\sAsk Question$/, '');
    }

    // extract all languages from tags and have a drop down menu
    // extract all tags and have them in a drop down menu

    for (var codeblock of codeblocks) {
        // create Add to fragment buttons on every codeblock
        var button = document.createElement('button');
        button.innerText = "Add to fragment";
        // insert them after the code, but still inside grey box
        codeblock.insertAdjacentElement('afterend', button);
        button.addEventListener(
            'click', function (event) {
                // set reference to the codeblock
                const bodyElem = event.currentTarget.parentElement.firstChild;
                chrome.storage.local.get(['url'], function (result) {
                    // check if the URL of the SO question page is the same as is saved, meaning the automatically extracted fragment was already saved in storage
                    // if this is a different page, set the correct values for storage
                    if (window.location != result.url) {
                        chrome.storage.local.set({
                            url: window.location,
                            label: "",
                            scope: scope,
                            body: bodyElem.innerText,
                            description: description,
                            tags: tags,
                            domain: ""
                        }, function () {
                            // then set the scrollpos and open the popup window
                            scrollpos = window.pageYOffset - bodyElem.getBoundingClientRect().y;
                            chrome.runtime.sendMessage({ content: 'add' });
                        });
                    } // if this is the same page, only the new, user selected codeblock needs to be saved
                    else {
                        chrome.storage.local.set({ body: bodyElem.innerText }, function () {
                            // then set the scrollpos and open the popup window
                            scrollpos = window.pageYOffset - bodyElem.getBoundingClientRect().y;
                            chrome.runtime.sendMessage({ content: 'add' });
                        });
                    }
                });
            }
        );
    }
};

// run setup when content script is injected into SO page
setup();

chrome.runtime.onMessage.addListener(function (recieved, sender, sendResponse) {
    // hand over automatically extracted fragment to the popup to display and be edited by user
    if (recieved.content == 'setPopup') {
        sendResponse({ url: window.location, label: "", scope: scope, body: body, description: description, tags: tags, domain: "" });
    } // scroll page to position of codeblock that's loaded in the fragment editor
    else if (recieved.content == 'scroll') {
        scroll(0, scrollpos);
    }
});

// does not work properly: target codeblock is just below the screen, not visible, instead of at the top of the screen
// for scrolling: scroll(0, window.pageYOffset - codeblocks[0].getBoundingClientRect().y)