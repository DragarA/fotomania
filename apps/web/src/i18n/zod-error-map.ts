import { z } from 'zod';

import i18n from './config';

/**
 * Custom Zod v4 error map for internationalized validation messages
 *
 * This handles common validation errors globally (e.g., required, type errors, length).
 * For domain-specific validation rules, use per-schema translations.
 *
 * Returns: { message: string } | string | undefined | null
 * - Return undefined/null to use default Zod message
 */
export const zodI18nErrorMap = (issue: z.core.$ZodRawIssue) => {
    switch (issue.code) {
        case 'invalid_type':
            console.log(issue);
            // Check for undefined input (required field)
            if (issue.input === undefined) {
                return i18n.t('validation:required');
            }
            return i18n.t('validation:invalid_type', {
                expected: issue.expected,
                received: typeof issue.input,
            });

        case 'too_small':
            if (issue.origin === 'string') {
                return i18n.t('validation:too_small', {
                    minimum: issue.minimum,
                });
            }
            break;

        case 'too_big':
            if (issue.origin === 'string') {
                return i18n.t('validation:too_big', {
                    maximum: issue.maximum,
                });
            }
            break;

        case 'invalid_format':
            if (issue.format === 'email') {
                return i18n.t('validation:invalid_email');
            }
            break;
    }

    // Return undefined to use default Zod error message
    return undefined;
};

/**
 * Apply the global error map to Zod
 * Call this once in your app initialization
 */
export function initializeZodI18n() {
    z.config({
        customError: zodI18nErrorMap,
    });
}
