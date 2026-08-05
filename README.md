Current release: **3.20.12 — DOC-1.2 Call-Ready Consultation Guide**

# CoverageFit v3.20.12

DOC-1.2 turns the internal Agent Guide into a readable live-call document. Discussion topics now follow a sequential What we know, Ask, What to explore, Check, and Notes structure; unavailable property fields are omitted; evidence labels use plain producer language; and the final section captures decisions, missing items, owner, due date, follow-up method, and notes. Fixed three-page compression has been removed and browser page counters are enabled. The underlying report data, scoring, evidence states, D1, authentication, private reports, and producer notifications remain unchanged. Production runtime remains Cloudflare Pages Functions plus D1.

See `CALL-READY-CONSULTATION-GUIDE.md`, `SPRINT-DOC-1.2.md`, and `DOC1_2_PRINT_CERTIFICATION.md`.

## Prior release: 3.20.11

AW-7.1 makes the active homeowner consultation the default Agent Workspace experience. Consultation, Inbox, and Pipeline are separate views, with the selected record organized into Before, During, and After phases.


## Prior release: 3.20.10

ASMT-1.8 improves the homeowner assessment without changing its underlying model. Required property confirmation is shown first, optional home details are collapsed, visible question and answer language is simplified through a presentation-only layer, evidence jargon is reduced, the early insight is non-blocking, and the estimate is now a truthful five minutes. ASMT-1.7 Save & Exit and seven-day local drafts remain intact.

# CoverageFit v3.20.7 — CONS-2.1 Privacy-Safe New Review Notification

A newly completed Home Coverage Review can now send one generic producer email alert linking to the secure Agent Workspace. The alert intentionally excludes homeowner identity, contact information, property details, Protection Score, findings, review reason, consultation ID, report token, campaign, and session data. Provider failure never blocks the saved review.

See `NEW-REVIEW-NOTIFICATION.md` and `SPRINT-CONS-2.1.md`.

## Prior release: 3.20.6

ASMT-1.6 carries confirmed homeowner-reported facts, policy-verification items, and unresolved questions into the Agent Workspace, Conversation Planner, Consultation Checklist, and printable Consultation Document without changing scoring or recommendation ordering.

## Prior release: 3.20.5

ASMT-1.5 classifies every active response as confirmed, partial, needing verification, or missing, blocks genuinely incomplete finalization, and preserves the evidence state in completed reports.

## Prior release: 3.20.4

ASMT-1.4 uses the homeowner's selected review reason to add bounded, transparent question context and reorder discussion priorities for home purchase, renewal, non-renewal or cancellation, and premium-increase journeys without changing the score.

CoverageFit v3.20.3

ASMT-1.3 adds property-aware assessment personalization. The eleven-question universal Home review remains intact, while homeowner-confirmed pool, detached-structure, older-roof, age, size, and story details now add only relevant questions or context. The feature does not use unconfirmed public records and does not make underwriting, valuation, eligibility, hazard, condition, or coverage conclusions.

## Current release: 3.20.3

See `ASSESSMENT-QUESTION-VALIDITY-AUDIT.md` for the question-by-question findings and `PROTECTION-SCORE-METHODOLOGY.md` for the normalized scoring contract and calibration scenarios. Cloudflare production setup remains documented in `CLOUDFLARE-SETUP.md`.

CoverageFit v3.20.1

ASMT-1.1 replaces the former raw point-subtraction score with the versioned `coveragefit-protection-score-v1` methodology. The Protection Score now measures response-based review readiness and clarity, uses normalized Home weights totaling 100, distinguishes uncertainty from identified gaps, and applies one authoritative band table throughout the assessment, reports, Agent Workspace, and consultation document.

## Current release: 3.20.1

See `PROTECTION-SCORE-METHODOLOGY.md` for the formula, category normalization, finding definitions, score bands, priority ranking, Home weights, calibration scenarios, and limitations. Cloudflare production setup remains documented in `CLOUDFLARE-SETUP.md`.

CoverageFit v3.20.0

