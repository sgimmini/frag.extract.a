for (var key in chrome.extension.getBackgroundPage().userInput) {
    if (chrome.extension.getBackgroundPage().userInput.key) {
        document.getElementById(key).value = chrome.extension.getBackgroundPage().userInput.key;
    }
}

$(document).ready(function () {
    $('body').on('click', 'a', function () {
        chrome.tabs.create({ url: $(this).attr('href') });
        return false;
    });
});

function sendNativeMessage() {
    message = {
        "label": document.getElementById('label').value,
        "prefix": document.getElementById('prefix').value,
        "scope": document.getElementById('scope').value,
        "body": document.getElementById('body').value,
        "description": document.getElementById('description').value,
        "keywords": "",
        "tags": document.getElementById('tags').value,
        "domain": document.getElementById('domain').value,
        "placeholders": ""
    };
    chrome.runtime.sendNativeMessage('com.frag.extract', chrome.extension.getBackgroundPage().userInput);
    chrome.extension.getBackgroundPage().userInput = { label: "", prefix: "", scope: "", body: "", description: "", tags: "", domain: "" };
    chrome.storage.local.remove(['label', 'prefix', 'scope', 'body', 'description', 'tags', 'domain']);
    window.close();
}

// send and cancel buttons
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('send_button').addEventListener(
        'click', sendNativeMessage);
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('cancel_button').addEventListener(
        'click', function () {
            chrome.extension.getBackgroundPage().userInput = { label: "", prefix: "", scope: "", body: "", description: "", tags: "", domain: "" };
            window.close();
        });
});

//chrome.storage.local.get(['label'], function (result) { document.getElementById('prefix').value = result.label; });

// save content of input fields
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('label').addEventListener(
        'input', function () { chrome.extension.getBackgroundPage().userInput.label = document.getElementById('label').value; });
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