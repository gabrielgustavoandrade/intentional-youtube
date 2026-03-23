// Main entry point — orchestrates all cleanup modules

(() => {
  const { router, pages, observer, debug, selectors, rulesEngine } = IntentionalYT;
  const PAGE = router.PAGE_TYPES;
  let safetyTimeout = null;

  function globalCleanup() {
    const s = IntentionalYT.settings;

    if (s.hideShorts) {
      rulesEngine.hideElements(selectors.shorts.navLink, 'global-shorts-nav');
      rulesEngine.hideElements(selectors.shorts.shelf, 'global-shorts-shelf');
      rulesEngine.hideElements(selectors.shorts.items, 'global-shorts-items');
    }

    if (s.redirectHome) {
      rulesEngine.hideElements(selectors.nav.home, 'global-home-nav');
    }

    if (s.hideDistractions) {
      rulesEngine.hideElements(selectors.recommendations.suggestedMixes, 'global-mixes');
      rulesEngine.hideElements(selectors.nav.trending, 'global-trending');
      rulesEngine.hideElements(selectors.nav.explore, 'global-explore');
    }

    if (s.monkMode) {
      rulesEngine.hideElements(selectors.monk.historyLink, 'monk-history');
      rulesEngine.hideElements(selectors.monk.libraryLink, 'monk-library');
      rulesEngine.hideElements(selectors.monk.playlistsNav, 'monk-playlists');
      rulesEngine.hideElements(selectors.monk.exploreSection, 'monk-explore-section');
      rulesEngine.hideElements(selectors.misc.notificationBadge, 'monk-notifications');

      const page = router.current;
      const allowed = [PAGE.SUBSCRIPTIONS, PAGE.SEARCH, PAGE.CHANNEL, PAGE.WATCH];
      if (!allowed.includes(page)) {
        location.replace('/feed/subscriptions');
        return;
      }
    }
  }

  function pageCleanup() {
    const page = router.current;
    debug?.log('cleanup', `Running cleanup for: ${page}`);

    globalCleanup();

    switch (page) {
      case PAGE.HOME:
        pages.home.clean();
        break;
      case PAGE.WATCH:
        pages.watch.clean();
        break;
      case PAGE.SEARCH:
        pages.search.clean();
        break;
      case PAGE.CHANNEL:
        pages.channel.clean();
        break;
      case PAGE.SUBSCRIPTIONS:
        pages.subscriptions.clean();
        break;
      case PAGE.SHORTS:
        pages.shorts.clean();
        break;
    }
  }

  IntentionalYT.runCleanup = pageCleanup;

  function init() {
    debug?.log('main', 'Initializing Intentional YouTube');

    router.init();
    pageCleanup();

    router.onChange((newPage, oldPage) => {
      debug?.log('main', `Page changed: ${oldPage} → ${newPage}`);
      clearTimeout(safetyTimeout);
      pageCleanup();
      safetyTimeout = setTimeout(pageCleanup, 1500);
    });

    observer.init(pageCleanup);
  }

  IntentionalYT.onSettingsReady(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  });
})();
