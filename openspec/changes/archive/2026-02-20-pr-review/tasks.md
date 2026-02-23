## 1. API Layer

- [x] 1.1 Verify `fetchPRFiles` in `scripts/github.js` - GET `/repos/{owner}/{repo}/pulls/{number}/files`
- [x] 1.2 Verify `createReview` in `scripts/github.js` - POST `/repos/{owner}/{repo}/pulls/{number}/reviews`
- [x] 1.3 Verify `fetchPRComments` in `scripts/github.js` - Fetches review + issue comments
- [x] 1.4 Verify `addPRComment` in `scripts/github.js` - POST `/repos/{owner}/{repo}/issues/{number}/comments`

## 2. Command Layer

- [x] 2.1 Verify `cmdPrReview` handles `pr review <number>` to view PR files
- [x] 2.2 Verify `cmdPrReview` handles `pr review <number> --approve`
- [x] 2.3 Verify `cmdPrReview` handles `pr review <number> --request-changes`
- [x] 2.4 Verify `cmdPrReview` handles `pr review <number> --comment "text"`
- [x] 2.5 Verify `cmdPrComments` lists PR comments with type indicators
- [x] 2.6 Verify `cmdPrComment` adds general PR comment

## 3. Tests

- [x] 3.1 Verify tests for `fetchPRFiles` (success, 404, 500)
- [x] 3.2 Verify tests for `createReview` (APPROVE, REQUEST_CHANGES, COMMENT, errors)
- [x] 3.3 Verify tests for `fetchPRComments` (both types, empty, errors)
- [x] 3.4 Verify tests for `addPRComment` (success, errors)

## 4. Verification

- [x] 4.1 Run tests: `npm test tests/unit/pr-review.test.js`
- [x] 4.2 Verify spec coverage matches implementation
