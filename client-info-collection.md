# Client Information Collection Feature Implementation Plan

## Overview
Extend the "Send to photographer" form on the public Gallery page to collect additional client information. Photographers can configure which fields are required through their profile settings.

## User Decisions Applied
- ✅ Field toggles in **photographer profile settings** (global for all catalogues)
- ✅ **Single full name** field (not first/last separately)
- ✅ **Structured address**: street, city, postal code, country
- ✅ **Phone input** with country code selector using `react-phone-number-input`
- ✅ **Country dropdown** using combobox with static country list (reuse from phone library)
- ✅ No localStorage caching for these fields

## Field Groups

### 1. Client Name
- Field: `clientName` (text)
- Single full name field
- Required when `collectClientName` is enabled

### 2. Client Address (Structured)
- Fields:
  - `clientAddressStreet` (text)
  - `clientAddressCity` (text)
  - `clientAddressPostalCode` (text)
  - `clientAddressCountry` (text) - combobox with country list
- All fields required as a group when `collectClientAddress` is enabled

### 3. Client Phone
- Field: `clientPhoneNumber` (text)
- Format: E.164 international format (e.g., +12345678900)
- UI: `react-phone-number-input` with country code selector
- Required when `collectClientPhone` is enabled

### 4. Additional Notes
- Field: `clientNotes` (text, textarea)
- Freeform text area
- Required when `collectClientNotes` is enabled

---

## Phase 1: Database Layer ✅ COMPLETE
**Model: haiku** (mechanical schema additions)

> **Status:** Migration already executed. Schema changes are in place.

### Files Modified

1. **apps/api/src/common/db/schema/client-session.schema.ts**
   - Added columns to clientSession table:
     - `clientName: text`
     - `clientAddressStreet: text`
     - `clientAddressCity: text`
     - `clientAddressPostalCode: text`
     - `clientAddressCountry: text`
     - `clientPhoneNumber: text`
     - `clientNotes: text`

2. **apps/api/src/common/db/schema/users.schema.ts**
   - Added toggle columns to user table:
     - `collectClientName: boolean` (default: false)
     - `collectClientAddress: boolean` (default: false)
     - `collectClientPhone: boolean` (default: false)
     - `collectClientNotes: boolean` (default: false)

---

## Phase 2: Backend Updates
**Model: sonnet** (error handling, validation logic, conditional field handling)

### Files to Modify

1. **apps/api/src/public/dto/add-favourites-req.dto.ts**
   - Update `addFavouritesSchema` with new optional fields
   - Update `AddFavouritesReqDtoClass` with Swagger documentation

2. **apps/api/src/public/dto/catalogue-public-res.dto.ts**
   - Add photographer's field collection settings to public catalogue response:
     - `collectClientName: boolean`
     - `collectClientAddress: boolean`
     - `collectClientPhone: boolean`
     - `collectClientNotes: boolean`
   - This exposes settings to frontend so it knows which fields to render

3. **apps/api/src/public/public.service.ts**
   - Update catalogue query to join user settings
   - Map collection settings to public response

4. **apps/api/src/public/public.controller.ts**
   - Ensure new fields are passed through to service

5. **apps/api/src/client-sessions/client-sessions.service.ts**
   - Update `addFavourites` method to save new fields to database
   - Update queries to return new client information

6. **apps/api/src/client-sessions/dto/client-session-favourite.dto.ts**
   - Update `ClientSessionFavouritesResDto` to include new fields
   - Update response mapping to include new data

7. **apps/api/src/client-sessions/client-sessions.controller.ts**
   - Update endpoint to return new fields in response

8. **apps/api/src/users/dto/update-user.dto.ts**
   - Add toggle fields to update schema

9. **apps/api/src/users/dto/user-res.dto.ts**
   - Add toggle fields to user response DTO

10. **apps/api/src/users/users.service.ts**
    - Update profile update method to handle toggle fields

### Unit Tests to Write

1. **apps/api/src/client-sessions/client-sessions.service.spec.ts**
   - Test `addFavourites` saves new client info fields
   - Test fields are optional and nullable

2. **apps/api/src/users/users.service.spec.ts**
   - Test profile update with toggle fields
   - Test default values for new users

---

## Phase 3: Frontend Updates
**Model: sonnet** (conditional rendering, dynamic validation, complex form logic)

### Dependencies to Install
```bash
pnpm --filter @repo/web add react-phone-number-input
```

### Files to Modify

1. **apps/web/src/features/profile/components/ProfileForm.tsx**
   - Add 4 toggle switches for submission field configuration
   - Add UI for:
     - "Collect client name"
     - "Collect client address"
     - "Collect client phone number"
     - "Collect additional notes"
   - Update form schema and submission

2. **apps/web/src/features/profile/hooks/useUser.ts**
   - Update User type to include new toggle fields

3. **apps/web/src/features/gallery/utils/favourites-validation.ts**
   - Create dynamic schema factory function:
     ```typescript
     type CollectionSettings = {
       collectClientName: boolean;
       collectClientAddress: boolean;
       collectClientPhone: boolean;
       collectClientNotes: boolean;
     };

     export const createSaveFavouritesSchema = (settings: CollectionSettings) => {
       return z.object({
         // ... existing fields
         clientName: settings.collectClientName ? z.string().min(1) : z.string().optional(),
         // ... etc
       });
     };
     ```
   - Add fields: clientName, clientAddress (street, city, postalCode, country), clientPhoneNumber, clientNotes

