// Shorts page handler — redirects away from /shorts

IntentionalYT.pages = IntentionalYT.pages || {};

IntentionalYT.pages.shorts = (() => {

  function clean() {
    if (!IntentionalYT.settings.hideShorts) return;

    if (location.pathname.startsWith('/shorts')) {
      IntentionalYT.debug?.log('shorts', 'Redirecting away from Shorts');
      location.replace('/feed/subscriptions');
    }
  }

  return { clean };
})();
