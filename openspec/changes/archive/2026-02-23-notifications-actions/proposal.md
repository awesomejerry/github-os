## Why

Users need to monitor their GitHub activity and manage CI/CD workflows directly from the terminal. Currently, users must switch to github.com to check notifications or view/re-run GitHub Actions. This change brings these essential workflows into the terminal, reducing context switching and enabling faster iteration on CI/CD pipelines.

## What Changes

### Notifications Commands
- `notifications` - Display recent notifications with formatted output
- `notifications --all` - Display all notifications (not just recent)
- `notifications --mark-read` - Mark all notifications as read

### Actions Commands
- `actions` - List workflow runs for current repository
- `actions view <run-id>` - View run details including job steps and logs
- `actions rerun <run-id>` - Re-run a failed or completed workflow
- `actions --repo` - List available workflows in the repository

### API Functions
- Notifications API: fetch notifications, mark as read
- Actions API: fetch runs, fetch run details, fetch logs, rerun workflow, list workflows

## Capabilities

### New Capabilities
- `notifications`: GitHub notifications management - viewing and marking notifications as read
- `actions`: GitHub Actions workflow management - listing runs, viewing details/logs, and re-running workflows

### Modified Capabilities
- None - This is a new feature addition

## Impact

### Files Modified
- `scripts/commands.js` - Add `cmdNotifications` and `cmdActions` functions, update command registry
- `scripts/github.js` - Add notifications and actions API functions

### Files Created
- `tests/unit/notifications-actions.test.js` - Unit tests for new commands

### API Endpoints Used
- `GET /notifications` - List notifications
- `PUT /notifications` - Mark notifications as read
- `GET /repos/{owner}/{repo}/actions/runs` - List workflow runs
- `GET /repos/{owner}/{repo}/actions/runs/{run_id}` - Get run details
- `GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs` - Get run logs
- `POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun` - Rerun workflow
- `GET /repos/{owner}/{repo}/actions/workflows` - List workflows

### Authentication Requirements
- Notifications: Requires `notifications` or `repo` scope
- Actions: Requires `repo` scope
- No public access available for these endpoints
