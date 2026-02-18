# Shared Decisions - GitHub OS v2.1 Write Operations

> 所有 write 操作模組必須遵守此文件定義的規範

---

## 1. 前置需求

**必須已登入** - 所有 write 操作需要 GitHub API token
```javascript
// 在 commands.js 開頭檢查
if (!isAuthenticated()) {
  terminal.print(`<span class="error">Please login first. Use 'login' command.</span>`);
  return;
}
```

---

## 2. GitHub API Endpoints

### File Operations
```javascript
// Create/Update file
PUT /repos/{owner}/{repo}/contents/{path}
Body: { message, content, branch?, sha? }

// Delete file
DELETE /repos/{owner}/{repo}/contents/{path}
Body: { message, sha, branch? }

// Create directory (create .gitkeep inside)
PUT /repos/{owner}/{repo}/contents/{path}/.gitkeep

// Move file (get content + delete old + create new)
// GitHub doesn't have native move API
```

### Git Operations
```javascript
// Create branch
POST /repos/{owner}/{repo}/git/refs
Body: { ref: "refs/heads/{branch}", sha: "{base_sha}" }

// Delete branch
DELETE /repos/{owner}/{repo}/git/refs/heads/{branch}

// List branches
GET /repos/{owner}/{repo}/branches

// Get default branch
GET /repos/{owner}/{repo} → default_branch
```

---

## 3. File Operations 規範

### touch <file>
```javascript
// 1. 檢查檔案是否存在
// 2. 如果存在，不做任何事（像真正的 touch）
// 3. 如果不存在，建立空檔案
// 4. 需要 commit message

touch README.md
> Created README.md (commit: "Create README.md")
```

### mkdir <dir>
```javascript
// GitHub 不支援空目錄，建立 .gitkeep
// 1. 建立 {dir}/.gitkeep
// 2. commit message: "Create directory {dir}"

mkdir src/components
> Created directory src/components/ (commit: "Create directory src/components")
```

### rm <file>
```javascript
// 1. 確認檔案存在
// 2. 顯示警告，要求確認
// 3. 刪除並 commit

rm old-file.js
> Warning: This will delete old-file.js
> Type 'yes' to confirm: yes
> Deleted old-file.js (commit: "Delete old-file.js")
```

### mv <src> <dest>
```javascript
// GitHub 沒有 move API
// 1. 取得 src 內容
// 2. 建立 dest（帶同樣內容）
// 3. 刪除 src
// 4. 需要 src 的 sha

mv old.js new.js
> Moved old.js → new.js (commit: "Move old.js to new.js")
```

### cp <src> <dest>
```javascript
// 1. 取得 src 內容
// 2. 建立 dest（帶同樣內容）

cp template.js copy.js
> Copied template.js → copy.js (commit: "Copy template.js to copy.js")
```

---

## 4. Editor 規範

### edit <file>
```javascript
// 1. 檢查檔案存在
// 2. 顯示 modal/overlay with textarea
// 3. 載入檔案內容
// 4. 使用者編輯
// 5. Save → commit with message
// 6. Cancel → close without saving

edit config.json
> Opening editor for config.json...
> [Modal shows with file content]
> [Save] [Cancel]
```

### UI 設計
```css
.editor-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.9);
  z-index: 1000;
}

.editor-container {
  max-width: 800px;
  margin: 50px auto;
  background: #1a1a2e;
  border-radius: 8px;
}

.editor-textarea {
  width: 100%;
  height: 400px;
  background: #0d0d1a;
  color: #00ff9f;
  font-family: monospace;
  border: none;
  padding: 16px;
}

.editor-buttons {
  display: flex;
  gap: 8px;
  padding: 16px;
}
```

---

## 5. Git Operations 規範

### commit -m "message"
```javascript
// GitHub 的 file operations 已經包含 commit
// 這個命令用於顯示 pending changes 或 staging area
// 或者用於 batch commit（如果有多個變更）

commit -m "Update multiple files"
> No staged changes. Use edit/touch/rm to make changes.
```

### branch
```javascript
// 不帶參數：列出所有分支
// -c <name>：建立分支
// -d <name>：刪除分支

branch
> * main
>   feature-a
>   feature-b

branch -c feature-c
> Created branch feature-c from main

branch -d old-feature
> Deleted branch old-feature
```

### checkout <branch>
```javascript
// 切換分支
// 注意：GitHub API 的 context 切換

checkout feature-a
> Switched to branch feature-a
> (Note: All operations now apply to feature-a)
```

---

## 6. 錯誤處理

### 共用錯誤訊息
```javascript
const ERRORS = {
  NOT_LOGGED_IN: 'Please login first. Use \'login\' command.',
  FILE_NOT_FOUND: 'File not found: {path}',
  FILE_EXISTS: 'File already exists: {path}',
  DIR_EXISTS: 'Directory already exists: {path}',
  PERMISSION_DENIED: 'Permission denied. Check your token scope.',
  RATE_LIMITED: 'Rate limited. Try again later.',
  BRANCH_EXISTS: 'Branch already exists: {name}',
  BRANCH_NOT_FOUND: 'Branch not found: {name}',
  CANNOT_DELETE_CURRENT: 'Cannot delete current branch.',
};
```

### API Error Handling
```javascript
async function handleApiCall(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error.status === 401) {
      terminal.print(`<span class="error">${ERRORS.PERMISSION_DENIED}</span>`);
    } else if (error.status === 403) {
      terminal.print(`<span class="error">${ERRORS.RATE_LIMITED}</span>`);
    } else if (error.status === 404) {
      terminal.print(`<span class="error">${ERRORS.FILE_NOT_FOUND}</span>`);
    } else {
      terminal.print(`<span class="error">Error: ${error.message}</span>`);
    }
    return null;
  }
}
```

---

## 7. 檔案結構

```
scripts/
├── commands.js      # 新增 touch, mkdir, rm, mv, cp, edit, commit, branch, checkout
├── github.js        # 新增 write API functions
├── editor.js        # (NEW) 編輯器 modal
└── ...

styles/
└── main.css         # 新增 editor styles
```

---

## 8. 並行開發計劃

| Worktree | 功能 | 主要檔案 |
|----------|------|---------|
| github-os-file-ops | touch, mkdir, rm, mv, cp | commands.js, github.js |
| github-os-editor | edit 命令 + modal | editor.js, commands.js, main.css |
| github-os-git | branch, checkout | commands.js, github.js |

---

*Last updated: 2026-02-18*
*Version: v2.1-alpha*
