// Languages available and loader for JSON locale files
var availableLangs = ['en', 'es', 'pt'];

// Tracks readiness so we can apply translations whether partials load
// before or after i18next initializes.
var i18nReady = false;
var partialsReady = false;
function loadTranslations() {
  // Load base locale files, then (optionally) load a per-service translations file
  return Promise.all(availableLangs.map(function(lang) {
    return fetch('/assets/locales/' + lang + '.json').then(function(res) {
      if (!res.ok) throw new Error('Failed to load ' + lang + ' translations');
      return res.json();
    }).then(function(json) {
      return { lang: lang, json: json };
    });
  })).then(function(arr) {
    var resources = {};
    arr.forEach(function(item) {
      resources[item.lang] = { translation: item.json };
    });

    // If there's a `service` query param, try to load per-service translations
    try {
      var params = new URLSearchParams(window.location.search);
      var serviceName = params.get('service');
      if (serviceName) {
        var servicePath = '/assets/locales/services/' + encodeURIComponent(serviceName) + '.json';
        return fetch(servicePath, { cache: 'no-cache' }).then(function(res) {
          if (!res.ok) {
            // Service file missing - resolve with base resources
            return resources;
          }
          return res.json().then(function(serviceJson) {
            // serviceJson is expected to be an object with language keys: { en: {...}, es: {...}, pt: {...} }
            Object.keys(serviceJson || {}).forEach(function(langKey) {
              if (!resources[langKey]) resources[langKey] = { translation: {} };
              // Deep merge service translations into base translations for that language
              resources[langKey].translation = deepMerge(resources[langKey].translation || {}, serviceJson[langKey] || {});
            });
            return resources;
          });
        }).catch(function(e) {
          console.warn('Failed to load service translations for', serviceName, e);
          return resources;
        });
      }
    } catch (e) {
      // ignore URL parsing errors
    }

    return resources;
  });
}

// Deep merge helper (simple recursive merge for plain objects)
function deepMerge(target, source) {
  var out = Object.assign({}, target);
  Object.keys(source || {}).forEach(function(k) {
    var srcVal = source[k];
    if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
      out[k] = deepMerge(out[k] || {}, srcVal);
    } else {
      out[k] = srcVal;
    }
  });
  return out;
}

function translateAllElements() {
  var elements = document.querySelectorAll('[data-translate]');
  elements.forEach(function(el) {
    var key = el.getAttribute('data-translate');
    if (key) {
      // allow translation strings to contain HTML tags
      // NOTE: only do this for trusted translation content to avoid XSS risks
      el.innerHTML = i18next.t(key, {'interpolation': {'escapeValue': false}});
    }
  });
}

// Render the packages carousel items based on translations
function renderPackages() {
  try {
    var pkgObj = i18next.t('packages', { returnObjects: true });
    if (!pkgObj) return;

    var container = document.querySelector('.course-one__carousel.thm__owl-carousel');
    if (!container) return;

    // collect package keys like package1, package2...
    var packageKeys = Object.keys(pkgObj).filter(function(k) { return /^package\d+$/.test(k); });
    packageKeys.sort(function(a, b) {
      return parseInt(a.replace('package', ''), 10) - parseInt(b.replace('package', ''), 10);
    });

    var ctaText = pkgObj.cta || i18next.t('packages.cta');

    var html = '';
    packageKeys.forEach(function(key, idx) {
      var pkg = pkgObj[key];
      if (!pkg) return;
      var imgIndex = (idx % 6) + 1; // cycle through available course images
      var imgSrc = 'assets/images/courses/course-1-' + imgIndex + '.jpg';
      var ctaSrc = 'course-details.html?service=' + pkg.serviceName;

      html += '<div class="item">\n';
      html += '  <div class="course-one__single">\n';
      html += '    <div class="course-one__image">\n';
      html += '      <a href="course-details.html" class="course-one__cat">' + escapeHtml(pkg.label || '') + '</a>\n';
      html += '      <div class="course-one__image-inner">\n';
      html += '        <img src="' + imgSrc + '" alt="">\n';
      html += '        <a href="course-details.html"><i class="scubo-icon-plus-symbol"></i></a>\n';
      html += '      </div>\n';
      html += '    </div>\n';
      html += '    <div class="course-one__content hvr-sweep-to-bottom">\n';
      html += '      <h3><a href="course-details.html">' + escapeHtml(pkg.title || '') + '</a></h3>\n';
      html += '      <p>' + escapeHtml(pkg.brief || '') + '</p>\n';
      html += '    </div>\n';
      html += '    <a href="' + ctaSrc + '" class="course-one__book-link">' + escapeHtml(ctaText || 'Book this course') + '</a>\n';
      html += '  </div>\n';
      html += '</div>\n';
    });

    container.innerHTML = html;
  } catch (e) {
    console.error('renderPackages error', e);
  }
}

// small helper to avoid injecting unescaped text into HTML
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Helpers to persist language selection in browser
function getStoredLanguage() {
  try {
    return localStorage.getItem('siteLanguage');
  } catch (e) {
    return null;
  }
}

function setStoredLanguage(lang) {
  try {
    localStorage.setItem('siteLanguage', lang);
  } catch (e) {
    // ignore write errors (private mode)
  }
}

// Function to change language and persist selection
function changeLanguage(language) {
  // i18next.changeLanguage may return a promise or accept a callback depending on version
  return Promise.resolve(i18next.changeLanguage(language)).then(function() {
    setStoredLanguage(language);
  });
}

// Bind click handlers for flag elements (safe to call multiple times).
function bindFlagHandlers() {
  var flagConfigs = [
    { id: 'brasil-flag', lang: 'pt' },
    { id: 'usa-flag', lang: 'en' },
    { id: 'spain-flag', lang: 'es' }
  ];
  flagConfigs.forEach(function(cfg) {
    var el = document.getElementById(cfg.id);
    if (el) {
      el.onclick = function() {
        changeLanguage(cfg.lang).then(function() {
          // After language change, update visible text and dynamic widgets
          translateAllElements();
          renderPackages();
        });
      };
    }
  });
}

// Attempt to bind on DOMContentLoaded and also when partials are injected.
document.addEventListener('DOMContentLoaded', function() {
  bindFlagHandlers();
});

// When partials are injected, re-apply translations (if i18n ready) and bind handlers.
document.addEventListener('partialsLoaded', function() {
  partialsReady = true;
  // Bind handlers for elements that live inside injected partials
  bindFlagHandlers();
  if (i18nReady) {
    translateAllElements();
    renderPackages();
  }
});


// Determine initial language from storage or default to 'pt'
var initialLang = getStoredLanguage() || 'pt';

// Load translations from JSON files then initialize i18next
loadTranslations().then(function(resources) {
  return i18next.init({
    lng: initialLang,
    debug: true,
    resources: resources
  });
}).then(function() {
  // i18next is initialized
  i18nReady = true;
  // Populate the page translations. If partials were injected already,
  // this will translate them as well. Otherwise, translations will be
  // applied after 'partialsLoaded' fires.
  translateAllElements();
  renderPackages();
  // Bind flag handlers in case header/footer were inline in the page
  bindFlagHandlers();
}).catch(function(err) {
  console.error('i18next init failed:', err);
});


