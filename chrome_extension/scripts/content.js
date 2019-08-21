// these variables need to be accessible through the entire life of the page this script was injected in
// for the jumpto button, second one is so that it can be reset to the original, if user clicks cancel
let bodyElem = "",
  origBodyElem = "";
// all the fragment elements, that get send to popup
let label = "",
  scope = "",
  scopeArray = [],
  body = "",
  description = "",
  tagArray = [],
  domainArray = [],
  jumpto = false;
// for ensuring, that setup is run (eaming the fragment gets extracted from the page) before the fragment is sent to the popup
let setupComplete = false,
  callback;

const MODEL_URL =
  "https://flori-boy.github.io/Hosting_Test/tensorflowjs_model_small/model.json";
const VOCAB_URL = "https://flori-boy.github.io/Hosting_Test/vocab.json";
const MAX_CODEBLOCKS = 5;
const MAX_LEN = 125;
const border = " UNIQUE_BORDER_SYMBOL ";

// list of all languages that can be recognized from tags
// this list is not comprehensive, please add any further programming lanuages you may think of
const languageList = [
  "javascript",
  "java",
  "c#",
  "php",
  "python",
  "html",
  "c++",
  "css",
  "sql",
  "c",
  "r",
  "objective-c",
  "swift",
  "ruby",
  "excel",
  "vba",
  "vb.net",
  "scala",
  "typescript",
  "matlab",
  "bash",
  "shell",
  "go",
  "rust",
  "octave"
];

// run setup when content script is injected into SO page
setup();

async function setup() {
  /*
   * Extract description [description of functionality in codeblock]
   * -> question title is used
   */
  const questionHeader = document.getElementById("question-header");
  if (questionHeader) {
    // remove potential "[closed]" and "Ask Question" from question header
    description = questionHeader.innerText.replace(
      /(?: \[closed\]| \[duplicate\])?\sAsk Question$/,
      ""
    );
  }

  // all codeblocks in all answers without inline code
  const codeblocks = Array.from(
    document.getElementById("answers").getElementsByTagName("code")
  ).filter(codeblock => codeblock.parentElement.tagName == "PRE");

  // all of these require a value stored with chrome storage api, therefore, they are grouped
  chrome.storage.local.get(
    { presetLabel: false, presetTabs: false, presetLanguage: false },
    async function(result) {
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
        // get all tags from SO page, then for every tag found check if it's in the language list and add it to scope, or if not add it to tags
        Array.from(
          document.getElementById("question").getElementsByClassName("post-tag")
        )
          .map(tag => tag.textContent)
          .forEach(tag => {
            if (languageList.includes(tag)) {
              scopeArray.push(tag);
            } else {
              // second value determines wether this option is selected or not
              tagArray.push([tag, true]);
              domainArray.push([tag, false]);
            }
          });
      } else {
        // get all tags from SO page, then for every tag found check if it's in the language list and add it to scope, or if not add it to tags
        Array.from(
          document.getElementById("question").getElementsByClassName("post-tag")
        )
          .map(tag => tag.textContent)
          .forEach(tag => {
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
      // load the model, hosted at url set at the top
      const model = await tf.loadLayersModel(MODEL_URL);
      // load the vocabulary, hosted at url set at the top
      const vocab = fetch(VOCAB_URL).then(response => response.json());

      // only the first MAX_CODEBLOCKS many codeblocks will be evaluated, otherwise evaluaten will take too long for questions with a lot of answers
      const searchblocks = codeblocks
        .slice(0, MAX_CODEBLOCKS)
        .map(block => block.innerText.replace(/\s$/, ""));

      // we evaluate each answer in concatenation with the question (= description)
      // the codeblock with the highest prediction gets chosen
      const ranking = [];
      await searchblocks.forEach(async searchblock => {
        const input = description.concat(border, searchblock);
        const prob = await evaluate(input.split(" "), model, vocab);
        console.log(prob);
        ranking.push([prob, searchblock]);
      });
      console.log(ranking);
      ranking.sort(sortFunction);
      console.log(ranking);

      if (ranking[0]) {
        console.log(ranking[0][1]);
        body = ranking[0][1];

        // find the index of the selected codeblock, in order to get it's DOM element
        const index = searchblocks.indexOf(body);
        if (index != -1) {
          // saves the dom element of the selected codeblock to scroll to it when jump to fragment button is clicked by user
          origBodyElem = codeblocks[index];
          // allows the jump to codeblock button in popup to not be disabled
          jumpto = true;
        }
      }

      // almost all cases where multiple languages are tagged are javascript and html
      // therefore an attempt is made to determine which of these languages the selected codeblock is
      scopeArray = detectJsHtml(body);
      // set the first language as the selected one
      if (scopeArray[0]) {
        scope = scopeArray[0];
      }

      // set the scope as preselected option for tags as well, if user selected that option
      if (result.presetLanguage && scope) {
        tagArray.push([scope, true]);
      }

      // so that the listener for the message from the popup knows, if setup is finished
      setupComplete = true;
      // callback is set to the response function of the listener for messages, if the user opens the popup before setup is complete
      if (callback) {
        // then setup will send the response containing the fragment to popup once it is complete
        callback({
          url: window.location,
          label: label,
          scope: scope,
          scopeArray: scopeArray,
          body: body,
          description: description,
          tags: tagArray,
          domain: domainArray,
          jumpto: jumpto
        });
      }
    }
  );

  // create Add to fragment buttons on every codeblock
  codeblocks.forEach(codeblock => {
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("style", "float: right; ");

    button.innerHTML = String.fromCharCode(8631);
    // insert them after the code, but still inside grey box
    codeblock.insertAdjacentElement("afterend", button);
    button.addEventListener("click", function(event) {
      // remove trailing whitespace
      const newCodeblock = codeblock.innerText.replace(/\s$/, "");
      // set scrollpos
      bodyElem = codeblock;
      // check if lanuage needs to be changed
      const newScopeArray = detectJsHtml(newCodeblock);
      // set the first language as the selected one
      let newScope = "";
      if (newScopeArray[0]) {
        newScope = newScopeArray[0];
      }

      chrome.storage.local.get(["url"], function(result) {
        // check if the URL of the SO question page is the same as is saved, meaning the automatically extracted fragment was already saved in storage
        // if this is a different page, set the correct values for storage
        if (window.location != result.url) {
          chrome.storage.local.set(
            {
              url: window.location,
              label: label,
              scope: newScope,
              scopeArray: newScopeArray,
              body: newCodeblock,
              description: description,
              tags: tagArray,
              domain: domainArray,
              jumpto: true
            },
            function() {
              // open the popup window
              chrome.runtime.sendMessage({ content: "add" });
            }
          );
        }
        // if this is the same page, only the new, user selected codeblock and possibly changed language need to be saved
        else {
          chrome.storage.local.set(
            {
              body: newCodeblock,
              scope: newScope,
              scopeArray: newScopeArray,
              jumpto: true
            },
            function() {
              // open the popup window
              chrome.runtime.sendMessage({ content: "add" });
            }
          );
        }
      });
    });
  });
}

function detectJsHtml(codeblock) {
  // only works for html and javascript
  if (
    scopeArray.length == 2 &&
    scopeArray.every(language => ["javascript", "html"].includes(language))
  ) {
    // detect html features
    if (/<(\S+).*>.*<\/\1>/s.test(codeblock)) {
      // put html first in array so it will be shown as the language with javascript accessible in a dropdown menu
      return ["html", "javascript"];
    } else {
      return ["javascript", "html"];
    }
  } else {
    return scopeArray;
  }
}

// This functions takes an 2d Array as Input and returns the array sorted by its 1st column in descending order
function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] > b[0] ? -1 : 1;
  }
}

