## Context

GitHub OS v2.0 introduces OAuth authentication flow that requires persistent session management. The session module needs to store authentication tokens securely in localStorage, support multiple GitHub accounts, and provide a clean API for the auth module and other components.

Current state: No session management exists. Authentication state is not persisted.

## Goals / Non-Goals

**Goals:**
- Implement localStorage-based session persistence
- Support single and multi-account scenarios
- Provide clean, testable API for session operations
- Follow SessionData structure from shared-decisions.md

**Non-Goals:**
- Token encryption (noted as optional enhancement in shared-decisions.md)
- Server-side session management
- Token refresh logic (GitHub tokens don't expire)

## Decisions

1. **localStorage over sessionStorage**: Chosen for persistence across sessions. Trade-off: Survives browser restart but accessible to JS on same origin.

2. **Dual key approach**: 
   - `github_os_session` for current active session (fast access)
   - `github_os_sessions` for all sessions (multi-account support)
   - Rationale: Simplifies common case of getting current session while enabling account switching

3. **isActive flag in SessionData**: Each session carries its active state. This allows rebuilding `github_os_session` from `github_os_sessions` array if needed.

4. **Error handling strategy**: 
   - JSON parse errors → return null (graceful degradation)
   - Invalid session data → return null
   - Missing keys → return null (not an error)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| localStorage unavailable (private browsing) | Functions return null, app handles gracefully |
| XSS attack exposes tokens | Documented in shared-decisions.md as acceptable for public client |
| Corrupted localStorage data | JSON.parse wrapped in try-catch, returns null |

## Open Questions

- None - design is straightforward and aligned with shared-decisions.md
