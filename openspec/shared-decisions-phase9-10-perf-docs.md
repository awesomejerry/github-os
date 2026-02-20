# Shared Decisions - GitHub OS v2.4 - Phase 9, 10, UX, Docs

> 所有 Issues、PR Review、Performance、Documentation 必須遵守此文件定義的規範

---

## Phase 10: Issues Management

### 1. Issue Commands

```bash
issues                    # List open issues
issues --all              # List all issues (including closed)
issues view <number>      # View issue details
issues create             # Create issue (interactive)
issues create -t "title" -b "body"  # Create issue directly
issues close <number>     # Close issue (with confirmation)
issues reopen <number>    # Reopen closed issue
issues comment <number> "text"  # Add comment
```

### 2. Issue List Output

```bash
$ issues

Issues for owner/repo:

#42 Bug: Login fails on Safari [bug] by contributor
   Status: open | 5 comments | Updated 2 days ago

#40 Feature: Add dark mode [enhancement] by awesomejerry
   Status: open | 12 comments | Updated 1 week ago

2 open issue(s)
```

### 3. GitHub API Endpoints

```javascript
// List issues
GET /repos/{owner}/{repo}/issues?state=open

// Get issue
GET /repos/{owner}/{repo}/issues/{number}

// Create issue
POST /repos/{owner}/{repo}/issues
Body: { title, body, labels }

// Close/Reopen issue
PATCH /repos/{owner}/{repo}/issues/{number}
Body: { state: "closed" | "open" }

// Add comment
POST /repos/{owner}/{repo}/issues/{number}/comments
Body: { body }
```

---

## Phase 9: PR Review

### 1. PR Review Commands

```bash
pr review <number>              # View PR for review
pr review <number> --approve    # Approve PR
pr review <number> --request-changes  # Request changes
pr review <number> --comment "text"   # Add review comment
pr comments <number>            # List PR comments
pr comment <number> "text"      # Add general comment
```

### 2. PR Review Output

```bash
$ pr review 42

Reviewing PR #42: Add staging workflow
Branch: feature/staging → main

Files changed:
  scripts/staging.js (+150/-10)
  scripts/commands.js (+80/-5)
  tests/staging.test.js (+50/-0)

Diff:
--- a/scripts/commands.js
+++ b/scripts/commands.js
@@ -100,6 +100,15 @@
+async function cmdStage() {
...

Options:
  --approve           Approve this PR
  --request-changes   Request changes
  --comment "text"    Add comment
```

### 3. GitHub API Endpoints

```javascript
// Get PR files
GET /repos/{owner}/{repo}/pulls/{number}/files

// Create review
POST /repos/{owner}/{repo}/pulls/{number}/reviews
Body: { body, event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT" }

// List comments
GET /repos/{owner}/{repo}/pulls/{number}/comments

// Add comment
POST /repos/{owner}/{repo}/pulls/{number}/comments
Body: { body, path, position }
```

---

## Performance Optimization

### 1. Large Repo Handling

**Problem:** Large repos (1000+ files) cause performance issues

**Solutions:**
- Implement pagination for tree API
- Add virtual scrolling for large outputs
- Cache aggressively with TTL
- Lazy load directory contents

### 2. Virtual Scrolling

```javascript
// Only render visible lines
class VirtualScroller {
  constructor(container, itemHeight) {
    this.visibleStart = 0;
    this.visibleEnd = Math.ceil(containerHeight / itemHeight);
  }
  
  render(items) {
    const visible = items.slice(this.visibleStart, this.visibleEnd);
    // Only render visible items
  }
}
```

### 3. Caching Strategy

```javascript
// Cache with TTL
const CACHE_TTL = {
  repo_info: 300000,    // 5 minutes
  file_content: 600000, // 10 minutes
  tree: 300000,         // 5 minutes
  branches: 60000       // 1 minute
};

// Clear cache on mutations
function clearRelatedCache(operation, path) {
  if (operation === 'commit') {
    cache.delete(`tree:${repo}`);
    cache.delete(`file:${path}`);
  }
}
```

---

## Documentation

### 1. User Guide (docs/USER_GUIDE.md)

```markdown
# GitHub OS User Guide

## Getting Started
- Quick start
- Authentication

## Basic Commands
- Navigation (ls, cd, pwd, tree)
- Reading files (cat, head, tail)
- Searching (grep, find)

## Advanced Features
- Staging workflow
- Pull requests
- Issues management

## Themes
- Available themes
- Customization
```

### 2. Command Reference (docs/COMMANDS.md)

```markdown
# Command Reference

## Navigation
### ls [path]
List directory contents...

## File Operations
### touch <file>
Create new file...

## Git Operations
### branch
List branches...
```

### 3. API Reference (docs/API.md)

```markdown
# GitHub API Integration

## Authentication
- OAuth flow
- Token scopes

## Rate Limits
- Unauthenticated: 60/hr
- Authenticated: 5000/hr

## Endpoints Used
- [List of all GitHub API endpoints]
```

---

## File Structure

```
scripts/
├── commands.js      # Add issues, pr review commands
├── github.js        # Add issues API functions
└── virtual-scroll.js # NEW - Virtual scrolling

docs/
├── USER_GUIDE.md    # NEW - User guide
├── COMMANDS.md      # NEW - Command reference
└── API.md           # NEW - API reference

openspec/specs/
├── issues-management/  # NEW
├── pr-review/          # NEW
└── performance/        # NEW
```

---

## 並行開發計劃

| Worktree | 功能 | 預估時間 |
|----------|------|---------|
| github-os-issues | Issues management | 1 hour |
| github-os-pr-review | PR review commands | 1.5 hours |
| github-os-perf | Performance optimization | 1 hour |
| github-os-docs | Documentation | 30 min |

---

## 驗證清單

### Issues
- [ ] `issues` lists open issues
- [ ] `issues create` creates issue
- [ ] `issues close` closes issue
- [ ] `issues comment` adds comment
- [ ] Tests pass

### PR Review
- [ ] `pr review` shows diff
- [ ] `pr review --approve` approves PR
- [ ] `pr comment` adds comment
- [ ] Tests pass

### Performance
- [ ] Large repos load faster
- [ ] Virtual scrolling works
- [ ] Cache TTL implemented
- [ ] Tests pass

### Documentation
- [ ] USER_GUIDE.md complete
- [ ] COMMANDS.md complete
- [ ] API.md complete
- [ ] README updated

---

*Last updated: 2026-02-20*
*Version: v2.4-alpha*
