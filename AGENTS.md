# Copilot Instructions

## Project Overview

Minimal, high-signal reference for automation or AI agents interacting with this Adobe App Builder review management application (serverless actions for CRUD + search/filter on product reviews, React Spectrum UI, persistent storage via `@adobe/aio-lib-db` wrapped by `StateRepository`).

## Purpose
Manage product reviews (CRUD + search/filter) via Adobe App Builder serverless actions with a React Spectrum UI. Persistence uses `@adobe/aio-lib-db` wrapped by `StateRepository`.

## Data Model (Review)
Fields (all required at create): `id` `<uuid>`, `sku`, `rating(1-5)`, `title`, `text`, `author`, `author_email(valid)`, `status(pending|approved|rejected default pending)`, `created_at`, `updated_at`.
Update: only provided fields; always refresh `updated_at`.

## Validation Rules
- Missing required field => 400.
- Rating not integer 1–5 => 400.
- Invalid email => 400.
- Use helpers in `actions/review.js` & `web-src/reviewValidator.js`.

## Action Endpoints (Conceptual)
| Folder | Path | Method | Notes |
|--------|------|--------|-------|
| create-review | /api/v1/create-review | POST | Returns created review (201). |
| update-reviews | /api/v1/update-reviews | POST | Batch partial updates; per-item success array. |
| delete-reviews-by-ids | /api/v1/delete-reviews-by-ids | POST | Batch delete; per-item success array. |
| get-list-reviews | /api/v1/get-list-reviews | POST | Wildcard substring filters across searchable fields. |
| get-reviews-by-ids | /api/v1/get-reviews-by-ids | POST | Returns array of reviews. |
| state-test | /api/v1/state-test | POST | Diagnostics only. |

## Invocation Conventions
Input may arrive as top-level params or JSON string under `__ow_body`; use `getParams` in `actions/utils.js` for normalization.
Responses: `{ statusCode, body, headers? }`. Errors via `errorResponse(code, message)`.
Batch endpoints always 200 with detailed per-item results (allow partial success).

## Storage
Database: App Builder DB collection `reviews`, using `_id = id` for lookups. SKU search uses direct field match on `sku`.

## Shared Utilities
- `actions/utils.js`: `getParams`, `errorResponse`.
- `actions/state-repository.js`: init/find/get/put/delete wrapper.
- `actions/review.js`: `createReview`, `updateReview`, `validateReview`, `parseReview`, `SEARCHABLE_FIELDS`.

## Search / Filtering
`get-list-reviews` performs case-insensitive substring match across provided filter params limited to `SEARCHABLE_FIELDS`.

## Logging
Use `Core.Logger('action-name', { level: params.LOG_LEVEL || 'warn' })`. Avoid secrets. Prefer short structured messages.

### Production Logging Configuration
Configure log level via environment variable `LOG_LEVEL` in Adobe IO Console:
- `LOG_LEVEL=error`: Only critical errors
- `LOG_LEVEL=warn`: Warnings and errors (recommended for production)
- `LOG_LEVEL=info`: All logs including info/debug (useful for debugging)
- `LOG_LEVEL=debug`: All logs including debug messages (development)

## Essential Commands
```bash
npm install
aio app run      # UI local, actions remote
aio app dev      # local UI + actions
npm test         # unit tests
npm run e2e      # action e2e tests
npm run lint     # eslint
aio app deploy   # deploy
aio app undeploy # remove
```

## Contribution Guardrails
- Reuse existing helpers; do not duplicate validation.
- Add/update tests for new action logic.
- Keep batch endpoints tolerant (partial success).
- Update `docs/README.md` for new endpoints.

## Quick Decision Matrix (Agent)
| Goal | Function/Action | Notes |
|------|-----------------|-------|
| Create review | `create-review` / `createReview()` | Ensure all fields present. |
| Update review(s) | `update-reviews` / `updateReview()` | Partial allowed; validate provided fields. |
| Delete review(s) | `delete-reviews-by-ids` | Supply `ids` array. |
| List all / filtered | `get-list-reviews` | Provide filter params (substring). |
| Fetch by IDs | `get-reviews-by-ids` | Returns array (silently skips missing). |

## Common Error Patterns
- 400: missing field / invalid rating / email.
- 500: storage or unexpected exception.
- Batch errors encoded per item inside `results`.

## Extending
Add action folder, export `main`, leverage existing utilities, document endpoint, add tests. Consider pagination + stricter status transitions as next enhancements.

---
Keep this cheat sheet lean; expand only if core architecture changes.
