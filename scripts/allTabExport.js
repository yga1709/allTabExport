document.getElementById("export").onclick = () => {
  let exportUrls = {};
  exportUrls[`num`] = 0;
  chrome.tabs.query({ windowType: "normal" }, tabs => {
    let title = document.getElementById("title");
    let dispStr;
    let checkUrl = document.createElement("a");

    for (var i = tabs.length - 1; i >= 0; i--) {
      checkUrl.href = tabs[i].url;

      dispStr = `${i + 1}. ${tabs[i].title}`;

      //popupに 「1. タイトル」の形式で表示。
      title.insertAdjacentHTML("afterbegin", `${dispStr}<br>`);

      //Export用にexportUrls（連想配列）の中にタイトル（key:titles〇)とurl(key:urls〇)を追加。
      exportUrls[`titles${String(i + 1)}`] = dispStr;
      exportUrls[`urls${String(i + 1)}`] = tabs[i].url;
      exportUrls[`num`] = tabs.length;
    }

    //その時Exportする予定のタブの数をアイコン下に表示
    chrome.browserAction.setBadgeText({ text: String(tabs.length) });

    document.getElementById("export").disabled = true;
    document.getElementById(
      "save"
    ).innerHTML = `<button id="saveButton">保存</button>`;
    document.getElementById("saveButton").onclick = () => {
      download();
    };
  });

  download = data => {
    let json = JSON.stringify(exportUrls);
    let blob = new Blob([json], { type: "application/json" });
    let fileStamp = getTime();
    //chrome.notificationsAPIの引数、options
    const options = {
      iconUrl: "../hello.png",
      type: "basic",
      title: "AllTabExport",
      message: "Complite Export"
    };
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    console.log(a.href);
    a.target = "_blank";
    chrome.downloads.download(
      {
        url: a.href,
        filename: `sample/AllTabExport${fileStamp}.json`
      },
      e => console.log(e)
    );
    chrome.notifications.create("", options);
  };
};

//ファイル名用の時刻取得関数
getTime = () => {
  let jikan = new Date();
  //時・分・秒を取得する
  let hour = jikan.getHours();
  let minute = jikan.getMinutes();
  let second = jikan.getSeconds();

  let hiduke = new Date();
  //年・月・日・曜日を取得する
  let year = hiduke.getFullYear();
  let month = hiduke.getMonth() + 1;
  let week = hiduke.getDay();
  let day = hiduke.getDate();

  let fileStamp = `${year}-${month}-${week}-${day}-${hour}-${minute}-${second}`;
  return fileStamp;
};
