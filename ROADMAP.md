# GitHub OS Roadmap

> **Current Version:** v2.5.1  
> **Status:** Phase 10 complete, moving into Phase 11

---

## ✅ Completed

### Phase 5 (v2.0) — Authentication & Private Repos
- OAuth PKCE login/logout/session
- Private repo access
- 5000 req/hour authenticated rate

### Phase 6 (v2.1) — Write Operations
- `touch`, `mkdir`, `rm`, `mv`, `cp`
- Built-in `edit`
- Branch workflows (`branch`, `checkout`)

### Phase 6.5 (v2.2) — Staging Workflow
- `add`, `unstage`, `diff`, staged `commit`
- Enhanced `status`

### Phase 7 (v2.3) — Pull Requests
- `pr`, `pr view`, `pr create`, `pr merge`, `pr close`

### Phase 8 (v2.3.x) — UX Polish
- Theme system (6 themes)
- Keyboard shortcuts
- Improved terminal ergonomics

### Phase 9 (v2.4) — Organizations & Teams
- Org/team navigation commands
- Multi-scope repo browsing

### Phase 10 (v2.5) — Notifications & Actions
- `notifications`
- `actions`, `actions view`, `actions rerun`

---

## 🚧 Next Feature (Active): Phase 11 (v2.6) — Release Management

**Goal:** make release workflow terminal-native.

### Scope (P0 first)
- `release` — list releases for current repo
- `release view <tag>` — show release detail
- `release create -t <tag> -n <name> -b <body>` — create release

### Nice-to-have (P1)
- `release latest`
- `release delete <tag>` (with confirmation)
- Optional generated notes toggle

### Implementation Plan
1. Add GitHub API methods for release endpoints
2. Add `release` command parser + handlers
3. Add unit + integration tests
4. Update docs (`COMMANDS.md`, `USER_GUIDE.md`, `API.md`)

---

## 🧪 Quality Targets
- Keep all tests green (currently **319 passing**)
- Add tests for each new release subcommand
- Preserve command consistency and help output style

---

## 📌 Version Summary

| Version | Theme | Status |
|---|---|---|
| v2.0 | Auth | ✅ Done |
| v2.1 | Write ops | ✅ Done |
| v2.2 | Staging | ✅ Done |
| v2.3 | PR + UX polish | ✅ Done |
| v2.4 | Orgs/Teams | ✅ Done |
| v2.5 | Notifications/Actions | ✅ Done |
| v2.6 | Release management | 🚧 Next |

---

*Last updated: 2026-03-03*