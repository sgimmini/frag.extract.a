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
        "keywords": document.getElementById('snippetkeywords').value,
        "tags": document.getElementById('snippettags').value,
        "domain": document.getElementById('snippetdomain').value,
        "placeholders": document.getElementById('snippetplaceholders').value
    };
    chrome.runtime.sendNativeMessage('com.frag.extract', message);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('send-message-button').addEventListener(
        'click', sendNativeMessage);
});
