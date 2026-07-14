(function() {
  'use strict';

  var tripsCache = {};
  var defaultLang = 'pt';
  var supportedLangs = ['en', 'es', 'pt'];
  var fallbackImage = 'assets/images/background/taiba-1.png';

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getLang() {
    var lang = null;

    try {
      if (window.i18next && i18next.language) lang = i18next.language;
    } catch (e) {
      lang = null;
    }

    if (!lang) {
      try {
        lang = localStorage.getItem('siteLanguage');
      } catch (e) {
        lang = null;
      }
    }

    lang = (lang || defaultLang).split('-')[0].toLowerCase();
    return supportedLangs.indexOf(lang) === -1 ? defaultLang : lang;
  }

  function t(key, fallback) {
    try {
      if (window.i18next && typeof i18next.t === 'function') {
        return i18next.t(key, { defaultValue: fallback || key });
      }
    } catch (e) {
      return fallback || key;
    }

    return fallback || key;
  }

  function loadTrips(lang) {
    if (tripsCache[lang]) return Promise.resolve(tripsCache[lang]);

    return fetch('/assets/locales/trips/' + lang + '.json', { cache: 'no-cache' })
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to load trips for ' + lang);
        return res.json();
      })
      .then(function(json) {
        var trips = Array.isArray(json) ? json : [];
        tripsCache[lang] = trips;
        return trips;
      });
  }

  function sortTrips(trips) {
    return trips.slice().sort(function(a, b) {
      return String(a.date || '').localeCompare(String(b.date || ''));
    });
  }

  function formatDate(value, lang) {
    if (!value) return '';

    try {
      var parts = String(value).split('-').map(function(part) {
        return parseInt(part, 10);
      });
      if (parts.length === 3 && parts.every(function(part) { return !isNaN(part); })) {
        var date = new Date(parts[0], parts[1] - 1, parts[2]);
        return new Intl.DateTimeFormat(lang, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date);
      }
    } catch (e) {
      return value;
    }

    return value;
  }

  function availableSpots(trip) {
    var spots = parseInt(trip.spots, 10);
    var taken = parseInt(trip.spotsTaken, 10);
    if (isNaN(spots)) return '';
    if (isNaN(taken)) taken = 0;
    return Math.max(0, spots - taken);
  }

  function tripUrl(trip) {
    return 'surf-trip.html?trip=' + encodeURIComponent(trip.slug || '');
  }

  function renderMessage(container, message) {
    container.innerHTML = '<div class="col-12"><div class="surf-trips__message">' + escapeHtml(message) + '</div></div>';
  }

  function renderTripsList() {
    var container = document.getElementById('surf-trips-list');
    if (!container) return;

    var lang = getLang();
    container.innerHTML = '<div class="col-12"><div class="surf-trips__message">' + escapeHtml(t('surfTrips.loading', 'Loading trips...')) + '</div></div>';

    loadTrips(lang).then(function(trips) {
      var sortedTrips = sortTrips(trips);

      if (!sortedTrips.length) {
        renderMessage(container, t('surfTrips.empty', 'No surf trips are scheduled right now. Check back soon.'));
        return;
      }

      var html = '';
      sortedTrips.forEach(function(trip) {
        var href = tripUrl(trip);
        var remaining = availableSpots(trip);

        html += '<div class="col-lg-4 col-md-6">\n';
        html += '  <div class="course-one__single surf-trip-card">\n';
        html += '    <div class="course-one__image">\n';
        html += '      <a href="' + href + '" class="course-one__cat">' + escapeHtml(formatDate(trip.date, lang)) + '</a>\n';
        html += '      <div class="course-one__image-inner">\n';
        html += '        <img src="' + fallbackImage + '" alt="">\n';
        html += '        <a href="' + href + '"><i class="scubo-icon-plus-symbol"></i></a>\n';
        html += '      </div>\n';
        html += '    </div>\n';
        html += '    <div class="course-one__content hvr-sweep-to-bottom">\n';
        html += '      <h3><a href="' + href + '">' + escapeHtml(trip.title || '') + '</a></h3>\n';
        html += '      <p>' + escapeHtml(trip.destination || '') + '</p>\n';
        html += '      <div class="surf-trip-card__meta">' + escapeHtml(t('surfTrips.fields.availableSpots', 'Available spots')) + ': ' + escapeHtml(remaining) + '</div>\n';
        html += '    </div>\n';
        html += '    <a href="' + href + '" class="course-one__book-link">' + escapeHtml(t('surfTrips.viewDetails', 'View details')) + '</a>\n';
        html += '  </div>\n';
        html += '</div>\n';
      });

      container.innerHTML = html;
    }).catch(function(err) {
      console.error('renderTripsList error', err);
      renderMessage(container, t('surfTrips.loadError', 'We could not load the surf trips right now.'));
    });
  }

  function valueBlock(labelKey, fallback, value) {
    if (!value && value !== 0) return '';
    return '<div class="surf-trip-detail__item"><span>' + escapeHtml(t(labelKey, fallback)) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
  }

  function listBlock(labelKey, fallback, values) {
    if (!Array.isArray(values) || !values.length) return '';

    var html = '<div class="surf-trip-detail__list"><h4>' + escapeHtml(t(labelKey, fallback)) + '</h4><ul>';
    values.forEach(function(value) {
      html += '<li>' + escapeHtml(value) + '</li>';
    });
    html += '</ul></div>';
    return html;
  }

  function renderTripDetail() {
    var container = document.getElementById('surf-trip-detail');
    if (!container) return;

    var lang = getLang();
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('trip');

    if (!slug) {
      container.innerHTML = '<div class="surf-trips__message">' + escapeHtml(t('surfTrips.notFound', 'We could not find this surf trip.')) + '</div>';
      return;
    }

    container.innerHTML = '<div class="surf-trips__message">' + escapeHtml(t('surfTrips.loading', 'Loading trips...')) + '</div>';

    loadTrips(lang).then(function(trips) {
      var trip = trips.find(function(candidate) {
        return candidate && candidate.slug === slug;
      });

      if (!trip) {
        container.innerHTML = '<div class="surf-trips__message">' + escapeHtml(t('surfTrips.notFound', 'We could not find this surf trip.')) + '</div>';
        return;
      }

      document.title = 'NaBoa Surf Camp - ' + (trip.title || t('surfTrips.pageTitle', 'Surf Trips'));

      var remaining = availableSpots(trip);
      var registerUrl = trip.registrationUrl || '#';
      var html = '';

      html += '<div class="course-details__image surf-trip-detail__image">';
      html += '<img src="' + fallbackImage + '" alt="">';
      html += '</div>';
      html += '<div class="course-details__content surf-trip-detail__content">';
      html += '<a href="surf-trips.html" class="surf-trip-detail__back">' + escapeHtml(t('surfTrips.backToTrips', 'Back to trips')) + '</a>';
      html += '<h3>' + escapeHtml(trip.title || '') + '</h3>';
      html += '<div class="surf-trip-detail__grid">';
      html += valueBlock('surfTrips.fields.destination', 'Destination', trip.destination);
      html += valueBlock('surfTrips.fields.date', 'Date', formatDate(trip.date, lang));
      html += valueBlock('surfTrips.fields.surferLevel', 'Surfer level', trip.surferLevel);
      html += valueBlock('surfTrips.fields.price', 'Price', trip.price);
      html += valueBlock('surfTrips.fields.spots', 'Spots', trip.spots);
      html += valueBlock('surfTrips.fields.spotsTaken', 'Spots taken', trip.spotsTaken);
      html += valueBlock('surfTrips.fields.availableSpots', 'Available spots', remaining);
      html += '</div>';
      html += listBlock('surfTrips.fields.packageIncludes', 'Package includes', trip.packageIncludes);
      html += listBlock('surfTrips.fields.packageExcludes', 'Package excludes', trip.packageExcludes);
      html += listBlock('surfTrips.fields.paymentMethods', 'Payment methods', trip.paymentMethods);
      html += '<a href="' + escapeHtml(registerUrl) + '" class="thm-btn course-details__btn" target="_blank" rel="noopener">' + escapeHtml(t('surfTrips.cta', 'Register')) + '</a>';
      html += '</div>';

      container.innerHTML = html;
    }).catch(function(err) {
      console.error('renderTripDetail error', err);
      container.innerHTML = '<div class="surf-trips__message">' + escapeHtml(t('surfTrips.loadError', 'We could not load the surf trips right now.')) + '</div>';
    });
  }

  function renderTrips() {
    renderTripsList();
    renderTripDetail();
  }

  function attachI18nListener() {
    if (!window.i18next) {
      setTimeout(attachI18nListener, 200);
      return;
    }

    if (window.__tripsI18nHandlerAttached) return;
    window.__tripsI18nHandlerAttached = true;

    if (typeof i18next.on === 'function') {
      i18next.on('languageChanged', renderTrips);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    renderTrips();
    attachI18nListener();
  });

  document.addEventListener('translationsApplied', renderTrips);

  window.renderSurfTrips = renderTrips;
})();
