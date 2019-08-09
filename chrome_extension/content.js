// these variables need to be accessible through the entire life of the page this script was injected in
let scrollpos = 0;
let scope = "", body = "", description = "", tags = "";
// list of all languages that can be recognized from tags
// this list is not comprehensive, please add any further programming lanuages you may think of
const languageList = ['javascript', 'java', 'c#', 'php', 'python', 'html', 'c++', 'css', 'sql', 'c', 'r', 'objective-c', 'swift', 'ruby', 'excel', 'vba', 'vb.net', 'scala', 'typescript', 'matlab', 'bash', 'shell', 'go', 'rust', 'octave'];

function setup() {

    // all codeblocks in all answers without inline code
    const codeblocks = Array.from(document.getElementById('answers').getElementsByTagName('code')).filter(codeblock => codeblock.parentElement.tagName == 'PRE');
    // determine which codeblock is the best for fragment in here
    if (codeblocks.length) {
        // for now: always use top answers first codeblock
        // remove trailing whitespace
        body = codeblocks[0].innerText.replace(/\s$/, '');
        // set scrollpos
        // does not work properly: target codeblock is just below the screen, not visible, instead of at the top of the screen
        scrollpos = window.pageYOffset - codeblocks[0].getBoundingClientRect().y;
    }

    // get description
    const questionHeader = document.getElementById('question-header');
    if (questionHeader) {
        // remove potential "[closed]" and "Ask Question" from Question Header
        description = questionHeader.innerText.replace(/(?: \[closed\])?\sAsk Question$/, '');
    }

    // extract all tags and have them in a drop down menu
    const arrayTags = Array.from(document.getElementById('question').getElementsByClassName('post-tag')).map(tag => tag.href.replace(/https:\/\/stackoverflow.com\/questions\/tagged\//, ''));
    tags = arrayTags.toString();

    // extract all languages from tags and have a drop down menu
    const arrayScope = arrayTags.filter(tag => languageList.includes(tag));
    scope = arrayScope.toString();

    // almost all cases where multiple languages are tagged are javascript, html and css
    // therefore an attempt is made to determine which of these 3 languages the selected codeblock is

    // create Add to fragment buttons on every codeblock
    insertAddToFragmentButtons(codeblocks);
};

function insertAddToFragmentButtons(codeblocks) {
    for (var codeblock of codeblocks) {

        var button = document.createElement('button');
        // parentelement of the codeblock in order to put the button outside the grey box
        //var parent = codeblock.parentElement;
        button.setAttribute("type", "button");
        button.setAttribute("style", "float: right; ");
        //button.setAttribute("style", "background-color: blue;");
        button.innerHTML = String.fromCharCode(8631);
        // set the button after the grey box, but popup does not work then
        //parent.insertAdjacentElement("afterend", button);
        // insert them after the code, but still inside grey box
        codeblock.insertAdjacentElement('afterend', button);
        button.addEventListener(
            'click', function (event) {
                // remove trailing whitespace
                const newCodeblock = event.currentTarget.parentElement.firstChild.innerText.replace(/\s$/, '');
                // set scrollposs
                scrollpos = window.pageYOffset - event.currentTarget.parentElement.firstChild.getBoundingClientRect().y;

                chrome.storage.local.get(['url'], function (result) {
                    // check if the URL of the SO question page is the same as is saved, meaning the automatically extracted fragment was already saved in storage
                    // if this is a different page, set the correct values for storage
                    if (window.location != result.url) {
                        chrome.storage.local.set({
                            url: window.location,
                            label: "",
                            scope: scope,
                            body: newCodeblock,
                            description: description,
                            tags: tags,
                            domain: ""
                        }, function () {
                            // open the popup window
                            chrome.runtime.sendMessage({ content: 'add' });
                        });
                    }
                    // if this is the same page, only the new, user selected codeblock needs to be saved
                    else {
                        chrome.storage.local.set({ body: newCodeblock }, function () {
                            // open the popup window
                            chrome.runtime.sendMessage({ content: 'add' });
                        });
                    }
                });
            }
        );
    }
};

function detectJsHtmlCss(block, arrayScope) {

};

// run setup when content script is injected into SO page
setup();

// handle requests from other parts of extension
// only popup.js sends requests
chrome.runtime.onMessage.addListener(function (recieved, sender, sendResponse) {

    // when extension popup is opened on a site different to the last one 
    // hand over automatically extracted fragment to the popup to display and be edited by user
    if (recieved.content == 'setPopup') {
        sendResponse({ url: window.location, label: "", scope: scope, body: body, description: description, tags: tags, domain: "" });
    }

    // when jump to codeblock button is clicked
    // scroll page to position of codeblock that's loaded in the fragment editor
    else if (recieved.content == 'scroll') {
        scroll(0, scrollpos);
    }
});