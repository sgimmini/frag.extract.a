function loadState() {
    // fill text fields with values from previous state
    chrome.storage.local.get({ 'label': "", 'scope': "", 'body': "", 'description': "", 'tags': "", 'domain': "" }, function (result) {
        document.getElementById('label').value = result.label;
        document.getElementById('scope').value = result.scope;
        document.getElementById('body').value = result.body;
        document.getElementById('description').value = result.description;
        document.getElementById('tags').value = result.tags;
        document.getElementById('domain').value = result.domain;
    });
    /*if (!document.getElementById('description')) {
        document.getElementsByTagName('h5')[0].innerText = "No Fragment found";
    }*/
};

loadState();

// save button
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('form').addEventListener(
        'submit', function () {
            chrome.runtime.sendMessage({ content: 'sendNativeMessage' });
            window.close();
        });
});

// cancel button
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('cancel').addEventListener(
        'click', function () {
            chrome.storage.local.remove(['label', 'prefix', 'scope', 'body', 'description', 'tags', 'domain']);
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { content: 'extract' });
            });
            window.close();
        });
});

// jump to codeblock button
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('jumpto').addEventListener(
        'click', function () {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { content: 'scroll' });
            });
        });
});

// working hyperlinks
document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener(
        'click', function (event) {
            if (event.target.href !== undefined) {
                chrome.tabs.create({ url: event.target.href });
            }
        });
});

// save content of input fields
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('label').addEventListener(
        'input', function () { chrome.storage.local.set({ label: document.getElementById('label').value }); });
});
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('scope').addEventListener(
        'input', function () { chrome.storage.local.set({ scope: document.getElementById('scope').value }); });
});
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('body').addEventListener(
        'input', function () { chrome.storage.local.set({ body: document.getElementById('body').value }); });
});
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('description').addEventListener(
        'input', function () { chrome.storage.local.set({ description: document.getElementById('description').value }); });
});
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('tags').addEventListener(
        'input', function () { chrome.storage.local.set({ tags: document.getElementById('tags').value }); });
});
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('domain').addEventListener(
        'input', function () { chrome.storage.local.set({ domain: document.getElementById('domain').value }); });
});