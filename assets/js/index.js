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
    // expected t: { quote, name, title }
    // image should be based on index: assets/images/resources/01.png .. 07.png
    var imageIndex = ((idx % 7) + 1); // 1..7
    var pad = imageIndex < 10 ? '0' + imageIndex : String(imageIndex);
  var imageSrc = 'assets/images/testimonies/' + pad + '.png';
  // fallback to existing testi-1-X.jpg files if numbered png is missing
  var fallbackIndex = ((imageIndex - 1) % 5) + 1; // there are 5 testi-1-X.jpg in resources
  var fallbackSrc = 'assets/images/resources/testi-1-' + fallbackIndex + '.jpg';

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
  // add onerror to fall back to a known jpg if the numbered png doesn't exist on the server
  html += '              <img src="' + escapeHtml(imageSrc) + '" onerror="this.onerror=null;this.src=\'' + escapeHtml(fallbackSrc) + '\'" alt="">\n';
    html += '            </div>\n';
    html += '          </div>\n';
    html += '          <div class="testimonials-one__infos-content">\n';
    html += '            <h3>' + escapeHtml(t.name || '') + '</h3>\n';
    html += '            <span>' + escapeHtml(t.title || '') + '</span>\n';
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
