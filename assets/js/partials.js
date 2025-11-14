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
    // Run a minimal mobile menu setup so the side-menu content (which is copied from
    // the main nav) is available even if the theme JS ran before partial injection.
    try {
      setupMobileMenu();
    } catch (e) {
      console.warn('setupMobileMenu failed', e);
    }

    // Dispatch event so other scripts can run initialization that depends on partials
    document.dispatchEvent(new Event('partialsLoaded'));
  }

  // Minimal mobile menu wiring for cases where header was injected after theme init.
  function setupMobileMenu() {
    var mainNav = document.querySelector('.main-nav__main-navigation');
    var mobileNavContainer = document.querySelector('.mobile-nav__container');
    if (!mainNav || !mobileNavContainer) return;

    // only populate if empty to avoid duplication
    if (mobileNavContainer.children.length === 0) {
      mobileNavContainer.innerHTML = mainNav.innerHTML;

      // ensure dropdown buttons exist and bind toggle handlers
      Array.prototype.forEach.call(mobileNavContainer.querySelectorAll('li.dropdown'), function (li) {
        if (!li.querySelector('.dropdown-btn')) {
          var btn = document.createElement('button');
          btn.className = 'dropdown-btn';
          btn.innerHTML = '<i class="fa fa-angle-right"></i>';
          li.appendChild(btn);
        }
      });

      // Do not attach click handlers here; `assets/js/theme.js` will bind
      // the dropdown button handlers (using jQuery) to avoid duplicate listeners
      // and ensure consistent behavior across initial load and partial injection.
    }

    // The theme script (`assets/js/theme.js`) attaches delegated handlers for
    // `.side-menu__toggler` and `.side-menu__block-overlay`. Avoid adding another
    // direct click listener here which would double-toggle the menu (open then
    // immediately close). We still mark elements as bound so repeated runs are safe.
    Array.prototype.forEach.call(document.querySelectorAll('.side-menu__toggler'), function (toggler) {
      toggler.__partialsBound = true;
    });

    Array.prototype.forEach.call(document.querySelectorAll('.side-menu__block-overlay'), function (overlay) {
      overlay.__partialsBound = true;
    });
  }

  // Start loading as soon as possible
  if (document.readyState === 'loading') {
    // If DOM not ready, wait for it so containers exist
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
})();
