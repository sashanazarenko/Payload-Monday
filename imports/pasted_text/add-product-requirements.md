UI/UX DESIGN REQUIREMENTS
Add New Product
Jolly Unified Product Catalogue — Admin Console
Version 1.0  ·  13 March 2026  ·  For design use




Contents
Contents	2
1. Flow Overview	5
The Add New Product flow is a 5-step wizard. Each step groups related fields logically. The user can navigate between steps freely — the system auto-saves a Draft at every change. A product can only be Activated once all required fields across all steps are valid.	5
1.1  Global UX Behaviours	5
The following behaviours apply across all 5 steps and must be reflected in every screen design:	5
2.1  Purpose	7
Step 1 establishes the identity of the product: what it is, who supplies it, how it is categorised, whether it is public-facing, and what type of product record it is (standard, custom/proposal-only, or bespoke). This data underpins all subsequent steps.	7
2.2  Field Specifications	7
2.3  Conditional Logic	9
2.4  Error States	9
3.1  Purpose	11
Step 2 captures the variant structure (colours, sizes, or styles) and the full pricing model: MOQ quantity tiers, per-unit base cost, decoration costs (set in Step 3 — linked here for reference), freight, rush fees, and the margin target and floor. This is the step Finance has the most visibility into.	11
3.2  Section A — Variants	11
Variants represent the purchasable options for a product (e.g. colour, size, or style). A product must have at least one variant to be activated.	11
3.3  Section B — MOQ Tiers & Base Cost	12
MOQ tiers define the quantity-based pricing structure. At least one tier is required. Tiers must be contiguous (no gaps in quantity ranges) and non-overlapping.	12
Tier table UX:	13
3.4  Section C — Margin, Freight & Additional Costs	13
Sell Price Preview Panel	14
Below the margin fields, show a live computed preview panel (read-only, styled distinctly from form fields):	14
4.1  Purpose	15
Step 3 captures all decoration information: which decoration methods are available for this product, the physical print/embroidery area dimensions, placement coordinates, colour limits, and which decorator suppliers handle each method. This data is critical for the Design team and the pricing engine.	15
4.2  Decoration Method Card Structure	15
Each decoration method is added as a card/section. Multiple methods can be added (e.g. Screen Print AND Embroidery). The first method added is automatically set as 'Preferred'. The Admin can reorder methods by drag-and-drop or by toggling the 'Preferred' flag.	15
4.3  Add / Remove Decoration Method	17
4.4  Decorator Compatibility Warning	17
5.1  Purpose	18
Step 4 collects all digital assets associated with the product: blank product images (required for quoting and mockups), lifestyle images, and per-decoration-method files (templates, dielines, spec sheets). Assets are stored in the catalogue and accessible from the product record by Sales and Design.	18
5.2  Section A — Product Images	18
5.3  Section B — Decoration Method Assets	18
For each decoration method added in Step 3, a corresponding asset section appears. The design team needs these files to start a brief without requesting files separately.	18
5.4  Asset Upload UX Requirements	19
6.1  Purpose	20
Step 5 is the final gate before a product enters the Active catalogue. It presents a structured summary of all data entered across steps 1–4, a completeness check, a validation report, and the two final actions: Activate (if all required fields pass) or Save as Draft.	20
6.2  Summary Panel Structure	20
The Review screen is a read-only summary — not a form. It is divided into collapsible sections mirroring the 5 steps, each with an edit shortcut:	20
6.3  Completeness & Validation Report	20
6.4  Final Action Buttons	21
6.5  Activation Confirmation Modal	21
Before activating, display a confirmation modal (not a full-page redirect):	21
7. Navigation & Page Chrome	22
7.1  Step Progress Indicator	22
The step progress indicator must be persistently visible throughout the entire flow. Recommended position: horizontal pill/step bar at the top of the main content area (below the top navigation bar), full width.	22
7.2  Persistent Top Status Bar	22
A thin status bar sits below the step progress indicator and above the form content. It contains three elements aligned left, centre, right:	22
7.3  Bottom Navigation Bar	22
A sticky bottom bar (fixed to viewport bottom, white bg with top border) persists throughout the flow:	23
8. Empty States & Edge Cases	24
9. Designer Checklist	26
Use this checklist to verify all states and variants are covered in the design output:	26
9.1  Screens Required	26
9.2  Component States Required	26
9.3  Accessibility Requirements	27
1. Flow Overview
The Add New Product flow is a 5-step wizard. Each step groups related fields logically. The user can navigate between steps freely — the system auto-saves a Draft at every change. A product can only be Activated once all required fields across all steps are valid.



1.1  Global UX Behaviours
The following behaviours apply across all 5 steps and must be reflected in every screen design:






