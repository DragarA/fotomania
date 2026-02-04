# Client Information Collection Feature Implementation Plan

## Overview
Extend the "Send to photographer" form on the public Gallery page to collect additional client information. Photographers can configure which fields are required through their profile settings.

## User Decisions Applied
- ✅ Field toggles in **photographer profile settings** (global for all catalogues)
- ✅ **Single full name** field (not first/last separately)
- ✅ **Structured address**: street, city, postal code, country
- ✅ **Phone input** with country code selector
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
  - `clientAddressCountry` (text)
- All fields required as a group when `collectClientAddress` is enabled

### 3. Client Phone
- Field: `clientPhoneNumber` (text)
- Format: International format with country code (e.g., +1 234 567 8900)
- UI: Phone input with country code selector
- Required when `collectClientPhone` is enabled

### 4. Additional Notes
- Field: `clientNotes` (text, textarea)
- Freeform text area
- Required when `collectClientNotes` is enabled

## Phase 1: Database Layer

### Files to Modify

1. **apps/api/src/common/db/schema/client-session.schema.ts**
   - Add new columns to clientSession table:
     - `clientName: text`
     - `clientAddressStreet: text`
     - `clientAddressCity: text`
     - `clientAddressPostalCode: text`
     - `clientAddressCountry: text`
     - `clientPhoneNumber: text`
     - `clientNotes: text`

2. **apps/api/src/common/db/schema/users.schema.ts**
   - Add toggle columns to user table:
     - `collectClientName: boolean` (default: false)
     - `collectClientAddress: boolean` (default: false)
     - `collectClientPhone: boolean` (default: false)
     - `collectClientNotes: boolean` (default: false)

### Command to Run
```bash
pnpm --filter @repo/api db:generate
```

## Phase 2: Backend Updates

### Files to Modify

1. **apps/api/src/public/dto/add-favourites-req.dto.ts**
   - Update `addFavouritesSchema` with new optional fields
   - Update `AddFavouritesReqDtoClass` with Swagger documentation

2. **apps/api/src/public/public.controller.ts**
   - Update public catalogue endpoint to include photographer's field configuration
   - Ensure new fields are passed through to service

3. **apps/api/src/client-sessions/client-sessions.service.ts**
   - Update `addFavourites` method to save new fields to database
   - Update queries to return new client information

4. **apps/api/src/client-sessions/dto/client-session-favourite.dto.ts**
   - Update `ClientSessionFavouritesResDto` to include new fields
   - Update response mapping to include new data

5. **apps/api/src/client-sessions/client-sessions.controller.ts**
   - Update endpoint to return new fields in response

6. **apps/api/src/users/dto/update-user.dto.ts**
   - Add toggle fields to update schema

7. **apps/api/src/users/users.service.ts**
   - Update profile update method to handle toggle fields

## Phase 3: Frontend Updates

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
   - Update `saveFavouritesSchema` with conditional validation based on settings
   - Add fields: clientName, clientAddress (object), clientPhoneNumber, clientNotes

4. **apps/web/src/features/gallery/components/favourites/SaveFavouritesModal.tsx**
   - Fetch photographer settings from catalogue data
   - Add conditional form fields:
     - Full name input (when collectClientName enabled)
     - Address fields: street, city, postal code, country (when collectClientAddress enabled)
     - Phone input with country code selector (when collectClientPhone enabled)
     - Notes textarea (when collectClientNotes enabled)
   - Update form submission to include new fields
   - Remove localStorage caching for new fields

5. **apps/web/src/features/gallery/pages/PublicCataloguePage.tsx**
   - Ensure photographer settings are available for the form

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

## Phase 4: Translations

### Files to Update

Add i18n keys to:
- `apps/web/src/locales/en/public.json`
- `apps/web/src/locales/sl/public.json`

### New Keys Needed

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
      "countryPlaceholder": "United States",
      "phoneLabel": "Phone Number",
      "notesLabel": "Additional Notes",
      "notesPlaceholder": "Any special requests or information..."
    }
  }
}
```

Profile settings translations:
```json
{
  "form": {
    "submissionFields": "Client Information Fields",
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

Gallery translations:
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

## Phase 5: SDK Regeneration & Testing

### Steps

1. Ensure API server is running to generate OpenAPI spec
2. Regenerate SDK:
   ```bash
   pnpm --filter @repo/sdk generate
   ```

3. Run tests:
   ```bash
   pnpm --filter @repo/api test
   ```

4. Run linting:
   ```bash
   pnpm lint
   ```

5. Format code:
   ```bash
   pnpm format
   ```

## Implementation Order

1. Database schema changes (with migration)
2. Backend DTOs and API updates
3. Frontend profile settings (toggles)
4. Frontend public gallery form
5. Frontend favourites modal display
6. Translations
7. SDK regeneration
8. Testing and linting

## Dependencies to Check

- Phone input component library (e.g., `react-phone-number-input` or `react-phone-input-2`)
- Country selector for address (if needed)

## Testing Checklist

- [ ] Migration runs successfully
- [ ] Profile settings save correctly
- [ ] Form fields show/hide based on settings
- [ ] Form validation works for required fields
- [ ] Data saves correctly to database
- [ ] Data displays correctly in favourites modal
- [ ] Phone number format is preserved
- [ ] Address displays in formatted layout
- [ ] All translations work
- [ ] SDK types are correct
- [ ] No TypeScript errors
- [ ] All tests pass
