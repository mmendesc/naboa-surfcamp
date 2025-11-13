// Client-side partials loader
// Usage: add <div id="site-header"></div> and <div id="site-footer"></div> to your pages.
// Include this script before i18n initialization so translations apply to injected content.

(function () {
  'use strict';

  const partials = [
    { id: 'site-header', url: '/inc/header.html' },
    { id: 'site-footer', url: '/inc/footer.html' }
  ];

  async function fetchAndInject(part) {
    const container = document.getElementById(part.id);
    if (!container) return;
    try {
      const res = await fetch(part.url, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      container.innerHTML = html;
    } catch (err) {
      console.error('Failed to load partial', part.url, err);
    }
  }

  async function loadAll() {
    await Promise.all(partials.map(fetchAndInject));
    // Dispatch event so other scripts can run initialization that depends on partials
    document.dispatchEvent(new Event('partialsLoaded'));
  }

  // Start loading as soon as possible
  if (document.readyState === 'loading') {
    // If DOM not ready, wait for it so containers exist
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
})();
