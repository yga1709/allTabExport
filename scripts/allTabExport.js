document.getElementById("export").onclick = () => {
  let exportUrls = {};
  //タイトル総数管理変数
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

    //全てのボタンを押せなくする
    document.getElementById("export").disabled = true;
    document.getElementById("inport").disabled = true;
    document.getElementById(
      "save"
    ).innerHTML = `<button class="ui primary button" id="saveButton">Save</button> or <div class="ui input"><input type="text" placeholder="Save as..." id="selfname"></div>`;
    document.getElementById("saveButton").onclick = () => {
      let name = document.getElementById("selfname").value;
      if (name == null) {
        download();
      } else {
        download(name);
      }
    };
  });

  download = name => {
    let json = JSON.stringify(exportUrls);
    let blob = new Blob([json], { type: "application/json" });
    let fileStamp = getTime();
    let filename = `alltabexport/allTabExport${fileStamp}.json`;
    if (name) {
      filename = name + ".json";
    }
    //chrome.notificationsAPIの引数、options
    const options = {
      iconUrl: "../icon.png",
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
        filename: filename
      },
      e => console.log(e)
    );
    chrome.notifications.create("", options);
  };
};

document.getElementById("inport").onclick = () => {
  if (document.getElementById("export").disabled) {
    return 0;
  }
  const inport = document.getElementById("inport");
  const reader = new FileReader();
  const title = document.getElementById("title");
  document.getElementById("export").disabled = true;

  inport.addEventListener("change", e => {
    reader.readAsText(e.target.files[0]);
    console.log(e.target.files[0]);
  });

  reader.onload = e => {
    //document.getElementById("inport").disabled = true;
    let json = e.target.result;
    const inportData = jsonperser(json);
    let str = ``;
    console.log(inportData);

    //取得したNumをアイコンの下に表示
    chrome.browserAction.setBadgeText({ text: String(inportData["num"]) });

    //取得したURLのタイトルを表示するループ
    //for (let i = inportData["num"]; i > 0; i--) {
    for (let i = 1; i <= inportData["num"]; i++) {
      str += `${inportData["titles" + i]}<br>`;
      //title.insertAdjacentHTML("afterbegin", `${inportData["titles" + i]}<br>`);
      title.innerHTML = str;
    }
    //タイトルの表示後に開くボタンを表示
    document.getElementById(
      "save"
    ).innerHTML = `<button class="ui primary button" id="openButton">Open</button>`;

    document.getElementById("openButton").onclick = () => {
      if (10 <= inportData["num"]) {
        let check = confirm("大量のタブを開こうとしています。");
        if (!check) return 0;
      }
      for (let i = inportData["num"]; i > 0; i--) {
        chrome.tabs.create({ url: inportData["urls" + i] });
      }
    };
  };
};

jsonperser = json => {
  try {
    openUrls = JSON.parse(json);
    return openUrls;
  } catch (e) {}
};

//ファイル名用の時刻取得関数
getTime = () => {
  let data = new Date();
  //時・分・秒を取得する
  let hour = data.getHours();
  let minute = data.getMinutes();
  let second = data.getSeconds();

  let time = new Date();
  //年・月・日・曜日を取得する
  let year = time.getFullYear();
  let month = time.getMonth() + 1;
  let week = time.getDay();
  let day = time.getDate();

  let fileStamp = `${year}-${month}-${week}-${day}-${hour}-${minute}-${second}`;
  return fileStamp;
};

//htmlのエスケープメソッド
escape = content => {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};
