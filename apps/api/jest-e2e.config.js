module.exports = {
  displayName: 'api:e2e',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/*.e2e-spec.ts'],
  collectCoverageFrom: [
    'src/**/*.controller.ts',
    'src/**/*.service.ts',
  ],
  coverageDirectory: 'coverage-e2e',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  setupFiles: ['<rootDir>/test/setup.ts'],
};
