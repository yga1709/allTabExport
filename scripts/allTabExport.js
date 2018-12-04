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
      dispStr = escape(dispStr);

      //popupに 「1. タイトル」の形式で表示。
      title.insertAdjacentHTML(
        "afterbegin",
        `<div class="item">${dispStr}</div>`
      );

      //Export用にexportUrls（連想配列）の中にタイトル（key:titles〇)とurl(key:urls〇)を追加。
      exportUrls[`titles${String(i + 1)}`] = dispStr;
      exportUrls[`urls${String(i + 1)}`] = tabs[i].url;
      exportUrls[`num`] = tabs.length;
    }

    //その時Exportする予定のタブの数をアイコン下に表示
    chrome.browserAction.setBadgeText({ text: String(tabs.length) });

    document.getElementById("export").disabled = true;
    document.getElementById("inport").disabled = true;
    document.getElementById(
      "save"
    ).innerHTML = `<button class="ui primary button" id="saveButton">Save</button>`;
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
        filename: `sample/allTabExport${fileStamp}.json`
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

document.getElementById("inport").onclick = () => {
  const inport = document.getElementById("inport");
  const reader = new FileReader();

  document.getElementById("export").disabled = true;

  inport.addEventListener("change", e => {
    reader.readAsText(e.target.files[0]);
  });
  reader.onload = e => {
    let json = e.target.result;
    const inportData = jsonperser(json);
    //取得したNumをアイコンの下に表示
    chrome.browserAction.setBadgeText({ text: String(inportData["num"]) });
    //取得したURLのタイトルを表示するループ
    for (let i = inportData["num"]; i > 0; i--) {
      title.insertAdjacentHTML("afterbegin", `${inportData["titles" + i]}<br>`);
    }
    //タイトルの表示後に開くボタンを表示
    document.getElementById(
      "save"
    ).innerHTML = `<button class="ui primary button" id="openButton">Open</button>`;
    //開くが押された場合
    document.getElementById("openButton").onclick = () => {
      for (let i = inportData["num"]; i > 0; i--) {
        chrome.tabs.create({ url: inportData["urls" + i] });
      }
    };
  };
};

jsonperser = json => {
  openUrls = JSON.parse(json);
  return openUrls;
};

escape = content => {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};
