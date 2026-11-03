const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const posterEl = document.getElementById('poster');
const titleEl = document.getElementById('movie-title');
const linkEl = document.getElementById('movie-link');
const rerollBtn = document.getElementById('reroll');

let movies = [];

function isLetterboxdWatchlistUrl(rawUrl) {
  if (!rawUrl) {
    return false;
  }

  try {
    const url = new URL(rawUrl);
    return url.hostname === 'letterboxd.com' && /^\/[^/]+\/watchlist(?:\/|$)/.test(url.pathname);
  } catch (_error) {
    return false;
  }
}

function pickRandomMovie(movieList) {
  const randomIndex = Math.floor(Math.random() * movieList.length);
  return movieList[randomIndex];
}

function showStatus(message) {
  statusEl.textContent = message;
}

function showMovie(movie) {
  titleEl.textContent = movie.title;
  linkEl.href = movie.url;

  if (movie.poster) {
    posterEl.src = movie.poster;
    posterEl.alt = `Poster for ${movie.title}`;
    posterEl.classList.remove('hidden');
  } else {
    posterEl.removeAttribute('src');
    posterEl.alt = '';
    posterEl.classList.add('hidden');
  }

  resultEl.classList.remove('hidden');
  rerollBtn.classList.remove('hidden');
  showStatus(`Found ${movies.length} movie${movies.length === 1 ? '' : 's'}.`);
}

function showRandomMovie() {
  if (!movies.length) {
    showStatus('No movies are available to choose from.');
    resultEl.classList.add('hidden');
    rerollBtn.classList.add('hidden');
    return;
  }

  showMovie(pickRandomMovie(movies));
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function loadWatchlist() {
  showStatus('Checking current tab...');

  const activeTab = await getActiveTab();

  if (!activeTab?.id || !isLetterboxdWatchlistUrl(activeTab.url)) {
    showStatus('Open a Letterboxd watchlist page, then reopen this popup.');
    return;
  }

  showStatus('Reading movies from watchlist...');

  let response;
  try {
    response = await chrome.tabs.sendMessage(activeTab.id, { type: 'LETTERBOXD_GET_WATCHLIST' });
  } catch (_error) {
    showStatus('Could not read the page. Refresh the tab and try again.');
    return;
  }

  if (!response?.ok) {
    showStatus(response?.error || 'Unable to extract watchlist movies from this page.');
    return;
  }

  movies = response.movies;

  if (!movies.length) {
    showStatus('No movies found. Scroll to load posters first if needed.');
    return;
  }

  showRandomMovie();
}

rerollBtn.addEventListener('click', showRandomMovie);
void loadWatchlist();
