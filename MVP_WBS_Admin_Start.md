# Sales Product Search Prototype - MVP WBS (Admin-First)

## 1) MVP framing

**Start point for MVP:** `Admin` view and admin-owned workflows.  
**Goal:** Deliver an operational catalogue management MVP that allows admins to manage products, storefront visibility, decorators, APPA sync conflicts, pricing governance, and sales proposal support from a single system.

This WBS is built from the prototype scope already implemented in screens/routes and is intended for engineering handoff.

---

## 2) Scope map (prototype-aligned)

### In MVP scope (implemented in prototype)

- Product catalogue with filters, pagination, selection, and bulk actions
- Admin dashboard with catalogue health, incomplete products, and quick actions
- Product detail with:
  - Listing Management (storefront visibility controls)
  - Readiness checks and publish gating
  - Decoration, pricing tiers, assets, notes
- Add New Product 5-step wizard
- Decorator Matrix (list, filters, drawer detail, pricing matrix access, review cadence)
- APPA Sync dashboard (sync status, conflicts triage, bulk conflict resolution)
- Pricing Rules (margin floors, at-risk products, audit log)
- Price Curve template management in settings
- Proposal workspace support (list + builder) for sales operations integrated with margin rules
- Role-based navigation and behavior toggles (Admin / Sales / Finance / Product)
- User management (admin-controlled users, roles, status lifecycle, and access governance)

### Out of MVP scope (present as placeholders)

- Routes currently resolving to under-construction pages (for example: `/users`, `/margin-audit`, `/reports`, `/quotes`)
- Deep backend integration, permissions service, and production-grade notification pipelines (prototype-level interaction only)

---

## 3) MVP Feature WBS Table (detailed, one feature per row)


