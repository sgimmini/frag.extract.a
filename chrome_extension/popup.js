var port = chrome.runtime.connectNative('manifest_frag_extract_host.json');


$(document).ready(function () {
    $('body').on('click', 'a', function () {
        chrome.tabs.create({ url: $(this).attr('href') });
        return false;
    });
});

function sendNativeMessage() {
    message = {
        "name": document.getElementById('snippetname').value,
        "prefix": document.getElementById('snippetprefix').value,
        "body": document.getElementById('snippetbody').value,
        "description": document.getElementById('snippetdescription').value
    };
    chrome.runtime.sendNativeMessage('frag_extract_host', message);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('send-message-button').addEventListener(
        'click', sendNativeMessage);
});