OPS-CF-1.1 moves the existing server-backed CoverageFit workflows to the current GitHub → Cloudflare Pages architecture. Cloudflare Pages Functions now serve the same `/api/consultations/*` and `/api/reports/*` routes, while Cloudflare D1 stores producer consultations and private prospect reports.

## Current release: 3.20.0

The repository no longer requires Netlify for production. Configure the Cloudflare D1 binding `COVERAGEFIT_DB`, the encrypted secret `COVERAGEFIT_PRODUCER_ACCESS_TOKEN`, and apply `migrations/0001_ops_cf_1_1.sql`. See `CLOUDFLARE-SETUP.md` for the preview and production workflow.

CoverageFit v3.19.31

RPT-1.2 replaces URL-exposed customer information and browser-only prospect report retrieval with private opaque report links backed by Netlify Functions and Netlify Blobs. Private reports expire after 30 days and provide truthful expired, unavailable, temporary-service, and device-only fallback states.

## Current release: 3.19.31

Completed Home reviews now redirect to `/home/report/#report_id=<opaque-id>`. The fragment contains no customer name, property address, campaign, or session ID and is not sent in normal page requests. The report route retrieves a minimized prospect-safe payload from the server, caches a temporary local copy for short outages, and remains compatible with legacy browser-local reports opened from the Agent Workspace.

CoverageFit v3.19.30

RPT-1.1 compresses the homeowner-facing Protection Snapshot into three clear pages while preserving the strongest educational guidance and one focused producer next step.

## Current release: 3.19.30

The customer report now contains one personalized overview, three educational topics, and one next-step page. Duplicate covers, repeated score and strength treatments, customer confidence percentages, repeated actions, and duplicate CTAs have been removed. DOC-1.1 remains the current three-page internal agent consultation document.

## Current release: 3.19.1

P1.6.2 expands the Professional Report Shell with model-driven producer, agency, contact, document-reference, and confidentiality details across the cover and shared running header/footer. Page numbering remains deferred to P1.6.3.

## Current release: 3.19.0

P1.6.1 adds the Professional Report Shell Foundation. The HTML renderer now composes the existing section output inside a reusable report shell with a model-driven cover page and shared print header/footer chrome. Page numbering and final browser-print controls are intentionally deferred.

## Current release: 3.18.9

P1.5.3 upgrades the Consultation Timeline into a professional, state-aware, responsive, print-safe report section while preserving the immutable timeline model → section → composer → HTML renderer path.

## Current release: 3.18.8

P1.5.2 adds the real Consultation Timeline renderer while preserving the immutable model → section → composer → HTML renderer path.

## Current release: v3.18.6

P1.4.3 adds the professional Consultation Checklist layout while preserving the immutable checklist model and section-driven print pipeline.

## Current release: v3.18.5
P1.4.2 adds the model-driven printable Consultation Checklist renderer. Professional checklist layout refinement remains P1.4.3.

## Current release: v3.18.3
P1.3.6 improves recommendation print pagination for long, grouped consultation reports while preserving the immutable model and section-driven renderer pipeline.

## P1.3.4 Recommendation Ordering

- Deterministic model-level priority and category ordering is complete.
- Exact ties preserve source order; grouping remains deferred to P1.3.5.

## Printable Recommendations

P1.3.2 adds model-driven semantic HTML for consultation recommendations. The section supports unlimited recommendations and remains composed through the shared Print Engine pipeline.

## Current release: 3.17.7

P1.2.3 adds the professional Property Summary print layout.

## Current product sprint
P1.1.1 adds the production Executive Summary data model. The printable visual component remains intentionally deferred to P1.1.2.

## v3.16.7

AW-6B.1A adds the runtime Print Section Registry. It provides validated registration, deterministic ordering, immutable metadata, duplicate protection, dependency injection into the Print Engine, and regression coverage. No printable content or composer behavior is included in this micro sprint.

## v3.16.6

AW-6A.5 completed. Automatic renderer selection, end-to-end pipeline, renderer QA, and public Print Engine APIs finalized.


## CoverageFit v3.15 Agent Workspace Baseline

Version 3.15 establishes the first production-ready Agent Workspace baseline, including the Conversation Planner, synchronized timeline, persistent consultation checklist, progress tracking, accessibility, responsive behavior, render/lifecycle hardening, deployment controls, and frozen compatibility contracts.

