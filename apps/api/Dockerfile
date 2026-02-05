# Build stage
FROM node:24-slim AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/api ./apps/api
COPY packages ./packages

# Build the API
RUN pnpm --filter @repo/api build

# Production stage
FROM node:24-slim AS runner

# Install pnpm for deploy
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/prettier-config/package.json ./packages/prettier-config/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY apps/api/drizzle ./apps/api/drizzle

# Create uploads directory
RUN mkdir -p /app/apps/api/uploads

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main.js"]