| WBS ID | Feature                                       | User Story (correct format)                                                                                                                   | Detailed Functional Description                                                                                                                                                                                                                    | Acceptance Criteria                                                                                                                                    | Priority |
| ------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 2.1    | Admin Dashboard: Catalogue Health             | As an Admin, I want to see a single catalogue health overview so that I can prioritize remediation work quickly.                              | Show health score hero, KPI cards, incomplete counts by type, and direct links to corrective workflows. Include activity feed and side widgets for lifecycle/category distribution and pending pricing reviews.                                    | Dashboard loads with all KPI blocks; counts are consistent with product data source; links route correctly to target modules.                          | Must     |
| 2.2    | Admin Dashboard: Incomplete Products Worklist | As an Admin, I want a focused incomplete products table so that I can resolve missing critical data before it impacts quoting/production.     | Table supports tabs by missing type (all/decoration/images/pricing/assets), row selection, select-all, and bulk assignment UX. Include pagination controls and persistent selected count behavior per filter view.                                 | Tab counts update by filter; row and select-all states are accurate; assignment action can be triggered for selected rows; pagination state is stable. | Must     |
| 2.3    | Admin Dashboard: Quick Actions                | As an Admin, I want one-click access to key operations so that I can move from monitoring to action without extra navigation.                 | Provide quick action buttons for Add Product, Bulk Import, Manage Decorators, Run APPA Sync. Buttons must deep-link to correct routes and preserve role context.                                                                                   | Every quick action opens expected page; no broken routes; role-restricted actions are hidden/disabled where needed.                                    | Should   |
| 3.1    | Product Catalogue: Search/Filter/Pagination   | As an Admin, I want to filter and browse catalogue products efficiently so that I can find target products in large datasets.                 | Build catalogue view with filter sidebar + top controls + paginated result grid. Pagination resets when filter changes. Support selected rows tracking only for Admin role.                                                                        | Filtered result count matches visible records; pagination works across pages; role-switch clears stale selections.                                     | Must     |
| 3.2    | Product Catalogue: Bulk Publish/Unpublish     | As an Admin, I want to publish or hide multiple products at once so that I can manage storefront visibility at scale.                         | Floating bulk bar appears when selections exist. Publish action validates each selected product against required storefront fields; valid items publish, invalid items are skipped and listed in summary modal. Unpublish applies to all selected. | Confirmation modal shows valid vs invalid counts; publish updates only eligible products; toast confirmation displays action result.                   | Must     |
| 3.3    | Product Detail: Listing Management Panel      | As an Admin, I want to control product storefront status from product detail so that I can decide what customers can view.                    | Include visibility state card, Yes/No toggle, explicit save action, and saved feedback state. Header-level quick toggle should stay in sync with panel state.                                                                                      | Toggling visibility updates product state only after save; saved state rehydrates correctly on reload/navigation.                                      | Must     |
| 3.4    | Product Detail: Publish Gating                | As an Admin, I want publishing blocked when mandatory fields are missing so that incomplete products are not exposed publicly.                | If user attempts publish when required fields are missing, show missing-fields panel with actionable items. Each missing item links user to relevant tab/section to fix data.                                                                      | Publish is blocked until requirements pass; panel shows accurate missing fields; clicking action moves user to correct tab.                            | Must     |
| 3.5    | Product Detail: Product Information Workspace | As an Admin, I want full product context in one place so that I can update commercial and production details without switching screens.       | Support image gallery, variant selection, and tabbed sections: Decoration Specs, Pricing, Design Assets, Product Notes. Include role-aware edit restrictions for pricing fields.                                                                   | Tabs render correct data; variant switching updates contextual info; users without edit rights see read-only state messaging.                          | Must     |
| 3.6    | Product Detail: Readiness Widgets             | As an Admin, I want storefront and production readiness indicators so that I can judge launch readiness instantly.                            | Compute readiness counts per checklist domain and show incomplete items as actionable links. Readiness should update as product fields change.                                                                                                     | Counts are accurate and reactive; incomplete-item actions navigate to relevant correction area.                                                        | Must     |
| 4.1    | New Product Wizard: Step Framework            | As an Admin, I want a guided multi-step creation flow so that complex product setup is manageable and less error-prone.                       | Implement 5-step wizard with step status pills (not started/in progress/complete/warning/error), autosave status, completeness meter, and back/continue controls.                                                                                  | Step navigation works in both directions; autosave status changes correctly; progress meter reflects required field completion.                        | Must     |
| 4.2    | New Product Wizard: Core Details              | As an Admin, I want to capture core product identity first so that downstream pricing/decorator decisions are based on valid metadata.        | Collect product name, supplier, category, source type, and initial visibility defaults. Validate required fields and clear field-level errors on edit.                                                                                             | Required fields enforce validation; update clears relevant errors; draft stores entered values.                                                        | Must     |
| 4.3    | New Product Wizard: Decoration                | As an Admin, I want to define decoration method and supplier early so that pricing and production planning are initialized correctly.         | Select primary decoration setup and method-specific settings used by pricing tiers and production rules.                                                                                                                                           | Decoration selection persists to next steps; downstream step defaults reflect chosen decoration method.                                                | Must     |
| 4.4    | New Product Wizard: Variants & Pricing        | As an Admin/Finance, I want to define pricing tiers and variants so that sell prices can be generated reliably.                               | Manage pricing tiers (add/remove/edit), MOQ behavior, below-MOQ surcharge options, and validation of numeric ranges/continuity. Enforce role-based edit permissions.                                                                               | Tier operations are valid (no broken table state); save feedback works; non-authorized roles cannot edit restricted inputs.                            | Must     |
| 4.5    | New Product Wizard: Assets                    | As an Admin, I want to upload product and production assets so that sales and operations have required files available.                       | Add asset upload/attachment step for imagery/spec files/templates; distinguish optional vs required assets for activation logic.                                                                                                                   | Assets are attachable/removable; required asset rule is reflected in validation report if configured.                                                  | Should   |
| 4.6    | New Product Wizard: Review & Activation       | As an Admin, I want a final validation checkpoint so that only complete products are activated.                                               | Review step aggregates validation report, supports jump-back edits to failed steps, and gates activation. Activation modal confirms action, then success state redirects.                                                                          | Activation button disabled when canActivate is false; confirm flow activates and redirects; success message appears.                                   | Must     |
| 5.1    | Decorator Matrix: Directory & Filters         | As an Admin, I want a searchable decorator directory so that I can manage supplier performance and availability.                              | Provide KPI header, search, status/method/state filters, sortable columns, and row status styling. Include APPA/manual source badges and review due indicators.                                                                                    | Filtering and sorting produce correct result sets; visual statuses match data states; KPIs match underlying list.                                      | Must     |
| 5.2    | Decorator Matrix: Add/Edit Entry Points       | As an Admin, I want quick actions on decorators so that I can maintain records without leaving context.                                       | Add Decorator modal plus row action menu (view, pricing, edit, duplicate, suspend/reactivate).                                                                                                                                                     | All actions are reachable; modal creates record; row actions trigger expected behavior.                                                                | Should   |
| 5.3    | Decorator Drawer: Profile Tab                 | As an Admin, I want full operational decorator details so that I can decide supplier usage confidently.                                       | Drawer shows contact details, capabilities, categories, performance metrics, notes, and status badges in a compact profile panel.                                                                                                                  | Drawer opens from selected row; data fields render correctly; close/return behavior is stable.                                                         | Must     |
| 5.4    | Decorator Drawer: Pricing Matrix Tab          | As an Admin, I want to inspect and edit decorator pricing matrix so that product pricing calculations stay current.                           | Pricing tab loads matrix by decorator, supports edit flow, and marks APPA-synced sources where manual edits may be constrained/overwritten.                                                                                                        | Matrix loads for mapped decorators; updates are saved; APPA-synced decorators show source warning state.                                               | Must     |
| 5.5    | Decorator Review Cadence                      | As an Admin, I want to manage review frequency for manual decorators so that stale pricing is proactively surfaced.                           | Configure review frequency and last-reviewed date, calculate next due date, and display due/overdue state badges for dashboard and list views.                                                                                                     | Saving review metadata updates due status immediately; overdue/due-soon counts are accurate.                                                           | Should   |
| 6.1    | APPA Sync Dashboard: Monitoring               | As an Admin, I want APPA sync observability so that I can detect integration health issues quickly.                                           | Show last sync status, products updated, unresolved conflicts, discontinued counts, sync history chart/table, and coverage breakdown by source type.                                                                                               | Summary cards and charts render with coherent data; manual sync trigger updates syncing state/feedback.                                                | Must     |
| 6.2    | APPA Conflicts: Row-Level Decisioning         | As an Admin, I want to resolve APPA conflicts per record so that trusted values are applied intentionally.                                    | Conflict table with field-level comparison (catalogue vs APPA), tab filters by conflict type, and actions: Accept APPA or Keep Catalogue.                                                                                                          | Resolving a row removes it from unresolved list; tab counts update in real time.                                                                       | Must     |
| 6.3    | APPA Conflicts: Bulk Decisioning              | As an Admin, I want to apply decisions to many conflicts at once so that triage time is reduced.                                              | Support multi-select + select-all within active tab and bulk actions for accept-all/dismiss-all.                                                                                                                                                   | Bulk actions apply only selected rows; selection state resets after completion; counts reconcile.                                                      | Must     |
| 6.4    | APPA Conflict Auditability                    | As an Admin, I want conflict resolution history so that changes are traceable for governance and troubleshooting.                             | Persist actor, timestamp, conflict type, previous value, chosen value, and reason/source; expose this in audit logs/reporting layer.                                                                                                               | Each resolved conflict has complete audit metadata; audit entries can be queried/exported.                                                             | Should   |
| 7.1    | Pricing Rules: Category Policy Table          | As Finance/Admin, I want category-level floor/target controls so that margin policy is centrally enforced.                                    | Display margin floors and targets by category with product volume and at-risk counts; include edit controls and last-changed provenance.                                                                                                           | Updates persist and reflect in all dependent workflows; table totals and risk counts are accurate.                                                     | Must     |
| 7.2    | Pricing Rules: At-Risk Product Workbench      | As Finance/Admin, I want a list of products at or below margin floor so that I can remediate profitability risk quickly.                      | Show risk-severity rows, trigger context (e.g., APPA cost increase), and inline repricing panel with live margin/sell preview before save.                                                                                                         | Repricing updates affected row status; below-floor products can be lifted above threshold and removed from urgent queue.                               | Must     |
| 7.3    | Pricing Rules: Audit Log                      | As Finance/Admin, I want a full pricing change log so that policy changes and automatic sync impacts are transparent.                         | Log field changed, old/new values, target entity, actor/system source, timestamp; support pagination and export.                                                                                                                                   | Audit rows include complete metadata; export contains visible and historical entries.                                                                  | Must     |
| 7.4    | Price Curve Templates: Editor                 | As an Admin, I want reusable price curve templates so that new product setup is faster and consistent.                                        | Template editor supports tier creation/edit/delete, validation warnings (gaps/overlaps), mini chart preview, and dirty/save state indicators.                                                                                                      | Template saves only valid structures; warning states are visible; preview updates with edits.                                                          | Should   |
| 7.5    | Price Curve Templates: Lifecycle              | As an Admin, I want to duplicate/delete/set-default templates so that I can manage pricing standards over time.                               | Include guarded delete flow, set-default action, and read-only behavior for non-admin roles. Ensure default template always exists.                                                                                                                | Cannot delete last/default without fallback; default assignment is unique; non-admin cannot modify templates.                                          | Should   |
| 7.6    | Margin Enforcement Engine                     | As Finance/Admin, I want floor enforcement in product and proposal flows so that no non-compliant pricing is sent to clients unintentionally. | Evaluate margin at line-item and aggregate levels; block send/publish where policy requires; optionally route to finance approval state.                                                                                                           | Violating items trigger clear warnings; send/publish gating behaves according to policy rules.                                                         | Must     |
| 8.1    | Proposal List Workspace                       | As Sales/Admin, I want a proposal pipeline view so that I can track status, urgency, and next actions.                                        | Show proposal KPIs, searchable/filterable table, due-soon/overdue signals, status badges, and status-driven secondary actions.                                                                                                                     | Filtering/search is accurate; due-state indicators reflect dates; row actions map to status configuration.                                             | Should   |
| 8.2    | Proposal Builder: Line Item Composer          | As Sales/Admin, I want to build and edit proposal line items so that I can create accurate client-ready quotes.                               | Editable line-item table for variant, qty, decoration, margin, unit cost components, sell price, and totals; duplicate/delete row actions included.                                                                                                | Price and total calculations update immediately after edits; duplicate/delete operations maintain table integrity.                                     | Should   |
| 8.3    | Proposal Builder: Product Search Slide-Over   | As Sales/Admin, I want to quickly add products from catalogue to proposal so that quote building is fast.                                     | Slide-over search supports query + category filtering, displays source badges (APPA/manual/proposal-only), and inserts selected items with default config.                                                                                         | Added product appears as new line item with editable defaults; search filters produce correct product list.                                            | Should   |
| 8.4    | Proposal Builder: Notes & Attachments         | As Sales/Admin, I want separate internal and client-facing notes so that communication is controlled and professional.                        | Internal notes remain internal-only; client notes appear in proposal output. Attachments section supports add/remove for proposal artifacts.                                                                                                       | Internal notes are not exposed in client output; attachment list updates on add/remove actions.                                                        | Could    |
| 8.5    | Proposal Builder: Send Controls & Approval    | As Sales/Admin, I want send controls to be policy-aware so that non-compliant proposals are escalated instead of sent.                        | Send button disabled when margin violations exist; show explicit reason tooltip/banner and allow request-for-approval workflow.                                                                                                                    | Send is blocked for violating proposals; approval action is available when required; compliant proposals can be sent.                                  | Must     |
| 9.1    | Role Permission Matrix                        | As a System Admin, I want explicit role capability definitions so that UI behavior and backend authorization remain aligned.                  | Define and enforce CRUD/action permissions for Admin, Finance, Sales, Product across all major modules and controls.                                                                                                                               | Permission matrix is documented and implemented; unauthorized actions are blocked at UI and API levels.                                                | Must     |
| 9.2    | UI Authorization Guardrails                   | As any user, I want clear feedback for inaccessible features so that I understand what I can/cannot do.                                       | Hide or disable restricted actions; present read-only banners/tooltips; route unknown/unavailable pages to controlled fallback page.                                                                                                               | No dead-end unauthorized action paths; fallback page consistently handles unsupported routes.                                                          | Must     |
| 9.3    | User Management: User Directory               | As an Admin, I want a complete user list so that I can manage access to the platform.                                                        | Provide users table with search/filter by role and status, showing name, email, role, status, last login, and created date. Include pagination and sortable columns.                                                                                | User list loads with role/status filters; search works by name/email; row data reflects source of truth.                                              | Must     |
| 9.4    | User Management: Invite User                  | As an Admin, I want to invite new users so that teams can access the platform with the right role from day one.                               | Invite flow captures email, role, and optional team/notes. System sends invite token/link and marks user as `invited` until activation. Prevent duplicate active invites for same email.                                                            | Invite validates required fields; invite email is issued; invited user appears in list with `invited` status.                                         | Must     |
| 9.5    | User Management: Edit Role & Profile Access   | As an Admin, I want to update user roles so that permissions stay aligned with organizational changes.                                        | Admin can change role for existing users (Admin/Finance/Sales/Product), with confirmation and audit logging. Include safeguards for high-impact role changes.                                                                                      | Role changes take effect immediately on next auth refresh; all changes are logged with actor/time/old/new role.                                       | Must     |
| 9.6    | User Management: Deactivate/Reactivate User   | As an Admin, I want to deactivate users without deleting history so that access can be revoked safely.                                        | Support status lifecycle `active`, `inactive`, `invited`, and optional `locked`. Deactivation blocks login and API access but keeps user ownership/audit history intact; reactivation restores access.                                              | Inactive users cannot authenticate; historical records remain attributed; reactivation restores prior role.                                            | Must     |
| 9.7    | User Management: Password & Security Controls | As an Admin, I want account security controls so that compromised or stale accounts can be remediated quickly.                                | Provide actions for reset-password trigger, force sign-out from active sessions, and optional login lock/unlock. Expose security event history per user.                                                                                           | Security actions execute successfully; user receives notifications where applicable; actions are auditable.                                            | Should   |
| 9.8    | User Management: Access Audit Log             | As an Admin/Auditor, I want user-access and permission change logs so that compliance and incident investigations are supported.              | Store and display auth-related events: invite sent/accepted, login attempts, role changes, deactivate/reactivate, security actions. Filter by user/date/action and support export.                                                                  | All access events are queryable and exportable; audit records are immutable and timestamped.                                                           | Should   |
| 10.1   | QA: Core Regression Pack                      | As QA, I want stable regression coverage so that high-risk behaviors do not break release-to-release.                                         | Cover route smoke tests and critical path scenarios: publish gating, margin enforcement, APPA conflict flows, wizard activation.                                                                                                                   | Test suite passes in staging; critical path defects are blocked from release.                                                                          | Must     |
| 10.2   | UAT: Role-Based Scenario Testing              | As business stakeholders, I want role-based UAT scripts so that signoff reflects real operational workflows.                                  | Create Admin/Finance/Sales UAT packs with expected outcomes and evidence checkpoints.                                                                                                                                                              | UAT checklist completed with signoff; unresolved Sev-1/Sev-2 defects are zero at release gate.                                                         | Must     |
| 10.3   | Release & Monitoring                          | As operations team, I want controlled rollout and monitoring so that we can detect and recover from production issues quickly.                | Use phased release, release notes, rollback plan, and post-launch metrics for sync health, publish actions, conflict backlog, and margin exceptions.                                                                                               | Rollout checklist completed; monitoring dashboards active; rollback procedure validated.                                                               | Must     |