Release documentation:

- `RELEASE_NOTES_v3.15.md`
- `RELEASE_HIGHLIGHTS.md`
- `MIGRATION_GUIDE_v3.15.md`
- `WR1C_API_BASELINE.md`

## CoverageFit v3.16 Print Engine Foundation

AW-6A.1 introduced `CoverageFitPrintEngine`. AW-6A.2 added section contracts and validation. AW-6A.3 established the serialization boundary. AW-6A.4 adds a working adapter registry and Home adapter so future Business, Landlord, and Life modules can plug into the same print pipeline. See `AW6_PRINT_ENGINE.md`, `AW6_PRINT_MODEL_CONTRACTS.md`, `AW6_PRINT_SERIALIZATION.md`, and `AW6_PRINT_ADAPTERS.md`.

# CoverageFit v1 Pilot

Deployment-ready pilot focused on one journey:

1. Landing page
2. 10-question guided assessment
3. Compact Protection Snapshot
4. Call/text booking page

## Configure
Edit `/producer.json`. The active Formspree endpoint is controlled by `formEndpoint`.

## Test routes
- `/`
- `/assessment/`
- `/home/report/` after assessment submission
- `/book/`
- `/triggers/homebuyer/`
- `/triggers/renewal/`
- `/triggers/premium-increase/`


## Meta Conversion Update
Added emotional trigger copy, risk-removing CTAs, early insight after question 2, human report introduction, and a reassuring booking page.


## CoverageFit Platform Update
- Root is now a platform chooser for Home, Business, Landlord, Auto, and Life journeys.
- `/home/` is a full Home landing page; existing assessment remains at `/assessment/`.
- `/business/` is a first-class CoverageFit Business landing page.
- `/landlord/` is a new landlord review landing page with direct contact CTA.
- Shared navigation, trust language, journey footer, and universal Coverage Review positioning were added.

## CoverageFit v2.2 — Business Profile + Industry Routing
- `/business/profile/` is now the first step for Business reviews.
- Supports ten industry routes and stores the profile in both sessionStorage and localStorage under `coveragefit_business_profile`.
- The existing shared Business assessment remains unchanged in question content for this phase, but receives the selected `industry` and `module` routing parameters.
- Business profile details are carried into the assessment context, Formspree submission, saved report payload, and consumer record.

## CoverageFit v2.3 — First Five Industry Modules

Business assessment modules are now active for Contractor, Restaurant, Professional Office, Retail, and Nonprofit. Each module includes industry-specific questions, conditional follow-up questions, category labels, profile context, and structured response storage. Healthcare, Technology, Property Management, Manufacturing, and Other continue to use the general business assessment until later phases.


## CoverageFit v2.4 — Shared Coverage Questions

The Business journey now merges every industry path into a shared Current Coverage section. It captures current carrier, renewal date, claims, locations, vehicles, general liability, property, business income, workers compensation, cyber, umbrella, professional liability, and certificate/contract requirements. A unified five-step progress system is displayed across Business Profile, Industry Review, Current Coverage, Snapshot, and Contact Review.

## CoverageFit v2.5 Business Snapshot
- Replaced the Business report with Business Profile, Operations, Current Coverage, Risk Areas, and transparent Preparedness Score sections.
- Score starts at 100, applies only predefined answer deductions, and deducts 2 points for missing carrier or renewal date.
- Score is explicitly educational and is not underwriting, eligibility, pricing, or a coverage determination.


## CoverageFit Business v2.6

Added dedicated industry modules for Healthcare, Technology, Property Management, Manufacturing, and Other. All ten Business Profile selections now route to a seven-question industry module before merging into the shared Current Coverage section.

Each new module includes industry-specific labels, conditional questions, structured response keys, Business Profile context, report storage, and lead payload integration.

## CoverageFit Business v2.7 Recommendation Engine
- Adds industry baseline recommendation rules for all ten business modules.
- Adds answer-triggered conditional recommendations and priority upgrades.
- Groups report recommendations into High Priority Review, Recommended Discussion, and Additional Consideration.
- Explains why each topic appears and identifies the response source that triggered it.
- Recommendations are educational discussion topics, not underwriting or coverage determinations.

