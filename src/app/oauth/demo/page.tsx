import DemoLauncher from '@/components/oauth/DemoLauncher';

export default function OAuthDemoPage() {
  return (
    <section className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Dreamland OAuth</p>
          <h1 className="text-3xl font-semibold">授權測試 / 示範畫面</h1>
          <p className="text-sm text-white/70">
            此頁提供簡易前端介面，透過「開新分頁的連結」呼叫 `/oauth/authorize`。不使用 JavaScript API 直接送出，只需準備 ClientId 與 Redirect URI 即可。
          </p>
          <ol className="list-decimal space-y-2 text-sm text-white/70">
            <li>先於 `/api/oauth/clients` 建立 Client 並取得 `client_id`、`client_secret`。</li>
            <li>填入 `client_id` 與 `redirect_uri`（必須符合 Client 註冊資料）。</li>
            <li>點擊「前往授權畫面」，瀏覽器會以 URL 方式直接導向授權流程。</li>
          </ol>
        </header>

        <DemoLauncher />
      </div>
    </section>
  );
}
