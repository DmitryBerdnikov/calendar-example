# CI, Release Please, and Render Staging

## Status

Accepted

## Context

The project is ready for automated verification and release bookkeeping, but the backend MVP is not fully complete yet. The remaining backend tasks still cover availability, public slots, public bookings, admin bookings, and backend-backed frontend smoke tests.

Render can host the current app early, but this should be treated as staging rather than production. The API still uses SQLite, and the current Render deployment should not introduce a paid persistent disk or a database migration away from SQLite.

## Decision

Add GitHub Actions CI as the gate for pull requests and pushes to `main`. The CI workflow installs pnpm, regenerates OpenAPI and the API client, checks generated artifacts are committed, runs typechecking, runs API tests, and builds the web app.

Use Release Please with the root `simple` release strategy. The repository is a private application monorepo, so it should have one changelog, tag, and GitHub Release for the whole app instead of separate package releases.

Release Please uses `RELEASE_PLEASE_TOKEN` when that secret exists and otherwise falls back to `GITHUB_TOKEN`. A personal access token can be added later if release pull requests need to trigger follow-up GitHub Actions workflows.

Add a Render Blueprint for staging services:

- `scheduling-api-staging` as a Node web service.
- `scheduling-web-staging` as a static site.
- `autoDeployTrigger: checksPass` so Render deploys only after GitHub checks pass.
- Ephemeral SQLite at `/tmp/scheduling.sqlite`.

The API keeps local defaults but also supports Render's `PORT` environment variable. Render sets `API_HOST=0.0.0.0` so the public web service can receive traffic.

## Consequences

The project can now prove changes in CI before Render deploys from `main`.

The Render environment is useful for staging and demos, but data can be lost on restart or deploy. It is not a production data store.

Full production readiness still depends on completing the active backend tasks and the backend-backed Playwright cutover.