---

## 4) Recommended delivery sequence (phased)

- **Phase 1 (Admin Core):** WBS 1, 2, 3
- **Phase 2 (Product Authoring + Decorators):** WBS 4, 5
- **Phase 3 (Data Integrity & Pricing Control):** WBS 6, 7
- **Phase 4 (Sales Proposal Enablement + Hardening):** WBS 8, 9, 10

---

## 4A) Complete User Story Inventory (full list)

### A. Shared platform and navigation

- **US-001** As a user, I want role-based navigation so that I only see modules relevant to my responsibilities.
- **US-002** As a user, I want the role switcher to update the UI immediately so that I can preview or test role-specific experiences.
- **US-003** As a user, I want consistent page shell/layout so that moving between modules feels predictable.
- **US-004** As a user, I want fallback handling for unavailable routes so that I never hit a broken page.
- **US-005** As a user, I want clear read-only indicators on restricted screens so that I understand why an action is disabled.

### B. Admin dashboard

- **US-006** As an Admin, I want a catalogue health score so that I can track overall data quality at a glance.
- **US-007** As an Admin, I want KPI cards for active, pending, and APPA conflicts so that I can prioritize urgent actions.
- **US-008** As an Admin, I want tabbed incomplete-product queues so that I can work by issue type.
- **US-009** As an Admin, I want row selection in incomplete queues so that I can assign or triage in bulk.
- **US-010** As an Admin, I want quick links from KPI cards to detailed modules so that I can remediate faster.
- **US-011** As an Admin, I want recent activity history so that I can see who changed key data.
- **US-012** As an Admin, I want pricing review alerts so that manual decorator pricing stays current.
- **US-013** As an Admin, I want quick actions (add product, decorators, APPA sync) so that I can execute tasks in one click.

