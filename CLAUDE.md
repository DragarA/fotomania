# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fotomania is a **Turborepo monorepo** with a type-safe API-to-frontend pipeline:
- **Backend**: NestJS API with OpenAPI/Swagger
- **Frontend**: React + Vite with TanStack Router and TanStack Query
- **SDK**: Auto-generated TypeScript client from OpenAPI spec
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local (email/password) and Google OAuth strategies

## Common Commands

Before running any commands, make sure you select the proper version of node via `nvm`:

```bash
nvm use
```

### Development
```bash
# Development (OpenAPI spec auto-generates on API startup)
pnpm dev                                    # API (port 3000), Web (port 5173), SDK watcher

# Individual packages
pnpm --filter @repo/api dev                 # API only
pnpm --filter @repo/web dev                 # Web only
pnpm --filter @repo/sdk dev                 # SDK watcher only
```

### Building
```bash
pnpm build                                  # Build all (order: API → SDK → Web)
pnpm --filter @repo/api build               # API only
pnpm --filter @repo/sdk build               # SDK only (requires openapi.json)
pnpm --filter @repo/web build               # Web only
```

### Code Quality
```bash
pnpm lint                                   # Lint all packages
pnpm format                                 # Format all code
turbo clean                                 # Clear Turborepo cache
```

### Database (Drizzle)
```bash
pnpm --filter @repo/api db:generate         # Generate migration from schema changes
pnpm --filter @repo/api db:migrate          # Run migrations
pnpm --filter @repo/api db:push             # Push schema directly (dev only)
pnpm --filter @repo/api db:studio           # Open Drizzle Studio
```

### OpenAPI/SDK Generation
```bash
# OpenAPI spec is automatically generated on API startup to apps/api/openapi.json
# The SDK watcher (in dev mode) automatically regenerates when openapi.json changes

# Manual SDK generation (if needed)
pnpm --filter @repo/sdk generate           # Reads apps/api/openapi.json

# Manual OpenAPI fetch (alternative, but not needed since auto-generated)
curl http://localhost:3000/api-json > apps/api/openapi.json
```

### Testing
```bash
# Run all tests
pnpm --filter @repo/api test               # All tests (unit + e2e)

# Unit tests
pnpm --filter @repo/api test:unit          # Run unit tests
pnpm --filter @repo/api test:watch         # Watch mode
pnpm --filter @repo/api test:cov:unit      # Unit tests with coverage

# E2E tests
pnpm --filter @repo/api test:e2e           # Run e2e tests
pnpm --filter @repo/api test:cov:e2e       # E2E tests with coverage

# Coverage
pnpm --filter @repo/api test:cov           # All tests with coverage
```

## Architecture

### Type-Safe API Pipeline

The core architecture enforces end-to-end type safety:

```
Database Schema (Drizzle)
  ↓
API Endpoints (NestJS + Swagger decorators)
  ↓
OpenAPI Spec (auto-generated on API startup → apps/api/openapi.json)
  ↓
TypeScript SDK (auto-generated via @hey-api/openapi-ts, watches openapi.json in dev)
  ↓
Frontend Components (React + TanStack Query)
```

**Critical Flow**:
1. API starts → OpenAPI spec auto-generates to `apps/api/openapi.json`
2. SDK watcher detects change → auto-regenerates TypeScript client
3. Frontend imports types and services from `@repo/sdk`
4. End-to-end type safety from database to UI

### Dependency Injection Patterns

#### Global Services (apps/api/src/db/drizzle.ts)
Uses **Symbol-based injection** for type-safe DI:
```typescript
export const DRIZZLE = Symbol('DRIZZLE');  // Prevents string collision
export type DrizzleDB = ReturnType<typeof createDrizzleConnection>;
```

Services inject via `@Inject(DRIZZLE)` decorator. The `DbModule` is marked `@Global()` so all modules can access the database without importing.

#### Module Structure
- Feature modules (UsersModule, AuthModule) follow **NestJS module pattern**
- Controllers handle HTTP, Services handle business logic
- Services are exported when needed by other modules

### Authentication Architecture

**Passport.js** with session-based authentication:

1. **Strategies** (apps/api/src/auth/strategies/):
   - `local.strategy.ts`: Email/password via bcrypt
   - `google.strategy.ts`: OAuth with automatic user creation

