chrome.tabs.getSelected(null, tab => {
  let title = document.getElementById("title");
  title.innerHTML = tab.title;
});
