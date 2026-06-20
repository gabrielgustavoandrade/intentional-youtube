// Picture-in-picture controls for the YouTube watch player

IntentionalYT.pictureInPicture = (() => {
  const BUTTON_ID = 'iyt-pip-button';
  const CLASS_READY = 'iyt-pip-ready';
  const AUTO_REQUEST_COOLDOWN_MS = 1200;
  const PREPARE_RETRY_DELAY_MS = 250;
  const PREPARE_RETRY_LIMIT = 24;
  let autoRequestInFlight = null;
  let lastAutoRequestAt = 0;
  let focusedVideo = null;
  let focusedVideoKey = '';
  let prepareRetryTimer = null;
  let prepareRetryCount = 0;
  const observedVideos = new WeakSet();

  function isSupported() {
    return Boolean(document.pictureInPictureEnabled && HTMLVideoElement.prototype.requestPictureInPicture);
  }

  function getVideo() {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.find((video) => video.readyState > 0 && video.videoWidth > 0) || videos[0] || null;
  }

  function enableBrowserAuto(video) {
    if (!video || !('autoPictureInPicture' in video)) return;

    try {
      video.autoPictureInPicture = true;
    } catch (error) {
      IntentionalYT.debug?.log('pip', `Browser auto PiP unavailable: ${error.message}`);
    }
  }

  function isPlaying(video) {
    return Boolean(video && !video.paused && !video.ended && video.readyState > 0);
  }

  function isWatchPage() {
    const pageTypes = IntentionalYT.router?.PAGE_TYPES;
    if (!pageTypes) return location.pathname.startsWith('/watch');

    return IntentionalYT.router.current === pageTypes.WATCH;
  }

  function canAutoRequest(reason) {
    if (reason === 'watch-route-exit') return true;

    return isWatchPage();
  }

  function activeElementAcceptsText() {
    const el = document.activeElement;
    if (!el) return false;

    const tagName = el.tagName?.toLowerCase();
    return Boolean(
      el.isContentEditable ||
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select'
    );
  }

  function makeFocusable(element) {
    if (!element || element.hasAttribute('tabindex')) return;
    element.setAttribute('tabindex', '-1');
  }

  function focusWithoutScroll(element) {
    if (!element) return;

    try {
      element.focus({ preventScroll: true });
    } catch {
      element.focus();
    }
  }

  function requestAutoWhenHidden(reason) {
    if (document.visibilityState === 'hidden') {
      requestAuto(reason);
    }
  }

  function observeVideoForAutoPictureInPicture(video) {
    if (!video || observedVideos.has(video)) return;

    observedVideos.add(video);
    video.addEventListener('loadedmetadata', () => {
      enableBrowserAuto(video);
      if (document.visibilityState === 'visible') {
        prepareVideoForAutoPictureInPicture({ forceFocus: true });
      } else {
        requestAutoWhenHidden('video-loaded-hidden');
      }
    });
    video.addEventListener('playing', () => {
      enableBrowserAuto(video);
      if (document.visibilityState === 'visible') {
        prepareVideoForAutoPictureInPicture({ forceFocus: true });
      } else {
        requestAutoWhenHidden('video-playing-hidden');
      }
    });
  }

  function prepareVideoForAutoPictureInPicture({ forceFocus = false } = {}) {
    window.clearTimeout(prepareRetryTimer);

    if (!isWatchPage() || document.visibilityState !== 'visible') {
      return false;
    }

    const video = getVideo();
    if (!video) {
      if (prepareRetryCount < PREPARE_RETRY_LIMIT) {
        prepareRetryCount += 1;
        prepareRetryTimer = window.setTimeout(() => {
          prepareVideoForAutoPictureInPicture({ forceFocus });
        }, PREPARE_RETRY_DELAY_MS);
      }
      return false;
    }

    prepareRetryCount = 0;
    enableBrowserAuto(video);
    observeVideoForAutoPictureInPicture(video);
    const videoKey = `${location.pathname}${location.search}`;

    if (!forceFocus && focusedVideo === video && focusedVideoKey === videoKey) {
      return true;
    }

    if (activeElementAcceptsText()) {
      return true;
    }

    const player = document.querySelector('#movie_player');
    makeFocusable(player);
    makeFocusable(video);

    focusWithoutScroll(player || video);
    focusWithoutScroll(video);
    focusedVideo = video;
    focusedVideoKey = videoKey;
    IntentionalYT.debug?.log('pip', 'Prepared video focus for automatic PiP');

    return true;
  }

  async function enter({ requirePlaying = false } = {}) {
    if (!isSupported()) {
      throw new Error('Picture-in-picture is not supported in this browser.');
    }

    if (document.pictureInPictureElement) {
      return { active: true };
    }

    const video = getVideo();
    if (!video) {
      throw new Error('No YouTube video is ready yet.');
    }

    enableBrowserAuto(video);
    prepareVideoForAutoPictureInPicture();

    if (requirePlaying && !isPlaying(video)) {
      return { active: false, skipped: 'not-playing' };
    }

    await video.requestPictureInPicture();
    return { active: true };
  }

  async function toggle() {
    if (!isSupported()) {
      throw new Error('Picture-in-picture is not supported in this browser.');
    }

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return { active: false };
    }

    return enter();
  }

  async function exit() {
    if (!document.pictureInPictureElement) {
      return { active: false };
    }

    await document.exitPictureInPicture();
    return { active: false };
  }

  function exitOnPageClose() {
    if (!document.pictureInPictureElement) return;

    document.exitPictureInPicture().catch((error) => {
      IntentionalYT.debug?.log('pip', `Could not close PiP during page close: ${error.message}`);
    });
  }

  function requestAuto(reason = 'auto') {
    if (!canAutoRequest(reason) || !isSupported() || document.pictureInPictureElement) {
      return Promise.resolve({ active: Boolean(document.pictureInPictureElement) });
    }

    const now = Date.now();
    if (autoRequestInFlight || now - lastAutoRequestAt < AUTO_REQUEST_COOLDOWN_MS) {
      return autoRequestInFlight || Promise.resolve({ active: false, skipped: 'cooldown' });
    }

    const video = getVideo();
    enableBrowserAuto(video);
    observeVideoForAutoPictureInPicture(video);
    prepareVideoForAutoPictureInPicture();

    if (!isPlaying(video)) {
      return Promise.resolve({ active: false, skipped: 'not-playing' });
    }

    lastAutoRequestAt = now;
    autoRequestInFlight = enter({ requirePlaying: true })
      .catch((error) => {
        IntentionalYT.debug?.log('pip', `Auto PiP blocked on ${reason}: ${error.message}`);
        return { active: false, error: error.message };
      })
      .finally(() => {
        autoRequestInFlight = null;
      });

    return autoRequestInFlight;
  }

  function updateButtonState(button) {
    const active = Boolean(document.pictureInPictureElement);
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('title', active ? 'Exit picture-in-picture' : 'Open picture-in-picture');
  }

  function refreshButtonState() {
    const button = document.getElementById(BUTTON_ID);
    if (button) updateButtonState(button);
  }

  function createButton() {
    const button = document.createElement('button');
    const icon = document.createElement('span');

    button.id = BUTTON_ID;
    button.type = 'button';
    button.className = 'iyt-pip-button';
    button.setAttribute('aria-label', 'Open picture-in-picture');

    icon.className = 'iyt-pip-icon';
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon);

    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        await toggle();
      } catch (error) {
        IntentionalYT.debug?.log('pip', error.message);
      } finally {
        updateButtonState(button);
      }
    });

    return button;
  }

  function ensureButton() {
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    const player = document.querySelector('#movie_player');

    if (!watchFlexy || !player || !isSupported()) {
      removeButton();
      return;
    }

    let button = document.getElementById(BUTTON_ID);
    if (!button) {
      button = createButton();
    }

    if (button.parentElement !== player) {
      player.append(button);
    }

    const video = getVideo();
    enableBrowserAuto(video);
    observeVideoForAutoPictureInPicture(video);
    prepareVideoForAutoPictureInPicture();
    player.classList.add(CLASS_READY);
    updateButtonState(button);
  }

  function removeButton() {
    document.getElementById(BUTTON_ID)?.remove();
    document.querySelector('#movie_player')?.classList.remove(CLASS_READY);
  }

  function respondWith(sendResponse, action, { refreshButton = false } = {}) {
    action()
      .then((result) => {
        if (refreshButton) refreshButtonState();
        sendResponse({ ok: true, ...result });
      })
      .catch((error) => sendResponse({ ok: false, error: error.message }));

    return true;
  }

  document.addEventListener('enterpictureinpicture', () => {
    refreshButtonState();
  }, true);

  document.addEventListener('leavepictureinpicture', () => {
    refreshButtonState();
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      requestAuto('visibility-hidden');
    }
  }, true);

  window.addEventListener('blur', () => {
    requestAuto('window-blur');
  });

  window.addEventListener('pagehide', exitOnPageClose);
  window.addEventListener('beforeunload', exitOnPageClose);

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    switch (msg?.type) {
      case 'IYT_EXIT_PIP':
        return respondWith(sendResponse, exit, { refreshButton: true });
      case 'IYT_AUTO_PIP':
        return respondWith(sendResponse, () => requestAuto(msg.reason || 'extension-message'));
      case 'IYT_TOGGLE_PIP':
        return respondWith(sendResponse, toggle, { refreshButton: true });
      default:
        return undefined;
    }
  });

  return { ensureButton, removeButton, requestAuto, toggle, exit };
})();
