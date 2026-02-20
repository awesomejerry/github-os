# GitHub OS API Reference

> **Version:** v2.4.0
> **Last Updated:** 2026-02-20

---

## Authentication

### OAuth Flow

GitHub OS uses **OAuth PKCE** for secure authentication.

**Flow:**
1. User runs `login`
2. Generate `code_verifier` (64 chars)
3. Derive `code_challenge` (S256)
4. Redirect to GitHub authorization
5. User authorizes
6. Callback receives `code`
7. Exchange code for token via Cloudflare Worker
8. Store token in localStorage

**Token Storage:**
```javascript
// localStorage key: github_os_session
{
  username: "string",
  accessToken: "string",
  scope: "repo,user",
  createdAt: timestamp
}
```

---

### Token Scopes

| Scope | Access |
|-------|--------|
| `repo` | Full repo access (public + private) |
| `user` | User profile |

---

### Auth Functions

```javascript
// scripts/auth.js

initiateLogin()
  // Starts OAuth flow
  // Returns: void (redirects)

handleCallback()
  // Handles OAuth callback
  // Returns: Promise<{ success: boolean, username?: string }>

validateToken(token)
  // Validates token against GitHub API
  // Returns: Promise<boolean>

isAuthenticated()
  // Checks if session exists
  // Returns: boolean

getAccessToken()
  // Gets current access token
  // Returns: string | null
```

---

## GitHub API Endpoints

### Rate Limits

| Mode | Limit | Window |
|------|-------|--------|
| Unauthenticated | 60 | 1 hour |
| Authenticated | 5000 | 1 hour |

---

### Repositories

#### List User Repos
```
GET /users/{username}/repos
  ?sort=updated
  &per_page=30
  &page=1
```

#### Get Repository
```
GET /repos/{owner}/{repo}
```

#### Get Repo Tree
```
GET /repos/{owner}/{repo}/git/trees/{tree_sha}
  ?recursive=1
```

#### Get Default Branch SHA
```
GET /repos/{owner}/{repo}/git/refs/heads/{branch}
```

---

### Files

#### Get File Contents
```
GET /repos/{owner}/{repo}/contents/{path}
  ?ref={branch}
```

**Response:**
```json
{
  "name": "filename.js",
  "path": "src/filename.js",
  "sha": "abc123",
  "content": "base64-encoded",
  "encoding": "base64"
}
```

#### Create File
```
PUT /repos/{owner}/{repo}/contents/{path}

{
  "message": "commit message",
  "content": "base64-encoded-content"
}
```

#### Update File
```
PUT /repos/{owner}/{repo}/contents/{path}

{
  "message": "commit message",
  "content": "base64-encoded-content",
  "sha": "existing-file-sha"
}
```

#### Delete File
```
DELETE /repos/{owner}/{repo}/contents/{path}

{
  "message": "commit message",
  "sha": "file-sha"
}
```

---

### Batch Commit (Git Data API)

For committing multiple files at once:

#### 1. Get Base Commit
```
GET /repos/{owner}/{repo}/git/refs/heads/{branch}
```

#### 2. Create Blobs
```
POST /repos/{owner}/{repo}/git/blobs

{
  "content": "file content",
  "encoding": "utf-8"
}
```

#### 3. Create Tree
```
POST /repos/{owner}/{repo}/git/trees

{
  "base_tree": "base-tree-sha",
  "tree": [
    {
      "path": "file.txt",
      "mode": "100644",
      "type": "blob",
      "sha": "blob-sha"
    }
  ]
}
```

#### 4. Create Commit
```
POST /repos/{owner}/{repo}/git/commits

{
  "message": "commit message",
  "tree": "tree-sha",
  "parents": ["parent-commit-sha"]
}
```

#### 5. Update Branch Ref
```
PATCH /repos/{owner}/{repo}/git/refs/heads/{branch}

{
  "sha": "new-commit-sha"
}
```

---

