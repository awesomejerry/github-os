# Proposal: Add Loading Indicators

## Why

When API calls take time (especially for large repos or slow connections), users see no feedback. This makes the terminal feel unresponsive and broken.

## What Changes

Add a simple loading indicator that:
- Shows "Loading..." text before API calls
- Clears when data arrives
- Works for all async commands (ls, cat, log, branch, issues, releases, contributors, etc.)

## Capabilities

### Modified Capabilities

- `terminal`: Add loading state display
- `commands`: Show loading before async operations

## Impact

- New `showLoading()` and `hideLoading()` methods in Terminal class
- Update async commands to show loading state
- Better UX for slow operations
