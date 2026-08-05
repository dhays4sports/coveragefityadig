## P1.6.4 Professional Report Shell Certification

- End-to-end six-section report rendering
- Canonical section ordering
- Cover, running header, running footer, and report body presence
- Immutable shell diagnostics
- Production certification metadata
- Partial-report warning behavior
- Cover and page-numbering opt-outs
- Standalone HTML document output
- Browser dependency order

Run: `node P1_6_4_QA.js`

## P1.6.3 Page Numbering and Print Pagination Controls

- Page-counter markup and CSS paged-media counters: passed.
- Page-numbering opt-out: passed.
- Last-section trailing-page prevention: passed.
- Existing report shell and print regressions: passed.

## P1.6.1 Professional Report Shell Foundation

- Dedicated shell QA: 12 passed, 0 failed.
- Verified immutable shell output, cover generation, running chrome, HTML escaping, cover opt-out, renderer integration, dependency order, and print CSS.
- Existing current P1 and AW-6 print regressions remain required for release packaging.

## P1.5.3 Professional Consultation Timeline Layout

Dedicated QA validates status legend, reviewed/current/upcoming section states, current-topic emphasis, section metadata, first-item continuity markers, responsive styling, print pagination controls, immutability, and unlimited timeline support.

## P1.5.2 Consultation Timeline Renderer

- Dedicated renderer QA covers semantic structure, status states, groups, timing, escaping, unlimited items, immutability, and dependency order.

## P1.4.3 QA

- Professional checklist layout suite: 15 passed.
- Current print architecture and P1 regressions pass.
- JavaScript syntax and ZIP integrity verified.

## P1.4.2 Checklist Renderer
- Dedicated QA covers semantic output, unlimited items, phase rendering, progress, statuses, optional fields, escaping, immutability, dependency order, and print CSS.

## P1.3.6 Recommendation Print Polish
- Dedicated QA verifies group-heading continuity, first-card markers, card break protection, widow/orphan rules, footer continuity, source non-mutation, and release versioning.
- Current print architecture and P1 recommendation regressions must remain green.

## P1.3.4 Recommendation Ordering

- Deterministic model-level priority and category ordering is complete.
- Exact ties preserve source order; grouping remains deferred to P1.3.5.

## P1.3.2 Recommendation Renderer

- Dedicated renderer QA covers unlimited items, escaping, labels, optional fields, immutability, visibility, runtime dependency order, and print CSS.

## P1.2.3 QA

- Professional Property Summary layout: 15 checks passed.
- Existing print architecture regressions remain required.

## P1.1.1 QA
- Executive Summary model mapping
- Partial and missing data behavior
- Immutability
- Section integration
- Browser dependency order
- Existing renderer/composer/visibility regressions

## v3.16.6

AW-6A.5 completed. Automatic renderer selection, end-to-end pipeline, renderer QA, and public Print Engine APIs finalized.

# Phase 2 QA

Completed checks:
- 10 active Home assessment questions
- JavaScript syntax validation passed
- JSON parsing passed
- No missing internal HTML routes or asset references
- Duplicate `/home/` and `/campaign/` entry points redirect to `/assessment/`
- Report simplified to strengths, three priorities, questions, actions, and one booking CTA
- Producer identity remains controlled through `/producer.json`
- Booking flow uses direct call/text and does not rely on a dead anchor
- Internal architecture documents and unused public routes removed from deployment


## Meta Conversion QA
- Test all trigger pages on mobile
- Confirm Get My Protection Snapshot opens correct trigger
- Confirm early insight appears after question 2 exactly once
- Confirm report opens with thank-you message
- Confirm booking page shows no-pressure language


## CoverageFit v2.3 Industry Module QA

- Contractor path completed with elevated-work and workforce conditionals.
- Restaurant path completed with liquor-control and catering conditionals.
- Professional Office path completed with employee-dependent employment practices question.
- Retail path completed with ecommerce and temporary-event conditionals.
- Nonprofit path completed with vulnerable-participant and safeguard conditionals.
- Verified unique response keys, answer metadata, industry labels, profile summary, local/session storage, and report payload persistence.
- Healthcare, Technology, Property Management, Manufacturing, and Other intentionally remain on the shared general module for this phase.


## v2.4 Shared Coverage QA

- [x] All five dedicated industry modules merge into the shared coverage section.
- [x] General fallback industries merge into the shared coverage section.
- [x] Current carrier stores a free-text value.
- [x] Renewal date stores an optional date value.
- [x] Shared responses are included in report payload and Formspree payload.
- [x] Five-step progress state changes between Industry Review, Current Coverage, Snapshot, and Contact Review.
- [x] Business Profile displays the same five-step progress system.
- [x] JavaScript syntax and duplicate response keys validated.


