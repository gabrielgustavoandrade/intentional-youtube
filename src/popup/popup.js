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
const pipButton = document.getElementById('toggle-pip');
const pipStatus = document.getElementById('pip-status');
let pipStatusTimer = null;

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
  banner?.classList.add('visible');
}

function setPipStatus(message) {
  if (!pipStatus) return;
  window.clearTimeout(pipStatusTimer);
  pipStatus.textContent = message;
  if (!message) return;
  pipStatusTimer = window.setTimeout(() => {
    pipStatus.textContent = '';
  }, 3600);
}

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => resolve(tab));
  });
}

function sendTabMessage(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(response);
    });
  });
}

async function togglePictureInPicture() {
  setPipStatus('');
  const tab = await getActiveTab();

  if (tab?.id == null || !tab.url?.includes('youtube.com/watch')) {
    setPipStatus('Open a YouTube video first.');
    return;
  }

  try {
    const response = await sendTabMessage(tab.id, { type: 'IYT_TOGGLE_PIP' });
    if (!response?.ok) {
      throw new Error(response?.error || 'Picture in Picture could not start.');
    }
    setPipStatus(response.active ? 'Floating video.' : 'Returned to the page.');
  } catch (error) {
    setPipStatus('Use the video button if the browser blocks this shortcut.');
  }
}

function reloadTabs() {
  chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id != null) chrome.tabs.reload(tab.id);
    }
  });
  banner?.classList.remove('visible');
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
pipButton?.addEventListener('click', togglePictureInPicture);

loadSettings();
