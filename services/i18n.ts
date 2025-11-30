import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../langs/en.json';
import fr from '../langs/fr.json';
import { StorageService } from './storage';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: {
      translation: en,
    },
    fr: {
      translation: fr,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

const resolvePersistedLanguage = async () => {
  try {
    const language = await StorageService.getLanguage();
    if (language && language !== i18n.language) {
      await i18n.changeLanguage(language);
    }
  } catch (error) {
    console.warn('Unable to load persisted language preference', error);
  }
};

void resolvePersistedLanguage();

export default i18n;
