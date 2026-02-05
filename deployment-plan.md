# Deployment Plan: Fotomania to DirectAdmin Hosting

## Overview

Deploy the Fotomania monorepo (NestJS API + Vite React frontend) to DirectAdmin hosting with Phusion Passenger for Node.js and GitHub Actions CI/CD.

## Architecture

```
api.fotomania.com     → NestJS API (Passenger + Node.js)
fotomania.com         → React SPA (static files served by Apache/LitSpeed)
external-db.com       → PostgreSQL (external managed database)
```

---

## Node.js Version (Confirmed)

**Current requirement**: `>=24.0.0` (in `package.json`)

**Status**: Deployment environment supports Node 24. No downgrade required.

---

## Files to Create/Modify

### 1. Passenger Entry Point
**File**: `apps/api/app.js` (new)

Creates a Passenger-compatible wrapper for NestJS that:
- Loads dotenv for environment variables
- Works with Passenger's socket-based communication
- Falls back to PORT for local testing

### 2. API Production Modifications
**File**: `apps/api/src/main.ts` (modify)

Changes:
- Make CORS origin configurable via `FRONTEND_URL` env var
- Make port configurable via `PORT` env var
- Remove OpenAPI file writing in production (not needed, causes permission issues)

### 3. .htaccess for Frontend
**File**: `apps/web/.htaccess` (new)

Handles:
- SPA routing (redirect all to index.html)
- GZIP compression
- Static asset caching
- Security headers

### 4. GitHub Actions Workflow
**File**: `.github/workflows/deploy.yml` (new)

Two jobs:
1. **build**: Install deps, build all packages, create deployment artifacts
2. **deploy**: SSH to server, upload artifacts, install production deps, restart Passenger

**SDK policy**: Do not regenerate SDK during CI/CD. The generated SDK is committed to git and used as-is during builds.
This means developers must keep `packages/sdk/src/generated` up to date before merging.

---

## Implementation Steps

### Stage 1: Create Passenger Entry Point
**File**: `apps/api/app.js`

```javascript
require('dotenv').config();

// Passenger compatibility
if (typeof PhusionPassenger !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

// Start the NestJS application
require('./dist/main.js');
```

### Stage 2: Modify main.ts for Production
**File**: `apps/api/src/main.ts`

Changes:
1. CORS: Use `process.env.FRONTEND_URL` for production origin
2. Port: Use `process.env.PORT || 3000`
3. Conditional OpenAPI file writing: Skip in production

```typescript
// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL].filter(Boolean)
    : ['http://localhost:5173'];

app.enableCors({
    origin: allowedOrigins,
    credentials: true,
});

// Port
const port = process.env.PORT || 3000;
await app.listen(port);
```

