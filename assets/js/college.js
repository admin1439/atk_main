/* Infinite, seamless auto-slide for Colleges
   - duplicates cards inside the same track (no second row)
   - resets at half width for perfect loop
   - pauses on hover
   - works even when section is injected by main.js
*/
(() => {
  function init() {
    const container = document.querySelector('.college-scroll-container');
    const track = document.querySelector('.college-grid');
    if (!container || !track || container.dataset.sliderInit === 'true') return;

    // Duplicate items INSIDE the same track for seamless loop
    const cards = Array.from(track.children);
    cards.forEach(card => track.appendChild(card.cloneNode(true)));

    let paused = false;
    const speed = 0.7; // px per frame; adjust as you like

    function tick() {
      if (!paused) {
        container.scrollLeft += speed;

        // Reset at half of track width (because we doubled content)
        const half = track.scrollWidth / 2;
        if (container.scrollLeft >= half) {
          container.scrollLeft -= half;
        }
      }
      requestAnimationFrame(tick);
    }

    container.addEventListener('mouseenter', () => (paused = true));
    container.addEventListener('mouseleave', () => (paused = false));

    container.dataset.sliderInit = 'true';
    requestAnimationFrame(tick);
  }

  // Run on DOM ready and when section is injected dynamically
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  const mo = new MutationObserver(() => {
    if (document.querySelector('.college-scroll-container')) init();
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();
