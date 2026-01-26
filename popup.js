// Elementy DOM
const serverUrlInput = document.getElementById('serverUrl');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const saveBtn = document.getElementById('saveBtn');
const openMeitubeBtn = document.getElementById('openMeitubeBtn');

// Załaduj zapisany URL serwera
chrome.storage.sync.get(['metubeServer'], (result) => {
  if (result.metubeServer) {
    serverUrlInput.value = result.metubeServer;
  }
  checkServerStatus();
});

// Sprawdź status serwera MeTube
async function checkServerStatus() {
  const serverUrl = serverUrlInput.value.trim();

  try {
    // Próba połączenia z serwerem
    const response = await fetch(`${serverUrl}/history`, {
      method: 'GET',
      mode: 'cors'
    });

    if (response.ok) {
      statusDot.classList.add('online');
      statusText.textContent = 'Połączono z MeTube';
    } else {
      statusDot.classList.remove('online');
      statusText.textContent = 'Serwer niedostępny';
    }
  } catch (error) {
    statusDot.classList.remove('online');
    statusText.textContent = 'Brak połączenia z serwerem';
  }
}

// Zapisz ustawienia
saveBtn.addEventListener('click', () => {
  const serverUrl = serverUrlInput.value.trim();

  chrome.storage.sync.set({ metubeServer: serverUrl }, () => {
    // Powiadom content script o zmianie
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateServer',
          serverUrl: serverUrl
        }).catch(() => {
          // Tab może nie mieć content script (nie YouTube)
        });
      }
    });

    // Animacja potwierdzenia
    saveBtn.textContent = '✓ Zapisano!';
    saveBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #43a047 100%)';

    setTimeout(() => {
      saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
        </svg>
        Zapisz ustawienia
      `;
      saveBtn.style.background = '';
      checkServerStatus();
    }, 1500);
  });
});

// Otwórz panel MeTube
openMeitubeBtn.addEventListener('click', () => {
  const serverUrl = serverUrlInput.value.trim();
  chrome.tabs.create({ url: serverUrl });
});

// Sprawdź status przy zmianie URL
serverUrlInput.addEventListener('input', () => {
  clearTimeout(window.checkTimeout);
  window.checkTimeout = setTimeout(checkServerStatus, 500);
});
