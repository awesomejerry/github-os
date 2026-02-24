# notifications Specification

## Purpose
TBD - created by archiving change notifications-actions. Update Purpose after archive.
## Requirements
### Requirement: User can view notifications
The system SHALL allow authenticated users to view their GitHub notifications.

#### Scenario: View recent notifications
- **WHEN** user runs `notifications` command
- **THEN** system displays recent notifications with type icon, title, repository, and relative timestamp
- **AND** system shows total notification count

#### Scenario: View all notifications
- **WHEN** user runs `notifications --all` command
- **THEN** system displays all notifications (not limited to recent)
- **AND** system shows total notification count

#### Scenario: Notifications without authentication
- **WHEN** unauthenticated user runs `notifications` command
- **THEN** system displays error message "Authentication required. Use 'login' to connect."

### Requirement: User can mark notifications as read
The system SHALL allow authenticated users to mark all notifications as read.

#### Scenario: Mark all notifications as read
- **WHEN** user runs `notifications --mark-read` command
- **THEN** system marks all notifications as read
- **AND** system displays success confirmation

#### Scenario: Mark read without authentication
- **WHEN** unauthenticated user runs `notifications --mark-read` command
- **THEN** system displays error message "Authentication required. Use 'login' to connect."

### Requirement: Notifications output format
The system SHALL format notifications output consistently.

#### Scenario: Notification output format
- **WHEN** notifications are displayed
- **THEN** each notification shows:
  - Icon indicating type (🔔 Issue, ✅ PR merged, 💬 Comment)
  - Title with number
  - Repository name in parentheses
  - Actor and relative timestamp on second line

### Requirement: Empty notifications state
The system SHALL handle empty notification list gracefully.

#### Scenario: No notifications
- **WHEN** user has no notifications
- **THEN** system displays "No notifications" message

