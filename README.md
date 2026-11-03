# movie-picker

Choose a movie from a Letterboxd watchlist.

## Letterboxd Roulette (Chrome extension MVP)

### Folder structure

- `/manifest.json` – Manifest V3 configuration and permissions.
- `/popup.html` – Popup markup shown when extension icon is clicked.
- `/popup.css` – Popup styling.
- `/popup.js` – Popup behavior (tab checks, messaging, random selection, rendering).
- `/content.js` – Movie extraction logic executed on Letterboxd pages.

### How components communicate

1. User clicks the extension icon and opens the popup.
2. `popup.js` checks whether the active tab URL looks like a Letterboxd watchlist URL.
3. If valid, popup sends `LETTERBOXD_GET_WATCHLIST` to `content.js` using `chrome.tabs.sendMessage`.
4. `content.js` extracts movie data and returns `{ ok: true, movies }` or `{ ok: false, error }`.
5. `popup.js` randomly picks one movie and renders title/poster/link using DOM APIs (`textContent`, `href`, `src`).

### Uncertainties about Letterboxd HTML

Letterboxd can change markup and may use different classes across layouts. The extractor intentionally:

- Tries multiple container/link selectors.
- Validates entries by requiring a `/film/` URL.
- Deduplicates by canonical movie URL.

If Letterboxd changes structure further, selectors in `content.js` may need adjustment.
