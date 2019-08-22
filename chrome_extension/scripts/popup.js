document.addEventListener("DOMContentLoaded", function() {
  // restores previous state / sets up new state
  setup();

  // save button
  document.getElementById("form").addEventListener("submit", function() {
    // saves fragment to database via python script in frag.edit vsc extension
    chrome.runtime.sendMessage({ content: "sendNativeMessage" }, function() {
      window.close();
    });
  });

  // cancel button
  document.getElementById("cancel").addEventListener("click", function() {
    // clears current state, when popup is reopened it will fetch automatically extracted fragment from content script
    chrome.storage.local.remove(
      [
        "url",
        "label",
        "scope",
        "scopeArray",
        "body",
        "description",
        "tags",
        "domain",
        "jumpto"
      ],
      function() {
        window.close();
      }
    );
  });

  // jump to codeblock button
  document.getElementById("jumpto").addEventListener("click", function() {
    // scroll the page to the position of the codeblock that's in the editor on page
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { content: "scroll" });
    });
  });

  // working hyperlinks, only used for the "More information on creating VS Code Snippets" at the bottom
  window.addEventListener("click", function(event) {
    if (event.target.href !== undefined) {
      chrome.tabs.create({ url: event.target.href });
    }
  });

  // save content of input fields
  document.getElementById("label").addEventListener("input", function() {
    chrome.storage.local.set({ label: this.value });
  });
  document.getElementById("scope").addEventListener("input", function() {
    chrome.storage.local.set({ scope: this.value });
  });
  document.getElementById("body").addEventListener("input", function() {
    chrome.storage.local.set({ body: this.value });
  });
  document.getElementById("description").addEventListener("input", function() {
    chrome.storage.local.set({ description: this.value });
  });
  // state changes of tags and domain fields are saved by the onChipAdd and onChipDelete functions defined in the setChips function
});

function setup() {
  // get the previous state from storage
  chrome.storage.local.get(
    {
      url: "",
      label: "",
      scope: "",
      scopeArray: [""],
      body: "",
      description: "",
      tags: [["", false]],
      domain: [["", false]],
      jumpto: false
    },
    function(result) {
      // returns array of length 1 with the currently viewed tab
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        /*
         * Reopening popup on last site -> state is restored
         */
        // if you're still on the site the poup was last opened, load last state with your changes from the automatically extracted fragment
        // also true when real popup is opened after clicking an Add to Fragment on SO question page, correct data in storage in this case guaranteed by content script
        if (
          tabs[0].url == result.url ||
          tabs[0].url ==
            "chrome-extension://faoicolglehmgplpccapgobineahofjh/popup.html"
        ) {
          // load saved state as input
          loadState(result);

          // jump to codeblock gets greyed out if no codeblock was found on SO page or real popup is opened, because addressing the content script from there does not work
          if (
            !result.jumpto ||
            tabs[0].url ==
              "chrome-extension://faoicolglehmgplpccapgobineahofjh/popup.html"
          ) {
            document.getElementById("jumpto").disabled = true;
          }
        }

        /*
         * Opening popup on new SO question page -> collecting fragment from content script
         */
        // if you're on a different SO question page (where the content script was injected), load automatically extracted fragment
        else if (
          /https:\/\/stackoverflow.com\/questions\/\d*\/.*/.test(tabs[0].url)
        ) {
          chrome.tabs.sendMessage(tabs[0].id, { content: "setPopup" }, function(
            response
          ) {
            // error handling, if extension is installed and tab is not reloaded (meaning the content script has not been injected)
            if (chrome.runtime.lastError) {
              // the tab gets reloaded to inject the current version of the content script and popup window is immediatly closed
              chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
              window.close();
            } else {
              // load response from content script as input
              loadState(response);

              // if no codeblock was found, grey out jump to codeblock button
              if (!response.jumpto) {
                document.getElementById("jumpto").disabled = true;
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
                jumpto: response.jumpto
              });
            }
          });
        }

        /*
         * Opening popup on NOT a question page -> don't load last state and no suggested fragment
         */
        // if you're on a different site (not a SO question page), clear last state and load empty editor
        else {
          chrome.storage.local.remove([
            "label",
            "scope",
            "scopeArray",
            "body",
            "description",
            "tags",
            "domain"
          ]);
          // so that state is restored upon reopening of the popup
          chrome.storage.local.set({ url: tabs[0].url, jumpto: false });
          // also change title to no longer say "Suggested Fragment"
          document.getElementById("title").innerText = "No Fragment found";
          // grey out jump to codeblock
          document.getElementById("jumpto").disabled = true;
          // to initialize the chips elements
          loadState({
            label: "",
            scope: "",
            scopeArray: [""],
            body: "",
            description: "",
            tags: [["", false]],
            domain: [["", false]]
          });
        }
      });
    }
  );
}