### C. Product catalogue

- **US-014** As an Admin, I want sidebar filters so that I can narrow products quickly.
- **US-015** As an Admin, I want paginated product results so that performance and scanning stay manageable.
- **US-016** As an Admin, I want select-all-on-page behavior so that bulk operations are efficient.
- **US-017** As an Admin, I want floating bulk action controls so that selected-item actions are always accessible.
- **US-018** As an Admin, I want bulk publish with validation so that only storefront-ready products are published.
- **US-019** As an Admin, I want bulk unpublish so that I can hide many products instantly when needed.
- **US-020** As an Admin, I want a publish summary modal so that I can see what was published vs skipped and why.
- **US-021** As an Admin, I want toast confirmations after bulk actions so that I get immediate feedback.

### D. Product detail and listing management

- **US-022** As an Admin, I want product breadcrumbs so that I can navigate back to category/list context.
- **US-023** As an Admin, I want storefront status visible on the product page so that I can verify public visibility.
- **US-024** As an Admin, I want to toggle storefront visibility and save so that publishing is deliberate and auditable.
- **US-025** As an Admin, I want publish blocked when required fields are missing so that incomplete products are not exposed.
- **US-026** As an Admin, I want missing-field guidance with direct links so that I can fix issues without searching.
- **US-027** As an Admin, I want storefront and production readiness counters so that I know launch readiness.
- **US-028** As a user, I want product tabs (specs/pricing/assets/notes) so that all product data is organized.
- **US-029** As a user, I want variant selection and image thumbnails so that I can verify item specifics quickly.
- **US-030** As a Finance/Admin user, I want pricing tier editing controls so that product costs stay accurate.
- **US-031** As a non-authorized role, I want pricing shown read-only so that permissions are enforced clearly.

