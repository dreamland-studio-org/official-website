'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

type LoginCardProps = {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
};

export default function LoginCard({ clientId, redirectUri, scope, state }: LoginCardProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const authorizeUrl = useMemo(() => buildAuthorizeUrl({ clientId, redirectUri, scope, state }), [clientId, redirectUri, scope, state]);
  const registerSuccess = searchParams?.get('registerSuccess') === '1';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? '登入失敗');
        setIsLoading(false);
        return;
      }

      window.location.assign(authorizeUrl);
    } catch (err) {
      console.error(err);
      setError('連線發生問題，請稍候再試');
      setIsLoading(false);
    }
  };

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-5 text-sm text-black" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}>
      {registerSuccess && (
        <p className="rounded-2xl border border-emerald-400/40 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          註冊成功，請使用新帳號登入。
        </p>
      )}
      <p className="rounded-2xl border border-amber-400/40 bg-amber-50 px-5 py-4 text-xs text-amber-900">
        (NEW) 新版的登入驗證系統，由築夢之地開發。這並不是意外，這是會考霸團隊更新了登入驗證系統！
      </p>
      <div className="rounded-2xl border border-black/10 bg-white px-5 py-4">
        <p className="text-black/70">請登入你的築夢之地帳號以繼續授權流程。</p>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-[0.3em] text-black/50">帳號 / Email</label>
        <input
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="username 或 email"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-[0.3em] text-black/50">密碼</label>
        <input
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="輸入密碼"
          type="password"
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-3">
        <motion.button
          type="submit"
          className="relative w-full overflow-hidden rounded-full bg-black py-3 text-center text-base font-semibold text-white transition disabled:opacity-60"
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.01 } : undefined}
          whileTap={!isLoading ? { scale: 0.98 } : undefined}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border border-white/60 border-t-transparent" />
                登入中...
              </>
            ) : (
              '登入並繼續'
            )}
          </span>
          {isLoading && <span className="absolute inset-0 bg-gradient-to-r from-gray-800 via-black to-gray-800 opacity-70" />}
        </motion.button>

        <div className="grid gap-2 sm:grid-cols-2">
          <motion.a
            href={`/oauth/login/google?returnTo=${encodeURIComponent(authorizeUrl)}`}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-center text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            以 Google 登入
          </motion.a>
          <motion.a
            href={`/oauth/login/discord?returnTo=${encodeURIComponent(authorizeUrl)}`}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-center text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            以 Discord 登入
          </motion.a>
        </div>

        <p className="text-xs text-black/60">
          還沒有帳號？{' '}
          <a className="underline" href={`/oauth/register?returnTo=${encodeURIComponent(authorizeUrl)}`}>
            立即註冊
          </a>
        </p>
      </div>
    </motion.form>
  );
}

function buildAuthorizeUrl(params: { clientId: string; redirectUri: string; scope: string; state: string }) {
  const urlParams = new URLSearchParams();
  if (params.clientId) urlParams.set('client_id', params.clientId);
  if (params.redirectUri) urlParams.set('redirect_uri', params.redirectUri);
  if (params.scope) urlParams.set('scope', params.scope);
  if (params.state) urlParams.set('state', params.state);
  urlParams.set('response_type', 'code');
  return `/oauth/authorize?${urlParams.toString()}`;
}