function loadState(input) {
  // input contains all the fragment attributes that were extracted from the question page by content script
  document.getElementById("label").value = input.label;
  document.getElementById("body").value = input.body;
  document.getElementById("description").value = input.description;
  document.getElementById("scope").value = input.scope;

  // set the question title (= description) as suggestion for label
  const labelSuggestion = document.createElement("option");
  labelSuggestion.value = input.description;
  document.getElementById("labellist").appendChild(labelSuggestion);

  // sets all initial tag chips and adds the rest as autocomplete options
  const tagchips = document.getElementById("tagchips");
  setChips(input.tags, tagchips, "tags");

  // sets all initial domain chips and adds the rest as autocomplete options
  const domainchips = document.getElementById("domainchips");
  setChips(input.domain, domainchips, "domain");

  // set the select options for scope
  const scopelist = document.getElementById("scopelist");
  input.scopeArray.forEach(language => {
    const newOption = document.createElement("option");
    newOption.value = language;
    scopelist.appendChild(newOption);
  });
}

function setChips(tags, domElement, name) {
  // array containing all initial tags
  // format: [{ tag: 'elem0' }, { tag: 'elem1' }]
  const tagData = [];
  // object containing all other tags as autocomplete options
  // format: { 'elem0': null, 'elem1': null }
  const autocompleteTags = {};
  // popuplate above data structures
  tags.forEach(tag => {
    // if second attribute is true, the tag will be preselected
    if (tag[1]) {
      tagData.push({ tag: tag[0] });
    } else {
      autocompleteTags[tag[0]] = null;
    }
  });

  // initialize chips element
  const instance = M.Chips.init(domElement, {
    data: tagData,
    placeholder: "+",
    secondaryPlaceholder: "+",
    autocompleteOptions: {
      data: autocompleteTags,
      limit: Infinity,
      // offers list of all autocomplete options even before one starts typing
      minLength: 0
    },
    onChipAdd: (event, chip) => {
      const newChip = chip.childNodes[0].nodeValue;
      const index = tags.map(tag => tag[0]).indexOf(newChip);
      // the new chip is part of the saved tags already
      if (index != -1) {
        tags[index] = [newChip, true];
        // remove newChip from autocomplete
        delete autocompleteTags[newChip];
        instance.autocomplete.updateData(autocompleteTags);
      } else {
        tags.push([newChip, true]);
      }
      // save the modified array containing the chips and autocomplete options to storage
      const storageItem = {};
      storageItem[name] = tags;
      chrome.storage.local.set(storageItem);
    },
    onChipDelete: (event, chip) => {
      const removedChip = chip.childNodes[0].nodeValue;
      const index = tags.map(tag => tag[0]).indexOf(removedChip);
      // just in case user adds and deletes a chip faster than onChipAdd was executed
      if (index != -1) {
        tags[index] = [removedChip, false];
        // add removedChip to autocomplete
        autocompleteTags[removedChip] = null;
        instance.autocomplete.updateData(autocompleteTags);
      }
      // save the modified array containing the chips and autocomplete options to storage
      const storageItem = {};
      storageItem[name] = tags;
      chrome.storage.local.set(storageItem);
    }
  });
}
