// these variables need to be accessible through the entire life of the page this script was injected in
let scrollpos = 0;
let label = "", scope = "", scopeArray = [], body = "", description = "", tagArray = [], domainArray = [];

const MODEL_URL = "https://flori-boy.github.io/Hosting_Test/tensorflowjs_model_small/model.json";
const VOCAB_URL = "https://flori-boy.github.io/Hosting_Test/vocab.json"
const MAX_LEN = 125
const border = " stop "

// list of all languages that can be recognized from tags
// this list is not comprehensive, please add any further programming lanuages you may think of
const languageList = ['javascript', 'java', 'c#', 'php', 'python', 'html', 'c++', 'css', 'sql', 'c', 'r', 'objective-c', 'swift', 'ruby', 'excel', 'vba', 'vb.net', 'scala', 'typescript', 'matlab', 'bash', 'shell', 'go', 'rust', 'octave'];

// run setup when content script is injected into SO page
setup();

async function setup() {

    /*
     * Extract description [description of functionality in codeblock]
     * -> question title is used
     */
    const questionHeader = document.getElementById('question-header');
    if (questionHeader) {
        // remove potential "[closed]" and "Ask Question" from question header
        description = questionHeader.innerText.replace(/(?: \[closed\]| \[duplicate\])?\sAsk Question$/, '');
    }

    // all codeblocks in all answers without inline code
    let codeblocks = Array.from(document.getElementById('answers').getElementsByTagName('code')).filter(codeblock => codeblock.parentElement.tagName == 'PRE');

    // all of these require a value stored with chrome storage api, therefore, they are grouped
    chrome.storage.local.get({ presetLabel: false, presetTabs: false, presetLanguage: false }, async function (result) {

        /*
         * Extract label [primary key in fragment database, also the name of the fragment in tree view in vsc extension]
         * -> see github issue on this topic: https://github.com/smn57/frag.extract.a/issues/6
         */
        // if user sets the option to preset the label as a copy of description
        if (result.presetLabel) {
            label = description;
        }

        /*
         * Extract tags [used to quickly access fragments relating to something specific in tree view in vsc extension]
         * -> SO's tags for questions are used
         */
        /*
         * Extract scope [language the codeblock is written in]
         * -> SO's tags for questions are matched to predefined languageList
         */
        /*
         * Extract domain [libraries or frameworks that are used in the codeblock, use of this attribute is unclear]
         * -> SO's tags for questions are presented as options in popup
         */
        // if user sets the option to preselect all tabs
        if (result.presetTabs) {
            // get all tags from SO page, remove links from name with regex, then for every tag found check if it's in the language list and add it to scope, or if not add it to tags
            Array.from(document.getElementById('question').getElementsByClassName('post-tag')).map(tag => tag.href.replace(/https:\/\/stackoverflow.com\/questions\/tagged\//, '')).forEach(tag => {
                if (languageList.includes(tag)) {
                    scopeArray.push(tag);
                } else {
                    // second value determines wether this option is selected or not
                    tagArray.push([tag, true]);
                    domainArray.push([tag, false]);
                }
            });
        } else {
            // get all tags from SO page, remove links from name with regex, then for every tag found check if it's in the language list and add it to scope, or if not add it to tags
            Array.from(document.getElementById('question').getElementsByClassName('post-tag')).map(tag => tag.href.replace(/https:\/\/stackoverflow.com\/questions\/tagged\//, '')).forEach(tag => {
                if (languageList.includes(tag)) {
                    scopeArray.push(tag);
                } else {
                    // second value determines wether this option is selected or not
                    tagArray.push([tag, false]);
                    domainArray.push([tag, false]);
                }
            });
        }

        /*
         * Extract body [codeblock of the fragment]
         * -> best codeblock in the answers is selected
         */
        const model = await create_Model(MODEL_URL);
        const vocab = await create_Vocab(VOCAB_URL);

        /* ISSUE: is that if even needed? if the codeblocks array is empty, the for clause will not be executed and ranking.sort(sortFunction)
        should work on an empty array, right? Maybe body = ranking[0][1] needs to be put in an if clause */

        // determine which codeblock is the best for fragment in here
        if (codeblocks.length) {
            // we evaluate each answer in concatenation with the question
            // the codeblock with the highest prediction gets chosen
            // remove trailing whitespace
            // body = codeblocks[0].innerText.replace(/\s$/, '');
            if (codeblocks.length > 5) {
                codeblocks = codeblocks.slice(0, 5);
            }

            let ranking = []
            for (let i = 0; i < codeblocks.length; i++) {
                let input = description.concat(border, codeblocks[i].innerText.replace(/\s$/, ''))
                const prob = await evaluate(input.split(" "), model, vocab)
                console.log(prob)
                const tupel = [prob, codeblocks[i].innerText.replace(/\s$/, '')]
                ranking.push(tupel)
            }
            console.log(ranking)
            ranking.sort(sortFunction);
            console.log(ranking)
            console.log(ranking[0][1])
            body = ranking[0][1];

            /* ISSUE: codeblocks[0] is NOT the codeblock found by the model. The model uses the innerText of codeblock dom element
            => no way to get the dom element of the selected codeblock */

            // set scrollpos
            // does not work properly: target codeblock is just below the screen, not visible, instead of at the top of the screen
            scrollpos = codeblocks[0].getBoundingClientRect().top; //window.pageYOffset - codeblocks[0].getBoundingClientRect().y;

            /* ISSUE: this needs to happen after the codeblock was actually selected (not sure if thats the case currently) */

            // almost all cases where multiple languages are tagged are javascript and html
            // therefore an attempt is made to determine which of these languages the selected codeblock is
            // also sets the first language in the array as the selected one
            detectJsHtml(body);
        }

        /* ISSUE: this needs to happen after the codeblock was actually selected (after detectJSHtml(body) was executed) (not sure if thats the case currently) */

        // set the scope as preselected option for tags as well, if user selected that option
        if (result.presetLanguage && scope) {
            tagArray.push([scope, true]);
        }
    });

    /* ISSUE: all of the above functions need to happen before sendResponse is executed in the chrome.runtime.onMessage.addListener function down below */

    // create Add to fragment buttons on every codeblock
    codeblocks.forEach(codeblock => {
        let button = document.createElement('button');
        button.setAttribute("type", "button");
        button.setAttribute("style", "float: right; ");

        button.innerHTML = String.fromCharCode(8631);
        // insert them after the code, but still inside grey box
        codeblock.insertAdjacentElement('afterend', button);
        button.addEventListener(
            'click', function (event) {
                // remove trailing whitespace
                const newCodeblock = event.currentTarget.parentElement.firstChild.innerText.replace(/\s$/, '');
                // check if lanuage needs to be changed
                detectJsHtml(newCodeblock);
                // set scrollposs
                scrollpos = event.currentTarget.parentElement.firstChild.getBoundingClientRect().top; // - event.currentTarget.parentElement.firstChild.getBoundingClientRect().height;

                chrome.storage.local.get(['url'], function (result) {
                    // check if the URL of the SO question page is the same as is saved, meaning the automatically extracted fragment was already saved in storage
                    // if this is a different page, set the correct values for storage
                    if (window.location != result.url) {
                        chrome.storage.local.set({
                            url: window.location,
                            label: label,
                            scope: scope,
                            scopeArray: scopeArray,
                            body: newCodeblock,
                            description: description,
                            tags: tagArray,
                            domain: domainArray
                        }, function () {
                            // open the popup window
                            chrome.runtime.sendMessage({ content: 'add' });
                        });
                    }
                    // if this is the same page, only the new, user selected codeblock and possibly changed language need to be saved
                    else {
                        chrome.storage.local.set({ body: newCodeblock, scope: scope, scopeArray: scopeArray }, function () {
                            // open the popup window
                            chrome.runtime.sendMessage({ content: 'add' });
                        });
                    }
                });
            }
        );
    });
};

