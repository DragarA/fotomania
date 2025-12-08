/**
 * Test data factories for creating consistent test fixtures
 */

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
};
