# Setup and Management Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Management Commands](#management-commands)
4. [Configuration Management](#configuration-management)

---

## Prerequisites

### Required Software

- **Node.js**: Version 14.x or higher
- **Adobe I/O CLI**: Installed globally
  ```bash
  npm install -g @adobe/aio-cli
  ```
- **Adobe Account**: With access to Adobe Developer Console and App Builder

### Account Requirements

- Experience Cloud integration
- App Builder project configuration
- Commerce Backend UI extension project (for Mesh integration)
- App Builder workspace configured

---

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages for both frontend and backend actions.

### 2. Select Organization and Project

Before working with the project, you need to select your organization and project context in Adobe I/O.

#### Step 2a: Authenticate with Adobe I/O

```bash
aio console:login
```

This will open a browser window where you authenticate with your Adobe ID.

#### Step 2b: Select Organization

```bash
aio console:org:select
```

This lists all organizations you have access to. Select your company/organization from the list.

**Example output:**
```
? Select an organization:
  Company A (OrgA@AdobeOrg)
❯ Company B (OrgB@AdobeOrg)  ← Select this
  Company C (OrgC@AdobeOrg)
```

#### Step 2c: Select Project

```bash
aio console:project:select
```

This lists all App Builder projects in your selected organization. Select your product reviews project.

**Example output:**
```
? Select a project:
  Commerce App
❯ Product Review App  ← Select this
  Analytics Dashboard
```

#### Step 2d: Select Workspace

```bash
aio console:workspace:select
```

This lists all workspaces for the selected project. Workspaces typically include:
- `Production` - Live production environment
- `Stage` - Staging/pre-production environment
- `Development` - Development/testing environment

**Example output:**
```
? Select a workspace:
  Development
❯ Production  ← Select this for production deployment
  Stage
```

### 3. Configure Local Environment

After selecting your organization, project, and workspace, link the project to your local directory:

```bash
aio app use
```

This command will:
1. Detect your current project configuration
2. Link your local directory to the selected project/workspace
3. Generate `.env` file with runtime credentials
4. Configure authentication for API calls

**Generated `.env` file:**
```bash
# Adobe I/O Runtime credentials
AIO_RUNTIME_AUTH=your-runtime-auth-token
AIO_RUNTIME_NAMESPACE=your-namespace
AIO_PROJECT=product-review-app
AIO_WORKSPACE=production

# Optional: Configure hostname for testing
CNA_HOSTNAME=adobeioruntime.net

# Optional: Log level for debugging
LOG_LEVEL=warn
```

**Important:**
- The `.env` file must NOT be committed to version control
- Credentials are workspace-specific (different for prod/stage/dev)
- For E2E tests, set `LOG_LEVEL=warn` to reduce logging

### 4. Switching Between Workspaces (Prod/Stage/Dev)

When working on different environments (production, stage, development), you can easily switch:

#### View Current Workspace

```bash
aio app use --list
```

This shows your current project and workspace configuration.

#### Switch to Different Workspace

```bash
aio app use
```

This will prompt you to:
1. Select organization (if not already selected)
2. Select project (if not already selected)
3. Select workspace (this is what changes)

**Example workflow:**
```bash
# Start with Production workspace
$ aio app use
? Select a workspace: Production
✅ Linked to Product Review App / Production

# Later, switch to Stage workspace
$ aio app use
? Select a workspace: Stage
✅ Linked to Product Review App / Stage

# Switch back to Production
$ aio app use
? Select a workspace: Production
✅ Linked to Product Review App / Production
```

**What happens when switching:**
- `.env` file is updated with new workspace credentials
- Runtime namespace changes to match workspace
- All subsequent deployments go to selected workspace
- API calls authenticate against selected workspace

### 5. Verify Installation

```bash
npm test
```

All unit tests should pass (154 tests total).

---

## Management Commands

### Development

**Run local server (UI local, actions remote):**
```bash
aio app run
```

**Run local server with local actions:**
```bash
aio app dev
```

**Difference between `run` vs `dev`:**
- `aio app run`: Frontend runs locally, actions are deployed to remote runtime
- `aio app dev`: Both frontend and actions run locally (for full debugging)

---

### Testing

**Run unit tests:**
```bash
npm test
```

Expected: 154 tests passing

**Run E2E tests:**
```bash
npm run e2e
```

Note: E2E tests require deployed endpoints and authentication configuration.

**Run linter:**
```bash
npm run lint
```

Expected: 0 errors, 0 warnings

---

### Deployment

**Deploy to production:**
```bash
aio app deploy
```

This will:
- Build frontend assets
- Deploy actions to Adobe I/O Runtime
- Upload static files to CDN
- Configure GraphQL Mesh endpoints

**Undeploy (remove from production):**
```bash
aio app undeploy
```

This will remove all actions and static files from Adobe I/O Runtime.

---

### Configuration Management

#### Workspace Management

Adobe App Builder uses a hierarchical structure for managing projects across different environments:

**Hierarchy:**
```
Organization
  └── Project
       └── Workspace (Production | Stage | Development)
```

**View Current Configuration:**
```bash
aio app use --list
```

This displays:
- Current organization
- Current project
- Current workspace
- Runtime namespace

**Example output:**
```
Current Configuration:
  Organization: Company B (OrgB@AdobeOrg)
  Project: Product Review App
  Workspace: Production
  Runtime Namespace: 714154-545silverhare
```

#### Switching Between Environments

**Switch Workspace (Production → Stage):**
```bash
aio app use
```

Follow the prompts:
1. Select organization (or press Enter to keep current)
2. Select project (or press Enter to keep current)
3. Select workspace (select "Stage")

**Switch Workspace (Stage → Development):**
```bash
aio app use
```

Follow the same process, select "Development" workspace.

#### Common Workflow Patterns

**Pattern 1: Development → Stage → Production**
```bash
# 1. Develop on Development workspace
$ aio app use
? Select workspace: Development
$ aio app run  # Local development against dev

# 2. Deploy to Stage for testing
$ aio app use
? Select workspace: Stage
$ aio app deploy  # Deploy to staging

# 3. Promote to Production
$ aio app use
? Select workspace: Production
$ aio app deploy  # Deploy to production
```

**Pattern 2: Hotfix in Production**
```bash
# 1. Switch directly to Production workspace
$ aio app use
? Select workspace: Production

# 2. Make changes locally
# 3. Deploy directly to production
$ aio app deploy

# 4. After fix, switch back to Development
$ aio app use
? Select workspace: Development
```

#### Best Practices

1. **Always verify workspace before deploying:**
   ```bash
   aio app use --list  # Check current workspace
   ```

2. **Use separate workspaces for each environment:**
   - Development: Feature development and testing
   - Stage: Pre-production testing and UAT
   - Production: Live production environment

3. **Keep workspaces in sync:**
   - Use git to manage code across workspaces
   - Deploy same code to different workspaces
   - Workspace selection determines where code is deployed

4. **Test in Stage before Production:**
   ```bash
   # Deploy to Stage first
   $ aio app use
   ? Select workspace: Stage
   $ aio app deploy

   # Test thoroughly, then deploy to Production
   $ aio app use
   ? Select workspace: Production
   $ aio app deploy
   ```

#### Workspace-Specific Configuration

Each workspace can have different:
- Runtime namespace
- API credentials
- Environment variables
- Service integrations

**Example: Different API endpoints per workspace**
```bash
# Development workspace
AIO_RUNTIME_NAMESPACE=dev-namespace
LOG_LEVEL=debug

# Stage workspace
AIO_RUNTIME_NAMESPACE=stage-namespace
LOG_LEVEL=info

# Production workspace
AIO_RUNTIME_NAMESPACE=prod-namespace
LOG_LEVEL=warn
```

---

## Configuration Management

### Environment Variables

**Set production log level:**
```bash
aio app deploy --env LOG_LEVEL=warn
```

**Multiple environment variables:**
```bash
aio app deploy --env LOG_LEVEL=warn --env DEBUG=false
```

**Via Adobe IO Console:**
1. Go to Adobe IO Console
2. Select your project
3. Navigate to Workspace → Runtime
4. Add environment variable:
   - Name: `LOG_LEVEL`
   - Value: `warn` or `error` or `info`

### Log Levels

- `error`: Only critical errors
- `warn`: Warnings and errors (recommended for production)
- `info`: All logs including info/debug (useful for debugging)
- `debug`: All logs including debug messages (development)

### Environment Files

**`.env` file (local development):**
```
AIO_RUNTIME_AUTH=your-auth-token
AIO_RUNTIME_NAMESPACE=your-namespace
CNA_HOSTNAME=adobeioruntime.net
```

**Important:**
- Never commit `.env` to version control
- `.env` is excluded from git via `.gitignore`
- Different environments use different credentials

---

## Troubleshooting Setup Issues

### "aio: command not found"

**Problem:** Adobe I/O CLI not installed

**Solution:**
```bash
npm install -g @adobe/aio-cli
```

### "Authentication failed"

**Problem:** Invalid Adobe credentials or workspace

**Solution:**
1. Verify your Adobe account has App Builder access
2. Run `aio app use` again and select correct workspace
3. Check Adobe Developer Console for project status

### "Tests failing"

**Problem:** Unit tests not passing

**Solution:**
1. Ensure all dependencies installed: `npm install`
2. Check Node.js version: `node --version` (should be 14+)
3. Run linter first: `npm run lint`
4. Check test output for specific errors

### "Deployment failed"

**Problem:** `aio app deploy` failing

**Solution:**
1. Verify workspace configured: `aio app use --list`
2. Check internet connection
3. Review deployment logs for specific errors
4. Ensure no .env file issues

---

## Summary

You now have:
- ✅ Adobe I/O CLI installed
- ✅ App Builder workspace configured
- ✅ Local environment set up
- ✅ All tests passing

**Next Steps:**
1. Read [AUTHENTICATION.md](AUTHENTICATION.md) to understand authentication
2. Read [API.md](API.md) to learn about API endpoints
3. Run `aio app run` to start development
