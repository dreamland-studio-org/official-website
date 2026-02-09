'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { prisma } from '@/lib/prisma';

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
    <motion.form
      onSubmit={handleSubmit}
      className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-black/10 bg-white text-sm text-slate-900 shadow-[0_40px_120px_rgba(6,18,32,0.18)] dark:border-white/10 dark:bg-[#0e2a47] dark:text-white dark:shadow-[0_40px_120px_rgba(6,18,32,0.55)]"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative grid gap-8 p-6 md:grid-cols-[1.1fr_1fr] md:gap-10 md:p-10">
        <section className="flex h-full flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1 text-xs uppercase tracking-[0.25em] text-black/70 dark:border-white/20 dark:bg-white/10 dark:text-white/80">
              單一登入
            </div>
            <h1 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl dark:text-white">
              築夢之地工作室
              <span className="block text-slate-500 dark:text-white/70">單一登入系統</span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70">請登入你的築夢之地帳號以繼續授權流程。</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 dark:border-white/15 dark:bg-white/10">
            <p className="text-xs uppercase tracking-[0.25em] text-black/50 dark:text-white/60">即將登入</p>
            <div className="mt-2 inline-flex items-center rounded-lg border border-black/10 bg-white px-3 py-1 text-sm font-semibold text-black dark:border-white/20 dark:bg-white/15 dark:text-white">
              {clientId || 'Dreamland App'}
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-black/10 bg-white p-6 text-black shadow-[0_30px_80px_rgba(5,12,23,0.2)] dark:border-white/10 dark:bg-[#0b1f35] dark:text-white">
          {registerSuccess && (
            <p className="rounded-2xl border border-emerald-400/40 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
              註冊成功，請使用新帳號登入。
            </p>
          )}

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-black/50 dark:text-white/60">帳號 / Email</label>
            <input
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="username 或 email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-black/50 dark:text-white/60">密碼</label>
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

            <p className="text-xs text-black/60 dark:text-white/60">
              還沒有帳號？{' '}
              <a className="underline" href={`/oauth/register?returnTo=${encodeURIComponent(authorizeUrl)}`}>
                立即註冊
              </a>
            </p>
          </div>
        </section>
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
