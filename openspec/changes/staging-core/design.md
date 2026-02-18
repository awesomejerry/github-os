## Context

GitHub OS 是一個模擬終端機的網頁應用程式，使用 vanilla JavaScript (ES6 modules) 開發。目前需要一個 staging area 機制來管理檔案變更，類似 Git 的 staging 概念。

當前沒有任何 staging 機制，需要從零開始建立。localStorage 已被用於 session 管理（參考 shared-decisions.md），我們將遵循相同的模式。

## Goals / Non-Goals

**Goals:**
- 提供清晰的 staging API（create/update/delete）
- 確保資料一致性（防止衝突操作）
- 遵循現有程式碼風格和模組結構
- 完整的錯誤處理和驗證

**Non-Goals:**
- 不實作 commit 功能（屬於未來的 change）
- 不實作檔案內容的 diff 比對
- 不支援多個 staging area 或分支

## Decisions

### 1. localStorage 結構
**決定：** 使用單一 key `github_os_staging`，結構為：
```json
{
  "creates": { "path/file.txt": { "content": "..." } },
  "updates": { "path/file.txt": { "content": "...", "sha": "abc123" } },
  "deletes": { "path/file.txt": { "sha": "abc123" } }
}
```

**理由：**
- 簡單明瞭，易於理解和維護
- 三個獨立區分，方便衝突檢測
- 與 GitHub API 的三種操作對應

**替代方案：** 單一陣列儲存所有變更 `{ type: "create", path: "...", ... }`
- 未選擇原因：查詢效能較差，衝突檢測較複雜

### 2. 衝突檢測策略
**決定：** 在 staging 操作時立即檢測並拒絕衝突

**規則：**
- `stageCreate`: 檢查路徑是否已在 `creates` 或 `updates` 中
- `stageUpdate`: 檢查路徑是否在 `deletes` 中（衝突）
- `stageDelete`: 檢查路徑是否在 `creates` 中（移除 create 而非 delete）

**理由：**
- 早期失敗，避免用戶進入不一致狀態
- 清楚的錯誤訊息，幫助用戶理解問題

### 3. 錯誤處理
**決定：** 所有函數拋出帶有明確訊息的 `Error` 物件

**理由：**
- 與現有程式碼一致
- 便於呼叫端處理和顯示錯誤

### 4. 模組設計
**決定：** 純 ES6 module，無外部依賴

**理由：**
- 與現有模組一致
- 保持輕量，易於測試

## Risks / Trade-offs

### localStorage 容量限制
- **風險：** localStorage 有 5-10MB 限制，大量檔案可能超限
- **緩解：** 在 staging 時檢查大小，超過限制時警告用戶

### 資料同步
- **風險：** 多個分頁同時操作可能導致不一致
- **緩解：** 目前不處理，作為已知限制。未來可使用 storage event 監聽

### 無法還原
- **風險：** clearStaging() 會清除所有暫存資料
- **緩解：** 提供明確的 API 名稱，呼叫端應實作確認對話框
