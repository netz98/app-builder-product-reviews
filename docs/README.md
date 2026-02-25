# Product Reviews Application - Developer Guide

Welcome to the Product Reviews Application documentation. This Adobe App Builder application provides a serverless API for managing product reviews with a React-based admin interface.

## Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Documentation Index](#documentation-index)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Login to Adobe I/O
aio console:login

# 3. Select your organization
aio console:org:select

# 4. Select your project
aio console:project:select

# 5. Select workspace (Production/Stage/Development)
aio console:workspace:select

# 6. Link local project to selected workspace
aio app use

# 7. Run tests
npm test

# 8. Start local development server
aio app run

# 9. Open UI at http://localhost:9080
```

**Note:** After initial setup, you can switch between workspaces anytime:
```bash
aio app use  # Select different workspace (Production/Stage/Development)
```

---

## Overview

**Key Features:**
- RESTful API for CRUD operations on product reviews
- Adobe IMS authentication for secure access
- Multi-tenant data isolation by organization
- React Spectrum UI for review management
- GraphQL Mesh integration for unified API layer
- Persistent storage via App Builder DB (Document DB)

**Architecture:**
- **Frontend:** React with Adobe React Spectrum components
- **Backend:** Node.js 18 serverless actions on Adobe I/O Runtime
- **Storage:** App Builder DB (Document DB)
- **Auth:** Adobe IMS (Identity Management System)
- **Integration:** GraphQL Mesh for Commerce backend UI extension

**Test Coverage:** 154 unit tests passing

---

## Documentation Index

### Core Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](SETUP.md) | Prerequisites, local setup, and management commands |
| [AUTHENTICATION.md](AUTHENTICATION.md) | Adobe IMS authentication and security |
| [API.md](API.md) | RESTful API endpoints with examples |
| [GRAPHQL.md](GRAPHQL.md) | GraphQL Mesh configuration and queries |
| [UI.md](UI.md) | React Spectrum UI usage and features |
| [DATA_MODEL.md](DATA_MODEL.md) | Review data model and storage |

### Database Indexing

For faster filters at scale, create indexes on frequently queried fields:

```bash
aio app db index create reviews -k sku
aio app db index create reviews -k status -k created_at
aio app db index create reviews -k rating
```

### Reference Documentation

| Document | Description |
|----------|-------------|
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions |
| [SECURITY.md](SECURITY.md) | Security considerations and best practices |

---

## Project Structure

```
product-reviews/
├── actions/              # Serverless actions (backend API)
│   ├── utils.js         # Shared utilities
│   ├── storage-repository.js
│   └── review.js        # Review logic and validation
├── web-src/             # React frontend
│   └── src/
│       └── components/
│           ├── Action/
│           ├── App/
│           └── ReviewsTable/
├── tests/               # Unit and E2E tests
├── mesh.json           # GraphQL Mesh configuration
└── docs/               # Documentation (this directory)
```

---

## For PHP Developers

If you're integrating from a PHP application (e.g., Magento):

- Use **REST APIs** with cURL for testing and custom integrations
- Use **GraphQL Mesh** for Commerce Backend UI integration
- Authentication is automatic when accessed from Commerce Backend UI
- For custom integrations, implement Adobe IMS OAuth flow

All documentation provides curl examples that can be easily adapted to PHP HTTP clients.

---

## Additional Resources

- [Adobe App Builder Documentation](https://developer.adobe.com/app-builder/docs)
- [Adobe I/O Runtime Documentation](https://developer.adobe.com/runtime/docs/)
- [GraphQL Mesh Documentation](https://www.graphql-mesh.com/)
- [React Spectrum Documentation](https://react-spectrum.adobe.com/)

---

## UI logging
UI log level is controlled via `window.APP_CONFIG.LOG_LEVEL` in `web-src/index.html` (e.g. `debug`, `info`, `warn`, `error`).
