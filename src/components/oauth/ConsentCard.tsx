'use client';

import { useState } from 'react';

type ConsentCardProps = {
  username: string | null;
  email: string | null;
  clientId: string;
  clientName: string;
  redirectUri: string;
  scope: string;
  state: string;
};

export default function ConsentCard({ username, email, clientId, clientName, redirectUri, scope, state }: ConsentCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scopes = buildScopes(scope);

  const handleDecision = async (decision: 'approve' | 'deny') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, redirectUri, scope, state, decision }),
      });

      if (response.status === 401) {
        window.location.reload();
        return;
      }

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? '授權失敗');
        setIsLoading(false);
        return;
      }

      if (payload.redirectUrl) {
        window.location.assign(payload.redirectUrl);
        return;
      }

      setError('無效的伺服器回應，請稍候再試');
    } catch (err) {
      console.error(err);
      setError('連線發生問題，請稍候再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  return (
    <div className="space-y-6 text-sm text-black">
      <p className="rounded-2xl border border-amber-400/40 bg-amber-50 px-5 py-4 text-xs text-amber-900">
        (NEW) 新版的登入驗證系統，由築夢之地開發。這並不是意外，這是會考霸團隊更新了登入驗證系統！
      </p>
      <div className="rounded-2xl border border-black/10 bg-white px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-black/50">目前登入</p>
        <p className="text-lg font-medium text-black">{username ?? '未命名使用者'}</p>
        <p className="text-black/60">{email}</p>
        <button type="button" className="mt-3 text-xs text-black underline underline-offset-4" onClick={handleLogout}>
          切換帳號
        </button>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fafafa] px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-black/50">授權內容</p>
        <ul className="mt-3 space-y-2 text-black/80">
          {scopes.length === 0 && <li>基礎公開資料（使用者名稱、Email 驗證狀態）</li>}
          {scopes.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-black" />
              {scopeDescriptions[item] ?? item}
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="flex-1 rounded-full border border-black/30 bg-white py-2 font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"
          onClick={() => handleDecision('deny')}
          disabled={isLoading}
        >
          拒絕
        </button>
        <button
          type="button"
          className="flex-1 rounded-full bg-black py-2 font-semibold text-white transition hover:bg-black/80 disabled:opacity-60"
          onClick={() => handleDecision('approve')}
          disabled={isLoading}
        >
          {isLoading ? '處理中...' : '同意授權'}
        </button>
      </div>
    </div>
  );
}

const scopeDescriptions: Record<string, string> = {
  'profile.basic': '你的公開資料（使用者名稱、頭像）',
  'profile.email': '你的 Email 與驗證狀態',
};

function buildScopes(scope: string) {
  return scope
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean);
}