## CoverageFit Business v2.9 Production UI
- Branded staged Snapshot generation overlay
- Redesigned Contact Review experience and completion checklist
- Polished submit/success transition into the final report
- Improved empty states and report motion
- Score count-up and staggered recommendation animation
- Keyboard focus, live-region announcements, touch-target, contrast, and reduced-motion improvements
- Presentation-only enhancement; assessment, scoring, storage, and recommendation rules remain unchanged

## Recommendation pipeline

Version 3.6.0 uses one registered recommendation engine with separate Home and Business rule modules. See `RECOMMENDATION_PIPELINE_V3_6.md`.


## Agent Workspace v3.15 Certification

CoverageFit v3.15.9 is the certified stable Home-focused Agent Workspace baseline. See `WR1C_FINAL_PRODUCTION_CERTIFICATION.md`, `WR1C_READINESS_SCORE.md`, and `RELEASE_NOTES_v3.15.md`.


## AW-6A.3
Implemented print snapshot & serialization boundary.

## Print document composition
`CoverageFitPrintDocumentComposer.compose()` converts an immutable print model and registered section definitions into an ordered, immutable document structure. It does not render HTML; renderer integration is intentionally deferred.

### Print visibility
`assets/js/print-visibility.js` evaluates registered section requirements and visibility rules before composition. The Document Composer exposes visible and hidden sections as immutable structured output; it does not render HTML.
## Printable document runtime
The HTML print renderer is now composer-driven. It receives an immutable print model, composes registered sections, invokes only visible section renderers, and returns immutable HTML-renderer output. Section-specific printable content is intentionally not implemented in this release.

## Property Summary print model
Version 3.17.5 adds an immutable Property Summary model consumed by the print section. Visual rendering remains scheduled for P1.2.2.

### Recommendation Print Model
The printable consultation uses `CoverageFitRecommendationModel` to convert Recommendation Engine output into immutable, renderer-ready consultation data.

## v3.18.0 — Professional Recommendation Layout
Recommendations now render as a polished, client-facing consultation section with a priority summary and print-safe executive cards. Ordering and category grouping remain separate future sprints.

### P1.3.5 Recommendation Groups
Recommendations are organized into client-friendly protection categories while retaining deterministic priority order within each group.

### Checklist print model

The print pipeline now includes `CoverageFitChecklistModel`, an immutable adapter over the AW-5 consultation checklist. The Checklist section consumes this model; visible checklist rendering is intentionally deferred to P1.4.2.

## CONS-1.7 Consultation disposition

The Agent Workspace now tracks each consultation through a producer-controlled stage and, when closed, a required final outcome. Server-backed changes synchronize through `/api/consultations/disposition`; browser-local records retain their stage and outcome in local storage. Closing and reopening actions appear in the activity timeline.

## CONS-1.8 Pipeline summary and outcome reporting

The existing Agent Workspace now summarizes every synchronized consultation record with total, open, closed, and policy-bound counts. It reports totals for every supported workflow stage and final-outcome counts for closed consultations. Selecting a stage row focuses the existing queue filter; no duplicate reporting store or separate analytics route is created.
## CONS-1.9 Pipeline date range and source segmentation

The existing Agent Workspace pipeline now supports all-time, 7-day, 30-day, 90-day, and validated custom reporting windows of up to 366 days. The selected window scopes totals, stages, outcomes, and the existing queue consistently. Campaign, referral-source, and entry-source breakdowns use the same synchronized records and retain a visible Unattributed category when attribution is missing.



## CONS-2.0 Pipeline trend and CSV export

The existing Agent Workspace pipeline now displays consultation volume by received-date cohort and the current policy-bound conversion rate for each date bucket. Bucket granularity adapts to the active date range, and an accessible table exposes consultation, closing, and bound counts for every period. The Download pipeline CSV action exports one row per consultation in the active reporting window with customer, source, workflow, follow-up, and lifecycle fields; spreadsheet-formula prefixes are neutralized before download.