### E. New product wizard

- **US-032** As an Admin, I want a 5-step wizard so that product creation is guided and complete.
- **US-033** As an Admin, I want step status indicators so that I can see progress and issues per step.
- **US-034** As an Admin, I want autosave while editing so that draft work is not lost.
- **US-035** As an Admin, I want a completeness meter so that I know how close the product is to activation.
- **US-036** As an Admin, I want to edit core details (name/supplier/category/source) so that identity fields are correct.
- **US-037** As an Admin, I want to define decoration setup so that production and pricing defaults are valid.
- **US-038** As an Admin/Finance user, I want to configure variants and pricing tiers so that quote pricing is reliable.
- **US-039** As an Admin, I want to attach assets so that sales and production files are stored with the product.
- **US-040** As an Admin, I want final validation before activation so that invalid products cannot go live.
- **US-041** As an Admin, I want activation confirmation and success feedback so that I can trust activation outcome.
- **US-042** As an Admin, I want to save draft at any point so that I can pause and resume product setup.

### F. Decorator matrix and drawer

- **US-043** As an Admin, I want a searchable/sortable decorator matrix so that I can manage suppliers at scale.
- **US-044** As an Admin, I want status, method, and geography filters so that I can target specific decorators.
- **US-045** As an Admin, I want source badges (APPA/manual) so that I know where pricing data comes from.
- **US-046** As an Admin, I want KPI cards for decorator operations so that I can monitor supplier landscape health.
- **US-047** As an Admin, I want row action menus so that I can access edit/duplicate/suspend actions quickly.
- **US-048** As an Admin, I want an Add Decorator modal so that I can onboard new suppliers.
- **US-049** As an Admin, I want a decorator profile drawer so that details are available without route changes.
- **US-050** As an Admin, I want a decorator pricing matrix tab so that supplier pricing can be maintained centrally.
- **US-051** As an Admin, I want pricing review cadence controls so that manual rates are reviewed on schedule.
- **US-052** As an Admin, I want due/overdue review labels so that at-risk pricing gets prioritized.

