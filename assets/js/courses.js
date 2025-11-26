// Dynamically render the courses list on the courses page from the
// `packages` object in the locale files (via i18next).
// This mirrors the behavior of renderPackages() but targets the
// static courses grid (section.course-one .container > .row).

(function() {
  'use strict';

  // small helper to avoid injecting unescaped text into HTML
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCoursesFromLocales() {
    try {
      if (!window.i18next || typeof i18next.t !== 'function') return;

      var pkgObj = i18next.t('packages', { returnObjects: true });
      if (!pkgObj) return;

      // target the grid row inside the course-one section
      var container = document.querySelector('section.course-one .container > .row');
      if (!container) return;

      var packageKeys = Object.keys(pkgObj).filter(function(k) { return /^package\d+$/.test(k); });
      packageKeys.sort(function(a, b) {
        return parseInt(a.replace('package', ''), 10) - parseInt(b.replace('package', ''), 10);
      });

      // Apply category filter from query param `category` if present.
      // Support comma-separated values: ?category=surf,boards
      try {
        var params = new URLSearchParams(window.location.search);
        var rawCategory = params.get('category');
        if (rawCategory) {
          var allowed = rawCategory.split(',').map(function(s) { return (s || '').trim().toLowerCase(); }).filter(Boolean);
          if (allowed.length) {
            var allowedSet = {};
            allowed.forEach(function(s) { allowedSet[s] = true; });
            packageKeys = packageKeys.filter(function(k) {
              var p = pkgObj[k] || {};
              var cat = (p.category && typeof p.category === 'string') ? p.category.toLowerCase() : '';
              return !!allowedSet[cat];
            });
          }
        }
      } catch (e) {
        // ignore URL parsing issues and render all packages
      }

      var ctaText = (pkgObj.cta && typeof pkgObj.cta === 'string') ? pkgObj.cta : i18next.t('packages.cta');

      var html = '';
      packageKeys.forEach(function(key) {
        var pkg = pkgObj[key];
        if (!pkg) return;
        var imgSrc = 'assets/images/courses/' + (pkg.imageName || 'default.jpg');
        var ctaHref = 'course-details.html?service=' + encodeURIComponent(pkg.serviceName || '');

        html += '<div class="col-lg-4 col-md-6">\n';
        html += '  <div class="course-one__single">\n';
        html += '    <div class="course-one__image">\n';
        html += '      <a href="' + ctaHref + '" class="course-one__cat">' + escapeHtml(pkg.label || '') + '</a>\n';
        html += '      <div class="course-one__image-inner">\n';
        html += '        <img src="' + escapeHtml(imgSrc) + '" alt="">\n';
        html += '        <a href="' + ctaHref + '"><i class="scubo-icon-plus-symbol"></i></a>\n';
        html += '      </div>\n';
        html += '    </div>\n';
        html += '    <div class="course-one__content hvr-sweep-to-bottom">\n';
        html += '      <h3><a href="' + ctaHref + '">' + escapeHtml(pkg.title || '') + '</a></h3>\n';
        html += '      <p>' + escapeHtml(pkg.brief || '') + '</p>\n';
        html += '    </div>\n';
        html += '    <a href="' + ctaHref + '" class="course-one__book-link">' + escapeHtml(ctaText || '') + '</a>\n';
        html += '  </div>\n';
        html += '</div>\n';
      });

      container.innerHTML = html;
    } catch (e) {
      // non-fatal
      console.error('renderCoursesFromLocales error', e);
    }
  }

  // Try render now if possible
  document.addEventListener('DOMContentLoaded', function() {
    renderCoursesFromLocales();
    attachI18nListeners();
  });

  // Re-render after partials injection in case the section was injected
  document.addEventListener('partialsLoaded', function() {
    renderCoursesFromLocales();
  });

  // Attach language change listener if i18next is available (idempotent)
  function attachI18nListeners() {
    if (!window.i18next) {
      // try again shortly — i18next may initialize asynchronously
      setTimeout(function() {
        if (window.i18next) attachI18nListeners();
      }, 200);
      return;
    }

    if (window.__coursesI18nHandlerAttached) return;
    window.__coursesI18nHandlerAttached = true;

    if (typeof i18next.on === 'function') {
      i18next.on('languageChanged', function() {
        renderCoursesFromLocales();
      });
    }
  }

  // expose for manual invocation (useful for debugging/tests)
  window.renderCoursesFromLocales = renderCoursesFromLocales;

})();
