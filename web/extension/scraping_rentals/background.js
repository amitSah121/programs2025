chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.downloadUrl) {
    chrome.downloads.download({
      url: message.downloadUrl,
      filename: message.filename || "download.txt",
    });
  } else if (message.fileContent) {
    const ext = message.filename.split(".").pop().toLowerCase();
    let mimeType = "text/plain;charset=utf-8"; // fallback

    if (ext === "csv") mimeType = "text/csv;charset=utf-8";
    else if (ext === "json") mimeType = "application/json;charset=utf-8";
    else if (ext === "html" || ext === "htm")
      mimeType = "text/html;charset=utf-8";
    else if (ext === "xml") mimeType = "application/xml;charset=utf-8";
    else if (ext === "js") mimeType = "application/javascript;charset=utf-8";
    else if (ext === "css") mimeType = "text/css;charset=utf-8";
    else if (ext === "md") mimeType = "text/markdown;charset=utf-8";
    else if (ext === "svg") mimeType = "image/svg+xml;charset=utf-8";

    // Encode and form a data URL
    const encoded = encodeURIComponent(message.fileContent);
    const url = `data:${mimeType},${encoded}`;

    chrome.downloads.download({
      url: url,
      filename: message.filename || "download.txt",
      saveAs: true,
    });
  }
});
