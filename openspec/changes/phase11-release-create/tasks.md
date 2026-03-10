## 1. Spec updates
- [ ] 1.1 Add delta spec for releases-command (`release create <tag>`)
- [ ] 1.2 Add delta spec for github-api (create release endpoint)

## 2. API implementation
- [ ] 2.1 Add `createRelease(owner, repo, payload)` in `scripts/github.js`
- [ ] 2.2 Handle 401/403/422 error mapping clearly

## 3. Command implementation
- [ ] 3.1 Add `release create <tag>` parsing in `cmdRelease`
- [ ] 3.2 Parse `-t`, `-b`, `--draft`, `--prerelease`
- [ ] 3.3 Validate required `<tag>` and auth requirement
- [ ] 3.4 Show success summary with release URL

## 4. Tests and docs
- [ ] 4.1 Add tests for `createRelease` API helper
- [ ] 4.2 Add integration tests for command usage and success path
- [ ] 4.3 Update docs

## 5. Verification
- [ ] 5.1 Run targeted tests for release features
- [ ] 5.2 Validate OpenSpec change
