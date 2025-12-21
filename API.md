# Dreamland API 說明文件

本文件整理 Dreamland 官方網站與 OAuth Provider 的 API 規格，包含必填參數、回傳格式與常見錯誤。

## 通用回應格式

- 成功回傳多為 JSON，依各端點定義內容
- 錯誤回傳固定為 JSON：`{ "error": "<錯誤訊息或錯誤碼>" }`
- `Content-Type` 一般為 `application/json`，`/api/oauth/token` 也支援 `application/x-www-form-urlencoded`

## Auth APIs

### POST /api/auth/register

建立帳號，成功後自動建立 session 並寫入 `dl_session` cookie。

Request (JSON):

```json
{
  "username": "user_name",
  "email": "user@example.com",
  "password": "password123"
}
```

Response 201:

```json
{
  "message": "註冊成功！"
}
```

錯誤回應：

- 400 `{ "error": "使用者名稱必須為 3-32 個字母、數字或符號 _ . -" }`
- 400 `{ "error": "請輸入有效的 Email" }`
- 400 `{ "error": "密碼至少需要 8 個字元" }`
- 409 `{ "error": "帳號或 Email 已被註冊" }`
- 500 `{ "error": "無法建立帳號" }`

### POST /api/auth/verify

驗證 Email。

Request (JSON):

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

Response 200:

```json
{
  "message": "Email 驗證完成"
}
```

其他成功情境：

```json
{
  "message": "信箱已完成驗證"
}
```

錯誤回應：

- 400 `{ "error": "Email 與驗證碼皆為必填" }`
- 404 `{ "error": "驗證碼無效或帳號不存在" }`
- 400 `{ "error": "驗證碼錯誤" }`
- 500 `{ "error": "驗證失敗" }`

### POST /api/auth/login

使用帳號或 Email 登入，可選擇回傳 session token。成功後寫入 `dl_session` cookie。

Request (JSON):

```json
{
  "identifier": "user_name_or_email",
  "password": "password123",
  "include_session_token": true
}
```

Response 200:

```json
{
  "user": {
    "id": 1,
    "username": "user_name",
    "email": "user@example.com"
  },
  "session_token": "session_token_here",
  "session_expires_at": "2024-01-01T12:00:00.000Z"
}
```

說明：

- 未傳 `include_session_token` 或設為 `false`，不會回傳 `session_token` 與 `session_expires_at`

錯誤回應：

- 400 `{ "error": "請輸入帳號與密碼" }`
- 401 `{ "error": "帳號或密碼錯誤" }`
- 403 `{ "error": "此帳號使用第三方登入，請透過社群登入繼續" }`
- 500 `{ "error": "登入失敗" }`

### POST /api/auth/social

使用 Google 或 Discord 進行第三方登入。成功後寫入 `dl_session` cookie。

Request (JSON):

```json
{
  "provider": "google",
  "access_token": "google_access_token",
  "include_session_token": true
}
```

或使用 Google id_token：

```json
{
  "provider": "google",
  "id_token": "google_id_token",
  "include_session_token": true
}
```

Discord 使用 access_token：

```json
{
  "provider": "discord",
  "access_token": "discord_access_token",
  "include_session_token": true
}
```

Response 200:

```json
{
  "user": {
    "id": 1,
    "username": "user_name",
    "email": "user@example.com"
  },
  "session_token": "session_token_here",
  "session_expires_at": "2024-01-01T12:00:00.000Z"
}
```

錯誤回應：

- 400 `{ "error": "provider 必須為 google 或 discord" }`
- 401 `{ "error": "無法取得第三方登入資訊" }`
- 404 `{ "error": "尚未註冊" }`
- 500 `{ "error": "登入失敗" }`

### POST /api/auth/logout

清除 session 與 `dl_session` cookie。

Response 200:

```json
{
  "message": "已登出"
}
```

錯誤回應：

- 500 `{ "error": "無法登出" }`

## OAuth APIs

### POST /api/oauth/clients

建立 OAuth client。需要在 Header 帶 `Authorization: Bearer ${OAUTH_ADMIN_TOKEN}`。

