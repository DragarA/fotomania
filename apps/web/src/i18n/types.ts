import 'i18next';

// Import English translations as the source of truth for types
import auth from './locales/en/auth.json';
import common from './locales/en/common.json';
import errors from './locales/en/errors.json';
import gallery from './locales/en/gallery.json';
import publicNs from './locales/en/public.json';
import validation from './locales/en/validation.json';

// Define translation resources type
export type TranslationResources = {
    common: typeof common;
    auth: typeof auth;
    gallery: typeof gallery;
    public: typeof publicNs;
    validation: typeof validation;
    errors: typeof errors;
};

// Augment i18next module to provide type safety
declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: TranslationResources;
        // Return type for t() function
        returnNull: false;
    }
}
