// Konfiguracja - adres serwera MeTube (ładowany z chrome.storage)
let metubeServer = 'http://192.168.25.223:8081';

// Załaduj zapisany URL serwera
chrome.storage.sync.get(['metubeServer'], (result) => {
  if (result.metubeServer) {
    metubeServer = result.metubeServer;
  }
});

// Nasłuchuj na zmiany ustawień z popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateServer') {
    metubeServer = message.serverUrl;
    sendResponse({ success: true });
  }
  return true;
});

// Funkcja pobierająca aktualny URL filmu
function getCurrentVideoUrl() {
  const url = window.location.href;
  // Sprawdź czy to strona z filmem
  if (url.includes('/watch?v=') || url.includes('/shorts/')) {
    return url.split('&')[0]; // Usuń dodatkowe parametry, zostaw tylko video ID
  }
  return null;
}

// Funkcja wysyłająca URL do MeTube (przez service worker, omija Mixed Content)
async function sendToMeTube(url, format) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'sendToMeTube',
      serverUrl: metubeServer,
      videoUrl: url,
      format: format
    });

    if (response.success) {
      showNotification(`Dodano do MeTube (${format.toUpperCase()})`, 'success');
    } else {
      showNotification(`Błąd: ${response.error}`, 'error');
    }
  } catch (error) {
    showNotification(`Błąd połączenia z MeTube: ${error.message}`, 'error');
  }
}

// Funkcja wyświetlająca powiadomienie
function showNotification(message, type) {
  // Usuń poprzednie powiadomienie jeśli istnieje
  const existing = document.getElementById('metube-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'metube-notification';
  notification.className = `metube-notification metube-notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Animacja wejścia
  setTimeout(() => notification.classList.add('show'), 10);

  // Usuń po 3 sekundach
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Funkcja tworząca przyciski pobierania
function createDownloadButtons() {
  // Sprawdź czy przyciski już istnieją
  if (document.getElementById('metube-buttons-container')) return;

  // Znajdź element menu pod filmem (actions container)
  const actionsContainer = document.querySelector('#top-level-buttons-computed');

  if (!actionsContainer) return;

  // Utwórz kontener na przyciski
  const container = document.createElement('div');
  container.id = 'metube-buttons-container';
  container.className = 'metube-buttons-container';

  // Przycisk MP3
  const mp3Button = document.createElement('button');
  mp3Button.className = 'metube-btn metube-btn-mp3';
  mp3Button.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
    <span>MP3</span>
  `;
  mp3Button.title = 'Pobierz jako MP3 (audio)';
  mp3Button.addEventListener('click', () => {
    const url = getCurrentVideoUrl();
    if (url) {
      sendToMeTube(url, 'mp3');
    } else {
      showNotification('Nie znaleziono filmu do pobrania', 'error');
    }
  });

  // Przycisk MP4
  const mp4Button = document.createElement('button');
  mp4Button.className = 'metube-btn metube-btn-mp4';
  mp4Button.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
    </svg>
    <span>MP4</span>
  `;
  mp4Button.title = 'Pobierz jako MP4 (wideo)';
  mp4Button.addEventListener('click', () => {
    const url = getCurrentVideoUrl();
    if (url) {
      sendToMeTube(url, 'mp4');
    } else {
      showNotification('Nie znaleziono filmu do pobrania', 'error');
    }
  });

  container.appendChild(mp3Button);
  container.appendChild(mp4Button);

  // Wstaw przyciski przed innymi akcjami
  actionsContainer.insertBefore(container, actionsContainer.firstChild);
}

// Funkcja obserwująca zmiany w DOM (YouTube to SPA)
function observePageChanges() {
  // Observer do wykrywania zmian strony
  const observer = new MutationObserver((mutations) => {
    // Sprawdź czy jesteśmy na stronie z filmem
    if (window.location.pathname === '/watch' || window.location.pathname.startsWith('/shorts/')) {
      // Poczekaj aż elementy się załadują
      setTimeout(createDownloadButtons, 1000);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Początkowe sprawdzenie
  if (window.location.pathname === '/watch' || window.location.pathname.startsWith('/shorts/')) {
    setTimeout(createDownloadButtons, 1500);
  }
}

// Nasłuchuj na zmiany URL (YouTube SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Usuń stare przyciski przy zmianie strony
    const oldContainer = document.getElementById('metube-buttons-container');
    if (oldContainer) oldContainer.remove();

    // Dodaj nowe jeśli to strona z filmem
    if (window.location.pathname === '/watch' || window.location.pathname.startsWith('/shorts/')) {
      setTimeout(createDownloadButtons, 1500);
    }
  }
}).observe(document, { subtree: true, childList: true });

// Uruchom observer po załadowaniu strony
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observePageChanges);
} else {
  observePageChanges();
}

console.log('MeTube Downloader extension loaded');
