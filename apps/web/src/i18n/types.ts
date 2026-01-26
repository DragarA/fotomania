import 'i18next';

// Import English translations as the source of truth for types
import auth from './locales/en/auth.json';
import common from './locales/en/common.json';
import delivery from './locales/en/delivery.json';
import errors from './locales/en/errors.json';
import gallery from './locales/en/gallery.json';
import onboarding from './locales/en/onboarding.json';
import profile from './locales/en/profile.json';
import publicNs from './locales/en/public.json';
import validation from './locales/en/validation.json';

// Define translation resources type
export type TranslationResources = {
    common: typeof common;
    auth: typeof auth;
    gallery: typeof gallery;
    profile: typeof profile;
    public: typeof publicNs;
    delivery: typeof delivery;
    validation: typeof validation;
    errors: typeof errors;
    onboarding: typeof onboarding;
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
