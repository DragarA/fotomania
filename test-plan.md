# Test Plan (Playwright-Oriented)

## Overview
This plan covers end-to-end flows for the Fotomania web app (React + Vite) and the public delivery/favourites experience. Steps are written as Playwright-friendly scenarios with clear setup, actions, and expected results.

## Global Setup
- Use a seeded test database or fixtures for at least:
  - One photographer account with known credentials.
  - One catalogue with multiple collections (standard + delivery).
  - One delivery collection with a delivery slug and published photos.
  - One client session with an email.
- Ensure API and web servers are running.
- Configure env vars for Mailgun in a test-safe mode (or mock email send endpoint).

## Authentication
### Login (Email/Password)
- Navigate to `/login`.
- Fill email/password and submit.
- Expect redirect to dashboard (catalogues list).
- Expect authenticated UI (user/avatar/menu present).

### Logout
- Open user menu and click logout.
- Expect redirect to `/login`.
- Verify protected routes redirect to login.

### Invalid Login
- Submit invalid credentials.
- Expect error toast/message.
- Stay on login page.

## Catalogues
### View Catalogues List
- Login and navigate to dashboard.
- Expect catalogue cards list.
- Verify counts/metadata render (title, status).

### Create Catalogue
- Click create catalogue.
- Fill required fields and submit.
- Expect new catalogue appears in list.

### Update Catalogue
- Open catalogue detail page.
- Edit title/description/status and save.
- Expect updated values persist after refresh.

### Delete Catalogue
- Delete catalogue via UI action.
- Confirm dialog.
- Expect removal from list.

### Set Catalogue Cover
- Open catalogue with photos.
- Set a photo as cover.
- Expect cover preview updated on catalogue card.

## Collections
### Create Standard Collection
- Open a catalogue.
- Create a new collection (non-delivery).
- Expect collection appears in list.

### Create Delivery Collection
- Open a catalogue.
- Create a delivery collection.
- Expect delivery-specific actions available (share link, send email).

### Rename/Update Collection
- Open collection context menu.
- Rename and save.
- Expect updated name persists.

### Delete Collection
- Open collection context menu.
- Delete and confirm.
- Expect collection removed from list.

## Photos
### Upload Photos
- Open collection.
- Upload multiple images.
- Expect upload queue shows progress and completes.
- Expect photos appear in grid.

### Delete Photo
- Open photo detail or context menu.
- Delete photo and confirm.
- Expect removal from grid.

### Collection Download History (Delivery)
- Open delivery collection detail.
- View download history (if UI present).
- Expect list populated (or empty state).

## Delivery Flow (Public)
### Open Delivery Link
- Navigate to `/d/{deliverySlug}` as unauthenticated user.
- If password protected, enter password.
- Expect gallery view with photos.

### Download Delivery
- Click download action.
- Expect file download starts.
- Verify download entry recorded (if accessible to owner later).

## Favourites Flow (Public)
### Open Public Catalogue Link
- Navigate to public catalogue URL/slug.
- If password protected, enter password.
- Expect photo grid visible.

### Add/Remove Favourites
- Toggle favourite on multiple photos.
- Expect UI updates (favourite state).

### Submit Favourites with Email
- Enter client email and submit favourites.
- Expect success confirmation.
- If possible, verify favourites saved (owner dashboard view).

## Delivery Email (Owner)
### Send Delivery Email
- Open delivery collection context menu.
- Choose “Send Email to Client”.
- Expect success toast.
- Verify email send request succeeded (mock or test log).

### Delivery Email Error Handling
- Trigger failure (e.g., missing client email in fixture).
- Expect error toast.

## Internationalization
### Gallery UI Translations
- Switch language (if UI supports).
- Verify collection context menu labels update.

### Email Language Selection
- Use a photographer with `preferredLanguage = sl`.
- Trigger favourites submitted + delivery email.
- Verify subject/body localized (via mock/stub capture).

## Permissions & Authorization
### Cross-User Access
- Login as photographer A.
- Attempt to open photographer B’s catalogue/collection (direct URL).
- Expect 403/redirect/blocked UI.

### Public Routes Must Not Require Auth
- Open `/d/{deliverySlug}` and public catalogue link in fresh session.
- Expect access without login (subject to password if configured).

## Error/Edge States
### Empty States
- Open catalogue with no collections/photos.
- Expect empty state messaging and CTA.

### Network Failure Handling
- Simulate API failure on collections or photos endpoints.
- Expect error toasts and graceful fallback UI.

## Performance/UX Smoke Checks
- Initial page load renders without console errors.
- Photo grid virtualized (if implemented) does not freeze for 50+ items.

## Suggested Playwright Utilities
- Custom fixtures for authenticated/unauthenticated contexts.
- Helpers for file uploads (use `setInputFiles`).
- Mailgun stub or API capture to assert email content.
