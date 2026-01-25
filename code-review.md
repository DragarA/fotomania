# Code Review

- apps/api/src/collections/collections.service.ts: Guard against missing `FRONTEND_URL` to avoid sending `undefined/d/...` links. Consider `configService.getOrThrow('FRONTEND_URL')` and returning a 400/500 when absent.
- apps/web/src/features/gallery/hooks/useCollections.tsx: Improve error messaging by reading `error.body?.message` (SDK errors often expose details there) before falling back to `error.message`.
- apps/api/src/collections/collections.service.ts: `photographerName` may be nullable; consider a fallback to avoid blank template fields.
- Generated artifacts: `apps/api/openapi.json` and `packages/sdk/src/generated/*` should be regenerated from current API sources before committing.