4. **apps/web/src/features/gallery/components/favourites/SaveFavouritesModal.tsx**
   - Fetch photographer settings from catalogue data
   - Add conditional form fields:
     - Full name input (when collectClientName enabled)
     - Address fields: street, city, postal code, country combobox (when collectClientAddress enabled)
     - Phone input with `react-phone-number-input` (when collectClientPhone enabled)
     - Notes textarea (when collectClientNotes enabled)
   - Pass settings to `createSaveFavouritesSchema()` for dynamic validation
   - Update form submission to include new fields

5. **apps/web/src/features/gallery/pages/PublicCataloguePage.tsx**
   - Pass photographer settings from catalogue response to SaveFavouritesModal

6. **apps/web/src/features/gallery/hooks/useCatalogueFavourites.tsx**
   - Update `ClientFavouriteSession` interface to include new fields

7. **apps/web/src/features/gallery/components/favourites/FavouritesModal.tsx**
   - Display new client information in the favourites popup:
     - Client name card
     - Formatted address card
     - Phone number card
     - Notes section
   - Update layout to accommodate new information

8. **apps/web/src/hooks/useClientSessions.ts**
   - Update `useAddFavouritesMutation` to send new fields

---

## Phase 4: Translations
**Model: haiku** (mechanical key additions)

### Files to Update

Add i18n keys to:
- `apps/web/src/i18n/locales/en/public.json`
- `apps/web/src/i18n/locales/sl/public.json`
- `apps/web/src/i18n/locales/en/profile.json`
- `apps/web/src/i18n/locales/sl/profile.json`
- `apps/web/src/i18n/locales/en/gallery.json`
- `apps/web/src/i18n/locales/sl/gallery.json`

### New Keys Needed

**public.json** - Save favourites modal:
```json
{
  "modal": {
    "save": {
      "clientNameLabel": "Your Name",
      "clientNamePlaceholder": "John Doe",
      "addressLabel": "Address",
      "streetLabel": "Street",
      "streetPlaceholder": "123 Main St",
      "cityLabel": "City",
      "cityPlaceholder": "New York",
      "postalCodeLabel": "Postal Code",
      "postalCodePlaceholder": "10001",
      "countryLabel": "Country",
      "countryPlaceholder": "Select country...",
      "phoneLabel": "Phone Number",
      "notesLabel": "Additional Notes",
      "notesPlaceholder": "Any special requests or information..."
    }
  }
}
```

**profile.json** - Profile settings:
```json
{
  "form": {
    "submissionFields": "Client Information Fields",
    "submissionFieldsDescription": "Configure which information clients must provide when submitting favourites",
    "collectClientName": "Collect client name",
    "collectClientNameDescription": "Require clients to provide their full name",
    "collectClientAddress": "Collect client address",
    "collectClientAddressDescription": "Require clients to provide their address",
    "collectClientPhone": "Collect client phone number",
    "collectClientPhoneDescription": "Require clients to provide their phone number",
    "collectClientNotes": "Collect additional notes",
    "collectClientNotesDescription": "Allow clients to add additional information"
  }
}
```

**gallery.json** - Favourites modal display:
```json
{
  "favouritesModal": {
    "clientNameLabel": "Client",
    "addressLabel": "Address",
    "phoneLabel": "Phone",
    "notesLabel": "Notes"
  }
}
```

---

## Phase 5: SDK Regeneration & Testing
**Model: sonnet** (test design, edge cases)

### Steps

1. Ensure API server is running to generate OpenAPI spec

2. Regenerate SDK:
   ```bash
   pnpm --filter @repo/sdk generate
   ```

3. Run unit tests:
   ```bash
   pnpm --filter @repo/api test:unit
   ```

4. Run E2E tests:
   ```bash
   pnpm --filter @repo/api test:e2e
   ```

5. Run linting:
   ```bash
   pnpm lint
   ```

6. Format code:
   ```bash
   pnpm format
   ```

---

## Implementation Order

1. ~~Database schema changes (with migration)~~ ✅ COMPLETE
2. Backend DTOs and API updates
3. Backend unit tests
4. Frontend profile settings (toggles)
5. Frontend public gallery form
6. Frontend favourites modal display
7. Translations
8. SDK regeneration
9. Testing and linting

---

## Testing Checklist

### Database & Backend
- [x] Migration runs successfully
- [ ] Profile settings save correctly
- [ ] New user defaults have all toggles as false
- [ ] Public catalogue response includes collection settings
- [ ] Client session saves all new fields correctly

### Frontend Form
- [ ] Form fields show/hide based on photographer settings
- [ ] Form validation works for required fields when enabled
- [ ] Phone input formats correctly (E.164)
- [ ] Country dropdown works and stores correct value
- [ ] Form submits successfully with new fields

### Frontend Display
- [ ] Data displays correctly in favourites modal
- [ ] Phone number displays in readable format
- [ ] Address displays in formatted layout
- [ ] Empty fields don't show empty cards

### General
- [ ] All translations work (EN and SL)
- [ ] SDK types are correct
- [ ] No TypeScript errors
- [ ] All unit tests pass
- [ ] All E2E tests pass
