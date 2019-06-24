console.log("started");
let paragraphs = document.getElementsByTagName('code');
var oneElement = paragraphs[3];

//var topPos = oneElement.offsetTop;
/*
for (elt of paragraphs) {
    elt.style['background-color'] = '#FFB2B2';
}

for (let i = 0; i < 3; i++) {
    paragraphs[i].style['background-color'] = '#FFB2B2';
}

 */

/*function jumpToCode() {
    var myElement = paragraphs[3];
    var topPos = myElement.offsetTop;
    document.getElementsByTagName('code').scrollTop = topPos;
}*/

chrome.runtime.onMessage.addListener(function (recieved, callback) {
    if (recieved.codeblock) {
        document.getElementsByTagName('code').scrollTop = document.getElementsByTagName('code')[recieved.codeblock].offsetTop;
    }
});