## Context

The issues management functionality is already implemented in the codebase. The current implementation provides:
- `issues` - lists open issues
- `issues --all` / `issues --closed` - list all/closed issues
- `issues view <number>` - view issue details
- `issues create [-t "title"] [-b "body"]` - create issues
- `issues close <number>` - close issue with confirmation
- `issues reopen <number>` - reopen issue with confirmation  
- `issues comment <number> "text"` - add comment

The Phase 10 spec requires updating the output format for `issues` list to show more detailed information per issue.

## Goals / Non-Goals

**Goals:**
- Update `listIssues` output format to match Phase 10 spec
- Add comments count and updated_at timestamp to issue list display
- Show status line with state indicator

**Non-Goals:**
- Adding new commands (already implemented)
- Modifying API functions (already support required data)
- Changing authentication/authorization logic

## Decisions

### 1. Output Format Change
**Decision:** Update `listIssues` to use multi-line format per issue

Current format:
```
#42 Title @author [labels] (2 days ago)
```

Phase 10 format:
```
#42 Bug: Login fails on Safari [bug] by contributor
   Status: open | 5 comments | Updated 2 days ago
```

**Rationale:** Provides more context at a glance without needing to view each issue.

### 2. Data Requirements
**Decision:** Extend `fetchRepoIssues` response to include `comments` and `updated_at`

The GitHub API already returns these fields, we just need to pass them through.

### 3. Confirmation Dialogs
**Decision:** Keep existing confirmation dialogs for `close` and `reopen`

These already match the Phase 10 requirement for confirmation (similar to `pr merge`).

## Risks / Trade-offs

- **Output length:** Multi-line format takes more terminal space → Acceptable for improved readability
- **Backward compatibility:** Tests expect current format → Update tests to match new format
