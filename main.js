const numeralColumns = {};
const categoricalColumns = {};

const DATA_TYPES = {
  タイトル: "string",
  著者: "string",
  Wikipediaの紹介: "string",
  ジャンル: "category", // 範疇情報
  おすすめ度: "number",
};

document.addEventListener("DOMContentLoaded", function () {
    // CSVを読み込んでパースする関数
    fetch("./hobbies.csv")
    .then(function (response) {
        return response.text();
    })
    .then(function (data) {
        const records = parseCSV(data);
        const elements = createTableContents(records);
        const master = document.getElementById("master");
        const table = master.querySelector("table");
        table.append(...elements);
        const tbody = elements[1]; // テーブルのデータ部分（tbody）を取得
      const input = master.querySelector("input"); // master内にある検索用の<input>要素を取得
      input.addEventListener("input", function () {
        const keyword = input.value; // 検索ボックスに入力された値を取得
       // tbody の子要素を削除
        while (tbody.firstChild) {
          tbody.removeChild(tbody.firstChild);
        }
        createTableBodyRows(tbody, records, keyword);
      });
        // 統計情報用UIの生成
      createStatsUI(records);
    });
});

function createStatsUI(records) {
  // "master" IDを持つ要素内の ".stats > .selector" 要素を取得
  const selector = document.querySelector("#master > .stats > .selector");

  // DATA_TYPESオブジェクト内の各キー（フィールド）についてループ処理
   for (const key in DATA_TYPES) {

    // フィールドが "category" 型の場合に処理を行う
    if (DATA_TYPES[key] === "category") {
      const li = document.createElement("li"); // 新しいリスト項目 (li) を作成
      li.textContent = key; // リスト項目のテキストとしてフィールド名（key）を設定
      selector.append(li); // 作成したリスト項目を selector に追加

      const column = categoricalColumns[key]; // "category"型のフィールドに対応するデータ列を取得
      const counts = {}; // 各カテゴリの値の出現回数を記録するオブジェクト

      // column内のすべてのカテゴリ値について、countsオブジェクトに初期化
      for (const value of column) {
        counts[value] = 0; // 各カテゴリ値をキーにしてカウントを0に初期化
      }

      // records配列をループし、指定された "category" フィールドの値に基づいてカウントを更新
      for (const record of records) {
        counts[record[key]]++; // 該当するカテゴリの出現回数を1増やす
      }
      // リスト項目にクリックイベントリスナーを追加
      li.addEventListener("click", () => {
        // グラフを描画
        drawGraph(counts);
      });
     }
  }
      console.log(counts); // 各カテゴリの出現回数をコンソールに出力  
}

function drawGraph(values) {
  const BAR_WIDTH = 10; // 各バーの幅を指定
  const PADDING_TOP = 10; // グラフの上部に空ける余白
  const PADDING_BOTTOM = 60; // グラフの下部に空ける余白（ラベル用）
  const graphContainer = document.querySelector("#master > .stats > .graph"); // グラフを描画するコンテナ要素を取得
  const rect = graphContainer.getBoundingClientRect(); // コンテナのサイズを取得
  const barMaxHeight = rect.height - PADDING_TOP - PADDING_BOTTOM; // バーの最大高さを計算（余白を除く）
  const max = Math.max(...Object.values(values)); // valuesオブジェクト内の最大値を取得
  const heightUnit = barMaxHeight / max; // バーの高さを最大値に基づいて単位化
  const keys = Object.keys(values); // valuesオブジェクトからキーを取得
  const widthUnit = 1 / (keys.length + 1); // 各バーの幅を画面全体の割合で計算
   // 既存のグラフ要素がある場合、全て削除
  while (graphContainer.firstChild) {
    graphContainer.removeChild(graphContainer.firstChild);
  }
  // valuesのデータに基づいてバーを描画
  for (var i = 0; i < keys.length; i++) {
    const key = keys[i]; // 現在のキー（カテゴリ名）を取得
    const value = values[key]; // キーに対応する値を取得
    const div = document.createElement("div"); // 新しいdiv要素（バー）を作成
    // バーの位置を計算して設定
    div.style.left = `calc(${(i + 1) * widthUnit * 100}% - ${
      BAR_WIDTH - 0.5
    }px)`;
    // バーの高さを設定（値に基づいてスケーリング）
    div.style.height = `${value * heightUnit}px`;
    div.className = "bar"; // バーのCSSクラスを設定
    graphContainer.append(div); // 作成したバーをコンテナに追加
   // バーのラベル（カテゴリ名）を表示
    const label = document.createElement("div"); // ラベル用のdiv要素を作成
    label.textContent = key; // ラベルにカテゴリ名を設定
    label.className = "label"; // ラベルのCSSクラスを設定
    div.append(label); // ラベルをバーに追加
  }
}

