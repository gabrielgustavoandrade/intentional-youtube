// Channel page cleanup — Shorts tabs/shelves

IntentionalYT.pages = IntentionalYT.pages || {};

IntentionalYT.pages.channel = (() => {
  const { rulesEngine, selectors } = IntentionalYT;

  function clean() {
    if (IntentionalYT.settings.hideShorts) {
      rulesEngine.hideElements(selectors.shorts.channelTab, 'channel-shorts-tab');
      rulesEngine.hideElements(selectors.shorts.channelSection, 'channel-shorts-section');
    }
  }

  return { clean };
})();
