// Mutation observer — re-runs cleanup when YouTube injects new DOM content

IntentionalYT.observer = (() => {
  let observer = null;
  let throttleTimer = null;
  const THROTTLE_MS = 200;
  let cleanupFn = null;

  function init(onMutation) {
    cleanupFn = onMutation;

    observer = new MutationObserver((mutations) => {
      // Only react to added nodes (not pure removals)
      let hasAdded = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          hasAdded = true;
          break;
        }
      }
      if (!hasAdded) return;

      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        try { cleanupFn?.(); }
        catch (e) { console.error('[IYT] Mutation cleanup error:', e); }
      }, THROTTLE_MS);
    });

    const target = document.querySelector('ytd-app') ||
                   document.querySelector('#content') ||
                   document.body;

    observer.observe(target, { childList: true, subtree: true });
    IntentionalYT.debug?.log('observer', `Observing: ${target.tagName}#${target.id || ''}`);
  }

  function disconnect() {
    if (observer) { observer.disconnect(); observer = null; }
    if (throttleTimer) { clearTimeout(throttleTimer); throttleTimer = null; }
  }

  function reconnect() {
    disconnect();
    if (cleanupFn) init(cleanupFn);
  }

  return { init, disconnect, reconnect };
})();
