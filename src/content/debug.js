// Debug mode — logs rule firing, unmatched selectors, selector testing

IntentionalYT.debug = (() => {
  const ruleStats = {};

  function isEnabled() {
    return IntentionalYT.settings?.debugMode;
  }

  function log(category, ...args) {
    if (!isEnabled()) return;
    console.log(`%c[IYT:${category}]`, 'color: #7c3aed; font-weight: bold;', ...args);
  }

  function warn(category, ...args) {
    if (!isEnabled()) return;
    console.warn(`%c[IYT:${category}]`, 'color: #d97706; font-weight: bold;', ...args);
  }

  function trackRule(ruleName, matchCount, selector) {
    if (!isEnabled()) return;
    if (!ruleStats[ruleName]) {
      ruleStats[ruleName] = { fires: 0, totalMatches: 0, selectors: {} };
    }
    ruleStats[ruleName].fires++;
    ruleStats[ruleName].totalMatches += matchCount;
    if (selector) {
      ruleStats[ruleName].selectors[selector] = (ruleStats[ruleName].selectors[selector] || 0) + matchCount;
    }
  }

  function printStats() {
    console.group('%c[IYT] Rule Statistics', 'color: #7c3aed; font-weight: bold; font-size: 14px;');
    for (const [name, stats] of Object.entries(ruleStats).sort((a, b) => b[1].totalMatches - a[1].totalMatches)) {
      console.groupCollapsed(`${name}: ${stats.totalMatches} matches in ${stats.fires} runs`);
      console.table(stats.selectors);
      console.groupEnd();
    }
    console.groupEnd();
  }

  function testSelector(selector) {
    try {
      const els = document.querySelectorAll(selector);
      console.log(`%c[IYT:test]`, 'color: #059669; font-weight: bold;',
        `"${selector}" → ${els.length} elements`, els.length > 0 ? Array.from(els) : '(none)');
      return els;
    } catch (e) {
      console.error(`[IYT:test] Invalid selector: "${selector}"`, e.message);
      return [];
    }
  }

  function testAllSelectors() {
    const selectors = IntentionalYT.selectors;
    console.group('%c[IYT] Selector Test', 'color: #7c3aed; font-weight: bold; font-size: 14px;');
    for (const [groupName, group] of Object.entries(selectors)) {
      for (const [name, sels] of Object.entries(group)) {
        if (!Array.isArray(sels)) continue;
        const results = sels.map(s => {
          try { return { selector: s, count: document.querySelectorAll(s).length }; }
          catch { return { selector: s, count: -1 }; }
        });
        const total = results.reduce((sum, r) => sum + Math.max(0, r.count), 0);
        if (total > 0) {
          console.log(`✓ ${groupName}.${name}:`, results.filter(r => r.count > 0));
        } else {
          console.log(`✗ ${groupName}.${name}: no matches`, results);
        }
      }
    }
    console.groupEnd();
  }

  // Console API
  window.__iyt = {
    stats: printStats,
    test: testSelector,
    testAll: testAllSelectors,
    enable() { chrome.storage.local.set({ debugMode: true }); console.log('[IYT] Debug enabled'); },
    disable() { chrome.storage.local.set({ debugMode: false }); console.log('[IYT] Debug disabled'); }
  };

  return { log, warn, trackRule, isEnabled };
})();
