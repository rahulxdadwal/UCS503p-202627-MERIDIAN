// Coordination only. The application page owns the inference worker lifecycle.
chrome.action.onClicked.addListener(() => {
  void chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
