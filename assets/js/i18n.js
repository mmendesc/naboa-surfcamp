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
      el.innerHTML = i18next.t(key, {'interpolation': {'escapeValue': false}, joinArrays: ' <br>'});
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
      var imgSrc = 'assets/images/courses/' + pkg.imageName;
      var ctaSrc = 'course-details.html?service=' + pkg.serviceName;

      html += '<div class="item">\n';
      html += '  <div class="course-one__single">\n';
      html += '    <div class="course-one__image">\n';
      html += '      <a href="' + ctaSrc + '" class="course-one__cat">' + escapeHtml(pkg.label || '') + '</a>\n';
      html += '      <div class="course-one__image-inner">\n';
      html += '        <img src="' + imgSrc + '" alt="">\n';
      html += '        <a href="' + ctaSrc + '"><i class="scubo-icon-plus-symbol"></i></a>\n';
      html += '      </div>\n';
      html += '    </div>\n';
      html += '    <div class="course-one__content hvr-sweep-to-bottom">\n';
      html += '      <h3><a href="' + ctaSrc + '">' + escapeHtml(pkg.title || '') + '</a></h3>\n';
      html += '      <p>' + escapeHtml(pkg.brief || '') + '</p>\n';
      html += '    </div>\n';
      html += '    <a href="' + ctaSrc + '" class="course-one__book-link">' + escapeHtml(ctaText || 'Book this course') + '</a>\n';
      html += '  </div>\n';
      html += '</div>\n';
    });

    container.innerHTML = html;

    // If jQuery + Owl are present, (re)initialize the carousel with safe defaults
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.owlCarousel) {
      try {
        var $ = window.jQuery;
        var $container = $(container);

        // parse options: try jQuery data then fallback to parsing attribute
        var opts = $container.data('options');
        if (!opts) {
          try { opts = JSON.parse($container.attr('data-options') || '{}'); } catch (e) { opts = {}; }
        }
        if (!opts || typeof opts !== 'object') opts = {};

  // ensure sensible defaults
        if (typeof opts.slideBy === 'undefined') opts.slideBy = 1;
        if (typeof opts.autoplayTimeout === 'undefined') opts.autoplayTimeout = 5000;

  // determine visible slots for current viewport (best-effort)
        var visible = opts.items || 1;
        if (opts.responsive && typeof opts.responsive === 'object') {
          try {
            var vw = window.innerWidth || document.documentElement.clientWidth || 0;
            var bps = Object.keys(opts.responsive).map(function(k){return parseInt(k,10);}).filter(function(n){return !isNaN(n);}).sort(function(a,b){return a-b;});
            var chosen = null;
            for (var i = 0; i < bps.length; i++) { if (vw >= bps[i]) chosen = bps[i]; }
            if (chosen !== null) {
              var r = opts.responsive[chosen] || opts.responsive[String(chosen)];
              if (r && r.items) visible = r.items;
            } else if (opts.responsive['0'] && opts.responsive['0'].items) {
              visible = opts.responsive['0'].items;
            }
          } catch (e) { /* ignore */ }
        }

        // Defensive: disable loop when total items <= visible slots to avoid clone-based jumpiness
        if (packageKeys && packageKeys.length && packageKeys.length <= visible) {
          opts.loop = false;
        }

        // diagnostics removed

        // destroy existing instance if present
        if ($container.hasClass('owl-loaded') && $container.trigger) {
          try { $container.trigger('destroy.owl.carousel'); } catch (e) { /* ignore */ }
        }

        // initialize and capture API
        $container.owlCarousel(opts);
        var api = $container.data('owl.carousel') || $container.data('owl');

        // helper to compute current visible start index
        function currentIndex() {
          try { if (api && typeof api.current === 'function' && typeof api.relative === 'function') return api.relative(api.current()); } catch (e) {}
          try { var active = $container.find('.owl-item.active').first(); if (active.length) { var all = $container.find('.owl-item').not('.cloned'); return all.index(active); } } catch (e) {}
          return 0;
        }

        // pause/resume autoplay helpers
        var resumeTimer = null;
        function stopAutoplay() { try { $container.trigger('stop.owl.autoplay'); } catch (e) {} }
        function scheduleResume() { try { if (resumeTimer) clearTimeout(resumeTimer); resumeTimer = setTimeout(function(){ try { $container.trigger('play.owl.autoplay', [opts.autoplayTimeout || 5000]); } catch(e){} }, 3000); } catch(e){} }

        // precise single-step navigation using 'to' to avoid slideBy/responsive mismatches
        function navigate(delta) {
          try {
            var total = packageKeys.length || ($container.find('.owl-item').not('.cloned').length);
            var vis = (api && api.settings && api.settings.items) ? api.settings.items : visible;
            var cur = currentIndex();
            var tgt = cur + delta;
            if (!opts.loop) {
              var maxStart = Math.max(0, total - vis);
              if (tgt < 0) tgt = 0; if (tgt > maxStart) tgt = maxStart;
            } else {
              tgt = ((tgt % total) + total) % total;
            }
            // diagnostics removed
            stopAutoplay(); scheduleResume();
            try { $container.trigger('to.owl.carousel', [tgt, 600]); } catch (e) { try { $container.trigger(delta>0?'next.owl.carousel':'prev.owl.carousel',[600]); } catch(e2){} }
          } catch (e) { /* ignore */ }
        }

        var prevSel = $container.data('carousel-prev-btn');
        var nextSel = $container.data('carousel-next-btn');
        if (prevSel) {
          try { $(prevSel).off('click'); } catch(e) {}
          $(prevSel).off('click.i18nOwl').on('click.i18nOwl', function(e){ e && e.preventDefault && e.preventDefault(); try{ e && e.stopImmediatePropagation && e.stopImmediatePropagation(); } catch(_){} navigate(-1); return false; });
        }
        if (nextSel) {
          try { $(nextSel).off('click'); } catch(e) {}
          $(nextSel).off('click.i18nOwl').on('click.i18nOwl', function(e){ e && e.preventDefault && e.preventDefault(); try{ e && e.stopImmediatePropagation && e.stopImmediatePropagation(); } catch(_){} navigate(1); return false; });
        }

      } catch (e) {
        console.warn('Could not initialize packages carousel', e);
      }
    }

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

