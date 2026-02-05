import type { DrizzleDB } from './drizzle';

/**
 * Type for database instance that can be either the main DB connection
 * or a transaction context. Used for methods that support both transactional
 * and non-transactional operations.
 */
export type DbInstance =
    | DrizzleDB
    | Parameters<Parameters<DrizzleDB['transaction']>[0]>[0];
