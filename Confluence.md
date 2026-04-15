h1. Product Reviews App Builder - Public Setup and Environments

h2. Overview
This guide helps developers set up the Product Reviews Adobe App Builder project locally, choose the correct Adobe Developer Console workspace, and understand environment differences (stage vs prod) in a public-safe way.

h2. Prerequisites (macOS)
Install required tools with Homebrew:

Required:
{code:bash}
brew install node
brew install adobe/aio-cli/aio
{code}

Recommended versions:
* Node.js: 18.x LTS
* npm: 9+
* aio CLI: latest

Verify installations:
{code:bash}
node -v
npm -v
aio -v
{code}

h2. Access Requirements
You need:
* An Adobe Developer Console project with App Builder enabled
* An Adobe ID associated with your organization
* Access to at least one workspace (for example stage and/or prod)

h2. Clone and Install Dependencies
{code:bash}
git clone <repo-url>
cd <project-folder>
npm install
{code}

If you see native build errors, ensure Xcode Command Line Tools are installed:
{code:bash}
xcode-select --install
{code}

h2. Authenticate with Adobe I/O (aio)
Log in to Adobe I/O:
{code:bash}
aio login
{code}

Confirm login and current context:
{code:bash}
aio config get
aio whoami
{code}

h2. Select Org, Project, and Workspace
List available orgs, projects, and workspaces:
{code:bash}
aio config list orgs
aio config list projects
aio config list workspaces
{code}

Select the correct org, project, and workspace:
{code:bash}
aio config set org <org-name>
aio config set project <project-name>
aio config set workspace <workspace-name>
{code}

Tip: workspaces usually map to environments (for example stage/prod). Confirm your active context with:
{code:bash}
aio config get
{code}

h2. Link the App Builder Project Locally
Fetch project settings and create local config (if not already present):
{code:bash}
aio app use
{code}

This syncs the local project with the selected Adobe Developer Console project/workspace.

h2. Local Development
Run UI and actions locally:
{code:bash}
aio app dev
{code}

Run UI locally while using remote actions:
{code:bash}
aio app run
{code}

h2. Common Scripts
{code:bash}
npm test
npm run lint
npm run e2e
{code}

h2. API Mesh (GraphQL) Commands and Usage
The project includes a GraphQL Mesh config in `mesh.json` that maps REST endpoints to GraphQL operations.

`mesh.json` in git is a template and may contain a placeholder base URL like `{NAMESPACE}`.
Before creating or updating Mesh, generate a deployable file with your real Runtime namespace.

Recommended command (scripted):
{code:bash}
npm run mesh:update
{code}

The script resolves namespace from the current workspace, renders `mesh.generated.json`, and runs Mesh update.

Optional namespace override:
{code:bash}
NAMESPACE=<your-namespace> npm run mesh:update
{code}

Manual alternative (if needed):
{code:bash}
NAMESPACE=$(aio config get runtime.namespace)
sed "s|{NAMESPACE}|$NAMESPACE|g" mesh.json > mesh.generated.json
aio api-mesh update mesh.generated.json
{code}

Then run Mesh commands with `mesh.generated.json`:
{code:bash}
aio api-mesh run mesh.generated.json
aio api-mesh create mesh.generated.json
aio api-mesh update mesh.generated.json
{code}

Inspect deployed mesh:
{code:bash}
aio api-mesh describe
aio api-mesh status
aio api-mesh get --active
{code}

View recent mesh logs:
{code:bash}
aio api-mesh log-list
aio api-mesh log-get --rayid <ray-id>
{code}

Purge mesh cache:
{code:bash}
aio api-mesh cache purge --all
{code}

Notes:
* Mesh forwards auth headers to REST endpoints as defined in `mesh.json`.
* Re-check workspace and namespace before Mesh deploy/update.
* Do not commit `mesh.generated.json`; keep only template config in git.
* You may temporarily set namespace directly in `mesh.json` and deploy that file, but do not commit namespace-specific values.

h2. Environment Overview (Stage vs Prod)
* Stage workspace is for testing, validation, and QA.
* Prod workspace is for live production traffic and user data.

Key differences:
* Stage data is non-production and may be reset.
* Prod data is authoritative and should be protected.
* Stage is used for feature verification and integration testing.
* Prod updates should follow your release and approval process.

h2. Deployment
Deploy to the currently selected workspace:
{code:bash}
aio app deploy
{code}

Verify active workspace before deploying:
{code:bash}
aio config get
{code}

h2. Troubleshooting
* If you get permission errors, verify your org/project/workspace access in Adobe Developer Console.
* If actions fail locally, re-run `aio app use` to refresh configuration.
* For missing dependencies, remove `node_modules` and run `npm install` again.

h2. Helpful References
* Project README: README.md
* Setup guide: docs/SETUP.md
* API reference: docs/API.md
* Auth notes: docs/AUTHENTICATION.md
