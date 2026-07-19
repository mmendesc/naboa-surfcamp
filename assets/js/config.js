(function () {
  'use strict';

  async function loadConfig() {
    try {
      const res = await fetch('/config.json', { cache: 'no-cache' });
      if (!res.ok) return {};

      return await res.json();
    } catch (err) {
      console.warn('Failed to load project config', err);
      return {};
    }
  }

  function applyNavbarConfig(config) {
    const navbar = (config && config.navbar) ? config.navbar : {};

    Array.prototype.forEach.call(document.querySelectorAll('[data-navbar-item]'), function (item) {
      const key = item.getAttribute('data-navbar-item');
      if (key && navbar[key] === false) {
        item.remove();
      }
    });
  }

  async function apply() {
    const config = await loadConfig();
    applyNavbarConfig(config);
    return config;
  }

  window.ProjectConfig = {
    apply: apply,
    load: loadConfig
  };
})();
