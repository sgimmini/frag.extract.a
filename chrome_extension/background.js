chrome.runtime.onInstalled.addListener(function () {

  // Extension popup menu can only be opened stackoverflow.com
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: 'stackoverflow.com' },
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.runtime.onMessage.addListener(function (recieved) {
  if (recieved.content == 'sendNativeMessage') {
    chrome.storage.local.get({ 'label': "", 'scope': "", 'body': "", 'description': "", 'tags': "", 'domain': "" }, function (result) {
      // construct database fragment as message to be send to python script
      var message = {};
      // all trailing whitespace is trimmed and prefix is set as the first word in the codeblock
      message.label = result.label.replace(/\s$/, '');
      message.prefix = result.body.replace(/(?: |\.|,|:|\(|\{|\+|-|=|"|'|<|;).*/, '');
      message.scope = result.scope.replace(/\s$/, '');
      message.body = result.body.replace(/\s$/, '');
      message.description = result.description.replace(/\s$/, '');
      message.keywords = "";
      message.tags = result.tags.replace(/\s$/, '');
      message.domain = result.domain.replace(/\s$/, '');
      message.placeholders = "";

      // send fragment as message to python script to be added to the database
      chrome.runtime.sendNativeMessage('com.frag.extract', message);
      // clears current state, when popup is reopened it will fetch automatically extracted fragment from content script
      chrome.storage.local.remove(['url', 'label', 'scope', 'body', 'description', 'tags', 'domain', 'jumpto']);
    });
  } // opens the extension popup as normal browser popup when user hits an Add to fragment button on page, since extension popup cannot be opened programmatically
  else if (recieved.content == 'add') {
    // width and height need to be adapted, scrollbars=no seems to not do anything, there are still scrollbars
    const popup = window.open("popup.html", "extension_popup", "width=300,height=400,status=no,scrollbars=no,resizable=no");
    // set listener for mouse down, to close popup automatically when user clicks somewhere outside of popup (like extension popup behaviour)
    popup.addEventListener('blur', function () {
      popup.close();
    });
  }
});