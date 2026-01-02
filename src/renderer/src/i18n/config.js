import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import translationEN from './locales/en.json'
import translationES from './locales/es.json'
import translationFR from './locales/fr.json'
import translationDE from './locales/de.json'
import translationTL from './locales/tl.json'

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
  fr: { translation: translationFR },
  de: { translation: translationDE },
  tl: { translation: translationTL }
}

// Get saved language from localStorage
const savedLanguage = localStorage.getItem('appSettings')
let initialLanguage = 'en'

if (savedLanguage) {
  try {
    const settings = JSON.parse(savedLanguage)
    initialLanguage = settings.language || 'en'
  } catch (e) {
    console.error('Error parsing saved language:', e)
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
