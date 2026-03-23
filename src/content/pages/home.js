// Home page cleanup — redirects away

IntentionalYT.pages = IntentionalYT.pages || {};

IntentionalYT.pages.home = (() => {

  function clean() {
    const s = IntentionalYT.settings;
    if (!s.redirectHome) return;

    const target = IntentionalYT.REDIRECT_TARGETS[s.redirectTarget];
    if (target && location.pathname === '/') {
      const ytNavigate = document.querySelector('a[href="' + target + '"]');
      if (ytNavigate) {
        ytNavigate.click();
      } else {
        location.replace(target);
      }
    }
  }

  return { clean };
})();
