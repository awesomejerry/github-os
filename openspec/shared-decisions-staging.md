# Shared Decisions - GitHub OS v2.2 Staging Workflow

> 所有 staging 操作模組必須遵守此文件定義的規範

---

## 1. 核心概念

**Staging Area** - 像 git 一樣，所有變更先進入 staging area，最後用 `commit` 一次提交。

```
touch file.txt  → staged (creates)
edit file.js    → staged (updates)
rm old.txt      → staged (deletes)
status          → 顯示所有 staged changes
commit -m "..." → 一次性提交所有 staged changes
```

---

## 2. Staging State 結構

```javascript
// localStorage key: github_os_staging
{
  owner: "username",
  repo: "repo-name",
  branch: "main",
  changes: {
    creates: [
      { path: "new-file.txt", content: "" }
    ],
    updates: [
      { path: "edit-file.js", content: "...", sha: "abc123" }
    ],
    deletes: [
      { path: "old-file.txt", sha: "def456" }
    ]
  },
  createdAt: 1739876543210
}
```

---

## 3. Commands 改動

### 修改的命令

| 命令 | 原行為 | 新行為 |
|------|--------|--------|
| `touch <file>` | 立即建立 + commit | stage create |
| `mkdir <dir>` | 立即建立 + commit | stage create (.gitkeep) |
| `rm <file>` | 立即刪除 + commit | stage delete |
| `mv <src> <dest>` | 立即移動 + commit | stage delete + create |
| `cp <src> <dest>` | 立即複製 + commit | stage create |
| `edit <file>` | 立即編輯 + commit | stage update |
| `status` | 只顯示 auth | 顯示 staged changes |
| `commit -m "..."` | 顯示錯誤 | batch commit all staged |

### 新增的命令

| 命令 | 說明 |
|------|------|
| `unstage <path>` | 從 staging area 移除 |
| `unstage --all` | 清空 staging area |
| `diff` | 顯示 staged 變更內容 |

---

## 4. status 命令輸出

```bash
$ status

# 有 staged changes 時
Staged changes for owner/repo:
  <span class="success">new file:</span>   new-file.txt
  <span class="warning">modified:</span>   edit-file.js
  <span class="error">deleted:</span>   old-file.txt

3 change(s) staged. Use 'commit -m "..."' to commit.
Use 'unstage <file>' to remove from staging.

# 沒有 staged changes 時
No staged changes.
Use 'touch', 'edit', 'rm' etc. to stage changes.

# 同時顯示 auth 狀態
Logged in as: username (repo, user)
Rate limit: 4987/5000
```

---

## 5. commit 命令行為

```bash
$ commit -m "Add new feature"

# 有 staged changes
Committing 3 change(s)...
✓ Created: new-file.txt
✓ Updated: edit-file.js
✓ Deleted: old-file.txt

Commit: abc1234
Message: Add new feature

# 沒有 staged changes
No staged changes to commit.
Use 'touch', 'edit', 'rm' etc. to stage changes.
```

---

## 6. Batch Commit 實作

GitHub API 不支援 batch commit，需要：

1. 建立 tree (包含所有變更)
2. 建立 commit
3. 更新 branch ref

```javascript
// 步驟 1: 取得 base tree SHA
const ref = await GET /repos/{owner}/{repo}/git/refs/heads/{branch}
const baseTreeSha = ref.object.sha

// 步驟 2: 建立 blob for each file
const blobs = await Promise.all(
  changes.map(c => POST /repos/{owner}/{repo}/git/blobs { content })
)

// 步驟 3: 建立新 tree
const tree = await POST /repos/{owner}/{repo}/git/trees {
  base_tree: baseTreeSha,
  tree: [
    { path: "new-file.txt", mode: "100644", type: "blob", sha: blob1 },
    { path: "edit-file.js", mode: "100644", type: "blob", sha: blob2 },
    // deletes 不需要，因為不在 tree 裡
  ]
}

// 步驟 4: 建立 commit
const commit = await POST /repos/{owner}/{repo}/git/commits {
  message: "Add new feature",
  tree: tree.sha,
  parents: [baseCommitSha]
}

// 步驟 5: 更新 branch ref
await PATCH /repos/{owner}/{repo}/git/refs/heads/{branch} {
  sha: commit.sha
}
```

---

## 7. Error Handling

```javascript
const STAGING_ERRORS = {
  NOT_IN_REPO: 'Not in a repository. Use cd to enter a repo first.',
  STAGING_EMPTY: 'No staged changes to commit.',
  PATH_CONFLICT: 'Path is already staged for another operation.',
  AUTH_REQUIRED: 'Authentication required. Use login first.',
  BRANCH_MISMATCH: 'Staged changes are for a different branch.',
};
```

---

## 8. 檔案結構

```
scripts/
├── staging.js      # NEW - staging area 管理
├── commands.js     # 修改 touch/mkdir/rm/mv/cp/edit/status/commit
├── github.js       # 新增 batchCommit 函數
└── ...
```

---

## 9. 並行開發計劃

| Worktree | 功能 | 主要檔案 |
|----------|------|---------|
| github-os-staging-core | staging.js + localStorage | staging.js |
| github-os-staging-commands | 修改命令 | commands.js |
| github-os-batch-commit | batch commit API | github.js, commands.js |

---

*Last updated: 2026-02-18*
*Version: v2.2-alpha*
