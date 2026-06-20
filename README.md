# Intentional YouTube

A Chrome extension that removes Shorts, recommendations, and distractions from YouTube. You only see what you chose to watch.

## Install

### Chrome Web Store

Coming soon.

### Manual

1. Clone this repo
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → select the `intentional-youtube` folder
5. Open YouTube

## What it does

| Control | What it does |
|---|---|
| **Picture in Picture** | Adds a glass PiP button to the YouTube player and a popup shortcut for floating the current video. |
| **Hide Home** | Redirects `youtube.com` to Subscriptions (or Watch Later / Library). Hides the Home link in the sidebar. |
| **Hide Shorts** | Removes Shorts everywhere — nav link, shelves, search results, channel tabs. Redirects `/shorts/*` URLs. |
| **Hide Distractions** | Removes the recommendation sidebar, autoplay, end-screen overlays, suggestion cards, suggested mixes, Trending and Explore nav links. Expands the watch page to full width. |
| **Monk Mode** | Turns everything on. Locks YouTube to only Subscriptions, Search, Channels, and Watch pages. Hides History, Library, Playlists, and notification badges. Any other page redirects to Subscriptions. |

## How it works

1. **Service worker** redirects `youtube.com/` before the page loads via `declarativeNetRequest`
2. **Content scripts** run at `document_start` and clean up the DOM after settings load
3. **Router** detects the current page type using YouTube's SPA navigation events (`yt-navigate-finish`, `popstate`)
4. **Page modules** hide elements specific to each page (home, watch, search, channel, shorts)
5. **Picture-in-Picture module** injects the watch-page PiP button and handles popup messages
6. **MutationObserver** re-runs cleanup when YouTube injects new content (throttled at 200ms)
7. **Layout module** expands the primary column and pulls comments up when the sidebar is hidden

## Selector strategy

All YouTube DOM selectors live in [`src/content/selectors.js`](src/content/selectors.js). Each target has an array of fallback selectors — if YouTube changes their markup, update this one file.

To debug selectors, open the browser console on YouTube and run:

```js
__iyt.testAll()   // test all selectors against current page
__iyt.test('ytd-reel-shelf-renderer')   // test a specific selector
__iyt.enable()    // enable debug logging
```

## Project structure

```
intentional-youtube/
├── manifest.json
├── icons/
├── src/
│   ├── background/
│   │   └── service-worker.js        # declarativeNetRequest redirect rules
│   ├── content/
│   │   ├── settings-bridge.js       # Loads settings, exposes IntentionalYT global
│   │   ├── debug.js                 # Console debug tools (__iyt)
│   │   ├── selectors.js             # All YouTube DOM selectors
│   │   ├── router.js                # SPA page type detection
│   │   ├── rules-engine.js          # DOM query + hide/remove operations
│   │   ├── picture-in-picture.js    # Watch-page PiP button + popup command
│   │   ├── layout.js                # Watch page reflow
│   │   ├── observer.js              # MutationObserver
│   │   ├── main.js                  # Orchestrates cleanup
│   │   └── pages/                   # Per-page cleanup modules
│   ├── popup/
│   │   ├── popup.html               # Settings UI
│   │   └── popup.js                 # Settings controller
│   └── styles/
│       └── intentional.css          # Layout overrides
```

## Privacy

No data collected. No analytics. No tracking. All settings stored locally via `chrome.storage.local`.

## License

MIT
