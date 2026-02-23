## VERIFIED Requirements

The following requirements in `openspec/specs/pr-command/spec.md` are verified as implemented:

### Requirement: PR Review Command
Verified: `cmdPrReview` in `scripts/commands.js:1914-2020`
- View PR files: `pr review <number>` lists files with +/-/~ status icons
- Approve: `pr review <number> --approve` calls `createReview` with APPROVE
- Request changes: `pr review <number> --request-changes` calls `createReview` with REQUEST_CHANGES
- Comment: `pr review <number> --comment "text"` calls `createReview` with COMMENT
- Auth required for write operations

### Requirement: PR Comments Command
Verified: `cmdPrComments` in `scripts/commands.js:2022-2078`
- Lists both review and issue comments with type indicator
- Shows author, path (for review comments), and truncated body

### Requirement: PR Comment Command
Verified: `cmdPrComment` in `scripts/commands.js:2080-2121`
- Adds general comment via `addPRComment` using Issues API
- Auth required

### API Functions
Verified in `scripts/github.js`:
- `fetchPRFiles` (line 1233-1269): GET `/repos/{owner}/{repo}/pulls/{number}/files`
- `createReview` (line 1271-1313): POST `/repos/{owner}/{repo}/pulls/{number}/reviews`
- `fetchPRComments` (line 1315-1371): GET both review and issue comments
- `addPRComment` (line 1373-1407): POST `/repos/{owner}/{repo}/issues/{number}/comments`

### Test Coverage
Verified in `tests/unit/pr-review.test.js`:
- fetchPRFiles: success, 404, 500 errors
- createReview: APPROVE, REQUEST_CHANGES, COMMENT, auth/permission/404/422 errors
- fetchPRComments: both types, empty, errors
- addPRComment: success, auth/permission/404 errors
