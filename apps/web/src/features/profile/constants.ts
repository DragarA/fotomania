export const SUPPORTED_LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'sl', label: 'Slovenščina' },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['value'];
