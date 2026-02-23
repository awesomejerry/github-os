## Why

GitHub OS currently only supports browsing personal repositories. Users who are members of GitHub organizations need the ability to explore organizational resources including organization repos, teams, and team-specific repositories. This enables a more complete GitHub CLI experience for organization members and team collaborators.

## What Changes

- **New Commands**:
  - `org` - List user's organizations
  - `org <name>` - Navigate to organization repos
  - `org <name> --info` - Show organization details
  - `teams` - List teams in current organization context
  - `team <name>` - List repositories accessible to a team
  - `team <name> --members` - List team members

- **Path Navigation**:
  - Support `@org` format for organization paths (e.g., `@github/actions`, `@microsoft/vscode`)
  - Root path `/` shows organizations alongside `~` (personal repos)

- **API Integration**:
  - New GitHub API endpoints for organizations and teams
  - Requires `read:org` OAuth scope for private org/team access

## Capabilities

### New Capabilities

- `orgs-teams`: Organizations and teams navigation, listing, and exploration commands

### Modified Capabilities

- `navigation`: Path parsing updated to support `@org` format and organization context

## Impact

**Affected Files**:
- `scripts/commands.js` - New cmdOrg, cmdTeams functions and command registration
- `scripts/github.js` - New API functions for orgs/teams endpoints
- `scripts/navigation.js` - Path parsing for @org format (if exists)
- `scripts/app.js` - Organization context management

**API Endpoints** (new):
- `GET /user/orgs` - List user's organizations
- `GET /orgs/{org}` - Get organization details
- `GET /orgs/{org}/repos` - List organization repos
- `GET /orgs/{org}/teams` - List organization teams
- `GET /orgs/{org}/teams/{team_slug}/repos` - List team repos
- `GET /orgs/{org}/teams/{team_slug}/members` - List team members

**Authentication**:
- Requires `read:org` scope for accessing private org/team data
- Public orgs accessible without additional scope

**Tests**:
- New test file: `tests/unit/orgs-teams.test.js`
