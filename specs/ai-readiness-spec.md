# AI Readiness Improvements

## Overview
This spec defines requirements to improve AI readiness for the Fotomania monorepo. The goal is to make the project easier for automated agents to understand, test, and change safely.

## Requirements

### Documentation
- Add `CONTRIBUTING.md` with:
  - Local setup steps and required tools.
  - Branching and review expectations.
  - Lint/test commands and when to run them.
  - Auto-generated files and files that should not be edited.
- Add `AI.md` (or `docs/ai.md`) with:
  - Safe defaults for common tasks (run tests, update SDK, regenerate OpenAPI).
  - Explicit do-not-touch paths (e.g., `packages/sdk/src/generated`, `apps/web/src/routeTree.gen.ts`).
  - Known pitfalls (e.g., dev servers should not be started by agents).
- Add `docs/architecture.md` with a short system diagram and major module responsibilities.

### Environment and Config
- Add `.env.example` with required variables and clear descriptions.
- Add runtime validation for required env vars (fail fast with clear errors).
- Document Mailgun configuration expectations for local development/testing.

### Testing and Fixtures
- Add a Playwright test plan and initial E2E scaffolding.
- Add seed/fixture scripts for consistent local/CI data.
- Provide test users and expected credentials in fixtures (not in code).

### Codebase Conventions
- Enforce import order and formatting via CI checks.
- Add a brief “naming and file placement” guide (controllers, services, routes).

### Release/Change Tracking
- Add a simple `CHANGELOG.md` or release notes process.
- Add a template for feature specs in `specs/` to standardize future changes.

## Non-Goals
- This spec does not change runtime behavior.
- This spec does not add new features to the product.