// this function takes a tokenized string as input and returns a probability of
// the given intent (tokens before border - token) and
// and codeblock being a good fit
function evaluate(seedword, model, vocab) {
  // tensor to return later
  const to_return = new Array(MAX_LEN).fill(0);

  // If the word is in our dictionary we assign it it's value
  // else it gets "deleted" by the offset
  let offset = 0;
  for (let i = 0; i < seedword.length; ++i) {
    if (vocab.hasOwnProperty(seedword[i])) {
      to_return[i - offset] = vocab[seedword[i]];
    } else {
      ++offset;
    }
  }

  const shape = [1, MAX_LEN];

  return model.predict(tf.tensor(to_return, shape)).dataSync()[0];
}

// handle requests from other parts of extension
// only popup.js sends requests
chrome.runtime.onMessage.addListener(function(recieved, sender, sendResponse) {
  // when extension popup is opened on a site different to the last one
  // hand over automatically extracted fragment to the popup to display and be edited by user
  if (recieved.content == "setPopup") {
    // after all the attributes of the fragment where extracted from the site
    if (setupComplete) {
      // so that the scroll position is also reset when the user presses cancel in popup
      bodyElem = origBodyElem;
      sendResponse({
        url: window.location,
        label: label,
        scope: scope,
        scopeArray: scopeArray,
        body: body,
        description: description,
        tags: tagArray,
        domain: domainArray,
        jumpto: jumpto
      });
    }
    // if user opens the popup, before setup finishes, let popup.js wait, setup() will then send the response once it completes
    else {
      callback = sendResponse;
      return true;
    }
  }

  // when jump to codeblock button is clicked
  // scroll page to position of codeblock that's loaded in the fragment editor
  else if (recieved.content == "scroll") {
    bodyElem.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest"
    });
  }
});