### Branches

#### List Branches
```
GET /repos/{owner}/{repo}/branches
```

#### Create Branch
```
POST /repos/{owner}/{repo}/git/refs

{
  "ref": "refs/heads/{branch-name}",
  "sha": "commit-sha"
}
```

#### Delete Branch
```
DELETE /repos/{owner}/{repo}/git/refs/heads/{branch-name}
```

---

### Pull Requests

#### List PRs
```
GET /repos/{owner}/{repo}/pulls
  ?state=open|all
  &per_page=30
```

#### Get PR
```
GET /repos/{owner}/{repo}/pulls/{number}
```

#### Create PR
```
POST /repos/{owner}/{repo}/pulls

{
  "title": "PR title",
  "body": "PR description",
  "head": "feature-branch",
  "base": "main"
}
```

#### Merge PR
```
PUT /repos/{owner}/{repo}/pulls/{number}/merge

{
  "commit_title": "Merge pull request #42",
  "merge_method": "merge"
}
```

#### Close PR
```
PATCH /repos/{owner}/{repo}/pulls/{number}

{
  "state": "closed"
}
```

#### Get PR Files
```
GET /repos/{owner}/{repo}/pulls/{number}/files
```

#### Create Review
```
POST /repos/{owner}/{repo}/pulls/{number}/reviews

{
  "body": "Review comment",
  "event": "APPROVE|REQUEST_CHANGES|COMMENT"
}
```

---

### Issues

#### List Issues
```
GET /repos/{owner}/{repo}/issues
  ?state=open|all
  &per_page=30
```

#### Get Issue
```
GET /repos/{owner}/{repo}/issues/{number}
```

#### Create Issue
```
POST /repos/{owner}/{repo}/issues

{
  "title": "Issue title",
  "body": "Issue description",
  "labels": ["bug"]
}
```

#### Update Issue
```
PATCH /repos/{owner}/{repo}/issues/{number}

{
  "state": "open|closed",
  "title": "Updated title",
  "body": "Updated description"
}
```

#### Add Comment
```
POST /repos/{owner}/{repo}/issues/{number}/comments

{
  "body": "Comment text"
}
```

---

### Other

#### Search Code
```
GET /search/code
  ?q={query}+repo:{owner}/{repo}
```

#### List Commits
```
GET /repos/{owner}/{repo}/commits
  ?per_page=10
```

#### List Contributors
```
GET /repos/{owner}/{repo}/contributors
  ?per_page=20
```

#### List Releases
```
GET /repos/{owner}/{repo}/releases
  ?per_page=10
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue |
| 201 | Created | Resource created |
| 304 | Not Modified | Use cache |
| 400 | Bad Request | Fix request |
| 401 | Unauthorized | Login required |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Merge conflict |
| 422 | Validation Error | Fix validation |
| 500 | Server Error | Retry later |

---

## Cache

### Cache Keys

```javascript
// scripts/github.js

const cache = new Map();

// Key format:
`repos:${username}`         // User's repo list
`repo:${owner}/${repo}`     // Repo info
`tree:${owner}/${repo}:${sha}` // Repo tree
`file:${owner}/${repo}:${path}` // File content
`branches:${owner}/${repo}` // Branch list
```

### Cache TTL

| Type | TTL |
|------|-----|
| repo_info | 5 min |
| file_content | 10 min |
| tree | 5 min |
| branches | 1 min |

---

## Cloudflare Worker

Token exchange happens via Cloudflare Worker for security.

**Endpoint:** `https://github-os-token.awesomejerryshen.workers.dev`

**Request:**
```json
{
  "code": "authorization-code",
  "code_verifier": "pkce-verifier",
  "redirect_uri": "https://www.awesomejerry.space/github-os/callback.html"
}
```

**Response:**
```json
{
  "access_token": "gho_xxx",
  "token_type": "bearer",
  "scope": "repo,user"
}
```

---

*End of API Reference*
