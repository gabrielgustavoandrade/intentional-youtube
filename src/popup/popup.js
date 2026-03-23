// Popup settings controller

const DEFAULTS = {
  redirectHome: true,
  redirectTarget: 'subscriptions',
  hideShorts: true,
  hideDistractions: true,
  monkMode: false
};

const CHECKBOXES = Object.keys(DEFAULTS).filter(k => typeof DEFAULTS[k] === 'boolean');
const SELECTS = Object.keys(DEFAULTS).filter(k => typeof DEFAULTS[k] === 'string');
const banner = document.getElementById('reload-banner');

function loadSettings() {
  chrome.storage.local.get(DEFAULTS, (settings) => {
    for (const key of CHECKBOXES) {
      const el = document.getElementById(key);
      if (el) el.checked = settings[key];
    }
    for (const key of SELECTS) {
      const el = document.getElementById(key);
      if (el) el.value = settings[key];
    }
    updateVisibility(settings);
  });
}

function updateVisibility(settings) {
  const targetRow = document.getElementById('redirect-target-row');
  if (targetRow) {
    targetRow.style.display = settings.redirectHome ? 'flex' : 'none';
  }
}

function showBanner() {
  banner.classList.add('visible');
}

function reloadTabs() {
  chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
    for (const tab of tabs) chrome.tabs.reload(tab.id);
  });
  banner.classList.remove('visible');
}

function applyMonkMode() {
  chrome.storage.local.set({
    redirectHome: true,
    hideShorts: true,
    hideDistractions: true,
    monkMode: true
  }, () => {
    loadSettings();
    showBanner();
  });
}

for (const key of CHECKBOXES) {
  const el = document.getElementById(key);
  if (!el) continue;

  el.addEventListener('change', () => {
    if (key === 'monkMode' && el.checked) {
      applyMonkMode();
      return;
    }

    chrome.storage.local.set({ [key]: el.checked });
    chrome.storage.local.get(DEFAULTS, updateVisibility);
    showBanner();
  });
}

for (const key of SELECTS) {
  const el = document.getElementById(key);
  if (!el) continue;
  el.addEventListener('change', () => {
    chrome.storage.local.set({ [key]: el.value });
    showBanner();
  });
}

banner?.addEventListener('click', reloadTabs);

loadSettings();
