var exportUrls = {};

chrome.tabs.query({ windowType: "normal" }, function(tabs) {
  let title = document.getElementById("title");
  for (var i = tabs.length - 1; i >= 0; i--) {
    //popupに 「1. タイトル」の形式で表示。
    title.insertAdjacentHTML("afterbegin", `${i + 1}. ${tabs[i].title}<br>`);
    //Export用にexportUrls（連想配列）の中にタイトル（key:titles〇)とurl(key:urls〇)を追加。
    exportUrls[`titles${String(i)}`] = tabs[i].title;
    exportUrls[`urls${String(i)}`] = tabs[i].url;
    console.log(
      exportUrls[`titles${String(i)}`],
      exportUrls[`urls${String(i)}`]
    );
  }
  //その時Exportする予定のタブの数をアイコン下に表示
  chrome.browserAction.setBadgeText({ text: String(tabs.length) });
});
