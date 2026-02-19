# Checkout Command Specification

## Purpose

Switch between branches in a repository.

---

## Requirements

### Requirement: Checkout existing branch
The system SHALL allow switching to an existing branch.

#### Scenario: Switch to existing branch
- GIVEN the user is in a repository
- AND the branch "feature-x" exists
- WHEN executing `checkout feature-x`
- THEN the current branch is set to "feature-x"
- AND the branch cache is cleared
- AND a success message is displayed

#### Scenario: Branch not found
- GIVEN the user is in a repository
- AND the branch "nonexistent" does not exist
- WHEN executing `checkout nonexistent`
- THEN an error "Branch 'nonexistent' not found" is displayed

---

### Requirement: Validate repository context
The system SHALL require being in a repository to checkout branches.

#### Scenario: Not in repository
- GIVEN the user is at root (`/`)
- WHEN executing `checkout main`
- THEN an error "Not in a repository" is displayed

---

## Files

- `scripts/commands.js` - cmdCheckout
- `scripts/terminal.js` - currentBranch state

## Status

✅ Implemented in v2.1.0
