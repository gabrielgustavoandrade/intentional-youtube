// Background Service Worker — handles redirects via declarativeNetRequest

const REDIRECT_TARGETS = {
  subscriptions: '/feed/subscriptions',
  'watch-later': '/playlist?list=WL',
  library: '/feed/library',
  none: null
};

const REDIRECT_RULE_ID = 1;
const ALL_RULE_IDS = [REDIRECT_RULE_ID];

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

let chain = Promise.resolve();
function updateRedirectRules() {
  chain = chain.then(() => _updateRedirectRules()).catch(console.error);
  return chain;
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
        action: { type: 'redirect', redirect: { transform: { path: target } } },
        condition: { regexFilter: '^https?://www\\.youtube\\.com/?$', resourceTypes: ['main_frame'] }
      });
    }
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ALL_RULE_IDS,
    addRules
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    updateRedirectRules();
    chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_CHANGED' }).catch(() => {});
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(() => updateRedirectRules());
chrome.runtime.onStartup.addListener(() => updateRedirectRules());
