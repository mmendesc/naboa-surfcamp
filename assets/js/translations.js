// translations.js
// Exports translation objects as globals so `i18n.js` can consume them when loaded via a <script> tag.
// Keep these objects in sync with the keys used by `i18n.js`.

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
      'title': 'Do iniciante ao avancado',
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
