// Route manager — detects current YouTube page type
// Handles SPA navigation via yt-navigate-finish events and URL polling

IntentionalYT.router = (() => {
  const PAGE_TYPES = {
    HOME: 'home',
    WATCH: 'watch',
    SEARCH: 'search',
    CHANNEL: 'channel',
    SUBSCRIPTIONS: 'subscriptions',
    SHORTS: 'shorts',
    PLAYLIST: 'playlist',
    HISTORY: 'history',
    LIBRARY: 'library',
    TRENDING: 'trending',
    EXPLORE: 'explore',
    OTHER: 'other'
  };

  let currentPage = null;
  let currentUrl = location.href;
  const listeners = [];

  function detectPage(url) {
    const path = new URL(url).pathname;

    if (path === '/' || path === '') return PAGE_TYPES.HOME;
    if (path === '/feed/subscriptions') return PAGE_TYPES.SUBSCRIPTIONS;
    if (path === '/feed/history') return PAGE_TYPES.HISTORY;
    if (path === '/feed/library') return PAGE_TYPES.LIBRARY;
    if (path === '/feed/trending' || path === '/trending') return PAGE_TYPES.TRENDING;
    if (path === '/feed/explore' || path === '/explore') return PAGE_TYPES.EXPLORE;
    if (path.startsWith('/watch')) return PAGE_TYPES.WATCH;
    if (path.startsWith('/results')) return PAGE_TYPES.SEARCH;
    if (path.startsWith('/shorts/') || path === '/shorts') return PAGE_TYPES.SHORTS;
    if (path.startsWith('/playlist')) return PAGE_TYPES.PLAYLIST;
    if (path.startsWith('/@') || path.startsWith('/c/') || path.startsWith('/channel/') || path.startsWith('/user/')) {
      return PAGE_TYPES.CHANNEL;
    }

    return PAGE_TYPES.OTHER;
  }

  function onChange(callback) {
    listeners.push(callback);
  }

  function notifyListeners(oldPage, newPage) {
    for (const cb of listeners) {
      try {
        cb(newPage, oldPage);
      } catch (e) {
        console.error('[IYT] Router listener error:', e);
      }
    }
  }

  function checkNavigation() {
    const newUrl = location.href;
    if (newUrl !== currentUrl) {
      currentUrl = newUrl;
      const oldPage = currentPage;
      currentPage = detectPage(newUrl);
      if (oldPage !== currentPage) {
        IntentionalYT.debug?.log('route', `Navigation: ${oldPage} → ${currentPage} (${newUrl})`);
        notifyListeners(oldPage, currentPage);
      }
    }
  }

  function init() {
    currentPage = detectPage(location.href);
    IntentionalYT.debug?.log('route', `Initial page: ${currentPage}`);

    // YouTube SPA navigation event
    document.addEventListener('yt-navigate-finish', () => {
      checkNavigation();
    });

    // Also listen for yt-navigate-start for early action
    document.addEventListener('yt-navigate-start', () => {
      // Small delay to let URL update
      setTimeout(checkNavigation, 50);
    });

    // Fallback: popstate for back/forward
    window.addEventListener('popstate', () => {
      setTimeout(checkNavigation, 50);
    });

    // Fallback poll every 1s in case events are missed
    setInterval(checkNavigation, 1000);
  }

  return {
    PAGE_TYPES,
    get current() { return currentPage; },
    detectPage,
    onChange,
    init
  };
})();
