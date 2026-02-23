## 1. API Functions (github.js)

- [x] 1.1 Add fetchNotifications(all) function - GET /notifications
- [x] 1.2 Add markNotificationsRead() function - PUT /notifications
- [x] 1.3 Add fetchWorkflowRuns(owner, repo) function - GET /repos/{owner}/{repo}/actions/runs
- [x] 1.4 Add fetchWorkflowRun(owner, repo, runId) function - GET /repos/{owner}/{repo}/actions/runs/{run_id}
- [x] 1.5 Add fetchWorkflowLogs(owner, repo, runId) function - GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs
- [x] 1.6 Add rerunWorkflow(owner, repo, runId) function - POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun
- [x] 1.7 Add fetchWorkflows(owner, repo) function - GET /repos/{owner}/{repo}/actions/workflows

## 2. Notifications Command (commands.js)

- [x] 2.1 Add cmdNotifications(terminal, githubUser, args) function
- [x] 2.2 Implement notifications (show recent) subcommand
- [x] 2.3 Implement notifications --all flag
- [x] 2.4 Implement notifications --mark-read flag
- [x] 2.5 Add notifications and actions to command registry
- [x] 2.6 Add notifications and actions to help text
- [x] 2.7 Add notifications and actions to tab completion

## 3. Actions Command (commands.js)

- [x] 3.1 Add cmdActions(terminal, githubUser, args) function
- [x] 3.2 Implement actions (list runs) subcommand
- [x] 3.3 Implement actions view <run-id> subcommand
- [x] 3.4 Implement actions rerun <run-id> subcommand with confirmation
- [x] 3.5 Implement actions --repo flag (list workflows)

## 4. Tests

- [x] 4.1 Create tests/unit/notifications-actions.test.js
- [x] 4.2 Add tests for notifications command
- [x] 4.3 Add tests for actions command
- [x] 4.4 Add tests for API functions
