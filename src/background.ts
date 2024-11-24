chrome.runtime.onInstalled.addListener(() => {
    console.log("TimePin 插件已安裝");
  });
  
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "addTimestamp",
      title: "添加時間戳註解",
      contexts: ["page", "video"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "addTimestamp" && tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const video = document.querySelector("video");
          if (video) {
            const timestamp = Math.floor(video.currentTime);
            alert(`當前時間：${timestamp}s\n（在插件彈窗中記錄）`);
          } else {
            alert("未檢測到視頻播放器！");
          }
        }
      });
    }
  });
  