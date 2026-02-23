## 1. GitHub API Functions (github.js)

- [x] 1.1 Add `fetchUserOrgs()` function - GET /user/orgs
- [x] 1.2 Add `fetchOrgInfo(org)` function - GET /orgs/{org}
- [x] 1.3 Add `fetchOrgRepos(org)` function - GET /orgs/{org}/repos
- [x] 1.4 Add `fetchOrgTeams(org)` function - GET /orgs/{org}/teams
- [x] 1.5 Add `fetchTeamRepos(org, team)` function - GET /orgs/{org}/teams/{team_slug}/repos
- [x] 1.6 Add `fetchTeamMembers(org, team)` function - GET /orgs/{org}/teams/{team_slug}/members
- [x] 1.7 Add caching for org/team API responses

## 2. Command Functions (commands.js)

- [x] 2.1 Add `cmdOrg(terminal, githubUser, args)` function
- [x] 2.2 Implement `org` (no args) - list organizations
- [x] 2.3 Implement `org <name>` - navigate to org and list repos
- [x] 2.4 Implement `org <name> --info` - show org details
- [x] 2.5 Add `cmdTeams(terminal, githubUser, args)` function
- [x] 2.6 Implement `teams` - list teams in current org
- [x] 2.7 Implement `team <name>` - list team repos
- [x] 2.8 Implement `team <name> --members` - list team members
- [x] 2.9 Register `org` and `team` commands in command registry
- [x] 2.10 Update help output with Organizations & Teams section
- [x] 2.11 Add `org` and `team` to tab completion list

## 3. Organization Context (app.js)

- [x] 3.1 Add `currentOrg` state variable to track organization context
- [x] 3.2 Add `setCurrentOrg(org)` method
- [x] 3.3 Add `getCurrentOrg()` method
- [x] 3.4 Pass organization context to commands that need it

## 4. Path Navigation (commands.js)

- [ ] 4.1 Update `parsePath()` to recognize `@org` format
- [ ] 4.2 Update `resolvePath()` to handle org-prefixed paths
- [ ] 4.3 Update `cd` command to support `cd @org` navigation
- [ ] 4.4 Update `ls` at root to show organizations with `@` prefix

## 5. Tests (tests/unit/orgs-teams.test.js)

- [x] 5.1 Test `fetchUserOrgs()` returns formatted org list
- [x] 5.2 Test `fetchOrgInfo()` returns org details
- [x] 5.3 Test `fetchOrgRepos()` returns repo list
- [x] 5.4 Test `fetchOrgTeams()` returns team list
- [x] 5.5 Test `fetchTeamRepos()` returns team repos
- [x] 5.6 Test `fetchTeamMembers()` returns member list
- [x] 5.7 Test `cmdOrg` command signature (terminal, githubUser, args)
- [x] 5.8 Test `cmdTeams` command signature (terminal, githubUser, args)
- [ ] 5.9 Test path parsing with `@org` format
- [x] 5.10 Test error handling for missing `read:org` scope

## 6. Documentation

- [ ] 6.1 Update shared-decisions.md OAuth scope to include `read:org`
