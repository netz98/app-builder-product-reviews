h1. Product Reviews App Builder - Developer Setup & Environments

h2. Overview
This guide helps new developers set up the Product Reviews Adobe App Builder project locally, select the correct Adobe I/O project and workspace, and understand environment differences (stage vs prod).

h2. Prerequisites (macOS)
Install required tools with Homebrew:

Required:
{code:bash}
brew install node
brew install adobe/aio-cli/aio
{code}


Recommended versions:
* Node.js: 18.x LTS
* npm: 9+ (ships with Node)
* aio CLI: latest

Verify installations:
{code:bash}
node -v
npm -v
aio -v
{code}

h2. Access Requirements
You need:
* Access to the company Adobe Developer Console project
* An Adobe ID associated with the org
* Permission to the App Builder project and workspaces (stage and prod)

h2. Clone and Install Dependencies
{code:bash}
git clone <repo-url>
cd product-reviews
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

Tip: Workspaces map to environments (stage/prod). Confirm the active context with:
{code:bash}
aio config get
{code}

h2. Link the App Builder Project Locally
Fetch project settings and create local config (if not already present):
{code:bash}
aio app use
{code}

This syncs the local project with the selected Adobe I/O project/workspace.

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

Common commands (use the currently selected org/project/workspace):

Run mesh locally for development:
{code:bash}
aio api-mesh run mesh.json
{code}

Create a mesh from the local config:
{code:bash}
aio api-mesh create mesh.json
{code}

Update an existing mesh after edits:
{code:bash}
aio api-mesh update mesh.json
{code}

Inspect the deployed mesh:
{code:bash}
aio api-mesh describe
aio api-mesh status
aio api-mesh get --active
{code}

View recent mesh logs (use RayId when provided):
{code:bash}
aio api-mesh log-list
aio api-mesh log-get --rayid <ray-id>
{code}

Purge mesh cache (all entries):
{code:bash}
aio api-mesh cache purge --all
{code}

Notes:
* The Mesh forwards auth headers to the REST API as defined in `mesh.json`.
* When switching stage/prod workspaces, re-run `aio api-mesh describe` to confirm you are targeting the correct environment.

h2. Environment Overview (Stage vs Prod)
* Stage workspace is for testing, validation, and QA.
* Prod workspace is for live production traffic and user data.

Key differences:
* Stage data is non-production and can be reset more freely.
* Prod data is authoritative and must be protected.
* Stage is used for feature verification and integration testing.
* Prod is only updated via approved deployments.

h2. Deployment
Deploy to the currently selected workspace:
{code:bash}
aio app deploy
{code}

Verify the active workspace before deploying:
{code:bash}
aio config get
{code}

h2. Troubleshooting
* If you get permission errors, verify your org/project/workspace access in Adobe Developer Console.
* If actions fail locally, re-run `aio app use` to refresh configuration.
* For missing dependencies, remove `node_modules` and rerun `npm install`.

h2. Helpful References
* Project README: README.md
* Auth notes: AUTHENTICATION.md
