$(document).ready(function () {
    $('body').on('click', 'a', function () {
        chrome.tabs.create({ url: $(this).attr('href') });
        return false;
    });
});

function sendNativeMessage() {
    message = {
        "label": document.getElementById('snippetname').value,
        "prefix": document.getElementById('snippetprefix').value,
        "scope": "python",
        "body": document.getElementById('snippetbody').value,
        "description": document.getElementById('snippetdescription').value,
        "keywords": "",
        "tags": "",
        "domain": "",
        "placeholders": ""
    };
    chrome.runtime.sendNativeMessage('com.frag.extract', message);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('send-message-button').addEventListener(
        'click', sendNativeMessage);
});
