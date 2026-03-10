## 1. Spec updates
- [ ] 1.1 Add delta spec for releases-command (`release view <tag>`)
- [ ] 1.2 Add delta spec for github-api (release-by-tag endpoint behavior)

## 2. API implementation
- [ ] 2.1 Add `fetchReleaseByTag(owner, repo, tag)` in `scripts/github.js`
- [ ] 2.2 Add formatting + error handling (404 and generic failures)

## 3. Command implementation
- [ ] 3.1 Update `cmdRelease` to parse `view <tag>`
- [ ] 3.2 Add `cmdReleaseView` output and usage handling
- [ ] 3.3 Keep `release [count]` alias behavior unchanged

## 4. Tests and docs
- [ ] 4.1 Add unit test(s) for `fetchReleaseByTag`
- [ ] 4.2 Add integration test(s) for `release` registry/help and view usage path
- [ ] 4.3 Update `docs/COMMANDS.md` and `docs/USER_GUIDE.md`

## 5. Verification
- [ ] 5.1 Run full test suite
- [ ] 5.2 Validate OpenSpec change