## v2.6 Remaining Industry Module QA

Validated dedicated routing for:
- Healthcare
- Technology
- Property Management
- Manufacturing
- Other

Checks completed:
- All ten industry module keys exist.
- Each industry module contains seven questions.
- Each new module contains at least one conditional question.
- Question keys are unique within every module.
- Existing shared Current Coverage questions remain appended by `business-assessment-profile.js`.
- Business Profile summary remains populated from saved profile data.
- Responses continue through the existing assessment engine, report payload, local/session storage, and Formspree lead payload.
- JavaScript syntax checks passed.

## v2.7 Recommendation Engine QA
- Verified baseline recommendations generate for all ten industries.
- Verified contractor trigger fixture raises Commercial Auto, Workers Compensation, General Liability, Inland Marine, Commercial Umbrella, and contract requirements to High Priority.
- Verified priority de-duplication and upgrades.
- Verified business-recommendations.js and business-report.js pass Node syntax checks.
- Verified report HTML parses and final ZIP passes integrity testing.


## v3.1 Report Refinement QA
- [x] One Home report cover only
- [x] One executive summary only
- [x] Legacy benchmark terminology removed
- [x] Priority questions consolidated into priority cards
- [x] Dynamic next-step text generated from saved answers
- [x] Producer contact information included
- [x] Print-only branded header and footer added
- [x] Broad section-level break-inside rules overridden
- [x] JavaScript syntax validated
- [x] ZIP integrity validated


## v3.2.1 Dynamic Illustration Engine
- [x] Registry JSON parses successfully.
- [x] Every registry asset resolves to an included SVG.
- [x] Home and Business report pages load the shared illustration engine.
- [x] Home hero and priority-card illustration hooks are present.
- [x] Business industry hero and recommendation-card illustration hooks are present.
- [x] Missing assets fall back to default.svg.
- [x] Illustration JavaScript passes syntax validation.
- [x] Responsive and print CSS included.


## Sprint 2 — Journey Timeline and Business Report Deduplication
- [x] Home top journey uses three stages.
- [x] Business report top journey uses five stages.
- [x] Existing Business profile/assessment journey is not duplicated.
- [x] Home and Business reports render a five-step post-report action plan.
- [x] Business report contains one executive cover and one executive summary.
- [x] Legacy Business hero, score panel, and duplicate Executive Summary removed.
- [x] Business exact score remains available in the shared summary.
- [x] Booking links preserve product context.
- [x] Mobile and print timeline rules included.

## Sprint 4 — Shared Recommendation Engine
- [x] Shared engine loads before Home report rendering.
- [x] Shared engine loads before Business recommendation generation.
- [x] Business baseline and conditional rules retain their existing outputs.
- [x] Duplicate topics merge into one card.
- [x] Stronger matching rules upgrade priority.
- [x] Equal-priority reasons and trigger sources merge without duplication.
- [x] Home priority selection and scoring remain unchanged.
- [x] Trigger Library enrichment remains active.
- [x] Duplicate Volunteer Accident trigger definition removed.
- [x] JavaScript syntax and ZIP integrity validated.


## Recommendation Pipeline 3.6 QA
- Verify Home and Business rule modules register before report rendering.
- Verify all ten Business industries produce baseline recommendations.
- Verify conditional rules upgrade and merge through the shared collector.
- Verify Home priority topics render through `generate('home')`.
- Verify the compatibility adapter contains no product rules.

## AW-5A Release Regression

Run the complete portable JavaScript regression suite from the project root:

```bash
node RUN_REGRESSION_SUITE.js
```

The runner includes the static release check for required routes, local HTML references, and version consistency.


## WR-1A Production Readiness QA

Run the full suite from the project root:

```bash
node RUN_REGRESSION_SUITE.js
```

WR-1A adds two behavioral suites:

- `WR1_EndToEnd_QA.js`: complete, partial, and empty Home Workspace scenarios plus interaction, persistence, refresh, and reset walkthroughs.
- `WR1_Regression_QA.js`: repeated reset cycles, rapid status transitions, blocked storage, incompatible persistence, missing planner data, responsive resize safeguards, keyboard navigation safeguards, and lifecycle-event integration.

Browser-specific visual verification remains part of WR-1B and WR-1C.


## WR-1B.10 Production Candidate
- [x] Full discovered regression suite passes.
- [x] JavaScript syntax validation passes.
- [x] Static route, asset, and version validation passes.
- [x] Fresh-package extraction validation passes.
- [x] Accessibility, performance, responsive, motion, lifecycle, and interaction findings consolidated.
- [x] Known limitations and WR-1C manual release gates documented.


## WR-1C.2 Deployment Verification

Run:

```bash
node WR1C2_DEPLOYMENT_QA.js
```

