$(document).ready(function () {
    // fill text fields with values from previous state
    chrome.storage.local.get({ 'label': "", 'prefix': "", 'scope': "", 'body': "", 'description': "", 'tags': "", 'domain': "" }, function (result) {
        document.getElementById('label').value = result.label;
        document.getElementById('prefix').value = result.prefix;
        document.getElementById('scope').value = result.scope;
        document.getElementById('body').value = result.body;
        document.getElementById('description').value = result.description;
        document.getElementById('tags').value = result.tags;
        document.getElementById('domain').value = result.domain;
    });

    // support for clickable hyperlinks
    $('body').on('click', 'a', function () {
        chrome.tabs.create({ url: $(this).attr('href') });
        return false;
    });
});

// send and cancel buttons
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('form').addEventListener(
        'submit', function () {
            chrome.runtime.sendMessage({ content: "sendNativeMessage" });
            window.close();
        });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('cancel').addEventListener(
        'click', function () {
            chrome.storage.local.remove(['label', 'prefix', 'scope', 'body', 'description', 'tags', 'domain']);
            window.close();
        });
});

// save content of input fields
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('label').addEventListener(
        'input', function () { chrome.storage.local.set({ label: document.getElementById('label').value }); });
});
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('prefix').addEventListener(
        'input', function () { chrome.storage.local.set({ prefix: document.getElementById('prefix').value }); });
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