## Dreamland Official Website & OAuth Provider

This repository hosts the Dreamland studio website together with the in-house OAuth 2.0 authorization server that other Dreamland platforms can integrate with.

## Getting Started

```bash
npm install
npx prisma db push   # create/update the oauth_* tables plus the users table
npm run dev
```

Environment variables live in `.env`. Use `.env.example` as a template and make sure `OAUTH_ADMIN_TOKEN` is a long random string (used to manage OAuth clients).

## Database Schema

Prisma manages the following tables:

| Table | Purpose |
| ----- | ------- |
| `users` | 主帳號資料（username, email, password_hash, verification_code, email_verified）|
| `oauth_sessions` | 維持 `/oauth/authorize` 登入狀態 |
| `oauth_clients` | 三方服務資訊與允許的 redirect URIs |
| `oauth_authorization_codes` | 短期授權碼 |
| `oauth_access_tokens` | Access/refresh token（皆以 SHA-256 雜湊存放） |
| (fields on `users`) | 紀錄 Discord / Google 等第三方登入資訊（`google_id`, `discord_id`） |

The `users` table matches the schema you provided earlier, so you can import existing data directly.

## OAuth Flow Overview

1. 使用者註冊 (`POST /api/auth/register`) → 收到驗證碼 → `POST /api/auth/verify`.
2. 使用者登入 (`POST /api/auth/login`) 或透過 Discord / Google 單點登入 (`/oauth/login/*`) 產生 `dl_session` cookie；行動端可用 `include_session_token` 取得 session token。
3. 第三方平台把使用者導向 `/oauth/authorize?client_id=...&redirect_uri=...&scope=...&state=...`
4. 使用者在授權頁面確認後，Dreamland 會把 `code` 帶回 `redirect_uri`；行動端也可直接呼叫 `POST /api/oauth/authorize` 並在 `Authorization: Bearer <session_token>` 帶入 session token。
5. 平台呼叫 `POST /api/oauth/token` 交換 `access_token` / `refresh_token`。
6. 平台透過 `GET /api/oauth/userinfo` 取得使用者資料。

## Endpoints

### Auth APIs

| Endpoint | Method | 說明 |
| -------- | ------ | ---- |
| `/api/auth/register` | POST | 建立帳號，DEV 模式會直接回傳驗證碼方便測試 |
| `/api/auth/verify` | POST | 驗證 Email |
| `/api/auth/login` | POST | 以 username 或 email 登入並寫入 `dl_session` cookie（可選 `include_session_token` 回傳 session token） |
| `/api/auth/social` | POST | 以 Google/Discord access token 或 id token 登入（可選 `include_session_token` 回傳 session token） |
| `/api/auth/logout` | POST | 刪除 session 與 cookie |

### OAuth APIs

| Endpoint | Method | 說明 |
| -------- | ------ | ---- |
| `/oauth/authorize` | GET | 使用者授權頁面 |
| `/api/oauth/authorize` | POST | 授權頁面送出時使用，回傳帶有 code 或 error 的 redirect URL（支援 `Authorization: Bearer <session_token>`） |
| `/api/oauth/token` | POST | 支援 `authorization_code` 與 `refresh_token` |
| `/api/oauth/userinfo` | GET | 依 access token 回傳使用者資料 |
| `/api/oauth/clients` | POST | 需在 Header 帶 `Authorization: Bearer ${OAUTH_ADMIN_TOKEN}` 以建立新的 client |
| `/oauth/demo` | GET | 以純超連結導向 `/oauth/authorize` 的簡易測試介面 |
| `/oauth/login/google` | GET | 觸發 Google OAuth，完成後自動回到 Dreamland 授權流程 |
| `/oauth/login/discord` | GET | 觸發 Discord OAuth，完成後自動回到 Dreamland 授權流程 |
| `/oauth/register` | GET | 黑白風格的註冊頁面，完成註冊與 Email 驗證 |

`/oauth/demo` 頁面可利用 `src/config/oauthApps.ts` 的設定快速切換不同 App 的 `client_id`、`redirect_uri` 與 scope。若需要社群登入，請在 `.env` 內設定 `DISCORD_*` 與 `GOOGLE_*` 相關環境變數並將 redirect URI 設為 `/oauth/login/{provider}/callback`。

### Example: 建立 Client

```bash
curl -X POST http://localhost:3000/api/oauth/clients \
  -H "Authorization: Bearer $OAUTH_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "KaoBar",
    "redirectUris": ["https://kaobar.dreamland-studio.org/oauth/callback"],
    "scopes": "profile.basic profile.email"
  }'
```

### Example: 交換 Token

```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&client_id=...&client_secret=...&code=...&redirect_uri=https://..."
```

### Example: 行動端登入與授權 (Flutter / Mobile)

帳密登入並拿到 session token：

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "your@email.com",
    "password": "your_password",
    "include_session_token": true
  }'
```

社群登入（Google access_token 或 id_token）：

```bash
curl -X POST http://localhost:3000/api/auth/social \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "access_token": "google_access_token",
    "include_session_token": true
  }'
```

用 session token 直接呼叫授權 API 拿 code：

```bash
curl -X POST http://localhost:3000/api/oauth/authorize \
  -H "Authorization: Bearer session_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your_client_id",
    "redirect_uri": "https://example.com/callback",
    "scope": "profile.basic",
    "state": "demo"
  }'
```

## Notes

- 所有 access token 與 refresh token 皆以 SHA-256 雜湊後寫入資料庫，遺失明文就必須重新走 token flow。
- session cookie 名稱為 `dl_session`，有效期間 7 天。
- `/oauth/authorize` 頁面自動處理登入與授權流程，第三方只要帶好 query 參數即可。
- 若要重建 Prisma 型別記得執行 `npx prisma generate`。
- 信件寄送採 SMTP，請在 `.env` 設定 `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`；註冊時系統會寄送黑白風格的 HTML 驗證碼信件。
