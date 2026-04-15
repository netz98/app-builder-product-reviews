# Product Reviews App Builder

Adobe App Builder app for managing product reviews in Adobe Commerce Admin. Provides a React Spectrum UI and serverless actions for CRUD, search, and moderation workflows backed by App Builder DB.

## Features

- Create, update, delete, and list reviews
- Status moderation (pending / approved / rejected)
- Search and filter across review fields with pagination and sorting
- Batch operations (bulk approve, reject, delete)
- Admin UI SDK menu entry for Commerce Admin
- GraphQL Mesh integration for unified API layer
- Multi-tenant data isolation per Adobe organization

## Architecture

- **Frontend:** React with Adobe React Spectrum components
- **Backend:** Node.js 18 serverless actions on Adobe I/O Runtime
- **Storage:** App Builder DB (Document DB) via `@adobe/aio-lib-db`
- **Auth:** Adobe IMS (Identity Management System)
- **Integration:** GraphQL Mesh for Commerce Backend UI extension
- **Test Coverage:** 154 unit tests

## Project Structure

```
product-reviews/
├── actions/              # Serverless actions (backend API)
│   ├── utils.js
│   ├── storage-repository.js
│   └── review.js         # Review logic and validation
├── web-src/              # React frontend
│   └── src/
│       └── components/
│           ├── Action/   # ReviewForm, EditReview, MassActions
│           ├── App/
│           └── ReviewsTable/
├── tests/                # Unit and E2E tests
├── mesh.json             # GraphQL Mesh configuration
├── ext.config.yaml       # Extension and action registration
├── extension-manifest.json
└── docs/                 # Documentation
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Login to Adobe I/O and select org/project/workspace
aio console:login
aio console:org:select
aio console:project:select
aio console:workspace:select

# 3. Link local project to selected workspace
aio app use

# 4. Run tests
npm test

# 5. Start local development server (UI at http://localhost:9080)
aio app run
```

> After initial setup, switch workspaces anytime with `aio app use`.

## Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `aio app run` | Frontend local, actions remote |
| `aio app dev` | Frontend and actions both local |
| `npm test` | Run unit tests (154 tests) |
| `npm run e2e` | Run E2E tests |
| `npm run lint` | Run linter |
| `aio app deploy` | Deploy to current workspace |
| `aio app undeploy` | Remove from current workspace |
| `aio app use --list` | Show current workspace config |

## Mesh Deployment Note

- `mesh.json` may contain `{NAMESPACE}` as a template placeholder.
- Use the helper script to render namespace and update Mesh for the active workspace:

```bash
npm run mesh:update
```

- Optional: override namespace explicitly, for example `NAMESPACE=<your-namespace> npm run mesh:update`.
- You can also set namespace directly in `mesh.json` and run `aio api-mesh update mesh.json`, but do not commit namespace-specific values.
- Keep `mesh.json` in git as template and do not commit `mesh.generated.json`.

## Documentation

### Core Guides

| Document | Description |
|----------|-------------|
| [docs/SETUP.md](docs/SETUP.md) | Prerequisites, local setup, workspace management, and deployment workflows |
| [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) | Adobe IMS authentication, OAuth flow, multi-tenancy, and token management |
| [docs/API.md](docs/API.md) | RESTful API endpoints with curl examples and error reference |
| [docs/GRAPHQL.md](docs/GRAPHQL.md) | GraphQL Mesh configuration, schema, and query/mutation examples |
| [docs/UI.md](docs/UI.md) | React Spectrum UI components, features, and integration guide |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Review data model, field definitions, validation rules, and storage |

### Reference

| Document | Description |
|----------|-------------|
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and solutions (auth, API, UI, deployment) |
| [docs/SECURITY.md](docs/SECURITY.md) | Security practices, compliance, and incident response |

## API Overview

Base URL: `https://{NAMESPACE}.adobeioruntime.net/api/v1/web/review`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/create-review` | POST | Create a new review |
| `/update-reviews` | PUT | Batch update reviews |
| `/delete-reviews-by-ids` | POST | Batch delete reviews |
| `/get-list-reviews` | POST | List reviews with filters, pagination, sorting |
| `/get-reviews-by-ids` | POST | Fetch reviews by IDs |
| `/state-test` | POST | Diagnostic storage connectivity check |

All endpoints require `Authorization: Bearer {IMS_TOKEN}` and `x-gw-ims-org-id: {ORG_ID}` headers. See [docs/API.md](docs/API.md) for full reference.

## Database Indexing

For faster queries at scale, create indexes on frequently filtered fields:

```bash
aio app db index create reviews -k sku
aio app db index create reviews -k status -k created_at
aio app db index create reviews -k rating
```

## Notes

- `.env` is generated by `aio app use` and must not be committed.
- Admin UI SDK menu registration is handled by `actions/registration/index.js`.
- IMS tokens are required for all authenticated actions.
- UI log level is controlled via `window.APP_CONFIG.LOG_LEVEL` in `web-src/index.html` (e.g. `debug`, `info`, `warn`, `error`).

## Additional Resources

- [Adobe App Builder Documentation](https://developer.adobe.com/app-builder/docs)
- [Adobe I/O Runtime Documentation](https://developer.adobe.com/runtime/docs/)
- [GraphQL Mesh Documentation](https://www.graphql-mesh.com/)
- [React Spectrum Documentation](https://react-spectrum.adobe.com/)
