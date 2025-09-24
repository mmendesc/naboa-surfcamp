const enTranslations = {
  "welcome": "Welcome",
  "greeting": "Hello, {{name}}!",
  "pluralExample_one": "You have {{count}} notification.",
  "pluralExample_other": "You have {{count}} notifications.",
  "navigation": {
    "home": "Home",
    "about": "About",
    "courses": "Courses",
    "contact": "Contact"
  }
}

const esTranslations = {
  "welcome": "Bem-vindo",
  "greeting": "Olá, {{name}}!",
  "pluralExample_one": "Você tem {{count}} notificação.",
  "pluralExample_other": "Você tem {{count}} notificações.",
  "navigation": {
    "home": "Comienzo",
    "about": "Sobre",
    "courses": "Cursos",
    "contact": "Contato"
  }
}

const ptTranslations = {
  "welcome": "Bem-vindo",
  "greeting": "Olá, {{name}}!",
  "pluralExample_one": "Você tem {{count}} notificação.",
  "pluralExample_other": "Você tem {{count}} notificações.",
  "navigation": {
    "home": "Inicio",
    "about": "Sobre",
    "courses": "Cursos",
    "contact": "Contato"
  }
}

function translateAllElements() {
  var elements = document.querySelectorAll('[data-translate]');
  elements.forEach(function(el) {
    var key = el.getAttribute('data-translate');
    if (key) {
      el.textContent = i18next.t(key);
    }
  });
}

// Function to change language
function changeLanguage(language) {
  return i18next.changeLanguage(language);
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


i18next.init({
  lng: 'en', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: enTranslations
    },
    es: {
      translation: esTranslations
    },
    pt: {
      translation: ptTranslations
    }
  }
});


