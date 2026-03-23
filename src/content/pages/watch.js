// Watch page cleanup — sidebar, autoplay, end screen, layout reflow

IntentionalYT.pages = IntentionalYT.pages || {};

IntentionalYT.pages.watch = (() => {
  const { rulesEngine, selectors } = IntentionalYT;
  let autoplayHandled = false;

  IntentionalYT.router?.onChange(() => { autoplayHandled = false; });

  function clean() {
    const s = IntentionalYT.settings;

    if (s.hideDistractions) {
      rulesEngine.hideElements(selectors.recommendations.watchSidebar, 'watch-sidebar');
      rulesEngine.hideElements(selectors.recommendations.belowVideoRecs, 'watch-below-recs');
      rulesEngine.hideElements(selectors.recommendations.endScreen, 'watch-endscreen');
      rulesEngine.hideElements(selectors.recommendations.cards, 'watch-cards');

      tryDisableAutoplay();
      rulesEngine.hideElements(selectors.recommendations.autoplay, 'watch-autoplay');
    }

    IntentionalYT.layout?.reflowWatch();
  }

  function tryDisableAutoplay() {
    if (autoplayHandled) return;
    const toggleBtn = document.querySelector('.ytp-autonav-toggle-button-container');
    if (!toggleBtn) return;

    const isOn = toggleBtn.getAttribute('aria-checked') === 'true' ||
                 toggleBtn.querySelector('[aria-checked="true"]');
    if (isOn) {
      toggleBtn.click();
      autoplayHandled = true;
      IntentionalYT.debug?.log('autoplay', 'Toggled autoplay off');
    }
  }

  return { clean };
})();
