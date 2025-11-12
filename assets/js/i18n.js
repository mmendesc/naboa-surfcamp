// Languages available and loader for JSON locale files
var availableLangs = ['en', 'es', 'pt'];

function loadTranslations() {
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
    return resources;
  });
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

// Add onclick event to brasil-flag to change language to 'pt' and update translations
document.addEventListener('DOMContentLoaded', function() {
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
          translateAllElements();
        });
      };
    }
  });
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
  // i18next is initialized, populate the page translations
  translateAllElements();
}).catch(function(err) {
  console.error('i18next init failed:', err);
});


