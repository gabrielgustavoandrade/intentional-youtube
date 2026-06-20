// DOM cleanup engine — applies rules based on current page and settings

IntentionalYT.rulesEngine = (() => {
  const log = (...args) => IntentionalYT.debug?.log('rules', ...args);

  // Collect elements from ALL matching selectors (not just the first hit)
  function queryAll(selectorList) {
    if (!Array.isArray(selectorList)) selectorList = [selectorList];
    const seen = new Set();
    const all = [];
    let firstSelector = null;
    for (const selector of selectorList) {
      try {
        for (const el of document.querySelectorAll(selector)) {
          if (!seen.has(el)) {
            seen.add(el);
            all.push(el);
            if (!firstSelector) firstSelector = selector;
          }
        }
      } catch (e) {
        log(`Invalid selector: ${selector}`, e.message);
      }
    }
    return { elements: all, matchedSelector: firstSelector };
  }

  function hideElements(selectorList, ruleName) {
    const { elements, matchedSelector } = queryAll(selectorList);
    let count = 0;
    for (const el of elements) {
      if (!el.dataset.iytHidden) {
        el.dataset.iytHidden = 'true';
        el.style.setProperty('display', 'none', 'important');
        count++;
      }
    }
    if (count > 0) {
      log(`[${ruleName}] Hid ${count} elements via "${matchedSelector}"`);
      IntentionalYT.debug?.trackRule(ruleName, count, matchedSelector);
    }
    return count;
  }

  function removeElements(selectorList, ruleName) {
    const { elements, matchedSelector } = queryAll(selectorList);
    let count = 0;
    for (const el of elements) {
      el.remove();
      count++;
    }
    if (count > 0) {
      log(`[${ruleName}] Removed ${count} elements via "${matchedSelector}"`);
      IntentionalYT.debug?.trackRule(ruleName, count, matchedSelector);
    }
    return count;
  }

  function unhideElements(selectorList) {
    const { elements } = queryAll(selectorList);
    for (const el of elements) {
      unhideElement(el);
    }
  }

  function unhideElement(el) {
    if (!el?.dataset?.iytHidden) return;

    delete el.dataset.iytHidden;
    el.style.removeProperty('display');
  }

  function unhideManagedElements() {
    for (const el of document.querySelectorAll('[data-iyt-hidden="true"]')) {
      unhideElement(el);
    }
  }

  return { queryAll, hideElements, removeElements, unhideElements, unhideManagedElements };
})();
