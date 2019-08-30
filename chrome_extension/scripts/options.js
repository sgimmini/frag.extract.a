document.addEventListener("DOMContentLoaded", function() {
  // reload selected options upon opening of the options menu
  chrome.storage.local.get(
    {
      presetTags: false,
      presetLanguage: false,
      presetLabel: false,
      parametrize: false
    },
    function(result) {
      document.getElementById("tags").checked = result.presetTags;
      document.getElementById("scope").checked = result.presetLanguage;
      document.getElementById("label").checked = result.presetLabel;
      document.getElementById("parametrize").checked = result.parametrize;
    }
  );

  // save selections
  document.getElementById("tags").addEventListener("input", function() {
    chrome.storage.local.set({ presetTags: this.checked });
  });
  document.getElementById("scope").addEventListener("input", function() {
    chrome.storage.local.set({ presetLanguage: this.checked });
  });
  document.getElementById("label").addEventListener("input", function() {
    chrome.storage.local.set({ presetLabel: this.checked });
  });
  document.getElementById("parametrize").addEventListener("input", function() {
    chrome.storage.local.set({ parametrize: this.checked });
  });
});
