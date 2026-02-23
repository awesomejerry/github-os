# Shared Decisions - GitHub OS Phase 9 & 10

> Phase 9: Organizations & Teams | Phase 10: Notifications & Actions

---

## Phase 9: Organizations & Teams

### 1. Org Commands

```bash
org                     # List user's organizations
org <name>              # Navigate to org repos
org <name> --info       # Show org details
```

### 2. Team Commands

```bash
teams                   # List teams in current org
team <name>             # List repos in team
team <name> --members   # List team members
```

### 3. Path Structure

```
/                           # Root
├── ~                       # Your repos (current)
├── @github                 # Organization
│   ├── actions/
│   ├── docs/
│   └── octocat/
├── @microsoft/
│   ├── vscode/
│   └── typescript/
```

### 4. GitHub API Endpoints

```javascript
// List user's orgs
GET /user/orgs

// Get org details
GET /orgs/{org}

// List org repos
GET /orgs/{org}/repos

// List org teams
GET /orgs/{org}/teams

// List team repos
GET /orgs/{org}/teams/{team_slug}/repos

// List team members
GET /orgs/{org}/teams/{team_slug}/members
```

### 5. Commands Implementation

```javascript
// scripts/commands.js
async function cmdOrg(terminal, githubUser, args) {
  // org -> list orgs
  // org <name> -> navigate to org
  // org <name> --info -> show org details
}

async function cmdTeams(terminal, githubUser, args) {
  // teams -> list teams
  // team <name> -> list team repos
  // team <name> --members -> list members
}
```

---

## Phase 10: Notifications & Actions

### 1. Notification Commands

```bash
notifications            # Show recent notifications
notifications --all      # Show all notifications
notifications --mark-read # Mark all as read
```

### 2. Actions Commands

```bash
actions                 # List workflow runs
actions view <run-id>   # View run details & logs
actions rerun <run-id>  # Rerun workflow
actions --repo          # List repo workflows
```

### 3. Output Format

#### Notifications
```bash
$ notifications

Recent notifications:

🔔 Issue: Bug in login #42 (awesomejerry/repo)
   opened by contributor, 2 hours ago

✅ PR merged: Add feature #123 (awesomejerry/repo)
   merged by reviewer, 5 hours ago

💬 Comment on Issue #40 (awesomejerry/repo)
   by team-member, 1 day ago

3 notification(s)
```

#### Actions
```bash
$ actions

Workflow runs for awesomejerry/repo:

✅ CI (#456) - main
   Status: success | Duration: 2m 34s | 1 hour ago

❌ Test (#455) - feature/xyz
   Status: failure | Duration: 5m 12s | 3 hours ago

🔄 Deploy (#454) - main
   Status: in_progress | Started: 10 minutes ago

10 runs total
```

### 4. GitHub API Endpoints

```javascript
// List notifications
GET /notifications
Query: { all: boolean, participating: boolean }

// Mark as read
PUT /notifications

// List workflow runs
GET /repos/{owner}/{repo}/actions/runs

// Get workflow run
GET /repos/{owner}/{repo}/actions/runs/{run_id}

// Get run logs
GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs

// Rerun workflow
POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun

// List workflows
GET /repos/{owner}/{repo}/actions/workflows
```

### 5. Commands Implementation

```javascript
// scripts/commands.js
async function cmdNotifications(terminal, githubUser, args) {
  // notifications -> show recent
  // notifications --all -> show all
  // notifications --mark-read -> mark read
}

async function cmdActions(terminal, githubUser, args) {
  // actions -> list runs
  // actions view <id> -> show details + logs
  // actions rerun <id> -> rerun
  // actions --repo -> list workflows
}
```

---

## File Structure

```
scripts/
├── commands.js         # Add cmdOrg, cmdTeams, cmdNotifications, cmdActions
├── github.js           # Add orgs/teams/notifications/actions API functions

openspec/specs/
├── orgs-teams/         # NEW - Phase 9
└── notifications-actions/  # NEW - Phase 10
```

---

## Authentication Requirements

**Phase 9 (Orgs & Teams):**
- Requires `read:org` scope
- Public orgs accessible without auth
- Private orgs require membership + auth

**Phase 10 (Notifications & Actions):**
- Requires auth (no public access)
- Notifications: `notifications` or `repo` scope
- Actions: `repo` scope

---

## 驗證清單

### Phase 9
- [ ] `org` lists organizations
- [ ] `org <name>` navigates to org
- [ ] `teams` lists teams
- [ ] `team <name>` lists team repos
- [ ] Path navigation works (@org/repo)
- [ ] Tests pass

### Phase 10
- [ ] `notifications` shows notifications
- [ ] `notifications --all` shows all
- [ ] `actions` lists workflow runs
- [ ] `actions view <id>` shows details
- [ ] `actions rerun <id>` reruns workflow
- [ ] Tests pass

---

*Last updated: 2026-02-23*
*Version: v2.5-alpha*