function detectJsHtml(codeblock) {
    // only works for html and javascript
    if (scopeArray.length == 2 && scopeArray.every(language => ['javascript', 'html'].includes(language))) {
        // detect html features
        if (/<(\S+).*>.*<\/\1>/s.test(codeblock)) {
            // put html first in array so it will be shown as the language with javascript accessible in a dropdown menu
            scopeArray = ['html', 'javascript'];
        }
        else {
            scopeArray = ['javascript', 'html'];
        }
    }
    // set the first language as the selected one
    if (scopeArray[0]) {
        scope = scopeArray[0];
    }
};

// This functions takes an 2d Array as Input and returns the array sorted by its 1st column in descending order
function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] > b[0]) ? -1 : 1;
    }
}

// This function takes an URL and makes and HTTP Request
function Get(yourUrl) {
    let Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", yourUrl, false);
    Httpreq.send(null);
    return Httpreq.responseText;
}

// This function takes an URL and returns the TensorflowLayersModel which should lie at the other side
async function create_Model(url) {
    let back = await tf.loadLayersModel(url);
    return back;
}

// This function takes an URL and returns the JSON object which should lie at the other side
async function create_Vocab(url) {
    let back = JSON.parse(Get(url));
    return back;
}

// this function takes a tokenized string as input and returns a probability of
// the given intent (tokens before border - token) and
// and codeblock being a good fit
function evaluate(seedWord, mod, voc) {
    // tensor to return later
    let to_return = new Array(MAX_LEN).fill(0);
    let length = seedWord.length;
    // If the word is in our dictionary we assign it it's value
    // else it gets "deleted" by the offset
    let offset = 0;
    for (let i = 0; i < length; i++) {
        if (voc.hasOwnProperty(seedWord[i])) {
            to_return[i - offset] = voc[seedWord[i]]
        }
        else {
            offset = offset + 1;
        }
    }
    const shape = [1, MAX_LEN]
    // calling the model
    // let ret = tf.loadLayersModel(MODEL_URL).then(model => {
    const result = mod.predict(tf.tensor(to_return, shape))
    let resultData = result.dataSync();
    let back = resultData[0]
    //     return back;
    // });
    return back;
}

// handle requests from other parts of extension
// only popup.js sends requests
chrome.runtime.onMessage.addListener(function (recieved, sender, sendResponse) {

    // when extension popup is opened on a site different to the last one 
    // hand over automatically extracted fragment to the popup to display and be edited by user
    if (recieved.content == 'setPopup') {
        sendResponse({ url: window.location, label: label, scope: scope, scopeArray: scopeArray, body: body, description: description, tags: tagArray, domain: domainArray });
    }

    // when jump to codeblock button is clicked
    // scroll page to position of codeblock that's loaded in the fragment editor
    else if (recieved.content == 'scroll') {
        scroll(0, scrollpos);
    }
});