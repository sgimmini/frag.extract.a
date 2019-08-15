// these variables need to be accessible through the entire life of the page this script was injected in
let scrollpos = 0;
let label = "", scopeArray = [], body = "", description = "", tagArray = [];
const MODEL_URL = "https://flori-boy.github.io/Hosting_Test/tensorflowjs_model_small/model.json";
const VOCAB_URL = "https://flori-boy.github.io/Hosting_Test/vocab.json"
const MAX_LEN = 195
const border = " stop "
// list of all languages that can be recognized from tags
// this list is not comprehensive, please add any further programming lanuages you may think of
const languageList = ['javascript', 'java', 'c#', 'php', 'python', 'html', 'c++', 'css', 'sql', 'c', 'r', 'objective-c', 'swift', 'ruby', 'excel', 'vba', 'vb.net', 'scala', 'typescript', 'matlab', 'bash', 'shell', 'go', 'rust', 'octave'];
// import tensorflowjs for machine learning



// this function takes a tokenized string as input and returns a probability of
// the given intent (tokens before border - token) and
// and codeblock being a good fit
async function evaluate(seedWord) {
    // get the JSON from URL
    return fetch(VOCAB_URL)
    .then(function(resp){
        return resp.json();
    })
    .then(function(data){
        // tensor to return later
        var to_return = new Array(MAX_LEN).fill(0);
        var length = seedWord.length;
        // If the word is in our dictionary we assign it it's value
        // else it gets "deleted" by the offset
        var offset = 0;
        for(var i = 0; i < length; i++){
            if(data.hasOwnProperty(seedWord[i])){
                to_return[i-offset] = data[seedWord[i]]
            }
            else{
                offset = offset +1;
            }
        }
        const shape = [1, MAX_LEN]
        // calling the model
        tf.loadLayersModel(MODEL_URL).then(model =>{
            const result = model.predict(tf.tensor(to_return, shape))
            var resultData = result.dataSync();
            console.log(resultData[0]-1);
            return resultData[0]-1;
        });
    });
    }

// run setup when content script is injected into SO page
setup();

function setup() {
    /*
     * Extract description [description of functionality in codeblock]
     * -> question title is used
     */
    const questionHeader = document.getElementById('question-header');
    if (questionHeader) {
        // remove potential "[closed]" and "Ask Question" from question header
        description = questionHeader.innerText.replace(/(?: \[closed\]| \[duplicate\])?\sAsk Question$/, '');
    }
    /*
     * Extract body [codeblock of the fragment]
     * -> best codeblock in the answers is selected
     */
    // all codeblocks in all answers without inline code
    const codeblocks = Array.from(document.getElementById('answers').getElementsByTagName('code')).filter(codeblock => codeblock.parentElement.tagName == 'PRE');
    
    // determine which codeblock is the best for fragment in here
    if (codeblocks.length) {
        // for now: always use top answers first codeblock
        // remove trailing whitespace
        //  body = codeblocks[0].innerText.replace(/\s$/, '');
        var ranking = []
        for(var i = 0; i < codeblocks.length; i++){
            var input = description.concat(border, codeblocks[i].innerText.replace(/\s$/, ''))
            var prob = evaluate(input.split(" "))
            console.log(prob)
            var tupel = [prob, codeblocks[0].innerText.replace(/\s$/, '')]
            ranking.push(tupel)
        }
        ranking.sort(function(a, b){
            return a[0] > b[0] ? 1 : -1;
        })

        body = ranking[0][1];
        // set scrollpos
        // does not work properly: target codeblock is just below the screen, not visible, instead of at the top of the screen
        scrollpos = codeblocks[0].getBoundingClientRect().top; //window.pageYOffset - codeblocks[0].getBoundingClientRect().y;
    }


    /*
     * Extract label [primary key in fragment database, also the name of the fragment in tree view in vsc extension]
     * -> see github issue on this topic: https://github.com/smn57/frag.extract.a/issues/6
     */
    /*
     * Extract tags [used to quickly access fragments relating to something specific in tree view in vsc extension]
     * -> SO's tags for questions are used
     */
    /*
     * Extract scope [language the codeblock is written in]
     * -> SO's tags for questions are matched to predefined languageList
     */
    // all of these require a value stored with chrome storage api, therefore, they are grouped
    chrome.storage.local.get({ presetLabel: false, presetTabs: false }, function (result) {
        // if user sets the option to preset the label as a copy of description
        if (result.presetLabel) {
            label = description;
        }
        // if user sets the option to preselect all tabs
        if (result.presetTabs) {
            // get all tags from SO page, remove links from name with regex, then for every tag found check if it's in the language list and add it to scope, or if not add it to tags
            Array.from(document.getElementById('question').getElementsByClassName('post-tag')).map(tag => tag.href.replace(/https:\/\/stackoverflow.com\/questions\/tagged\//, '')).forEach(tag => {
                if (languageList.includes(tag)) {
                    scopeArray.push(tag);
                } else {
                    // second value determines wether this option is selected or not
                    tagArray.push([tag, true]);
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
                }
            });
        }
    });
    // almost all cases where multiple languages are tagged are javascript and html
    // therefore an attempt is made to determine which of these languages the selected codeblock is
    detectJsHtml(body);

    /*
     * Extract domain [libraries or frameworks that are used in the codeblock, use of this attribute is unclear]
     * -> SO's tags for questions are presented as options in popup, no action needed in content script
     */

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
                detectJsHtml(newCodeblock)
                // set scrollposs
                scrollpos = event.currentTarget.parentElement.firstChild.getBoundingClientRect().top; // - event.currentTarget.parentElement.firstChild.getBoundingClientRect().height;

                chrome.storage.local.get(['url'], function (result) {
                    // check if the URL of the SO question page is the same as is saved, meaning the automatically extracted fragment was already saved in storage
                    // if this is a different page, set the correct values for storage
                    if (window.location != result.url) {
                        chrome.storage.local.set({
                            url: window.location,
                            label: label,
                            scope: scopeArray,
                            body: newCodeblock,
                            description: description,
                            tags: tagArray
                        }, function () {
                            // open the popup window
                            chrome.runtime.sendMessage({ content: 'add' });
                        });
                    }
                    // if this is the same page, only the new, user selected codeblock and possibly changed language need to be saved
                    else {
                        chrome.storage.local.set({ body: newCodeblock, scope: scopeArray }, function () {
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
};

// handle requests from other parts of extension
// only popup.js sends requests
chrome.runtime.onMessage.addListener(function (recieved, sender, sendResponse) {

    // when extension popup is opened on a site different to the last one 
    // hand over automatically extracted fragment to the popup to display and be edited by user
    if (recieved.content == 'setPopup') {
        sendResponse({ url: window.location, label: label, scope: scopeArray, body: body, description: description, tags: tagArray });
    }

    // when jump to codeblock button is clicked
    // scroll page to position of codeblock that's loaded in the fragment editor
    else if (recieved.content == 'scroll') {
        scroll(0, scrollpos);
    }
});