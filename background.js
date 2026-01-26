// Service worker do obsługi żądań HTTP (omija problem Mixed Content)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendToMeTube') {
    handleMeTubeRequest(message.serverUrl, message.videoUrl, message.format)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Wskazuje na async response
  }
});

async function handleMeTubeRequest(serverUrl, videoUrl, format) {
  const endpoint = `${serverUrl}/add`;

  const payload = {
    url: videoUrl,
    quality: 'best',
    format: format // 'mp3' lub 'mp4'
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    return { success: true, format: format };
  } else {
    const error = await response.text();
    return { success: false, error: error };
  }
}
