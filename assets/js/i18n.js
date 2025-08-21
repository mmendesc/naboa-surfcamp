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

i18next.init({
  lng: 'en', // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      translation: enTranslations
    },
    es: {
      translation: {
        "welcome": "Bienvenido",
        "greeting": "¡Hola, {{name}}!",
        "pluralExample_one": "Tienes {{count}} notificación.",
        "pluralExample_other": "Tienes {{count}} notificaciones.",
        "navigation": {
          "home": "Inicio",
          "about": "Acerca de",
          "courses": "Cursos",
          "contact": "Contacto"
        }
      }
    }
  }
});