Request (JSON):

```json
{
  "name": "KaoBar",
  "redirectUris": ["https://kaobar.dreamland-studio.org/oauth/callback"],
  "scopes": "profile.basic profile.email",
  "clientId": "optional_custom_id"
}
```

Response 200:

```json
{
  "client_id": "generated_or_custom_id",
  "client_secret": "plain_client_secret",
  "redirect_uris": ["https://kaobar.dreamland-studio.org/oauth/callback"],
  "scopes": "profile.basic profile.email"
}
```

錯誤回應：

- 500 `{ "error": "未設定 OAUTH_ADMIN_TOKEN，無法建立 Client" }`
- 401 `{ "error": "無權限建立 Client" }`
- 400 `{ "error": "name 與 redirectUris 為必填欄位" }`
- 500 `{ "error": "建立 Client 失敗" }`

### POST /api/oauth/authorize

送出授權決策，回傳可導向的 redirect URL。支援 `Authorization: Bearer <session_token>` 或 `Authorization: Session <session_token>`，也可在 body 內傳 `session_token`，亦可使用 `dl_session` cookie。

Request (JSON):

```json
{
  "client_id": "client_id_here",
  "redirect_uri": "https://example.com/callback",
  "scope": "profile.basic",
  "state": "demo",
  "decision": "approve"
}
```

也可用 camelCase：

```json
{
  "clientId": "client_id_here",
  "redirectUri": "https://example.com/callback"
}
```

Response 200 (approve):

```json
{
  "redirectUrl": "https://example.com/callback?code=AUTH_CODE&state=demo"
}
```

Response 200 (deny):

```json
{
  "redirectUrl": "https://example.com/callback?error=access_denied&state=demo"
}
```

錯誤回應：

- 401 `{ "error": "尚未登入" }`
- 400 `{ "error": "client_id 與 redirect_uri 必填" }`
- 400 `{ "error": "無效的 client_id" }`
- 400 `{ "error": "redirect_uri 未經註冊" }`
- 500 `{ "error": "授權流程失敗" }`

### POST /api/oauth/token

交換 access token / refresh token。支援 JSON 或 `application/x-www-form-urlencoded`。

Request (x-www-form-urlencoded):

```
grant_type=authorization_code&client_id=...&client_secret=...&code=...&redirect_uri=https://...
```

或 refresh token:

```
grant_type=refresh_token&client_id=...&client_secret=...&refresh_token=...
```

Response 200:

```json
{
  "token_type": "Bearer",
  "access_token": "access_token_here",
  "expires_in": 3600,
  "refresh_token": "refresh_token_here",
  "scope": "profile.basic profile.email"
}
```

錯誤回應（主要返回 OAuth error code）：

- 400 `{ "error": "invalid_request", "error_description": "grant_type is required" }`
- 401 `{ "error": "invalid_client_c404", "error_description": "client credentials missing" }`
- 401 `{ "error": "invalid_client_d404" }`
- 400 `{ "error": "unsupported_grant_type" }`
- 400 `{ "error": "invalid_request" }`
- 400 `{ "error": "invalid_grant_c400" }`
- 400 `{ "error": "invalid_grant_c400-2" }`
- 400 `{ "error": "invalid_grant_c400-3" }`
- 400 `{ "error": "invalid_grant" }`
- 500 `{ "error": "server_error" }`

### GET /api/oauth/userinfo

依 access token 回傳使用者資料，需 `Authorization: Bearer <access_token>`。

Response 200:

```json
{
  "sub": "user-1",
  "user_id": "account_id",
  "username": "user_name",
  "email": "user@example.com",
  "email_verified": true,
  "avatar": ""
}
```

錯誤回應：

- 401 `{ "error": "invalid_request" }`
- 401 `{ "error": "invalid_token" }`
- 500 `{ "error": "server_error" }`

## Cookies / Session

- session cookie 名稱：`dl_session`
- 登入成功後會設定 `dl_session`，登出時清除
- `include_session_token` 會在回應中加入 `session_token` 與 `session_expires_at`
