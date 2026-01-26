# MeTube Downloader

Rozszerzenie Chrome do pobierania filmów i muzyki z YouTube bezpośrednio do serwera [MeTube](https://github.com/alexta69/metube).

## Funkcje

- Przyciski **MP3** i **MP4** bezpośrednio na stronie YouTube
- Obsługa filmów i Shorts
- Konfigurowalny adres serwera MeTube
- Wskaźnik statusu połączenia z serwerem

## Wymagania

- Przeglądarka Chrome/Chromium/Edge/Brave
- Działający serwer [MeTube](https://github.com/alexta69/metube)

## Instalacja (tryb deweloperski)

1. Pobierz lub sklonuj to repozytorium:
   ```bash
   git clone https://github.com/AleksanderOne/metube-extension-chrome.git
   ```

2. Otwórz Chrome i przejdź do `chrome://extensions/`

3. Włącz **Tryb programisty** (przełącznik w prawym górnym rogu)

4. Kliknij **Załaduj rozpakowane**

5. Wybierz folder z rozszerzeniem (`metube-extension-chrome`)

6. Rozszerzenie pojawi się na pasku narzędzi

## Konfiguracja

1. Kliknij ikonę rozszerzenia na pasku narzędzi
2. Wpisz adres swojego serwera MeTube (np. `http://192.168.1.100:8081`)
3. Kliknij **Zapisz ustawienia**
4. Zielona kropka oznacza poprawne połączenie z serwerem

## Użycie

1. Otwórz dowolny film na YouTube
2. Pod filmem pojawią się przyciski **MP3** i **MP4**
3. Kliknij wybrany format - film zostanie dodany do kolejki MeTube

## Struktura projektu

```
metube-extension-chrome/
├── manifest.json      # Konfiguracja rozszerzenia (Manifest V3)
├── background.js      # Service worker do obsługi żądań HTTP
├── popup.html         # Interfejs ustawień
├── popup.js           # Logika popup
├── content.js         # Skrypt wstrzykiwany na YouTube
├── styles.css         # Style przycisków
└── icons/             # Ikony rozszerzenia
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Licencja

MIT

---

Stworzone z pasją do kodowania przez **AleksanderOne**
