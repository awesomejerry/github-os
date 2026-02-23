## Context

GitHub OS is a browser-based terminal emulator for navigating GitHub repositories. Currently, it only supports browsing personal repositories (`~` path). This design adds support for GitHub Organizations and Teams, following the command patterns established in `shared-decisions-phase9-10.md`.

The implementation follows existing patterns:
- Command signature: `function cmdXxx(terminal, githubUser, args)` 
- API functions in `github.js` with caching
- Terminal output formatting with HTML classes

## Goals / Non-Goals

**Goals:**
- Enable users to list and explore their organizations
- Enable users to list teams within an organization
- Enable users to list repos and members for each team
- Support `@org` path navigation format
- Maintain consistency with existing command patterns

**Non-Goals:**
- Organization/Team administration (create, delete, update)
- Team membership management
- Organization settings modification
- Phase 10 features (Notifications & Actions)

## Decisions

### 1. Organization Context Management
**Decision**: Use a simple context variable in app.js to track current organization.

**Rationale**: Similar to how `githubUser` is passed through commands, we'll add `currentOrg` to the app state. When user runs `org <name>`, it sets the organization context.

**Alternative Considered**: Path-based context (parsing @org from current path). Rejected as more complex without clear benefit for this use case.

### 2. Path Format
**Decision**: Use `@org/repo` format for organization paths, distinct from personal repos.

**Rationale**: 
- Clear visual distinction between personal and org repos
- Aligns with GitHub's `@` mention conventions
- Easy to parse and extend

**Example**:
```
/                      # Root: shows organizations
~                      # Personal repos (current user)
@github                # Navigate to github org
@github/actions        # Navigate to actions repo in github org
```

### 3. Command Structure
**Decision**: Separate `org` and `team` commands with subcommands as flags.

**Rationale**: Follows existing patterns (`issues view`, `pr create`) and provides clear command hierarchy.

```
org                    → list user's orgs
org <name>             → navigate to org context
org <name> --info      → show org details
teams                  → list teams in current org
team <name>            → list team repos  
team <name> --members  → list team members
```

### 4. API Caching Strategy
**Decision**: Cache org/team data with same strategy as repos (keyed by org/team name).

**Rationale**: Org/team data changes infrequently. Cache invalidation on `clearCache()` is sufficient.

**Cache Keys**:
- `orgs:user` - List of user's orgs
- `org:{org}` - Organization details
- `org:{org}:repos` - Organization repos
- `org:{org}:teams` - Organization teams
- `team:{org}:{team}:repos` - Team repos
- `team:{org}:{team}:members` - Team members

### 5. Error Handling
**Decision**: Graceful error messages for permission/404 scenarios.

**Rationale**: Users may lack access to private orgs/teams. Clear error messages improve UX.

**Error Scenarios**:
- 404: Organization not found / No access
- 403: Missing `read:org` scope (prompt to re-login)
- Empty results: "No teams found" / "No members found"

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| API rate limit (many org/team API calls) | Implement caching, show loading states |
| Missing `read:org` scope | Detect 403, show re-login prompt with scope explanation |
| Large organizations (many teams) | Limit list to 100 items, suggest filters |
| Organization context confusion | Clear terminal prompt showing current org context |
