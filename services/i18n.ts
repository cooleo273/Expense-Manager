import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../langs/en.json';
import fr from '../langs/fr.json';
import { StorageService } from './storage';

StorageService.getLanguage().then((language) => {
  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources: {
        en: {
          translation: en,
        },
        fr: {
          translation: fr,
        },
      },
      lng: language || 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
});

export default i18n;