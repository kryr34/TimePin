function getCurrentTimestamp(): number | null {
    const video = document.querySelector("video") as HTMLVideoElement | null;
    return video ? Math.floor(video.currentTime) : null;
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTimestamp") {
      sendResponse({ timestamp: getCurrentTimestamp() });
    }
  });
  