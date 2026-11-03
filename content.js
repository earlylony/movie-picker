function isWatchlistPage() {
  return /^\/[^/]+\/watchlist(?:\/|$)/.test(window.location.pathname);
}

function normalizePosterUrl(imageElement) {
  const directSrc = imageElement.getAttribute('src') || imageElement.getAttribute('data-src');
  if (directSrc) {
    return directSrc;
  }

  const srcSet = imageElement.getAttribute('srcset') || imageElement.getAttribute('data-srcset');
  if (!srcSet) {
    return '';
  }

  const firstCandidate = srcSet.split(',')[0]?.trim().split(' ')[0];
  return firstCandidate || '';
}

function extractMovies() {
  // Letterboxd can use different containers across layouts, so we try a few selectors
  // and then validate each candidate by checking for a film URL.
  const candidateNodes = document.querySelectorAll(
    '.poster-container, li.poster-container, .film-poster, .poster-list li'
  );

  const seenUrls = new Set();
  const movies = [];

  candidateNodes.forEach((node) => {
    const link =
      node.querySelector('a[data-target-link]') ||
      node.querySelector('a.frame') ||
      node.querySelector('a.poster') ||
      node.querySelector('a[href*="/film/"]');

    if (!link) {
      return;
    }

    const href = link.getAttribute('href');
    if (!href || !href.includes('/film/')) {
      return;
    }

    const absoluteUrl = new URL(href, window.location.origin).toString();
    if (seenUrls.has(absoluteUrl)) {
      return;
    }

    const image = node.querySelector('img') || link.querySelector('img');

    const title =
      (image && image.getAttribute('alt')) ||
      node.getAttribute('data-film-name') ||
      link.getAttribute('aria-label') ||
      link.getAttribute('title') ||
      '';

    if (!title.trim()) {
      return;
    }

    movies.push({
      title: title.trim(),
      poster: image ? normalizePosterUrl(image) : '',
      url: absoluteUrl
    });
    seenUrls.add(absoluteUrl);
  });

  return movies;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'LETTERBOXD_GET_WATCHLIST') {
    return;
  }

  if (!isWatchlistPage()) {
    sendResponse({ ok: false, error: 'This is not a Letterboxd watchlist page.' });
    return;
  }

  try {
    const movies = extractMovies();
    sendResponse({ ok: true, movies });
  } catch (_error) {
    sendResponse({ ok: false, error: 'An error occurred while extracting movies.' });
  }
});