// Try to detect the user's browser language and map it to a supported short code.
// Returns a language code from availableLangs (e.g. 'en','es','pt') or null
function detectBrowserLanguage() {
  try {
    if (typeof navigator === 'undefined') return null;
    var sources = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || navigator.userLanguage || ''];
    for (var i = 0; i < sources.length; i++) {
      var src = (sources[i] || '').toString();
      // normalize like 'en-US' -> 'en'
      var code = src.split('-')[0].toLowerCase();
      if (availableLangs.indexOf(code) !== -1) return code;
    }
  } catch (e) {
    // non-fatal
  }
  return null;
}

// Function to change language and persist selection
function changeLanguage(language) {
  // i18next.changeLanguage may return a promise or accept a callback depending on version
  return Promise.resolve(i18next.changeLanguage(language)).then(function() {
    setStoredLanguage(language);
  });
}

// Update visual 'active' state for flags in header and mobile side menu
function updateActiveFlag(lang) {
  try {
    // remove active from any data-flag anchors
    var dataFlags = document.querySelectorAll('[data-flag]');
    Array.prototype.forEach.call(dataFlags, function(a) { a.classList.remove('active'); });

    // add active to the matching data-flag anchor(s)
    var matched = document.querySelectorAll('[data-flag="' + lang + '"]');
    Array.prototype.forEach.call(matched, function(a) { a.classList.add('active'); });

    // Also handle header IMG ids (if present) - toggle 'active' on those elements
    var idMap = { pt: 'brasil-flag', en: 'usa-flag', es: 'spain-flag' };
    Object.keys(idMap).forEach(function(k) {
      var el = document.getElementById(idMap[k]);
      if (el) {
        if (k === lang) el.classList.add('active'); else el.classList.remove('active');
      }
    });
  } catch (e) {
    // non-critical
  }
}

