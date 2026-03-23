// Search results cleanup

IntentionalYT.pages = IntentionalYT.pages || {};

IntentionalYT.pages.search = (() => {
  const { rulesEngine, selectors } = IntentionalYT;

  function clean() {
    const s = IntentionalYT.settings;

    if (s.hideShorts) {
      rulesEngine.hideElements(selectors.shorts.searchResults, 'search-shorts');
    }

    if (s.hideDistractions) {
      rulesEngine.hideElements(selectors.recommendations.searchRecs, 'search-recs');
    }
  }

  return { clean };
})();
