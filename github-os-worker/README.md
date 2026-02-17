# GitHub OS Token Exchange Worker

這個 Cloudflare Worker 處理 OAuth token exchange，解決 CORS 問題。

## 部署步驟

### 1. 安裝 Wrangler

```bash
npm install -g wrangler
```

### 2. 登入 Cloudflare

```bash
wrangler login
```

### 3. 部署

```bash
cd github-os-worker
wrangler deploy
```

部署完成後會得到一個 URL，例如：
```
https://github-os-token.<your-subdomain>.workers.dev
```

### 4. 更新 auth.js

把 `scripts/auth.js` 中的 `TOKEN_PROXY_URL` 改成你的 worker URL。

## 免費額度

Cloudflare Workers 免費方案：
- 每天 100,000 請求
- 對於個人使用綽綽有餘

## 本地測試

```bash
wrangler dev
```

會在 http://localhost:8787 啟動本地伺服器。
