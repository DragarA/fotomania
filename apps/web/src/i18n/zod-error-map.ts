import { z } from 'zod';
import i18n from './config';

/**
 * Custom Zod error map for internationalized validation messages
 *
 * This handles common validation errors globally (e.g., required, type errors, length).
 * For domain-specific validation rules, use per-schema translations.
 */
export const zodI18nErrorMap = ((issue: any, ctx: any) => {
  // Handle common validation errors globally
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined') {
        return { message: i18n.t('validation:required') };
      }
      return {
        message: i18n.t('validation:invalid_type', {
          expected: issue.expected,
          received: issue.received,
        }),
      };

    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return {
          message: i18n.t('validation:too_small', {
            minimum: issue.minimum,
          }),
        };
      }
      break;

    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return {
          message: i18n.t('validation:too_big', {
            maximum: issue.maximum,
          }),
        };
      }
      break;
  }

  // Fallback to default error message or per-schema custom message
  return { message: ctx.defaultError };
}) as z.ZodErrorMap;

/**
 * Apply the global error map to Zod
 * Call this once in your app initialization
 */
export function initializeZodI18n() {
  z.setErrorMap(zodI18nErrorMap);
}
