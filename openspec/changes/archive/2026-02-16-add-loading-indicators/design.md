## Context

Users see no feedback when API calls take time, making the terminal feel unresponsive.

## Goals / Non-Goals

**Goals:**
- Show loading indicator during async operations
- Simple spinner animation
- Works for all async commands

**Non-Goals:**
- Progress bars (API doesn't provide progress)
- Skeleton loading

## Decisions

### Implementation
- Add `showLoading(message)` and `hideLoading()` to Terminal class
- Use CSS spinner animation
- Show/hide around try/catch blocks

### Commands with loading
- ls, cat, info, log, branch, find, issues, releases, contributors, tree, grep, connect

## Risks / Trade-offs

- Minimal overhead
- Spinner uses CSS animation (no JS overhead)
