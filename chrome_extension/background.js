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

      // send fragment as message to python script to be added to the database
      chrome.runtime.sendNativeMessage('com.frag.extract', message);
      // clear current state
      chrome.storage.local.remove(['url', 'label', 'scope', 'body', 'description', 'tags', 'domain']);
    });
  } else if (recieved.content == 'add') {
    window.open("popup.html", "extension_popup", "width=300,height=400,status=no,scrollbars=no,resizable=no");
  }
});