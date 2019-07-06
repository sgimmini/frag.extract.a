// all codeblocks in all answers without inline code
const codeblocks = Array.from(document.getElementById('answers').getElementsByTagName('code')).filter(codeblock => codeblock.parentElement.tagName == 'PRE');
var scrollpos;

function extract() {
    // determine which codeblock here
    var code = '';
    if (codeblocks.length) {
        code = codeblocks[0].innerText;
        // set scrollpos here
        scrollpos = window.pageYOffset - codeblocks[0].getBoundingClientRect().y;
    }
    // get description
    const title = document.getElementById('question-header').innerText.replace(/(?: \[closed\])?\sAsk Question$/, '')
    chrome.storage.local.set({
        scope: "", /*extract all languages from tags and have a drop down menu*/
        body: code,
        description: title.charAt(0).toUpperCase() + title.slice(1),
        tags: "" /*extract all tags and have them in a drop down menu*/
    });
};

function addToFragmentButtons() {
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

extract();
addToFragmentButtons();

chrome.runtime.onMessage.addListener(function (recieved, callback) {
    if (recieved.content == 'scroll') {
        scroll(0, scrollpos);
    }
});

// for scrolling: scroll(0, window.pageYOffset - codeblocks[0].getBoundingClientRect().y)