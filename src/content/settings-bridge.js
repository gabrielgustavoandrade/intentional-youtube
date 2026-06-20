// Loads settings into a global for content scripts — loaded first

window.IntentionalYT = window.IntentionalYT || {};

IntentionalYT.DEFAULTS = {
  redirectHome: true,
  redirectTarget: 'subscriptions',
  hideShorts: true,
  hideDistractions: true,
  monkMode: false
};

IntentionalYT.REDIRECT_TARGETS = {
  subscriptions: '/feed/subscriptions',
  'watch-later': '/playlist?list=WL',
  library: '/feed/library'
};

IntentionalYT.settings = { ...IntentionalYT.DEFAULTS };
IntentionalYT._settingsReady = false;
IntentionalYT._settingsCallbacks = [];

IntentionalYT.onSettingsReady = function (cb) {
  if (IntentionalYT._settingsReady) {
    cb(IntentionalYT.settings);
  } else {
    IntentionalYT._settingsCallbacks.push(cb);
  }
};

function applySettings(stored) {
  IntentionalYT.settings = { ...IntentionalYT.DEFAULTS, ...stored };
  IntentionalYT._settingsReady = true;
  for (const cb of IntentionalYT._settingsCallbacks) {
    try { cb(IntentionalYT.settings); } catch (e) { console.error('[IYT] settings callback error', e); }
  }
  IntentionalYT._settingsCallbacks = [];
}

chrome.storage.local.get(IntentionalYT.DEFAULTS, applySettings);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type !== 'SETTINGS_CHANGED') return undefined;

  chrome.storage.local.get(IntentionalYT.DEFAULTS, (stored) => {
    IntentionalYT.settings = { ...IntentionalYT.DEFAULTS, ...stored };
    IntentionalYT.rulesEngine?.unhideManagedElements?.();
    if (typeof IntentionalYT.runCleanup === 'function') {
      IntentionalYT.runCleanup();
    }
  });

  return undefined;
});
