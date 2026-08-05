# CoverageFit Deployment

CoverageFit deploys from the existing GitHub repository to the existing Cloudflare Pages project.

## Required Cloudflare resources

- Pages Functions detected from `/functions`
- D1 binding named `COVERAGEFIT_DB`
- Encrypted secret named `COVERAGEFIT_PRODUCER_ACCESS_TOKEN`
- Optional CONS-2.1 email alert configuration: `RESEND_API_KEY`, `COVERAGEFIT_PRODUCER_NOTIFICATION_EMAIL`, `COVERAGEFIT_NOTIFICATION_FROM`, and `COVERAGEFIT_NEW_REVIEW_NOTIFICATIONS_ENABLED`
- D1 migration `migrations/0001_ops_cf_1_1.sql`

Follow `CLOUDFLARE-SETUP.md` for the one-time setup and preview certification process.

## Build settings

- Build command: blank
- Build output directory: `.`
- Root directory: repository root

## Release process

1. Put the complete release into a Git branch.
2. Push the branch to GitHub.
3. Test the Cloudflare Pages preview deployment against the preview D1 database.
4. Merge to the production branch only after the end-to-end preview flow passes.
5. Confirm `coveragefit.com`, `/api/consultations/*`, and `/api/reports/*` are served by the same Pages project.

## Rollback

Use Cloudflare Pages deployment history to roll back the static site and Functions. D1 records persist independently across deployments. Do not delete or recreate the production D1 database during a normal application rollback.
