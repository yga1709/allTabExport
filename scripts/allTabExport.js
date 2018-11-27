chrome.tabs.query({ windowType: "normal" }, function(tabs) {
  let title = document.getElementById("title");
  for (var i = tabs.length - 1; i >= 0; i--) {
    title.insertAdjacentHTML("afterbegin", `${i + 1}. ${tabs[i].title}<br>`);
  }
  chrome.browserAction.setBadgeText({ text: String(tabs.length) });
});
