chrome.runtime.onInstalled.addListener(function () {

  // Extension popup menu can only be opened stackoverflow.com
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: 'stackoverflow.com' }
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// handle runtime background tasks for the extension
chrome.runtime.onMessage.addListener(function (recieved, sender, sendResponse) {

  // save button was successfully clicked in extension popup, fragment now needs to be send to external python script to be saved to database
  if (recieved.content == 'sendNativeMessage') {
    chrome.storage.local.get({ label: "", scope: "", body: "", description: "", tags: [["", false]], domain: [["", false]] }, function (result) {
      // construct database fragment as message to be send to python script
      const message = {};
      // all trailing whitespace is trimmed
      message.label = result.label.replace(/\s$/, '');
      // prefix is set as the first word in the codeblock: initial widespace is deleted, then everything after the next whitespace is deleted
      message.prefix = result.body.replace(/^\s+/s, '').replace(/\s.*/s, '');
      // scope contains the actually selected language
      message.scope = result.scope.replace(/\s$/, '');
      message.body = result.body.replace(/\s$/, '');
      message.description = result.description.replace(/\s$/, '');
      // only used in vsc extension, only included here if in the future someone decides to utilize this attribute in chrome extension
      message.keywords = "";
      // first reduce the array of arrays to all selected tags, then form array of arrays into array of strings (removing the bool if it was selected), then join the strings to one
      message.tags = result.tags.filter(innerArray => innerArray[1]).map(innerArray => innerArray[0].replace(/\s$/, '')).join(', ');
      message.domain = result.domain.filter(innerArray => innerArray[1]).map(innerArray => innerArray[0].replace(/\s$/, '')).join(', ');
      // vsc extension functionality to recognize variables writes their name and type in here,  only included here if in the future someone decides to utilize this attribute in chrome extension
      message.placeholders = "";

      // send fragment as message to python script to be added to the database
      chrome.runtime.sendNativeMessage('com.frag.extract', message);
      // clears current state, when popup is reopened it will fetch automatically extracted fragment from content script
      chrome.storage.local.remove(['url', 'label', 'scope', 'scopeArray', 'body', 'description', 'tags', 'domain', 'jumpto']);
    });
    // this line fixes an inexplicable error and has no other use whatsoever
    sendResponse({ a: "" });
  }


  // an add to fragment button in SO question page was clicked
  // opens the extension popup as normal browser popup, since extension popup cannot be opened programmatically
  else if (recieved.content == 'add') {
    // width and height need to be adapted, scrollbars=no seems to not do anything, there are still scrollbars
    const popup = window.open("popup.html", "extension_popup", "width=370,height=566,status=no,scrollbars=no,resizable=no");
    // set listener for when window becomes inactive, to close popup automatically when user clicks somewhere outside of popup (like extension popup behaviour)
    popup.addEventListener('blur', function () {
      popup.close();
    });
  }
});