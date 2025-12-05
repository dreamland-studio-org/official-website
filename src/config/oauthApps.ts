export type OAuthDemoApp = {
  key: string;
  name: string;
  description?: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  state?: string;
};

/**
 * 修改此列表即可在 `/oauth/demo` 頁面快速套用不同授權應用程式的參數。
 * 建議把實際的 client_id / redirect_uri / scope 寫在這裡方便測試。
 */
export const oauthDemoApps: OAuthDemoApp[] = [
  {
    key: 'demo-kaobar',
    name: 'KaoBar 官方測試',
    description: '將使用 KaoBar 平台的 redirect URI',
    clientId: '583920174628',
    redirectUri: 'http://192.168.0.250:8080/oauth2.php?provider=dreamland',
    scope: 'profile.basic profile.email',
    state: 'kaobar-demo',
  },
  {
    key: 'demo-gsat',
    name: 'GSATBar 測試',
    description: '學測霸預設授權設定',
    clientId: 'gsat-client-id',
    redirectUri: 'https://gsatbar.dreamland-studio.org/oauth/callback',
    scope: 'profile.basic',
    state: 'gsat-demo',
  },
];
