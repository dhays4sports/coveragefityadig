# CoverageFit Cloudflare Pages + D1 Setup

CoverageFit production remains in the existing GitHub repository and existing Cloudflare Pages project. Netlify is not required.

## Runtime contract

- Static site: Cloudflare Pages
- API routes: Cloudflare Pages Functions under `/functions/api/`
- Durable storage binding: `COVERAGEFIT_DB`
- Producer secret: `COVERAGEFIT_PRODUCER_ACCESS_TOKEN`
- Database engine: Cloudflare D1
- Database migration: `migrations/0001_ops_cf_1_1.sql`

## 1. Create the D1 databases

Create two databases in Cloudflare:

- `coveragefit-production`
- `coveragefit-preview`

A separate preview database prevents test submissions from entering the live producer inbox.

In Cloudflare, open **Workers & Pages → D1 SQL database → Create database**.

## 2. Apply the migration

Open each D1 database, choose **Console**, paste the contents of:

`migrations/0001_ops_cf_1_1.sql`

Run it once against both production and preview.

The migration creates:

- `consultation_records`
- `prospect_reports`
- `api_rate_limits`

The migration is idempotent and can be run again safely.

## 3. Bind D1 to the existing Pages project

Open:

**Workers & Pages → CoverageFit project → Settings → Bindings**

Add a D1 database binding named exactly:

`COVERAGEFIT_DB`

Configure:

- Production environment → `coveragefit-production`
- Preview environment → `coveragefit-preview`

Redeploy after adding or changing bindings.

## 4. Add the producer secret

Open:

**Workers & Pages → CoverageFit project → Settings → Variables and Secrets**

Add an encrypted secret named exactly:

`COVERAGEFIT_PRODUCER_ACCESS_TOKEN`

Use a unique random value of at least 24 characters. Configure it for both Production and Preview. The preview value may be different.

Never commit the secret to GitHub, place it in HTML, or add it to a public configuration file.

## 5. Configure new-review email notifications

CONS-2.1 uses the Resend Email API from the existing consultation-submission Pages Function. Cloudflare Pages Functions can read encrypted secrets and environment variables from `context.env`.

Under **Workers & Pages → CoverageFit project → Settings → Variables and Secrets**, configure both Production and Preview.

Encrypted secret:

- `RESEND_API_KEY` — use a Resend key restricted to sending access where possible

Plaintext variables:

- `COVERAGEFIT_PRODUCER_NOTIFICATION_EMAIL` — producer mailbox that receives alerts
- `COVERAGEFIT_NOTIFICATION_FROM` — verified sender, such as `CoverageFit <reviews@coveragefit.com>`
- `COVERAGEFIT_NEW_REVIEW_NOTIFICATIONS_ENABLED` — set to `true` to send or `false` to disable

Optional variables:

- `COVERAGEFIT_NOTIFICATION_REPLY_TO`
- `COVERAGEFIT_SITE_URL` — explicit site origin; when omitted, CoverageFit uses the current deployment origin so Preview alerts open the Preview Workspace

The sender domain must be verified in Resend. Notification failure does not block consultation storage. The email intentionally contains no homeowner or assessment details. See `NEW-REVIEW-NOTIFICATION.md`.

## 6. Preserve the GitHub deployment

Keep the existing GitHub repository connected to the existing Cloudflare Pages project.

Recommended Pages build settings:

- Production branch: existing production branch
- Build command: blank
- Build output directory: `.`
- Root directory: repository root

Cloudflare detects the root `/functions` directory and deploys the Pages Functions with the static site.

`wrangler.example.jsonc` is a reference for local development. It intentionally contains placeholder database IDs and should not replace your current Pages project settings unless you deliberately choose configuration-as-code.

## 7. Create a preview deployment

Create a branch such as:

`ops-cf-1.1-cloudflare-runtime`

Push this release to that branch. Cloudflare Pages should create a unique preview URL automatically.

Before testing, confirm the preview deployment has:

- `COVERAGEFIT_DB` bound to `coveragefit-preview`
- `COVERAGEFIT_PRODUCER_ACCESS_TOKEN` configured for Preview
- The D1 migration applied to `coveragefit-preview`

## 8. Preview certification flow

From a separate browser or phone:

1. Complete a Home Coverage Review.
2. Confirm the private report opens at `/home/report/#report_id=...`.
3. Copy the private link to another device and confirm the report opens.
4. Open `/agent/workspace/` on the producer device.
5. Enter the preview producer secret and select **Connect & sync**.
6. Confirm the new consultation appears as **New**.
7. Open it, acknowledge it, schedule a follow-up, add a note, and change its stage.
8. Open the consultation document and customer report.
9. Confirm browser-local fallback still works with the API unavailable.
10. Confirm no customer name, email, phone, address, session ID, or report token appears in normal query parameters.

## 9. Promote to production

After the preview flow passes, merge the branch into the production branch. Cloudflare Pages deploys the same static site, Pages Functions, and API routes to `coveragefit.com` using the production D1 binding and production secret.

## Local development

Install dependencies from the public npm registry:

```bash
npm install
```

Copy `wrangler.example.jsonc` to `wrangler.jsonc`, replace both D1 IDs, and keep the resulting file out of Git if it contains project-specific settings you do not want committed.

Store a local producer token in `.dev.vars`:

```text
COVERAGEFIT_PRODUCER_ACCESS_TOKEN=replace-with-a-long-local-secret
```

Then run:

```bash
npm run cloudflare:dev
```

Cloudflare Wrangler serves the static site and Pages Functions together.

See `OPS_CF_1_1_VERIFICATION.md` for the completed local/D1 verification record and the remaining live preview certification boundary.
