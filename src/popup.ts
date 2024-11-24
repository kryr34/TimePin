type TimestampRecord = {
    timestamp: number;
    note: string;
    url: string;
  };
  
  // 更新記錄列表
  function updateRecordList(): void {
    const records: TimestampRecord[] = JSON.parse(localStorage.getItem("timestampRecords") || "[]");
    const list = document.getElementById("recordList") as HTMLUListElement;
    list.innerHTML = "";
  
    records.forEach((record, index) => {
      const li = document.createElement("li");
      li.className =
        "relative flex flex-col justify-between p-4 bg-gray-50 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer";
  
      const title = getVideoTitle(record.url);
      const isLong = title.length > 20;
  
      li.innerHTML = `
        <div class="title-container">
          <p class="title ${isLong ? "marquee" : ""}">${title}</p>
        </div>
        <p class="note">${record.note}</p>
        <p class="timestamp">${formatTimestamp(record.timestamp)}</p>
        <button
          class="delete-btn absolute top-2 right-2 text-red-500 hover:text-red-700"
          title="刪除"
        >
          &times;
        </button>
      `;
  
      // 綁定整個條目跳轉功能
      li.addEventListener("click", (event) => {
        if ((event.target as HTMLElement).classList.contains("delete-btn")) return; // 點擊刪除按鈕不觸發跳轉
        jumpToTimestamp(record.url, record.timestamp);
      });
  
      // 綁定刪除按鈕功能
      li.querySelector(".delete-btn")?.addEventListener("click", () => {
        deleteRecord(index);
      });
  
      list.appendChild(li);
    });
  }
  
  // 刪除指定索引的記錄
  function deleteRecord(index: number): void {
    const records: TimestampRecord[] = JSON.parse(localStorage.getItem("timestampRecords") || "[]");
    records.splice(index, 1); // 刪除指定索引的記錄
    localStorage.setItem("timestampRecords", JSON.stringify(records)); // 更新 localStorage
    updateRecordList(); // 刷新列表
  }
  // 獲取影片標題（目前僅返回 URL 占位，可擴展為獲取真實標題）
  function getVideoTitle(url: string): string {
    if (url.includes("youtube.com")) return "YouTube Video";
    if (url.includes("twitch.tv")) return "Twitch Stream";
    return "Unknown Video";
  }
  
  // 格式化時間戳為 HH:MM:SS
  function formatTimestamp(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ""}${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  
  // 根據 URL 和時間戳跳轉
  function jumpToTimestamp(url: string, timestamp: number): void {
    if (url.includes("youtube.com")) {
      const newUrl = new URL(url);
      newUrl.searchParams.set("t", timestamp.toString());
      chrome.tabs.create({ url: newUrl.toString() });
    } else if (url.includes("twitch.tv")) {
      const newUrl = `${url}?t=${Math.floor(timestamp / 60)}m${timestamp % 60}s`;
      chrome.tabs.create({ url: newUrl });
    } else {
      alert("不支持的視頻平台！");
    }
  }
  
  // 保存新記錄
  document.getElementById("save")?.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getTimestamp" }, (response) => {
          const timestamp = response.timestamp;
          const note = (document.getElementById("note") as HTMLTextAreaElement).value;
  
          if (timestamp !== null) {
            const records: TimestampRecord[] = JSON.parse(localStorage.getItem("timestampRecords") || "[]");
            records.push({ timestamp, note, url: tabs[0].url || "" });
            localStorage.setItem("timestampRecords", JSON.stringify(records));
  
            updateRecordList(); // 刷新列表
            (document.getElementById("note") as HTMLTextAreaElement).value = ""; // 清空輸入框
          } else {
            alert("未找到播放器或無法獲取時間！");
          }
        });
      }
    });
  });
  
  // 初始化記錄列表
  document.addEventListener("DOMContentLoaded", updateRecordList);
  