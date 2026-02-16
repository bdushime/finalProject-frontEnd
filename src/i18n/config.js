import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Vite allows you to import JSON files directly
import enTranslation from './locales/en.json';
import rwTranslation from './locales/rw.json';

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: enTranslation },
        rw: { translation: rwTranslation }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
});

export default i18n;