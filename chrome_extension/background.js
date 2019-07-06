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
  chrome.storage.local.remove(['label', 'scope', 'body', 'description', 'tags', 'domain']);
});

chrome.runtime.onMessage.addListener(function (recieved, callback) {
  if (recieved.content == 'sendNativeMessage') {
    chrome.storage.local.get({ 'label': "", 'scope': "", 'body': "", 'description': "", 'tags': "", 'domain': "" }, function (result) {
      // construct database fragment to be send to python script
      var message = {};
      message.label = result.label;
      message.prefix = result.body.replace(/(?: |\.|,|:|\(|\{|\+|-|=|"|'|<|;).*/, '');
      message.scope = result.scope;
      message.body = result.body;
      message.description = result.description;
      message.keywords = "";
      message.tags = result.tags;
      message.domain = result.domain;
      message.placeholders = "";

      chrome.runtime.sendNativeMessage('com.frag.extract', message);
      chrome.storage.local.remove(['label', 'scope', 'body', 'description', 'tags', 'domain']);
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { content: 'extract' });
      });
    });
  } else if (recieved.content == 'add') {
    window.open("popup.html", "extension_popup", "width=300,height=400,status=no,scrollbars=no,resizable=no");
  }
});