2.1  Purpose
Step 1 establishes the identity of the product: what it is, who supplies it, how it is categorised, whether it is public-facing, and what type of product record it is (standard, custom/proposal-only, or bespoke). This data underpins all subsequent steps.

2.2  Field Specifications


2.3  Conditional Logic






2.4  Error States






3.1  Purpose
Step 2 captures the variant structure (colours, sizes, or styles) and the full pricing model: MOQ quantity tiers, per-unit base cost, decoration costs (set in Step 3 — linked here for reference), freight, rush fees, and the margin target and floor. This is the step Finance has the most visibility into.

3.2  Section A — Variants
Variants represent the purchasable options for a product (e.g. colour, size, or style). A product must have at least one variant to be activated.







3.3  Section B — MOQ Tiers & Base Cost
MOQ tiers define the quantity-based pricing structure. At least one tier is required. Tiers must be contiguous (no gaps in quantity ranges) and non-overlapping.



Tier table UX:
Display as an editable inline table, not a form stack — one row per tier
'+ Add tier' button below last row adds a new tier row
'✕' delete icon on each row (right-aligned) — first row cannot be deleted if it is the only tier
Tier gap / overlap warning: if tiers do not connect cleanly, show an amber inline warning between the affected rows: 'Gap between tiers — all quantities must be covered'

3.4  Section C — Margin, Freight & Additional Costs


Sell Price Preview Panel
Below the margin fields, show a live computed preview panel (read-only, styled distinctly from form fields):
Heading: 'Sell price preview — based on [qty] units, [decorator] method' (qty and decorator are selectable dropdowns in the preview panel)
Table rows: Base cost | + Decoration cost | + Freight | = Total landed cost | Margin (%) | → Sell price / unit
This panel updates in real time as the Admin changes any cost or margin field
If margin is below floor: panel background turns red-tinted and shows '⚠ Below margin floor' warning





4.1  Purpose
Step 3 captures all decoration information: which decoration methods are available for this product, the physical print/embroidery area dimensions, placement coordinates, colour limits, and which decorator suppliers handle each method. This data is critical for the Design team and the pricing engine.



4.2  Decoration Method Card Structure
Each decoration method is added as a card/section. Multiple methods can be added (e.g. Screen Print AND Embroidery). The first method added is automatically set as 'Preferred'. The Admin can reorder methods by drag-and-drop or by toggling the 'Preferred' flag.



4.3  Add / Remove Decoration Method
'+ Add decoration method' button below the last method card adds a new blank card
Remove icon (✕) on each card — appears on hover of the card header
Confirmation before removal if the method has been referenced in proposals: 'Removing this decoration method may affect open proposals. Confirm?'
Methods can be reordered via drag handle on the card (drag-and-drop). Reordering does not affect Preferred status.

4.4  Decorator Compatibility Warning






5.1  Purpose
Step 4 collects all digital assets associated with the product: blank product images (required for quoting and mockups), lifestyle images, and per-decoration-method files (templates, dielines, spec sheets). Assets are stored in the catalogue and accessible from the product record by Sales and Design.



5.2  Section A — Product Images


5.3  Section B — Decoration Method Assets
For each decoration method added in Step 3, a corresponding asset section appears. The design team needs these files to start a brief without requesting files separately.



5.4  Asset Upload UX Requirements
Drag-and-drop zone with a dashed border and a clear call-to-action: 'Drag files here or click to browse'
Progress indicator per file during upload (progress bar within the thumbnail slot)
On upload success: thumbnail appears with file name, size, and a ✕ remove icon
On upload failure: thumbnail slot shows red border with error message below: 'Upload failed — [reason]. Try again.' with a Retry button
Accepted file types and max size shown below each upload zone in grey caption text
Image thumbnails are reorderable via drag-and-drop
'View full size' opens image in a lightbox overlay (do not navigate away from the form)
For non-image files (AI, EPS, PDF): show a file type icon with file name and size — no thumbnail





6.1  Purpose
Step 5 is the final gate before a product enters the Active catalogue. It presents a structured summary of all data entered across steps 1–4, a completeness check, a validation report, and the two final actions: Activate (if all required fields pass) or Save as Draft.

6.2  Summary Panel Structure
The Review screen is a read-only summary — not a form. It is divided into collapsible sections mirroring the 5 steps, each with an edit shortcut:
Section 1: Core Details — Product name, supplier, SKU, category, source, type flags, description
Section 2: Variants & Pricing — Variant count, MOQ range, pricing tier summary, margin target, margin floor
Section 3: Decoration — Decoration method count, preferred method name, preferred decorator name, print area
Section 4: Assets — Image count, asset file count per decoration method
Each section header shows a status indicator: ✓ Complete (green) or ⚠ Incomplete (amber) or ✗ Missing required fields (red). An 'Edit' link on each section header navigates the user back to that step.

6.3  Completeness & Validation Report







6.4  Final Action Buttons


