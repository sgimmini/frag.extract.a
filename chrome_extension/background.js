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

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.storage.local.remove(['label', 'prefix', 'scope', 'body', 'description', 'tags', 'domain', 'blocknumber']);
});

chrome.runtime.onMessage.addListener(function (recieved, callback) {
  if (recieved.content == 'sendNativeMessage') {
    chrome.storage.local.get({ 'label': "", 'prefix': "", 'scope': "", 'body': "", 'description': "", 'tags': "", 'domain': "" }, function (result) {
      var message = {};
      message.label = result.label;
      message.prefix = result.prefix;
      message.scope = result.scope;
      message.body = result.body;
      message.description = result.description;
      message.keywords = "";
      message.tags = result.tags;
      message.domain = result.domain;
      message.placeholders = "";
      chrome.runtime.sendNativeMessage('com.frag.extract', message);
      chrome.storage.local.remove(['label', 'prefix', 'scope', 'body', 'description', 'tags', 'domain']);
    });
  } else if (recieved.content == 'add') {
    window.open("popup.html", "extension_popup", "width=300,height=400,status=no,scrollbars=yes,resizable=no");
  }
});