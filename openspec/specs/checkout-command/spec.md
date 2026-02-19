# Checkout Command Spec

## Overview

Switch between branches in a repository.

## Requirements

### 1. Command Signature
```javascript
cmdCheckout(terminal, githubUser, args)
```

### 2. Branch Validation
- Check if branch exists
- Fetch branches list from API
- Show error if branch not found

### 3. Branch Switching
- Update terminal state with current branch
- Clear branch cache
- Show success message

### 4. Error Handling
- Not in repository
- Branch not found
- API errors

## Usage

```bash
checkout main        # Switch to main branch
checkout feature-x   # Switch to feature-x
```

## Files

- `scripts/commands.js` - cmdCheckout
- `scripts/terminal.js` - currentBranch state

## Status

✅ Implemented in v2.1.0
