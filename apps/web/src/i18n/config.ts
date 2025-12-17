import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enDelivery from './locales/en/delivery.json';
import enErrors from './locales/en/errors.json';
import enGallery from './locales/en/gallery.json';
import enPublic from './locales/en/public.json';
import enValidation from './locales/en/validation.json';
import slAuth from './locales/sl/auth.json';
import slCommon from './locales/sl/common.json';
import slDelivery from './locales/sl/delivery.json';
import slErrors from './locales/sl/errors.json';
import slGallery from './locales/sl/gallery.json';
import slPublic from './locales/sl/public.json';
import slValidation from './locales/sl/validation.json';

// Translation resources
const resources = {
    en: {
        common: enCommon,
        auth: enAuth,
        gallery: enGallery,
        public: enPublic,
        delivery: enDelivery,
        validation: enValidation,
        errors: enErrors,
    },
    sl: {
        common: slCommon,
        auth: slAuth,
        gallery: slGallery,
        public: slPublic,
        delivery: slDelivery, // Fallback to English for now
        validation: slValidation,
        errors: slErrors,
    },
} as const;

i18n
    // Browser language detector
    .use(LanguageDetector)
    // Pass i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        resources,
        defaultNS: 'common',
        fallbackLng: 'en',
        supportedLngs: ['en', 'sl'],

        // Language detection options
        detection: {
            // Order of detection methods
            order: ['localStorage', 'navigator'],
            // Cache user language choice
            caches: ['localStorage'],
            // localStorage key
            lookupLocalStorage: 'i18nextLng',
        },

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        // Development options
        debug: false, // Set to true for debugging

        // React options
        react: {
            useSuspense: false, // Disable suspense for now
        },
    });

export default i18n;