### Stage 3: Create Frontend .htaccess
**File**: `apps/web/.htaccess`

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### Stage 4: Create GitHub Actions Workflow
**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to DirectAdmin

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  NODE_VERSION: '24'
  PNPM_VERSION: '10.25.0'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build API
        run: pnpm --filter @repo/api build
        env:
          NODE_ENV: production

      - name: Build SDK
        run: pnpm --filter @repo/sdk build

      - name: Build Web
        run: pnpm --filter @repo/web build
        env:
          VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }}

      - name: Prepare API deployment package
        run: |
          mkdir -p deploy/api
          cp -r apps/api/dist deploy/api/
          cp -r apps/api/drizzle deploy/api/ 2>/dev/null || true
          cp apps/api/package.json deploy/api/
          cp apps/api/drizzle.config.ts deploy/api/ 2>/dev/null || true
          cp apps/api/app.js deploy/api/
          mkdir -p deploy/api/tmp
          touch deploy/api/tmp/restart.txt

      - name: Prepare Web deployment package
        run: |
          mkdir -p deploy/web
          cp -r apps/web/dist/* deploy/web/
          cp apps/web/.htaccess deploy/web/

      - name: Upload API artifact
        uses: actions/upload-artifact@v4
        with:
          name: api-build
          path: deploy/api
          retention-days: 7

      - name: Upload Web artifact
        uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: deploy/web
          retention-days: 7

  deploy-api:
    needs: build
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Download API artifact
        uses: actions/download-artifact@v4
        with:
          name: api-build
          path: api-build

      - name: Deploy API via SSH
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT }}
          source: "api-build/*"
          target: "/home/${{ secrets.SSH_USERNAME }}/domains/${{ vars.API_DOMAIN }}/public_html"
          strip_components: 1

      - name: Install dependencies and restart
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            cd /home/${{ secrets.SSH_USERNAME }}/domains/${{ vars.API_DOMAIN }}/public_html
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
            npm install --production --legacy-peer-deps
            npx drizzle-kit migrate 2>/dev/null || echo "Migrations skipped"
            touch tmp/restart.txt
            echo "API deployment complete!"

  deploy-web:
    needs: build
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Download Web artifact
        uses: actions/download-artifact@v4
        with:
          name: web-build
          path: web-build

      - name: Deploy Web via SSH
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT }}
          source: "web-build/*"
          target: "/home/${{ secrets.SSH_USERNAME }}/domains/${{ vars.WEB_DOMAIN }}/public_html"
          strip_components: 1

      - name: Verify deployment
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            ls -la /home/${{ secrets.SSH_USERNAME }}/domains/${{ vars.WEB_DOMAIN }}/public_html
            echo "Web deployment complete!"
```

### Stage 5: SDK Generation Policy (Required for CI/CD)
**Goal**: CI/CD does not regenerate SDK. The generated SDK must be committed to git.

Required developer workflow (before merging API changes):
1. Run the API locally so it writes `apps/api/openapi.json`.
2. Run `pnpm --filter @repo/sdk generate` to regenerate `packages/sdk/src/generated`.
3. Commit the updated generated files.

CI/CD will only run `pnpm --filter @repo/sdk build`, which compiles the committed SDK sources without regeneration.

---

## DirectAdmin Server Setup (Manual Steps)

### 1. Create Domains
- `api.fotomania.com` - Enable NodeJS Selector
- `fotomania.com` - Standard PHP/static hosting

### 2. Configure NodeJS Selector for API Domain
In DirectAdmin:
1. Go to Domain Setup → api.fotomania.com
2. Enable NodeJS Selector
3. Configure:
   - Node version: 20.x LTS
   - Application mode: production
   - Startup file: `app.js`
   - Application root: `/home/USER/domains/api.fotomania.com/public_html`

### 3. Create Required Directories
```bash
mkdir -p ~/domains/api.fotomania.com/public_html/uploads
mkdir -p ~/domains/api.fotomania.com/public_html/tmp
chmod 755 uploads tmp
```

### 4. Create .env File on Server
```bash
# /home/USER/domains/api.fotomania.com/public_html/.env

# Database
DATABASE_URL=postgresql://user:pass@db-host:5432/fotomania

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://fotomania.com

# JWT Secrets (generate strong random strings - use: openssl rand -base64 48)
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<different-64-char-random-string>

# Mailgun
MAILGUN_API_KEY=<your-key>
MAILGUN_DOMAIN=<your-domain>
MAILGUN_FROM_EMAIL=noreply@fotomania.com
MAILGUN_FROM_NAME=Fotomania

# Google OAuth (optional)
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

### 5. Enable SSL/HTTPS
- Enable Let's Encrypt for both domains in DirectAdmin
- Force HTTPS redirect

---

## GitHub Repository Setup

### Secrets (Settings → Secrets and variables → Actions → Secrets)
| Secret | Description |
|--------|-------------|
| `SSH_HOST` | DirectAdmin server IP or hostname |
| `SSH_USERNAME` | SSH username |
| `SSH_PRIVATE_KEY` | SSH private key (full RSA key including headers) |
| `SSH_PORT` | SSH port (usually 22) |

### Variables (Settings → Secrets and variables → Actions → Variables)
| Variable | Example Value |
|----------|---------------|
| `API_DOMAIN` | `api.fotomania.com` |
| `WEB_DOMAIN` | `fotomania.com` |
| `VITE_API_BASE_URL` | `https://api.fotomania.com` |

### Create Production Environment (Optional but Recommended)
1. Go to Settings → Environments
2. Create "production" environment
3. Add protection rules (require approval, etc.)

---

## Environment Variables Summary

### API (server .env)
| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Min 32 chars |
| `JWT_REFRESH_SECRET` | Yes | Min 32 chars, different from JWT_SECRET |
| `MAILGUN_API_KEY` | Yes | |
| `MAILGUN_DOMAIN` | Yes | |
| `MAILGUN_FROM_EMAIL` | Yes | |
| `FRONTEND_URL` | Yes | For CORS and email links |
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Default: 3000 |
| `GOOGLE_CLIENT_ID` | No | If using Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | If using Google OAuth |

### Web (build-time via GitHub Variables)
| Variable | Notes |
|----------|-------|
| `VITE_API_BASE_URL` | API URL for frontend to call |

---

## Verification Checklist

After deployment:
- [ ] API health check: `curl https://api.fotomania.com/`
- [ ] API docs accessible: `https://api.fotomania.com/api-docs`
- [ ] Frontend loads: `https://fotomania.com`
- [ ] Frontend can reach API: Check network tab for API calls
- [ ] SPA routing works: Navigate to a route, refresh - should not 404
- [ ] Auth flow works: Login/register
- [ ] File uploads work: Test uploading photos

---

## Troubleshooting

### API not starting
1. Check Passenger logs: `~/domains/api.fotomania.com/logs/`
2. Verify `.env` file exists and has correct permissions
3. Try restarting: `touch ~/domains/api.fotomania.com/public_html/tmp/restart.txt`

### CORS errors
1. Verify `FRONTEND_URL` in `.env` matches actual frontend domain
2. Check for trailing slashes (should not have one)

### Database connection issues
1. Verify `DATABASE_URL` is correct
2. Check if external DB allows connections from your server's IP
3. Test connection: `psql $DATABASE_URL`

### Frontend 404 on refresh
1. Verify `.htaccess` file exists and has correct rewrite rules
2. Check if `mod_rewrite` is enabled

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `apps/api/app.js` | Create | Passenger entry point |
| `apps/api/src/main.ts` | Modify | Production CORS and port config |
| `apps/web/.htaccess` | Create | SPA routing and caching |
| `.github/workflows/deploy.yml` | Create | CI/CD pipeline |
| `package.json` | Modify | Lower Node.js version if needed |
