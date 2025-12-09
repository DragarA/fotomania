     Overview

     Redesign the catalogue list page to emphasize cover photos with a cleaner, simpler card design. Move Edit/Manage actions to the catalogue detail page
     sidebar/header.

     User Requirements

     1. Catalogue Cards: Simplify to show only cover photo, title, description, and photo count
     2. Remove Buttons: Remove "View", "Edit", and "Manage" buttons from cards
     3. Card Navigation: Entire card should be clickable and link to catalogue detail page
     4. Move Actions: Move Edit and Manage options to the catalogue detail page sidebar/top bar

     Current State Analysis

     Catalogue List Page (apps/web/src/routes/catalogues/index.tsx)

     Current Card Structure (lines 46-115):
     - Cover image (48px height)
     - Title + "View" link
     - Last updated date
     - Description (3-line clamp)
     - Public URL link
     - Photo count
     - Footer with "Edit" and "Manage" buttons

     Current Card Issues:
     - Too much information displayed
     - Multiple navigation paths (View link, Edit button, Manage button)
     - Footer section takes up space
     - Cover image is too small (only 48px height)

     Catalogue Detail Page (apps/web/src/routes/catalogues/$catalogueId.index.tsx)

     Current Header/Sidebar (lines 210-221):
     - Sidebar with catalogue title, description, photo count
     - Collections list with "+ Add" button
     - No edit or manage actions currently

     Available Space for Actions:
     - Sidebar header area (lines 211-221)
     - Could add action buttons/dropdown menu

     ---
     Redesign Plan

     Part 1: Catalogue List Page Redesign

     File: apps/web/src/routes/catalogues/index.tsx

     New Card Design (lines 44-116):

     Visual Hierarchy:
     1. Large Cover Image: Increase from 48px to 200-240px height, make it visually dominant
     2. Title Overlay or Below Image: Display catalogue name prominently
     3. Metadata Below: Show description (2-line clamp) and photo count
     4. Remove All Buttons: No footer section, no inline links

     Card Structure:
     <Link
       to="/catalogues/$catalogueId"
       params={{ catalogueId: catalogue.id }}
       className="group block bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:shadow-lg hover:border-accent-300"
     >
       {/* Cover Image - Large and Prominent */}
       <div className="relative h-56 bg-gray-100">
         {catalogue.coverImage ? (
           <img
             src={`${baseUrl}/uploads/${catalogue.coverImage}`}
             alt={catalogue.title}
             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
           />
         ) : (
           <div className="w-full h-full flex items-center justify-center text-gray-400">
             <svg>...</svg> {/* Placeholder icon */}
           </div>
         )}
       </div>

       {/* Content Section */}
       <div className="p-5">
         <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-accent-600 transition-colors">
           {catalogue.title}
         </h2>

         <p className="text-gray-600 text-sm mb-3 line-clamp-2">
           {catalogue.description || 'No description provided.'}
         </p>

         <div className="flex items-center text-sm text-gray-500">
           <svg className="w-4 h-4 mr-1">...</svg> {/* Photo icon */}
           {catalogue.photoCount || 0} photos
         </div>
       </div>
     </Link>

     Key Changes:
     - Entire card is wrapped in <Link> component → clickable
     - Removed: "View" link, "Edit" button, "Manage" button, Public URL display, Last updated date, Footer section
     - Increased cover image height from 48px → 224px (h-56)
     - Added hover effects: shadow, scale on image, title color change
     - Simplified description to 2-line clamp
     - Cleaner photo count with icon

     Removed Elements:
     - Line 67-73: "View" text link → Removed
     - Line 63-65: Last updated date → Removed
     - Line 82-90: Public URL link → Removed (will move to detail page)
     - Line 99-114: Footer section with Edit/Manage buttons → Removed

     ---
     Part 2: Catalogue Detail Page Actions

     File: apps/web/src/routes/catalogues/$catalogueId.index.tsx

     Add Action Menu to Sidebar Header (after line 221):

     Option A: Button Group in Header
     <div className="p-6 border-b border-gray-200">
       <div className="flex items-start justify-between mb-2">
         <h1 className="text-2xl font-bold text-gray-900">
           {catalogue.title}
         </h1>
         {/* Action Dropdown */}
         <button className="text-gray-600 hover:text-gray-900">
           <svg>...</svg> {/* Three-dot menu icon */}
         </button>
       </div>

       {catalogue.description && (
         <p className="text-gray-600 text-sm mb-4">{catalogue.description}</p>
       )}

       {/* Action Buttons */}
       <div className="flex gap-2 mb-4">
         <Link
           to="/catalogues/$catalogueId/edit"
           params={{ catalogueId }}
           className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
         >
           Edit Details
         </Link>
         <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
           Share
         </button>
       </div>

       {/* Public URL Section */}
       <div className="bg-gray-50 rounded-lg p-3 mb-4">
         <div className="text-xs text-gray-500 mb-1">Public URL</div>
         <div className="flex items-center gap-2">
           <Link
             to="/c/$slug"
             params={{ slug: catalogue.publicUrlSlug }}
             className="text-sm text-accent-600 hover:text-accent-700 truncate"
           >
             /c/{catalogue.publicUrlSlug}
           </Link>
           <button className="text-gray-500 hover:text-gray-700">
             <svg>...</svg> {/* Copy icon */}
           </button>
         </div>
       </div>

       <div className="text-sm text-gray-500">
         {catalogue.photoCount} photos
       </div>
     </div>

     Option B: Dropdown Menu
     Add a dropdown menu button in the header that shows:
     - Edit Details
     - View Public Page
     - Copy Public Link
     - Delete Catalogue (with confirmation)

     Recommended: Option A (Button Group) for better discoverability

     ---
     Implementation Steps

     Step 1: Update Catalogue List Page

     File: apps/web/src/routes/catalogues/index.tsx

     1. Wrap each card in Link component (line 45)
       - Change <div key={catalogue.id}> to <Link to="/catalogues/$catalogueId" params={{...}}>
       - Move all card classes to Link component
       - Add hover effects: hover:shadow-lg hover:border-accent-300
     2. Redesign cover image section (lines 50-56)
       - Increase height from h-48 to h-56 (224px)
       - Add container with relative positioning
       - Add placeholder for catalogues without cover image
       - Add image hover scale effect: group-hover:scale-105 transition-transform duration-200
     3. Simplify content section (lines 57-97)
       - Remove "View" link (line 67-73)
       - Remove last updated date (line 63-65)
       - Change title to include hover color: group-hover:text-accent-600 transition-colors
       - Update description clamp from line-clamp-3 to line-clamp-2
       - Remove Public URL section (lines 82-90)
       - Simplify photo count with icon (lines 94-97)
     4. Remove footer section (lines 99-114)
       - Delete entire footer div with Edit/Manage buttons
     5. Add group class to Link
       - Enables group-hover: pseudo-classes for nested elements

     Step 2: Update Catalogue Detail Page Sidebar

     File: apps/web/src/routes/catalogues/$catalogueId.index.tsx

     1. Add action buttons after description (after line 217)
       - Add "Edit Details" button linking to edit page
       - Add "Share" button (optional, for future sharing features)
       - Use flexbox layout with gap
     2. Add Public URL section (after action buttons)
       - Display public URL in a highlighted box (bg-gray-50)
       - Add copy-to-clipboard button
       - Make URL a clickable link to public page
     3. Reorganize sidebar header
       - Title at top
       - Description below
       - Action buttons
       - Public URL box
       - Photo count at bottom
     4. Optional: Add dropdown menu
       - Three-dot menu icon in top-right of sidebar header
       - Dropdown with additional actions (if needed)

     Step 3: Add Copy to Clipboard Functionality

     Create helper function:
     const copyToClipboard = async (text: string) => {
       try {
         await navigator.clipboard.writeText(text);
         toast.success('Copied to clipboard');
       } catch (err) {
         toast.error('Failed to copy');
       }
     };

     Wire up to copy button:
     <button
       onClick={() => copyToClipboard(`${window.location.origin}/c/${catalogue.publicUrlSlug}`)}
       className="text-gray-500 hover:text-gray-700"
     >
       {/* Copy icon */}
     </button>

     Step 4: Update Styles and Transitions

     1. Card hover effects:
       - Shadow lift: hover:shadow-lg
       - Border highlight: hover:border-accent-300
       - Image zoom: group-hover:scale-105 transition-transform
       - Title color: group-hover:text-accent-600
     2. Image placeholder (for catalogues without cover):
       - Gray background with centered icon
       - Camera or image icon
       - Subtle styling to indicate no image
     3. Responsive adjustments:
       - Grid already responsive: grid-cols-1 md:grid-cols-2
       - Ensure card works well on mobile

     ---
     Visual Design Mockup

     Before (Current):

     ┌─────────────────────────────┐
     │ [Small Cover - 48px]        │
     ├─────────────────────────────┤
     │ Title               [View]  │
     │ Updated: Jan 1, 2024        │
     │ Description...              │
     │ URL: /c/slug                │
     │ Photos: 25                  │
     ├─────────────────────────────┤
     │         [Edit] [Manage]     │
     └─────────────────────────────┘

     After (New):

     ┌─────────────────────────────┐
     │                             │
     │    [Large Cover - 224px]    │
     │         (clickable)         │
     │                             │
     ├─────────────────────────────┤
     │ Title                       │
     │ Description (2 lines)...    │
     │ 📷 25 photos                │
     └─────────────────────────────┘
            ↓ (hover: shadow + scale)

     Detail Page Sidebar Addition:

     ┌──────────────────────┐
     │ Title           [⋮]  │
     │ Description          │
     │ ┌──────────────────┐ │
     │ │ Edit │ Share     │ │
     │ └──────────────────┘ │
     │ ┌──────────────────┐ │
     │ │ 🔗 /c/slug  [📋] │ │
     │ └──────────────────┘ │
     │ 📷 25 photos         │
     └──────────────────────┘

     ---
     Files to Modify

     Primary Changes

     1. apps/web/src/routes/catalogues/index.tsx - Complete card redesign
       - Lines 44-116: Card structure overhaul
       - Remove buttons, simplify content, enlarge cover image
     2. apps/web/src/routes/catalogues/$catalogueId.index.tsx - Add sidebar actions
       - Lines 211-221: Enhance sidebar header with action buttons and public URL

     No Backend Changes Required

     - All changes are frontend-only
     - Using existing data and routes
     - No API modifications needed

     ---
     Key Design Decisions

     1. Entire card is clickable: Better UX, follows card pattern conventions
     2. Emphasize cover image: Increase from 48px → 224px for visual impact
     3. Simplify card content: Remove clutter (dates, URLs, multiple buttons)
     4. 2-line description: Down from 3 lines for better proportion with larger image
     5. Move actions to detail page: Cleaner cards, actions in context where they're used
     6. Public URL in detail page: Better placement for copy/share functionality
     7. Hover effects: Visual feedback for clickability (shadow, scale, color)

     ---
     Edge Cases Handled

     1. No cover image: Show placeholder with icon and gray background
     2. No description: Display "No description provided." in gray
     3. Zero photos: Display "0 photos" correctly
     4. Long titles: Text wraps naturally, no truncation needed for single line
     5. Long descriptions: Clamped to 2 lines with ellipsis
     6. Mobile view: Cards stack to single column, maintain proportions

     ---
     Testing Checklist

     1. Catalogue List Page:
       - Cards display with large cover images
       - Entire card is clickable and navigates to detail page
       - Hover effects work (shadow, image scale, title color)
       - No cover image shows placeholder
       - Photo count displays correctly
       - Description clamps to 2 lines
     2. Catalogue Detail Page:
       - "Edit Details" button links to edit page
       - Public URL displays correctly
       - Copy button copies full URL to clipboard
       - Photo count matches catalogue data
       - Actions are accessible and visible
     3. Responsive Behavior:
       - Mobile: Single column layout
       - Desktop: Two-column grid
       - Card proportions work on all screen sizes