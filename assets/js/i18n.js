const enTranslations = {
  "navigation": {
    "home": "Home",
    "about": "About",
    "courses": "Courses",
    "contact": "Contact"
  },
  'sliderCarousel': {
    'slider1': {
      'subtitle': 'Fique na boa',
      'title': 'Venha Surfar com a gente',
      'cta': 'Pacotes'
    },
    'slider2': {
      'subtitle': 'Nao importa seu nivel',
      'title': 'Do iniciante ao avançado',
      'cta': 'Pacotes'
    },
    'slider3': {
      'subtitle': 'Um paraiso',
      'title': 'Venha Conhecer a taiba',
      'cta': 'Taiba'
    }
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
  "navigation": {
    "home": "Inicio",
    "about": "Sobre",
    "courses": "Cursos",
    "contact": "Contato"
  },
  'sliderCarousel': {
    'slider1': {
      'subtitle': 'Fique na boa',
      'title': 'Venha Surfar com a gente',
      'cta': 'Pacotes'
    },
    'slider2': {
      'subtitle': 'Nao importa seu nivel',
      'title': 'Do iniciante ao avançado',
      'cta': 'Pacotes'
    },
    'slider3': {
      'subtitle': 'Um paraiso',
      'title': 'Venha Conhecer a taiba',
      'cta': 'Taiba'
    }
  },
  'ctaTwo': {
    'text': 'Oferecemos serviço personalizado e com segurança',
    'button': 'Comece agora'
  },
  'ourServices': {
    'floatedText': 'SERVIÇOS',
    'subtitle': "NOSSOS SERVIÇOS",
    'title': 'O QUE OFERECEMOS',
    'surfLessons': {
      'header': 'Aulas de <br> Surf',
      'text': 'Oferecemos aulas de surf'
    },
    'rentalBoards': {
      'header': 'Aluguel de <br> Pranchas',
      'text': 'Alugue pranchas com a gente'
    },
    'film': {
      'header': 'Capitação de <br> Imagens',
      'text': 'Grave suas sessoes de surf para video analisar'
    },
    'retreats': {
      'header': 'Imersões de<br> Surf',
      'text': 'Final de semana de imersao com muito surf, comida e experiencias'
    }
  },
  'coursesList': {
    'subheader': 'Todos pacotes',
    'header': 'Pacotes mais<br> Procurados',
    'text': 'Todos nosso serviços e pacotes estao listados abaixo, escolha de acordo com seu nivel'
  },
  'taibaSection': {
    'subheader': 'conheça mais sobre nosso local',
    'header': 'Por que a Taiba?',
    'text': 'Taiba é um lugar tranquilo e com altas ondas',
    'button': 'Reserve com a gente'
  },
  'testimonials': {
    'subheader': 'comentarios',
    'header': 'O que falam sobre a gente'
  }
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