2. **Session Management**:
   - `session.serializer.ts`: Serializes user ID to session
   - Sessions stored with `express-session` (configure via `SESSION_SECRET` env var)
   - 30-day cookie lifetime by default

3. **Guards** (apps/api/src/auth/guards/):
   - `LocalAuthGuard`: For login endpoint
   - `GoogleAuthGuard`: For OAuth flow
   - `AuthenticatedGuard`: Protects routes requiring authentication

4. **Database Schema**:
   - `user` table: Core user data
   - `account` table: Links users to auth providers (credential, google)
   - `session` table: Session tokens (not currently used by express-session)
   - Password hashing handled in `auth.service.ts`

### Database Layer

**Drizzle ORM** with PostgreSQL:

- **Schema Location**: `apps/api/src/db/schema/` (barrel export in `index.ts`)
- **Connection**: Single pool created via `createDrizzleConnection()` in `db.module.ts`
- **Query Pattern**: Destructure single results from array:
  ```typescript
  const [user] = await db.select().from(user).where(eq(user.id, id));
  ```

### Frontend Routing

**TanStack Router** with file-based routes:

- Routes live in `apps/web/src/routes/`
- `__root.tsx` defines layout with `<Outlet />`
- Each route exports `Route = createFileRoute('/path')({ component })`
- Router has **QueryClient context** for integration with TanStack Query
- `routeTree.gen.ts` is auto-generated by Vite plugin

### Shared Configuration Packages

All apps extend base configs via workspace references:

- **TypeScript**: `packages/typescript-config/`
  - `base.json`: Strict mode, ESM interop
  - `node.json`: For NestJS (extends base)
  - `react.json`: For React (extends base)

- **ESLint**: `packages/eslint-config/`
  - Enforces **alphabetized imports** with blank lines between groups
  - Unused vars allowed with `_` prefix
  - Import order: builtin → external → internal → parent → sibling → index

- **Prettier**: `packages/prettier-config/`
  - Single quotes, 2-space tabs, 80 char width

### Critical Files

