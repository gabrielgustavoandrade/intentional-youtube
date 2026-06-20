// Background Service Worker — handles redirects via declarativeNetRequest

const REDIRECT_TARGETS = {
  subscriptions: 'https://www.youtube.com/feed/subscriptions',
  'watch-later': 'https://www.youtube.com/playlist?list=WL',
  library: 'https://www.youtube.com/feed/library',
  none: null
};

const REDIRECT_RULE_ID = 1;
const ALL_RULE_IDS = [REDIRECT_RULE_ID];
const AUTO_PIP_RETRY_DELAYS_MS = [1000, 3000];

const SETTING_DEFAULTS = {
  redirectHome: true,
  redirectTarget: 'subscriptions',
  hideShorts: true,
  hideDistractions: true,
  monkMode: false
};

async function getSettings() {
  const result = await chrome.storage.local.get(SETTING_DEFAULTS);
  return { ...SETTING_DEFAULTS, ...result };
}

let redirectRuleUpdate = Promise.resolve();
function updateRedirectRules() {
  redirectRuleUpdate = redirectRuleUpdate.then(() => _updateRedirectRules()).catch(console.error);
  return redirectRuleUpdate;
}

async function _updateRedirectRules() {
  const settings = await getSettings();
  const addRules = [];

  if (settings.redirectHome) {
    const target = REDIRECT_TARGETS[settings.redirectTarget];
    if (target) {
      addRules.push({
        id: REDIRECT_RULE_ID,
        priority: 1,
        action: { type: 'redirect', redirect: { url: target } },
        condition: { regexFilter: '^https?://www\\.youtube\\.com/?$', resourceTypes: ['main_frame'] }
      });
    }
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ALL_RULE_IDS,
    addRules
  });
}

function isWatchTab(tab) {
  return Boolean(tab?.id != null && tab.url?.includes('youtube.com/watch'));
}

function sendAutoPictureInPicture(tabId, reason) {
  return chrome.tabs.sendMessage(tabId, { type: 'IYT_AUTO_PIP', reason });
}

function sendExitPictureInPicture(tabId, reason) {
  return chrome.tabs.sendMessage(tabId, { type: 'IYT_EXIT_PIP', reason });
}

function requestAutoPictureInPictureForTab(tab, reason) {
  if (!isWatchTab(tab) || tab.active) return;

  sendAutoPictureInPicture(tab.id, reason).catch(() => {});
  AUTO_PIP_RETRY_DELAYS_MS.forEach((delay, index) => {
    setTimeout(() => {
      sendAutoPictureInPicture(tab.id, `${reason}-retry-${index + 1}`).catch(() => {});
    }, delay);
  });
}

async function requestAutoPictureInPicture(windowId, reason) {
  const tabs = await chrome.tabs.query({ windowId });
  const activeWatchTabs = tabs.filter((tab) => tab.active && isWatchTab(tab));
  const inactiveWatchTabs = tabs.filter((tab) => !tab.active && isWatchTab(tab));

  await Promise.allSettled([
    ...activeWatchTabs.map((tab) => (
      sendExitPictureInPicture(tab.id, reason)
    )),
    ...inactiveWatchTabs.map((tab) => (
      sendAutoPictureInPicture(tab.id, reason)
    ))
  ]);
}

chrome.storage.onChanged.addListener((_changes, area) => {
  if (area === 'local') {
    updateRedirectRules();
    chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
      for (const tab of tabs) {
        if (tab.id == null) continue;
        chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_CHANGED' }).catch(() => {});
      }
    });
  }
});

chrome.tabs.onActivated.addListener(({ windowId }) => {
  requestAutoPictureInPicture(windowId, 'tab-activated').catch(console.error);
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== 'complete') return;
  requestAutoPictureInPictureForTab(tab, changeInfo.url ? 'watch-url-updated' : 'watch-load-complete');
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  requestAutoPictureInPicture(windowId, 'window-focused').catch(console.error);
});

chrome.runtime.onInstalled.addListener(() => updateRedirectRules());
chrome.runtime.onStartup.addListener(() => updateRedirectRules());
