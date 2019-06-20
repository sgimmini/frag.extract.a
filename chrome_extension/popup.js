$(document).ready(function () {
    $('body').on('click', 'a', function () {
        chrome.tabs.create({ url: $(this).attr('href') });
        return false;
    });
});

function sendNativeMessage() {
    message = {
        "label": document.getElementById('snippetlabel').value,
        "prefix": document.getElementById('snippetprefix').value,
        "scope": document.getElementById('snippetscope').value,
        "body": document.getElementById('snippetbody').value,
        "description": document.getElementById('snippetdescription').value,
        "keywords": "",
        "tags": document.getElementById('snippettags').value,
        "domain": document.getElementById('snippetdomain').value,
        "placeholders": ""
    };
    chrome.runtime.sendNativeMessage('com.frag.extract', message);
    window.close();
}

// send and cancel buttons
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('send_button').addEventListener(
        'click', sendNativeMessage);
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('cancel_button').addEventListener(
        'click', function () { window.close(); });
});

// save content of input fields
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('snippetlabel').addEventListener(
        'input', function () { chrome.storage.local.set({ label: document.getElementById('snippetlabel').value }); });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('snippetprefix').addEventListener(
        'input', function () { chrome.storage.local.set({ prefix: document.getElementById('snippetprefix').value }); });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('snippetscope').addEventListener(
        'input', function () { chrome.storage.local.set({ scope: document.getElementById('snippetscope').value }); });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('snippetbody').addEventListener(
        'input', function () { chrome.storage.local.set({ body: document.getElementById('snippetbody').value }); });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('snippetdescription').addEventListener(
        'input', function () {
            chrome.storage.local.set({ description: document.getElementById('snippetdescription').value });
            chrome.storage.local.get(['label'], function (result) { document.getElementById('snippetprefix').value = result.label; });
        });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('snippetags').addEventListener(
        'input', function () { chrome.storage.local.set({ tags: document.getElementById('snippettags').value }); });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('snippetdomain').addEventListener(
        'input', function () { chrome.storage.local.set({ domain: document.getElementById('snippetdomain').value }); });
});