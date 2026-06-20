// Centralized selector configuration
// All YouTube DOM selectors in one place for easy maintenance
// Each entry supports multiple selectors (fallbacks) since YouTube markup changes often

IntentionalYT.selectors = {

  // ── Shorts ──────────────────────────────────────────────────────────
  shorts: {
    // Shorts shelf on home/subscriptions/search
    shelf: [
      'ytd-reel-shelf-renderer',
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytd-rich-shelf-renderer:has(ytd-reel-item-renderer)',
      'ytd-rich-section-renderer:has(ytd-reel-shelf-renderer)'
    ],
    // Individual Shorts items in feeds
    items: [
      'ytd-reel-item-renderer',
      'ytd-grid-video-renderer:has(a[href*="/shorts/"])',
      'ytd-rich-item-renderer:has(a[href*="/shorts/"])',
      'ytd-video-renderer:has(a[href*="/shorts/"])'
    ],
    // Shorts tab on channel pages
    channelTab: [
      'yt-tab-shape[tab-title="Shorts"]',
      'tp-yt-paper-tab[aria-label*="Shorts"]',
      'tp-yt-paper-tab[title="Shorts"]',
      'yt-chip-cloud-chip-renderer:has(yt-formatted-string[title="Shorts"])'
    ],
    // Shorts section on channel page
    channelSection: [
      'ytd-reel-shelf-renderer',
      'ytd-item-section-renderer:has(ytd-reel-shelf-renderer)'
    ],
    // Sidebar/nav Shorts link
    navLink: [
      'ytd-guide-entry-renderer:has(a[title="Shorts"])',
      'ytd-mini-guide-entry-renderer:has(a[title="Shorts"])',
      'ytd-guide-entry-renderer a[href="/shorts"]'
    ],
    // Shorts in search results
    searchResults: [
      'ytd-reel-shelf-renderer',
      'ytd-video-renderer:has(a[href*="/shorts/"])'
    ]
  },

  // ── Recommendations ─────────────────────────────────────────────────
  recommendations: {
    // Homepage feed
    homeFeed: [
      'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
      'ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer'
    ],
    // Right sidebar on watch page
    watchSidebar: [
      'ytd-watch-next-secondary-results-renderer',
      '#secondary-inner #related',
      '#secondary.ytd-watch-flexy #related'
    ],
    // The entire secondary column on watch page
    secondaryColumn: [
      '#secondary.ytd-watch-flexy',
      'ytd-watch-flexy #secondary'
    ],
    // Autoplay toggle and next-up
    autoplay: [
      '.ytp-autonav-toggle-button-container',
      '.ytp-autonav-endscreen-countdown',
      '.ytp-autonav-endscreen-upnext-container',
      'ytd-compact-autoplay-renderer'
    ],
    // End screen suggestions (in-player overlays)
    endScreen: [
      '.ytp-ce-element',
      '.ytp-endscreen-content',
      '.html5-endscreen',
      '.ytp-suggestion-set'
    ],
    // Below-video recommendation shelves
    belowVideoRecs: [
      'ytd-watch-next-secondary-results-renderer ytd-compact-video-renderer',
      'ytd-item-section-renderer.ytd-watch-next-secondary-results-renderer'
    ],
    // "People also watched" / related shelves in search
    searchRecs: [
      'ytd-shelf-renderer:has(#title-text:not(:empty))',
      'ytd-horizontal-card-list-renderer'
    ],
    // Suggested channels / mixes
    suggestedMixes: [
      'ytd-radio-renderer',
      'ytd-compact-radio-renderer'
    ],
    // Cards/overlays
    cards: [
      '.ytp-cards-teaser',
      '.ytp-cards-button'
    ]
  },

  // ── Layout elements to preserve ─────────────────────────────────────
  preserve: {
    player: ['#movie_player', 'ytd-player'],
    title: ['ytd-watch-metadata', 'h1.ytd-watch-metadata', '#title h1'],
    channelInfo: ['ytd-video-owner-renderer', '#owner'],
    actions: ['ytd-menu-renderer.ytd-watch-metadata', '#actions'],
    description: ['ytd-text-inline-expander', 'ytd-expander.ytd-video-secondary-info-renderer', '#description'],
    comments: ['ytd-comments#comments', '#comments'],
    searchBox: ['ytd-searchbox', '#search-form'],
    subscribeButton: ['#subscribe-button']
  },

  // ── Watch page layout ───────────────────────────────────────────────
  watchLayout: {
    primary: ['#primary.ytd-watch-flexy', '#primary-inner'],
    secondary: ['#secondary.ytd-watch-flexy'],
    belowPlayer: ['#below.ytd-watch-flexy', 'ytd-watch-metadata'],
    columns: ['ytd-watch-flexy #columns'],
    fullWidth: ['ytd-watch-flexy']
  },

  // ── Navigation ──────────────────────────────────────────────────────
  nav: {
    home: [
      'ytd-guide-entry-renderer:has(a[href="/"])',
      'ytd-mini-guide-entry-renderer:has(a[href="/"])'
    ],
    trending: [
      'ytd-guide-entry-renderer:has(a[href*="/trending"])',
      'ytd-guide-entry-renderer:has(a[title="Trending"])',
      'ytd-mini-guide-entry-renderer:has(a[href*="/trending"])'
    ],
    explore: [
      'ytd-guide-entry-renderer:has(a[href*="/explore"])',
      'ytd-guide-entry-renderer:has(a[title="Explore"])'
    ]
  },

  // ── Monk mode — pages/nav to block ──────────────────────────────────
  monk: {
    // Nav links to hide in monk mode (keep only subs, search, channels)
    historyLink: [
      'ytd-guide-entry-renderer:has(a[href="/feed/history"])',
      'ytd-mini-guide-entry-renderer:has(a[href="/feed/history"])'
    ],
    libraryLink: [
      'ytd-guide-entry-renderer:has(a[href="/feed/library"])',
      'ytd-mini-guide-entry-renderer:has(a[href="/feed/library"])'
    ],
    playlistsNav: [
      'ytd-guide-section-renderer:has(#guide-section-title:empty) ytd-guide-entry-renderer:has(a[href*="/playlist"])'
    ],
    // "Explore" section in left nav (Music, Gaming, News, etc.)
    exploreSection: [
      'ytd-guide-section-renderer:has(ytd-guide-entry-renderer a[href*="/gaming"])',
      'ytd-guide-section-renderer:has(ytd-guide-entry-renderer a[href*="/music"])'
    ]
  },

  // ── Misc ────────────────────────────────────────────────────────────
  misc: {
    hoverPreviews: [
      'ytd-thumbnail-overlay-toggle-button-renderer',
      '#mouseover-overlay'
    ],
    miniPlayer: [
      'ytd-miniplayer',
      'ytd-mini-guide-renderer'
    ],
    notificationBadge: [
      'ytd-notification-topbar-button-renderer .notification-badge',
      '.yt-spec-icon-badge-shape--type-notification'
    ]
  }
};