// Replace the course details header image with the value from the
// per-service JSON file (assets/locales/services/{service}.json).
// Expects the file to contain language keys (en,pt,es) and the image at
// either `...[lang].courseDetails.headerImage` or `...[lang].headerImage`.
function setCourseHeaderImage() {
  try {
    var params = new URLSearchParams(window.location.search);
    var serviceName = params.get('service');
    if (!serviceName) return;

    var imgContainer = document.querySelector('.course-details__image img');
    if (!imgContainer) return;

    var servicePath = '/assets/locales/services/' + encodeURIComponent(serviceName) + '.json';
    fetch(servicePath, { cache: 'no-cache' }).then(function(res) {
      if (!res.ok) throw new Error('service json not found');
      return res.json();
    }).then(function(serviceJson) {
      var lang = (i18nReady && window.i18next && i18next.language) ? i18next.language : (getStoredLanguage() || initialLang);
      var candidate = null;
      try {
        if (serviceJson[lang] && serviceJson[lang].courseDetails && serviceJson[lang].courseDetails.headerImage) {
          candidate = serviceJson[lang].courseDetails.headerImage;
        } else if (serviceJson[lang] && serviceJson[lang].headerImage) {
          candidate = serviceJson[lang].headerImage;
        }
      } catch (e) {
        candidate = null;
      }
      if (candidate) {
        // If the path is relative, leave as-is. Update src attribute.
        imgContainer.setAttribute('src', candidate);
      }
    }).catch(function() {
      // ignore missing service json
    });
  } catch (e) {
    // ignore
  }
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
      el.onclick = function(e) {
        e && e.preventDefault && e.preventDefault();
        changeLanguage(cfg.lang).then(function() {
          // After language change, update visible text and dynamic widgets
          translateAllElements();
          renderPackages();
          updateActiveFlag(cfg.lang);
        });
      };
    }
  });
}

// Add delegated binding for mobile flags using data-flag attributes.
// This ensures flags injected dynamically into the side menu are handled.
(function() {
  // Guard to avoid attaching multiple delegated listeners
  if (window.__i18nDelegatedFlagHandlerAttached) return;
  window.__i18nDelegatedFlagHandlerAttached = true;

  function delegatedFlagClick(e) {
    var el = e.target;
    // support clicks on the img or the anchor
    var anchor = el.closest && el.closest('[data-flag]');
    if (!anchor) return;
    var lang = anchor.getAttribute('data-flag');
    if (!lang) return;
    e.preventDefault && e.preventDefault();
    // Use the existing changeLanguage helper
    changeLanguage(lang).then(function() {
      translateAllElements();
      renderPackages();
      // update visual active state for flags
      updateActiveFlag(lang);
    }).catch(function(err) {
      console.error('changeLanguage failed', err);
    });
  }

  // Attach after DOMContentLoaded so anchors may exist, and also listen to partialsLoaded
  document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', delegatedFlagClick, false);
  });
  document.addEventListener('partialsLoaded', function() {
    // ensure listener is attached if partials are injected after DOMContentLoaded
    if (!document.body.__i18nFlagDelegation) {
      document.body.addEventListener('click', delegatedFlagClick, false);
      document.body.__i18nFlagDelegation = true;
    }
  });
})();

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
  // Ensure active flag visuals are applied after partials inject (flags may be
  // dynamically added by the partials loader). Use the current i18next language
  // when available, otherwise fall back to stored/default language.
  try {
    var currentLang = (i18nReady && window.i18next && i18next.language) ? i18next.language : (getStoredLanguage() || initialLang);
    updateActiveFlag(currentLang);
      // also attempt to set the course header image in case the details
      // area was already rendered or partials injected it after i18n init
      setCourseHeaderImage();
  } catch (e) {
    // ignore
  }
});


// Determine initial language:
// - if the user previously stored a language, use it
// - otherwise try to detect the browser language (and persist that choice)
// - finally fall back to 'pt'
var initialLang;
var storedLang = getStoredLanguage();
if (storedLang) {
  initialLang = storedLang;
} else {
  var detected = detectBrowserLanguage() || 'pt';
  // persist the detected language so subsequent visits use the same one
  setStoredLanguage(detected);
  initialLang = detected;
}

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
  // Ensure active state is initialized for flags based on stored/default language
  updateActiveFlag(initialLang);
  // Attempt to set the course header image from per-service JSON (if present)
  setCourseHeaderImage();
}).catch(function(err) {
  console.error('i18next init failed:', err);
});