### G. APPA sync and conflicts

- **US-053** As an Admin, I want APPA sync status cards so that integration health is visible.
- **US-054** As an Admin, I want manual sync trigger so that I can rerun sync when urgent updates are needed.
- **US-055** As an Admin, I want conflict tabs by type so that I can triage issues systematically.
- **US-056** As an Admin, I want row-level accept/keep actions so that conflict decisions are explicit.
- **US-057** As an Admin, I want bulk conflict actions so that high-volume conflicts can be resolved quickly.
- **US-058** As an Admin, I want resolved conflicts removed from active queue so that queue reflects true outstanding work.
- **US-059** As an Admin, I want sync history and coverage breakdown so that data source health is trackable over time.
- **US-060** As governance owner, I want conflict decisions audited so that change provenance is preserved.

### H. Pricing governance and templates

- **US-061** As Finance/Admin, I want category margin floors and targets so that pricing policy is centrally controlled.
- **US-062** As Finance/Admin, I want at-risk product detection so that low-margin items are remediated before quoting.
- **US-063** As Finance/Admin, I want inline repricing for at-risk items so that I can resolve issues without leaving context.
- **US-064** As Finance/Admin, I want preview calculations before saving repricing so that decisions are informed.
- **US-065** As Finance/Admin, I want pricing audit logs so that all pricing changes are transparent and reviewable.
- **US-066** As an Admin, I want to export pricing audit data so that reporting/compliance workflows are supported.
- **US-067** As an Admin, I want reusable price curve templates so that new product setup is consistent.
- **US-068** As an Admin, I want template validation warnings (gaps/overlaps) so that tier structures remain valid.
- **US-069** As an Admin, I want set-default template control so that the preferred pricing strategy is auto-applied.
- **US-070** As an Admin, I want duplicate/delete template actions with safeguards so that template lifecycle is manageable.