- **apps/api/openapi.json**: Auto-generated OpenAPI spec (created on API startup)
- **apps/api/src/main.ts**: Bootstrap logic (CORS, Swagger, OpenAPI file generation, session middleware, passport)
- **apps/web/src/routeTree.gen.ts**: Auto-generated route tree (don't edit manually)
- **packages/sdk/src/generated/**: Auto-generated SDK (don't edit manually)

## Adding New Features

### Adding an API Endpoint

1. Create/update controller in `apps/api/src/<module>/<module>.controller.ts`
2. Add Swagger decorators:
   ```typescript
   @ApiTags('module-name')
   @ApiOperation({ summary: 'Description' })
   @ApiResponse({ status: 200, description: 'Success' })
   ```
3. Service logic in `<module>.service.ts` using `@Inject(DRIZZLE)`
4. **Automatic flow (in dev mode)**:
   - Save changes → API auto-restarts → OpenAPI spec regenerates
   - SDK watcher detects change → SDK regenerates automatically
5. Import types/functions from `@repo/sdk` in frontend

### Adding a Frontend Route

1. Create `apps/web/src/routes/<path>.tsx`
2. Export route:
   ```typescript
   export const Route = createFileRoute('/path')({
     component: Component,
   });
   ```
3. TanStack Router plugin auto-generates route tree
4. Use TanStack Query for data fetching with SDK

### Adding a Database Table

1. Define schema in `apps/api/src/db/schema/<table>.schema.ts`
2. Export from `apps/api/src/db/schema/index.ts`
3. Run `pnpm --filter @repo/api db:generate` to create migration
4. Run `pnpm --filter @repo/api db:migrate` (or `db:push` for dev)
5. Access via injected Drizzle instance in services

## Testing Architecture

### Testing Strategy

The API uses **Jest** with a comprehensive testing setup:

- **Unit Tests** (`.spec.ts`): Test individual services and strategies in isolation
- **E2E Tests** (`.e2e-spec.ts`): Test full HTTP request/response cycles

### Deep Mock Pattern for Drizzle

**Critical Pattern**: Use `jest-mock-extended` for clean, type-safe Drizzle mocking:

```typescript
import { createDrizzleMock, MockDrizzleDB, resetDrizzleMock } from 'test/utils/drizzle-mock.factory';

// Create mock
const mockDb: MockDrizzleDB = createDrizzleMock();

// Mock query chain
mockDb.select.mockReturnValue({
  from: jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue([testUser]),
  }),
} as any);

// Execute query
const result = await service.findOne('user-id');

// Reset between tests
resetDrizzleMock(mockDb);
```

The mock uses **jest-mock-extended's mockDeep**:
- Automatically mocks all nested methods and properties
- Type-safe with full TypeScript support
- Chainable query builder support (select, from, where, insert, update, delete)
- Simple `mockReturnValue` and `mockReturnValueOnce` for different query results

### Test Utilities

**Location**: `apps/api/test/utils/`

1. **drizzle-mock.factory.ts**: Deep mock using jest-mock-extended
   - `createDrizzleMock()`: Creates type-safe Drizzle mock
   - `resetDrizzleMock()`: Clears all mock call history
   - `MockDrizzleDB`: Type alias for mocked Drizzle instance

2. **test-data.factory.ts**: Test fixture factories
   - `TestDataFactory.createUser()`: Generate test users
   - `TestDataFactory.createAccount()`: Generate auth accounts
   - `TestDataFactory.createSession()`: Generate sessions
   - `TestDataFactory.createGoogleProfile()`: Generate OAuth profiles

3. **test.module.ts**: Test module with mocked providers
   - Provides mocked `DRIZZLE` instance
   - Loads test environment config

4. **setup-e2e.ts**: E2E test infrastructure
   - `setupE2ETest()`: Bootstrap test app with mocks
   - `teardownE2ETest()`: Cleanup after tests

### Writing Tests

#### Unit Test Pattern

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockDb: MockDrizzleDB;

  beforeEach(async () => {
    mockDb = createDrizzleMock();

    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  afterEach(() => {
    resetDrizzleMock(mockDb);
  });

  it('should perform operation', async () => {
    // Arrange: Mock query chain
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([testData]),
      }),
    } as any);

    // Act: Call service method
    const result = await service.method();

    // Assert: Verify results
    expect(result).toEqual(testData);
  });
});
```

#### E2E Test Pattern

```typescript
describe('ControllerName (e2e)', () => {
  let app: INestApplication;
  let mockDb: any;
  let mockDbInternals: any;

  beforeAll(async () => {
    const setup = await setupE2ETest();
    app = setup.app;
    mockDb = setup.mockDb;
    mockDbInternals = getDrizzleMockInternals(mockDb);
  });

  it('should handle GET request', async () => {
    // Arrange
    mockDbInternals.setResults({ selectResult: [testData] });

    // Act & Assert
    const response = await request(app.getHttpServer())
      .get('/endpoint')
      .expect(200);

    expect(response.body).toEqual(testData);
  });
});
```

### Test Coverage

- **Services**: AuthService, UsersService (100% critical paths)
- **Strategies**: LocalStrategy, GoogleStrategy
- **Controllers**: Full e2e coverage for auth and users endpoints
- **Guards**: Tested via e2e controller tests

### Running Specific Tests

```bash
# Single test file
pnpm --filter @repo/api test auth.service.spec.ts

# Pattern matching
pnpm --filter @repo/api test --testNamePattern="validateUser"

# Update snapshots
pnpm --filter @repo/api test -u
```

## Environment Variables

Required for API (create `.env` in `apps/api/`):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fotomania
SESSION_SECRET=your-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Troubleshooting

### SDK Generation Issues
- OpenAPI spec auto-generates when API starts - check console for "✅ OpenAPI spec written to..." message
- If `apps/api/openapi.json` is missing, restart the API server
- SDK watches `openapi.json` file in dev mode and regenerates automatically
- For manual regeneration: `pnpm --filter @repo/sdk generate`

### TypeScript Errors in Frontend
- Rebuild SDK: `pnpm --filter @repo/sdk build`
- Check that API changes are reflected in `openapi.json`

### Authentication Issues
- Sessions require `SESSION_SECRET` env var
- CORS configured for `http://localhost:5173` only
- Cookies require `credentials: true` in fetch requests

### Database Migrations
- Schema location: `apps/api/src/db/schema/`
- Migrations in `apps/api/drizzle/`
- Connection string from `DATABASE_URL` env var
