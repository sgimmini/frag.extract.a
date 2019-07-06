var scrollpos = 0;
var scope = "", body = "", description = "", tags = "";

function setup() {
    // all codeblocks in all answers without inline code
    const codeblocks = Array.from(document.getElementById('answers').getElementsByTagName('code')).filter(codeblock => codeblock.parentElement.tagName == 'PRE');
    // determine which codeblock here
    if (codeblocks.length) {
        body = codeblocks[0].innerText;
        // set scrollpos here
        scrollpos = window.pageYOffset - codeblocks[0].getBoundingClientRect().y;
    }
    // get description
    description = document.getElementById('question-header').innerText.replace(/(?: \[closed\])?\sAsk Question$/, '');

    // extract all languages from tags and have a drop down menu
    // extract all tags and have them in a drop down menu

    for (var codeblock of codeblocks) {
        var button = document.createElement('button');
        button.innerText = "Add to fragment";
        codeblock.insertAdjacentElement('afterend', button);
        button.addEventListener(
            'click', function (event) {
                chrome.storage.local.set({ body: event.target.parentElement.firstChild.innerText });
                // set scrollpos here
                scrollpos = window.pageYOffset - event.target.parentElement.firstChild.getBoundingClientRect().y;
                //chrome.runtime.sendMessage({ content: 'add' });
            }
        );
    }
};

setup();

chrome.runtime.onMessage.addListener(function (recieved, sender, sendResponse) {
    if (recieved.content == 'setPopup') {
        sendResponse({ url: window.location, label: "", scope: scope, body: body, description: description, tags: tags, domain: "" });
    } else if (recieved.content == 'scroll') {
        scroll(0, scrollpos);
    }
});

// for scrolling: scroll(0, window.pageYOffset - codeblocks[0].getBoundingClientRect().y)