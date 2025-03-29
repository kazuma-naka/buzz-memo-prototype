chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);

  if (message.type === "getUserProfile") {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError || !token) {
        console.error("Auth token error:", chrome.runtime.lastError);
        sendResponse({ error: "Failed to get auth token" });
        return;
      }

      try {
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const profile = await res.json();
        console.log("Fetched profile:", profile);
        sendResponse({ profile });
      } catch (e) {
        console.error("Fetch failed:", e);
        sendResponse({ error: e.toString() });
      }
    });

    return true; // Required for async sendResponse
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("Tab updated", tabId, changeInfo, tab);

  if (
    changeInfo.status === "complete" &&
    tab.url &&
    (tab.url.startsWith("http://") || tab.url.startsWith("https://"))
  ) {
    const pagePath = tab.url;

    chrome.storage.local.get(pagePath, (result) => {
      const isSaved = result[pagePath] === true;
      console.log(`Path is saved: ${pagePath} ${isSaved}`);
      chrome.action.setIcon({
        path: isSaved ? "icon-saved.png" : "icon-default.png",
        tabId,
      });
    });
  } else {
    chrome.action.setIcon({
      path: "icon-default.png",
      tabId,
    });
  }
});
