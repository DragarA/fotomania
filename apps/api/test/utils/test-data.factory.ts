/**
 * Test data factories for creating consistent test fixtures
 */

import { stat } from "fs";
import { catalogueStatusEnum } from "../../src/common/db/schema";

export const TestDataFactory = {
  /**
   * Create a test user
   */
  createUser: (overrides: Partial<any> = {}) => ({
    id: 'test-user-id-1',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: true,
    image: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  /**
   * Create multiple test users
   */
  createUsers: (count: number, overrides: Partial<any> = {}) => {
    return Array.from({ length: count }, (_, i) =>
      TestDataFactory.createUser({
        id: `test-user-id-${i + 1}`,
        email: `test${i + 1}@example.com`,
        name: `Test User ${i + 1}`,
        ...overrides,
      })
    );
  },

  /**
   * Create a test account (authentication provider)
   */
  createAccount: (overrides: Partial<any> = {}) => ({
    id: 'test-account-id-1',
    accountId: 'test@example.com',
    providerId: 'credential',
    userId: 'test-user-id-1',
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    scope: null,
    password: '$2b$10$hashedpassword',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  /**
   * Create a test session
   */
  createSession: (overrides: Partial<any> = {}) => ({
    id: 'test-session-id-1',
    userId: 'test-user-id-1',
    token: 'test-session-token',
    expiresAt: new Date('2024-12-31'),
    ipAddress: '127.0.0.1',
    userAgent: 'Test Agent',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  /**
   * Create a Google OAuth profile
   */
  createGoogleProfile: (overrides: Partial<any> = {}) => ({
    id: 'google-id-123',
    displayName: 'Test User',
    emails: [{ value: 'test@example.com', verified: true }],
    photos: [{ value: 'https://example.com/photo.jpg' }],
    provider: 'google',
    _raw: '{}',
    _json: {},
    ...overrides,
  }),

  /**
   * Create a test catalogue
   */
  createCatalogue: (overrides: Partial<any> = {}) => ({
    id: 'test-catalogue-id-1',
    title: 'Test Catalogue',
    description: 'Test Description',
    coverImage: 'https://example.com/cover.jpg',
    password: null,
    publicUrlSlug: 'test-catalogue',
    ownerId: 'test-user-id-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    status: catalogueStatusEnum.enumValues[0],
    ...overrides,
  }),

  /**
   * Create multiple test catalogues
   */
  createCatalogues: (count: number, overrides: Partial<any> = {}) => {
    return Array.from({ length: count }, (_, i) =>
      TestDataFactory.createCatalogue({
        id: `test-catalogue-id-${i + 1}`,
        title: `Test Catalogue ${i + 1}`,
        publicUrlSlug: `test-catalogue-${i + 1}`,
        ...overrides,
      })
    );
  },

  /**
   * Create a test collection
   */
  createCollection: (overrides: Partial<any> = {}) => ({
    id: 'test-collection-id-1',
    name: 'Test Collection',
    catalogueId: 'test-catalogue-id-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  /**
   * Create multiple test collections
   */
  createCollections: (count: number, overrides: Partial<any> = {}) => {
    return Array.from({ length: count }, (_, i) =>
      TestDataFactory.createCollection({
        id: `test-collection-id-${i + 1}`,
        name: `Test Collection ${i + 1}`,
        ...overrides,
      })
    );
  },

  /**
   * Create a test photo
   */
  createPhoto: (overrides: Partial<any> = {}) => ({
    id: 'test-photo-id-1',
    originalFileName: 'test-photo.jpg',
    storagePath: '/uploads/test/test-photo.jpg',
    mimeType: 'image/jpeg',
    thumbnailPath: '/uploads/test/thumbnails/test-photo.jpg',
    width: 1920,
    height: 1080,
    size: 2048576,
    collectionId: 'test-collection-id-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  /**
   * Create multiple test photos
   */
  createPhotos: (count: number, overrides: Partial<any> = {}) => {
    return Array.from({ length: count }, (_, i) =>
      TestDataFactory.createPhoto({
        id: `test-photo-id-${i + 1}`,
        originalFileName: `test-photo-${i + 1}.jpg`,
        storagePath: `/uploads/test/test-photo-${i + 1}.jpg`,
        thumbnailPath: `/uploads/test/thumbnails/test-photo-${i + 1}.jpg`,
        ...overrides,
      })
    );
  },
};
