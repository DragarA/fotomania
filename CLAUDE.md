# CLAUDE.md

## Critical Rules
- **Never start dev servers** - assume `pnpm dev` is running (API :3000, Web :5173)
- **Never edit auto-generated files**: `openapi.json`, `routeTree.gen.ts`, `packages/sdk/src/generated/`
- Run `nvm use` before any shell command
- Use `lucide-react` for all frontend icons (no inline SVGs)
- Follow existing code patterns - check similar files before creating new ones
- **Atomic Execution**: Each stage should focus on one responsibility

## Architecture

```
Drizzle Schema → NestJS API → OpenAPI spec → TypeScript SDK → React Frontend
     ↓              ↓              ↓              ↓              ↓
  db/schema/    Swagger      openapi.json    @repo/sdk     TanStack Query
```

- **Monorepo**: Turborepo with `apps/api`, `apps/web`, `packages/sdk`
- **Auth**: Passport.js (local + Google OAuth), session-based
- **Database**: PostgreSQL + Drizzle ORM, inject via `@Inject(DRIZZLE)`
- **Routing**: TanStack Router (file-based in `apps/web/src/routes/`)

## Commands

### Development & Build
| Command | Description |
|---------|-------------|
| `pnpm build` | Build all (API → SDK → Web) |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format all code |

### Database
| Command | Description |
|---------|-------------|
| `pnpm --filter @repo/api db:generate` | Generate migration |
| `pnpm --filter @repo/api db:migrate` | Run migrations |
| `pnpm --filter @repo/api db:push` | Push schema (dev only) |
| `pnpm --filter @repo/api db:studio` | Open Drizzle Studio |

### Testing
| Command | Description |
|---------|-------------|
| `pnpm --filter @repo/api test` | All tests |
| `pnpm --filter @repo/api test:unit` | Unit tests |
| `pnpm --filter @repo/api test:e2e` | E2E tests |
| `pnpm --filter @repo/api test:cov` | All with coverage |

## Key Paths

| Path | Purpose |
|------|---------|
| `apps/api/src/db/schema/` | Drizzle schemas |
| `apps/api/src/<module>/` | API modules (controller, service, DTOs) |
| `apps/web/src/routes/` | Frontend routes |
| `apps/api/test/utils/` | Test utilities (mocks, factories) |
| `packages/typescript-config/` | Shared TS configs |
| `packages/eslint-config/` | Shared ESLint (alphabetized imports) |

## Patterns

### API Endpoint
```typescript
// apps/api/src/<module>/<module>.controller.ts
@ApiTags('module-name')
@ApiOperation({ summary: 'Description' })
@ApiResponse({ status: 200, description: 'Success' })
```

### Frontend Route
```typescript
// apps/web/src/routes/<path>.tsx
export const Route = createFileRoute('/path')({ component: MyComponent });
```

### Database Query
```typescript
const [user] = await db.select().from(user).where(eq(user.id, id));
```

## Testing

- **Unit tests**: `*.spec.ts` - test services in isolation
- **E2E tests**: `*.e2e-spec.ts` - test HTTP request/response
- **Mocks**: Use `createDrizzleMock()` from `test/utils/drizzle-mock.factory.ts`
- **Fixtures**: Use `TestDataFactory` from `test/utils/test-data.factory.ts`

## Environment Variables

Required in `apps/api/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/fotomania
SESSION_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Plan Mode (Planner-Executor Workflow)

When entering plan mode, the **Planner** writes a structured plan. This plan must be detailed enough that the **Executor** can perform each stage independently.

### Planning Principles
1. **Atomic Stages**: Each stage focuses on ONE responsibility
2. **Explicit Context**: Every stage lists exactly what to read and change
3. **Verifiable Completion**: Each stage has a clear "Done" definition
4. **Sequential Independence**: Stages should not require re-reading previous outputs

### Execution Model Selection

| Stage Type | Model | Rationale |
|------------|-------|-----------|
| DTOs, boilerplate | `haiku` | Mechanical, pattern-based |
| Module registration | `haiku` | Simple imports and additions |
| Controller wiring | `haiku` | Follows service interface |
| Service methods (simple) | `sonnet` | Requires error handling judgment |
| Service methods (complex) | `sonnet` | Business logic needs reasoning |
| E2E/Unit tests | `sonnet` | Must anticipate edge cases |
| Debugging/fixes | `opus` | Requires deep reasoning |
| Refactoring | `opus` | Requires broader pattern understanding |

### Execution Workflow

```
PLANNING (opus) → plan.md → [User reviews]
                                  ↓
EXECUTION: Task tool with model per stage
  - haiku  → DTOs, boilerplate, wiring
  - sonnet → Service logic, tests
  - opus   → Complex debugging only
                                  ↓
                        [User runs verification]
                                  ↓
FIX PHASE (opus if needed) → Debug failures
```

### Model Guidelines
- **Haiku**: Mechanical tasks, explicit patterns, no judgment calls
- **Sonnet**: Context understanding, error handling, test design
- **Opus**: Debugging, ambiguous requirements, complex refactoring
- **Escalate to Opus**: If smaller model fails verification twice
