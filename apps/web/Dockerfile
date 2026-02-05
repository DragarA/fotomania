# Build stage
FROM node:24-slim AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/web ./apps/web
COPY apps/api/openapi.json ./apps/api/openapi.json
COPY packages ./packages

# Build argument for API URL
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build SDK first, then web
RUN pnpm --filter @repo/sdk build
RUN pnpm --filter @repo/web build

# Production stage - use simple Node server instead of nginx
FROM node:24-alpine AS runner

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/apps/web/dist ./dist

# Railway provides PORT env var
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "serve -s dist -l $PORT"]
