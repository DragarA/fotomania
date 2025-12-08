/**
 * Drizzle mock factory using jest-mock-extended
 *
 * Provides a simpler, more maintainable deep mock for Drizzle ORM.
 */

import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

import { DrizzleDB } from '../../src/common/db/drizzle';

/**
 * Create a deep mock of DrizzleDB using jest-mock-extended
 */
export function createDrizzleMock(): DeepMockProxy<DrizzleDB> {
  return mockDeep<DrizzleDB>();
}

/**
 * Reset a Drizzle mock (clear all call history)
 */
export function resetDrizzleMock(mockDb: DeepMockProxy<DrizzleDB>): void {
  mockReset(mockDb);
}

/**
 * Type alias for better readability
 */
export type MockDrizzleDB = DeepMockProxy<DrizzleDB>;
