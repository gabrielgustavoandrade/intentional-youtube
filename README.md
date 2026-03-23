# Intentional YouTube

A Chrome extension that turns YouTube into an intentional-use product. Removes Shorts, recommendations, and algorithmic distractions so you only see what you chose to watch.

Inspired by PewDiePie's March 2026 setup where comments appear directly below the video, Shorts are gone, and the homepage redirects to Subscriptions.

## Install

1. Clone/download this repo
2. Open `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" → select the `intentional-youtube` folder
5. Open YouTube

## Architecture

```
intentional-youtube/
├── manifest.json                  # MV3 manifest
├── src/
│   ├── background/
│   │   └── service-worker.js      # Home redirect via declarativeNetRequest
│   ├── content/
│   │   ├── settings-bridge.js     # Loads settings for content scripts
│   │   ├── selectors.js           # All YouTube DOM selectors (centralized)
│   │   ├── router.js              # SPA route detection
│   │   ├── rules-engine.js        # DOM hide/remove operations
│   │   ├── pages/
│   │   │   ├── home.js            # Homepage redirect + feed cleanup
│   │   │   ├── watch.js           # Watch page: sidebar, autoplay, endscreen
│   │   │   ├── search.js          # Search results cleanup
│   │   │   ├── channel.js         # Channel page Shorts/suggestions removal
│   │   │   ├── subscriptions.js   # Subscriptions feed cleanup
│   │   │   └── shorts.js          # Shorts page block/redirect
│   │   ├── layout.js              # Watch page reflow (expand primary, pull comments up)
│   │   ├── observer.js            # MutationObserver with throttling
│   │   ├── debug.js               # Debug logging and selector testing
│   │   └── main.js                # Entry point, orchestrates everything
│   ├── popup/
│   │   ├── popup.html             # Settings popup
│   │   └── popup.js               # Settings controller
│   └── styles/
│       └── intentional.css        # Layout overrides
└── icons/
```

### How it works

1. **Service worker** sets up `declarativeNetRequest` rules to redirect `youtube.com/` to `/feed/subscriptions` before the page even loads
2. **Content scripts** load at `document_start` and initialize after settings are ready
3. **Router** detects the current page type and listens for YouTube's SPA navigation events (`yt-navigate-finish`, `popstate`)
4. **Page modules** run selectors to hide/remove unwanted elements specific to each page type
5. **MutationObserver** watches for YouTube injecting new content and re-runs cleanup (throttled at 200ms)
6. **Layout module** expands the primary column and pulls comments up when the sidebar is hidden on watch pages
7. **CSS** provides layout rules for the expanded watch page and backup hiding

### Key design decisions

- **Selectors are centralized** in `selectors.js` — when YouTube changes markup, update one file
- **Multiple fallback selectors** per target — if one breaks, the next one matches
- **`display: none !important`** over `element.remove()` for most hiding — safer, reversible, avoids breaking YouTube's internal state
- **Throttled observer** — 200ms debounce prevents performance issues from rapid DOM mutations
- **Graceful degradation** — if a selector fails, the rest of the extension keeps working

## Selector Strategy

All selectors live in `src/content/selectors.js`, grouped by category:

| Group | Purpose |
|---|---|
| `shorts.*` | Shorts shelves, items, nav links, channel tabs |
| `recommendations.*` | Homepage feed, watch sidebar, autoplay, endscreen, cards |
| `preserve.*` | Elements that must NOT be hidden (player, title, comments) |
| `watchLayout.*` | Structural elements for layout reflow |
| `nav.*` | Navigation links (trending, explore) |
| `misc.*` | Hover previews, mini-player, notification badges |

Each entry is an array of CSS selectors tried in order. First match wins.

### Updating broken selectors

1. Open YouTube, press F12
2. In console: `__iyt.testAll()` — shows which selectors match and which don't
3. Find the broken selector in `selectors.js`
4. Use the Elements panel to find the new selector
5. Add the new selector to the **front** of the array (highest priority)
6. Keep old selectors as fallbacks
7. Test: `__iyt.test('your-new-selector')`

## Debug Mode

Enable in the popup or set `debugMode: true` in storage.

### Console commands

| Command | Description |
|---|---|
| `__iyt.stats()` | Print rule firing statistics |
| `__iyt.testAll()` | Test all selectors against current page |
| `__iyt.test('selector')` | Test a specific CSS selector |
| `__iyt.enable()` | Enable debug logging |
| `__iyt.disable()` | Disable debug logging |

Debug logs are prefixed with `[IYT:category]` and color-coded in the console.

## Settings

All settings stored in `chrome.storage.local`. Defaults:

| Setting | Default | Description |
|---|---|---|
| `redirectHome` | `true` | Redirect youtube.com to subscriptions |
| `redirectTarget` | `subscriptions` | Where to redirect (subscriptions/watch-later/library) |
| `hideShorts` | `true` | Remove Shorts everywhere |
| `hideRecommendations` | `true` | Remove all recommendation surfaces |
| `hideHomeFeed` | `true` | Hide homepage feed content |
| `hideEndScreen` | `true` | Remove end-screen overlays |
| `disableAutoplay` | `true` | Disable autoplay UI |
| `strictMode` | `false` | Maximum distraction removal |
| `monkMode` | `false` | Only subs + search + channels |
| `debugMode` | `false` | Enable debug console output |

## Manual Test Checklist

### Home page
- [ ] Opening youtube.com redirects to /feed/subscriptions
- [ ] Direct navigation to youtube.com/ redirects
- [ ] Clicking YouTube logo redirects
- [ ] If redirect disabled: homepage feed is hidden
- [ ] Shorts shelves hidden on home

### Watch page
- [ ] Video plays normally
- [ ] Title, channel info, like/share visible
- [ ] Description expandable
- [ ] Comments visible directly below video info
- [ ] Right sidebar (related videos) hidden
- [ ] No recommendation blocks between video and comments
- [ ] End-screen suggestions hidden
- [ ] Autoplay toggle hidden/disabled
- [ ] Theater mode works correctly
- [ ] Full-screen works

### Search results
- [ ] Search works normally
- [ ] Video results display
- [ ] Channel results display
- [ ] Shorts results hidden
- [ ] "People also watched" shelves hidden

### Channel pages
- [ ] Channel loads normally
- [ ] Videos tab works
- [ ] Playlists tab works
- [ ] Shorts tab hidden
- [ ] Shorts shelf hidden

### Subscriptions
- [ ] Feed loads and displays normally
- [ ] Shorts shelf hidden if present
- [ ] Can click through to videos

### Shorts
- [ ] Navigating to /shorts/* shows blocked message or redirects
- [ ] Shorts links from other pages are handled

### SPA navigation
- [ ] Clicking a video from subs → watch page cleanup runs
- [ ] Back button → previous page cleanup runs
- [ ] Search from watch page → search cleanup runs
- [ ] Channel link from watch → channel cleanup runs
- [ ] No cleanup failures after 10+ navigations

### Settings
- [ ] Popup opens and shows current settings
- [ ] Toggling a setting takes effect on next YouTube navigation
- [ ] "Reload YouTube tabs" button works
- [ ] Strict mode enables all toggles
- [ ] Monk mode enables all toggles

### Edge cases
- [ ] Logged out YouTube
- [ ] Different screen widths (1280, 1920, 2560)
- [ ] Multiple YouTube tabs open
- [ ] Extension disable/re-enable