The suite validates deployment-control files, favicon and manifest metadata, local HTML references, sitemap route coverage, robots configuration, and security headers.


## WR-1C.3 Cross-Browser QA

Run `node WR1C3_CROSS_BROWSER_QA.js` to validate browser-sensitive fallbacks and prohibited hard dependencies. The full regression runner includes this suite automatically. Chromium route smoke testing is documented in `WR1C_CROSS_BROWSER_CERTIFICATION.md`.


## WR-1C.6 API Baseline QA

- [x] Public Workspace modules remain frozen.
- [x] Frozen public methods and constants remain available.
- [x] Checklist schema and persistence schema remain compatible.
- [x] Checklist status values and lifecycle event names remain compatible.
- [x] Workspace contract fields remain present and deeply immutable.
- [x] Workspace storage keys remain stable.
- [x] Motion, performance, and lifecycle diagnostic surfaces remain available.
- [x] Semantic-version and deprecation policy documented.
- [x] Machine-readable baseline matches the packaged VERSION.


## WR-1C.8 Final Certification

Run `node WR1C8_QA.js` to validate the readiness score, final certification, milestone closure, release identity, and frozen-baseline continuity.

## AW-6A.1 Print Engine Skeleton

Run:

```bash
node AW6A1_QA.js
node RUN_REGRESSION_SUITE.js
```

Coverage includes the frozen engine API, schema version, DOM-free behavior, Workspace script integration, explicit source injection, normalized model sections, deep immutability, source-reference isolation, empty-state diagnostics, documentation, and release version.


## AW-6A.2 Print Model Validation

Run `node AW6A2_QA.js`. The suite verifies public validation APIs, frozen section contracts, normalization, valid/invalid model handling, diagnostics integration, versioning, and documentation.


## AW-6A.3
Implemented print snapshot & serialization boundary.


## AW-6A.4

Run `node AW6A4_QA.js` to validate the adapter registry, Home adapter, Print Engine integration, immutable metadata, and compatibility fallback.


## AW-6A.5
Added AW6A5_QA.js regression suite.
## AW-6B.1A Section Registry

Run:

```bash
node AW6B1A_QA.js
```

Expected: 9 passed, 0 failed. The suite verifies runtime API availability, validation, registration, retrieval, duplicate protection, replacement, ordering, immutable metadata, diagnostics, unregistering, and reset behavior.


## AW-6B.1C
Run `node AW6B1C_QA.js`. The suite verifies real section registration, immutable-model enforcement, deterministic composition, deep immutability, and empty-registry behavior.

## AW-6B.1D QA
- Visibility engine API and rule evaluation
- Fully populated and partially populated print models
- Hidden-section empty-state descriptors
- Fail-closed rule exception handling
- Deep immutability
- Composer and registry regression
## AW-6B.1E Renderer Integration QA
Run `node AW6B1E_QA.js`. The suite verifies composer integration, visible-section filtering, deterministic section invocation, section-output validation, immutability, and browser script ordering.

## P1.1.3 QA
- Executive Summary semantic layout and model mapping verified.
- HTML escaping verified against markup-like client input.
- Complete, partial, and zero-score cases verified.
- Generated HTML includes responsive and US Letter print CSS.
- Existing registry/composer/visibility/renderer pipeline remains unchanged.

## P1.2.1 Property Summary Data Model
- Run `node P1_2_1_QA.js`.
- Confirms complete/partial mapping, null preservation, numeric normalization, diagnostics, immutability, section integration, and script order.

## P1.2.2
- Property Summary renderer QA added.
- Existing print architecture regressions remain required.

## P1.3.1 Recommendation Data Model
- Dedicated model mapping, immutability, alias handling, diagnostics, section integration, and browser dependency order are covered by `P1_3_1_QA.js`.

## P1.3.3 Professional Recommendation Layout
Run `node P1_3_3_QA.js`. The suite verifies the branded masthead, priority overview, numbered rails, unlimited items, escaped content, responsive/print CSS, immutability, visibility, dependency order, and release identity.

## P1.3.5
Run `node P1_3_5_QA.js`. Expected: 15 passed, 0 failed.

## P1.4.1 Checklist Data Model

- Dedicated QA: 12 passed, 0 failed.
- Validates mapping, progress, phase summaries, aliases, unlimited items, empty input, deep immutability, source non-mutation, diagnostics, section integration, visibility, and browser dependency order.


## P1.6.2 Shared Header/Footer Content Integration

Run `node P1_6_2_QA.js`. Expected: 14 passed, 0 failed. The suite verifies immutable metadata mapping, producer and agency contact details, report references, shared running chrome, escaping, sparse metadata behavior, renderer integration, CSS structure, and browser dependency order.
