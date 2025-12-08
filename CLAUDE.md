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

### Development
```bash
# First time setup (generate OpenAPI spec)
pnpm dev                                    # Start all services
pnpm --filter @repo/api generate-openapi   # Generate OpenAPI spec (in separate terminal after API starts)

# Regular development
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
# Manual OpenAPI generation (API must be running)
pnpm --filter @repo/api generate-openapi   # Fetches from http://localhost:3000/api-json
curl http://localhost:3000/api-json > apps/api/openapi.json  # Alternative

# Manual SDK generation
pnpm --filter @repo/sdk generate           # Reads apps/api/openapi.json
```

## Architecture

### Type-Safe API Pipeline

The core architecture enforces end-to-end type safety:

```
Database Schema (Drizzle)
  ↓
API Endpoints (NestJS + Swagger decorators)
  ↓
OpenAPI Spec (auto-generated at apps/api/openapi.json)
  ↓
TypeScript SDK (auto-generated via @hey-api/openapi-ts)
  ↓
Frontend Components (React + TanStack Query)
```

**Critical Flow**: Changes to API controllers automatically propagate types to the frontend through SDK regeneration.

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

- **apps/api/openapi.json**: Generated OpenAPI spec (gitignored, must regenerate on first run)
- **apps/api/src/main.ts**: Bootstrap logic (CORS, Swagger, session middleware, passport)
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
4. Run `pnpm --filter @repo/api generate-openapi` (or SDK watcher auto-detects)
5. SDK regenerates automatically
6. Import types/functions from `@repo/sdk` in frontend

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
- Ensure `apps/api/openapi.json` exists (run `generate-openapi` script)
- API must be running or built to generate OpenAPI spec
- SDK watches `openapi.json` file in dev mode

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
