// Dynamically render the testimonials carousel from locale file key
// `testimonials.testimonies` and update on language changes.
(function() {
  'use strict';

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizeArrayLike(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    // if object with keys (package1, package2...), convert to array in key order
    var keys = Object.keys(obj).filter(function(k) { return k; });
    keys.sort();
    return keys.map(function(k) { return obj[k]; });
  }

  function buildTestimonialItem(t, idx) {
    // expected t: { quote, name, title, image }
    // Use the provided `image` attribute from the testimony object as-is.
    var imageSrc = t.image || '';

    var html = '';
    html += '<div class="item">\n';
    html += '  <div class="testimonials-one__single">\n';
    html += '    <div class="testimonials-one__content">\n';
    html += '      <div class="testimonials-one__content-inner">\n';
    html += '        <div class="testimonials-one__qoute"></div>\n';
    html += '        <p>' + escapeHtml(t.quote || '') + '</p>\n';
  html += '        <div class="testimonials-one__infos">\n';
    html += '          <div class="testimonials-one__image">\n';
    html += '            <div class="testimonials-one__image-inner">\n';
  html += '              <img src="' + escapeHtml(imageSrc) + '" alt="">\n';
    html += '            </div>\n';
    html += '          </div>\n';
    html += '          <div class="testimonials-one__infos-content">\n';
    html += '            <h3>' + escapeHtml(t.name || '') + '</h3>\n';
    html += '            <span>' + escapeHtml(t.location || '') + '</span>\n';
    html += '          </div>\n';
    html += '        </div>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';
    return html;
  }

  function renderTestimonialsFromLocales() {
    try {
      if (!window.i18next || typeof i18next.t !== 'function') return;

      var testimonies = i18next.t('testimonials.testimonies', { returnObjects: true });
      if (!testimonies) return;

      var items = normalizeArrayLike(testimonies);
      if (!items.length) return;

      var container = document.querySelector('.testimonials-one__carousel');
      if (!container) return;

      // build items with index so we can assign sequential image filenames
      var html = items.map(function(t, i) { return buildTestimonialItem(t, i); }).join('\n');
      container.innerHTML = html;

      // Ensure Owl carousel is (re)initialized for this container. Theme.js
      // initializes `.thm__owl-carousel` on window.load, but if we inject
      // content after that point we must init or reinit the carousel here so
      // mobile behavior (one item at a time with nav arrows) works.
      try {
        if (window.jQuery) {
          var $ = window.jQuery;
          var $container = $(container);
          var opts = $container.data('options') || {};

          // If already initialized, destroy first to avoid duplicates
          if ($container.hasClass('owl-loaded') && $container.trigger) {
            try { $container.trigger('destroy.owl.carousel'); } catch (e) { /* ignore */ }
          }

          // Initialize with options from markup
          var owl = $container.owlCarousel(opts);

          // Re-bind prev/next controls if present
          var prevSel = $container.data('carousel-prev-btn');
          var nextSel = $container.data('carousel-next-btn');
          if (prevSel) {
            $(prevSel).off('click.indexOwl').on('click.indexOwl', function() { owl.trigger('prev.owl.carousel', [1000]); return false; });
          }
          if (nextSel) {
            $(nextSel).off('click.indexOwl').on('click.indexOwl', function() { owl.trigger('next.owl.carousel', [1000]); return false; });
          }
        }
      } catch (e) {
        // non-fatal
        console.warn('Could not (re)initialize testimonials carousel', e);
      }
    } catch (e) {
      console.error('renderTestimonialsFromLocales error', e);
    }
  }

  function attachListeners() {
    if (!window.i18next) {
      setTimeout(attachListeners, 200);
      return;
    }
    if (window.__indexTestimonialsHandlerAttached) return;
    window.__indexTestimonialsHandlerAttached = true;

    if (typeof i18next.on === 'function') {
      i18next.on('languageChanged', function() {
        renderTestimonialsFromLocales();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    renderTestimonialsFromLocales();
    attachListeners();
  });

  document.addEventListener('partialsLoaded', function() {
    renderTestimonialsFromLocales();
  });

  // expose for debugging
  window.renderTestimonialsFromLocales = renderTestimonialsFromLocales;

})();
