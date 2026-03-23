// Layout reflow — expands main column when sidebar is hidden
// Makes the watch page look intentional, not broken

IntentionalYT.layout = (() => {
  const CLASS_PREFIX = 'iyt-';

  function reflowWatch() {
    const s = IntentionalYT.settings;
    if (!s.hideDistractions) {
      removeReflow();
      return;
    }

    // Add class to watch-flexy to trigger CSS-based layout
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (watchFlexy) {
      watchFlexy.classList.add(`${CLASS_PREFIX}no-sidebar`);

      // Remove theater-mode constraint if not in theater
      if (!watchFlexy.hasAttribute('theater')) {
        watchFlexy.classList.add(`${CLASS_PREFIX}expanded`);
      }
    }

    // Move comments up by ensuring no recommendation blocks sit between info and comments
    pullCommentsUp();
  }

  function pullCommentsUp() {
    // On YouTube's watch page, comments (#comments) are inside #below,
    // which also contains #related (recommendations) in some layouts.
    // We ensure comments are visible and directly follow the video metadata.

    const comments = document.querySelector('ytd-comments#comments');
    const below = document.querySelector('#below');

    if (comments && below) {
      // Force comments to be visible
      comments.style.removeProperty('display');
      comments.classList.add(`${CLASS_PREFIX}comments-visible`);
    }

    // Hide any sections between metadata and comments that are recommendation-like
    const sections = document.querySelectorAll('#below > ytd-item-section-renderer');
    for (const section of sections) {
      // If it doesn't contain comments, it's likely a recommendation block
      if (!section.querySelector('ytd-comments')) {
        section.style.setProperty('display', 'none', 'important');
        section.dataset.iytHidden = 'true';
      }
    }
  }

  function removeReflow() {
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (watchFlexy) {
      watchFlexy.classList.remove(`${CLASS_PREFIX}no-sidebar`, `${CLASS_PREFIX}expanded`);
    }
  }

  return { reflowWatch, removeReflow };
})();