6.5  Activation Confirmation Modal
Before activating, display a confirmation modal (not a full-page redirect):
Title: 'Activate [Product Name]?'
Body: 'This product will become visible to all internal users in the catalogue and available for quoting. The website CMS feed will include it unless Non-public is enabled.'
If Non-public is ON: body adjusts to '… will be visible to internal users only. It will not appear on the public website.'
If Proposal-Only is ON: body adjusts to '… will be saved as Proposal-Only. It will not appear in standard catalogue searches but can be added to proposals.'
Buttons: 'Confirm Activation' (primary green) | 'Go back' (secondary)



7. Navigation & Page Chrome
7.1  Step Progress Indicator
The step progress indicator must be persistently visible throughout the entire flow. Recommended position: horizontal pill/step bar at the top of the main content area (below the top navigation bar), full width.



7.2  Persistent Top Status Bar
A thin status bar sits below the step progress indicator and above the form content. It contains three elements aligned left, centre, right:
Left: Product name (if entered) — 'Editing: Metro Tote Bag' — truncated at 40 chars. If no name yet: 'New product (unsaved)'
Centre: Completeness score — '9 of 14 required fields complete' — with a mini progress bar. Colour: red/amber/green by threshold.
Right: Save status — 'Saving…' (spinner) → 'Draft saved 12:34 PM' (green tick). Clicking opens a save history dropdown.

7.3  Bottom Navigation Bar
A sticky bottom bar (fixed to viewport bottom, white bg with top border) persists throughout the flow:
Left: '← Back to [Previous Step Name]' — ghost/text button. Hidden on Step 1.
Right: 'Save Draft' (secondary) + 'Continue to [Next Step Name] →' (primary). On Step 5: 'Save Draft' + 'Activate Product' (primary green).
'Continue' is always enabled — the system allows forward navigation even with incomplete data. A warning is shown if required fields in the current step are empty, but navigation is not blocked.



8. Empty States & Edge Cases




9. Designer Checklist
Use this checklist to verify all states and variants are covered in the design output:
9.1  Screens Required
Step 1 — Core Details (default / empty state)
Step 1 — Core Details (APPA pre-fill in progress — loading state)
Step 1 — Core Details (APPA pre-fill complete — fields populated, APPA chips visible)
Step 1 — Core Details (Source = Custom — Proposal-Only toggle locked ON, info banner)
Step 1 — Core Details (validation errors visible — at least 2 field errors shown)
Step 2 — Variants & Pricing (default — 2 variants, 3 MOQ tiers)
Step 2 — Variants & Pricing (sell price preview panel — all costs populated, margin above floor)
Step 2 — Variants & Pricing (sell price preview — margin below floor, red state)
Step 2 — Variants & Pricing (margin floor field — Ops role view: read-only locked)
Step 3 — Decoration (single method card — Screen Print, fully filled)
Step 3 — Decoration (two method cards — preferred + alternative, both expanded)
Step 3 — Decoration (decorator incompatibility warning visible)
Step 4 — Assets (empty state — no uploads yet)
Step 4 — Assets (uploads in progress — progress bars on thumbnails)
Step 4 — Assets (fully populated — images + files per decoration method)
Step 5 — Review (all complete — green, Activate button enabled)
Step 5 — Review (blocking errors — red panel, Activate button disabled)
Step 5 — Review (warnings only — amber panel, Activate button enabled)
Step 5 — Review (Proposal-Only product — 'Request promotion' CTA instead of Activate)
Activation confirmation modal
Unsaved changes / leave page modal
Success state — post-activation redirect to product detail

9.2  Component States Required
Step progress pill — 5 states: not started, in progress, complete, complete-with-warning, error
Completeness score bar — 3 colour states: red / amber / green
Auto-save status indicator — 3 states: saving, saved, error
APPA field chip — visible on pre-filled fields
MOQ tier table — empty (1 default row), populated (3 rows), gap warning state
Decoration method card — collapsed header, expanded form, preferred badge, alternative badge
Asset upload zone — empty, drag-over hover, uploading, complete, error
Read-only margin floor field (Ops role) — locked/grey styling
Decorator incompatibility amber warning inline

9.3  Accessibility Requirements
All form inputs have visible, associated labels (not placeholder-only labels)
Error messages are associated with their input via aria-describedby
Step progress indicator communicates current step to screen readers
Focus management: after clicking 'Continue', focus moves to the top of the new step content
Drag-and-drop upload zones have keyboard-accessible alternative (file browser button)
Colour is not the only means of conveying completeness status — icons and text labels accompany all colour indicators
Minimum touch target size: 44×44px for all interactive elements
Modals trap focus and return focus to trigger element on dismiss




Questions? Contact the Product Owner (Sasha Nazarenko). Reference the Jolly PRD Phase 1 for full system context.