function parseCSV(data) {
    // 改行で行を分割
    const rows = data.split("\n");
    // 最初の行をヘッダーとして分割
    const headers = rows[0].split(",");

    // 各行を連想配列で変換したものを格納する配列を用意
    const records = [];
    // 2行目以降（データ行）を連想配列で変換して格納
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(",");
        let record = {};
        for (let j = 0; j < headers.length; j++) {
            record[headers[j]] = values[j];
        }
        records.push(record);
    }
       // DATA_TYPESで定義された各フィールドについて処理
  for (const key in DATA_TYPES) {
    // そのフィールドが数値型（"number"）の場合にのみ処理を行う
    if (DATA_TYPES[key] === "number") {
      // records配列の各レコードに対して、指定されたフィールドの数値を取得
      // Number()関数で数値に変換し、nums配列に格納
      const nums = records.map((record) => Number(record[key]));

      // numeralColumnsオブジェクトに、フィールドごとの最大値と最小値を格納
      numeralColumns[key] = {
        max: Math.max(...nums), // nums配列から最大値を取得
        min: Math.min(...nums), // nums配列から最小値を取得
      };
    }
    // そのフィールドが範疇型（"category"）の場合にのみ処理を行う
    if (DATA_TYPES[key] === "category") {
      // records配列の各レコードに対して、指定されたフィールドの値を取得
      // Setオブジェクトを使って重複を排除し、categoricalColumnsオブジェクトに格納
      categoricalColumns[key] = Array.from(
        new Set(records.map((record) => record[key]))
      );
    }
  }
  
  console.log(categoricalColumns);
    return records;
}

// records から HTML を生成する関数
function createTableContents(records) {
    // ヘッダー行を生成
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    for (let key in records[0]) {
       const th = document.createElement("th"); 
       th.textContent = key; // 各ヘッダーセルにカラム名を設定
       th.dataset.type = DATA_TYPES[key]; // データ型情報を dataset に与える
       th.addEventListener("click", function () {
      setSort(th, records);
    });
       headerRow.append(th); // ヘッダー行にセルを追加
  }
    thead.append(headerRow);

    // テーブルのデータ行を作成
  const tbody = document.createElement("tbody");
  createTableBodyRows(tbody, records);

    return [thead, tbody];
}

function showDetail(record) {
    document.body.classList.add("-showDetail");
    const detail = document.querySelector("#detail > .container");
    
    // 演習2: 説明リスト要素を使用
    const dl = document.createElement("dl");
    
    for (let key in record) {
        const dt = document.createElement("dt");
        dt.textContent = key;
        
        const dd = document.createElement("dd");
        dd.textContent = record[key];
        
        dl.append(dt, dd);
    }
    
    detail.innerHTML = "";
    detail.append(dl);
}

// 演習1: 戻るボタンの機能
function hideDetail() {
    document.body.classList.remove("-showDetail");
}

function setSort(th, records) {
  switch (th.dataset.sortOrder) {
    case undefined:
      th.dataset.sortOrder = "asc";
      break;
    case "asc":
      th.dataset.sortOrder = "desc";
      break;
    case "desc":
      delete th.dataset.sortOrder;
      break;
  }

  const siblings = th.parentNode.children;
  for (let sibling of siblings) {
    if (sibling !== th) {
      delete sibling.dataset.sortOrder;
    }
  }

  const key = th.textContent.trim();
  const type = th.dataset.type;
  const copiedRecords = [...records];

  if (th.dataset.sortOrder !== undefined) {
    copiedRecords.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      switch (type) {
        case "string":
        case "category":
          return aValue.localeCompare(bValue);
        case "number":
          return aValue - bValue;
      }
    });
  }

  if (th.dataset.sortOrder === "desc") {
    copiedRecords.reverse();
  }

  const tbody = th.closest("table").querySelector("tbody");
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  createTableBodyRows(tbody, copiedRecords);

  console.log(copiedRecords);
}

  

function createTableBodyRows(tbody, records, keyword) {
  for (let record of records) {
    const tr = document.createElement("tr");
     // keyword（検索キーワード）が指定されている場合、レコードがキーワードを含むかチェック
    if (keyword) {
      let isMatch = false; // キーワードが一致するかどうかを判定するフラグ
      for (const key in record) {
        // レコードの各フィールドにキーワードが含まれているかチェック
        if (record[key].includes(keyword)) {
          isMatch = true; // 一致する場合、フラグをtrueに設定
          break; // 一致が確認できた時点でループを抜ける
        }
      }
      // キーワードが一致しない場合、このレコードは表示しない（次のレコードへ）
      if (!isMatch) {
        continue;
      }
    }
    for (let key in record) {
      const td = document.createElement("td");
      const text = record[key];

      // keywordが指定されている場合、キーワードを強調表示する
      if (keyword) {
        const regexp = new RegExp(keyword, "g"); // キーワードにマッチする正規表現を作成
        // キーワードを強調する
        const replacedText = text.replace(regexp, (match) => {
          return `<mark>${match}</mark>`;
        });
        td.innerHTML = replacedText; // 置換後のHTMLをセルに挿入
      } else {
        td.textContent = text; // 各データセルに値を設定
      }
   // 数値型の場合、最大値と最小値を元に色付け
      if (DATA_TYPES[key] === "number") {
        const column = numeralColumns[key];
        const ratio = (Number(text) - column.min) / (column.max - column.min);
        const clampedRatio = Math.max(0, Math.min(1, ratio));
        td.style.backgroundColor = `rgba(255, 196, 196, ${ratio})`; // 背景色を設定
      }
        // 範疇型の場合、カテゴリごとに色付け
      if (DATA_TYPES[key] === "category") {
        const column = categoricalColumns[key];
        const index = column.indexOf(text);
        const hue = (360 / column.length) * index;
        td.style.backgroundColor = `hsl(${hue}, 80%, 90%)`; // 背景色を設定
      }
      tr.append(td); // データ行にセルを追加
    }
    // 行をクリックしたときに詳細表示を呼び出すイベントリスナーを追加
    tr.addEventListener("click", function (event) {
      showDetail(record); // クリックされた行のデータを詳細表示
    });
    tbody.append(tr); // tbodyにデータ行を追加
  }
}