### I. Proposals list and builder

- **US-071** As a Sales user, I want a proposals pipeline view so that I can track all active client opportunities.
- **US-072** As a Sales user, I want status and search filters so that I can find proposals quickly.
- **US-073** As a Sales user, I want due-soon and overdue indicators so that I can prioritize follow-up.
- **US-074** As a Sales user, I want status-specific row actions so that next steps are contextual.
- **US-075** As a Sales/Admin user, I want proposal header controls (status, preview, send) so that I can progress the deal.
- **US-076** As a Sales/Admin user, I want editable line items so that pricing can be tailored per client need.
- **US-077** As a Sales/Admin user, I want live totals and margin calculations so that commercial outcomes are visible instantly.
- **US-078** As a Sales/Admin user, I want margin-floor warnings at line-item level so that compliance issues are obvious.
- **US-079** As a Sales/Admin user, I want product search slide-over so that I can add catalogue items quickly.
- **US-080** As a Sales/Admin user, I want support for proposal-only products so that custom opportunities can still be quoted.
- **US-081** As a Sales/Admin user, I want internal vs client-facing notes separation so that sensitive notes stay internal.
- **US-082** As a Sales/Admin user, I want attachments on proposals so that all supporting files travel with the quote.
- **US-083** As a Sales/Admin user, I want send-to-client blocked on margin violations so that policy breaches are prevented.
- **US-084** As a Sales/Admin user, I want finance-approval request path when below floor so that exceptions can still progress.

### J. Roles, QA, release

- **US-085** As a platform owner, I want explicit role permission mapping so that frontend and backend authorization stay aligned.
- **US-086** As QA, I want critical-path regression tests so that publish, sync, and pricing rules are protected from regressions.
- **US-087** As business stakeholders, I want role-based UAT scripts so that signoff reflects real workflows.
- **US-088** As operations, I want release monitoring and rollback readiness so that production issues can be contained quickly.

### K. User management

- **US-089** As an Admin, I want a user directory so that I can manage who has platform access.
- **US-090** As an Admin, I want to invite a new user with a selected role so that onboarding is controlled and fast.
- **US-091** As an Admin, I want to edit a user's role so that permissions match the user's current responsibilities.
- **US-092** As an Admin, I want to deactivate a user so that access is revoked without losing historical ownership and audit data.
- **US-093** As an Admin, I want to reactivate a user so that returning team members regain access quickly.
- **US-094** As an Admin, I want account security actions (reset password, force logout, lock/unlock) so that I can respond to security events.
- **US-095** As an Admin/Auditor, I want user-management audit logs so that compliance and access investigations are supported.

---

## 5) Critical dependencies

- APPA integration contracts and sync cadence decisions
- Auth/role source of truth (for reliable permission gates)
- Pricing policy ownership (who approves floor changes and overrides)
- File storage strategy for assets and proposal attachments
- Audit log retention and compliance requirements

---

## 6) Definition of Done (MVP)

- Admin can manage catalogue completeness and storefront visibility at scale
- Product activation is gated by required storefront/production fields
- APPA conflicts can be triaged and resolved with clear outcomes
- Margin governance is enforced end-to-end (product + proposal flows)
- Decorator operations and pricing matrix are manageable from one surface
- Sales can build/send proposals without bypassing margin controls
- Role-based access controls are consistently enforced
- QA/UAT pass criteria achieved for all in-scope MVP workflows

