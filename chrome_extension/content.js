/*
console.log("started");
let paragraphs = document.getElementsByTagName('code');
var oneElement = paragraphs[3];

var topPos = oneElement.offsetTop;

for (elt of paragraphs) {
    elt.style['background-color'] = '#FFB2B2';
}

for (let i = 0; i < 3; i++) {
    paragraphs[i].style['background-color'] = '#FFB2B2';
}

function jumpToCode() {
    var myElement = paragraphs[3];
    var topPos = myElement.offsetTop;
    document.getElementsByTagName('code').scrollTop = topPos;
}

chrome.runtime.onMessage.addListener(function (recieved, callback) {
    if (recieved.codeblock) {
        document.getElementsByTagName('code').scrollTop = document.getElementsByTagName('code')[recieved.codeblock].offsetTop;
    }
});
*/
// all codeblocks in all answers without inline code
const codeblocks = Array.from(document.getElementById('answers').getElementsByTagName('code')).filter(codeblock => codeblock.parentElement.tagName == 'PRE');
var scrollpos;

function extract() {
    // determine which codeblock here
    const code = codeblocks[0].innerText;
    // set scrollpos here

    chrome.storage.local.set({
        scope: "", /*extract all languages from tags and have a drop down menu*/
        body: code,
        description: document.getElementById('question-header').innerText.replace(/(?: \[closed\])?\sAsk Question$/, ''),
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
                chrome.storage.local.set({ body: event.currentTarget.parentElement.firstChild.innerText });
                // set scrollpos here

                //chrome.runtime.sendMessage({ content: "add" });
            }
        );
    }
};

extract();
addToFragmentButtons();

// for scrolling: scroll(0, window.pageYOffset - codeblocks[0].getBoundingClientRect().y)
