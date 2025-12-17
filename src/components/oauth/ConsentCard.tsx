'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
  const [pendingAction, setPendingAction] = useState<'idle' | 'approve' | 'deny'>('idle');
  const scopes = buildScopes(scope);
  const isApproving = pendingAction === 'approve' && isLoading;
  const isDenying = pendingAction === 'deny' && isLoading;

  const handleDecision = async (decision: 'approve' | 'deny') => {
    setPendingAction(decision);
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
      setPendingAction('idle');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  return (
    <div className="relative space-y-6 text-sm text-black" aria-live="polite" aria-busy={isApproving}>
      <motion.p
        className="rounded-2xl border border-amber-400/40 bg-amber-50 px-5 py-4 text-xs text-amber-900"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        (NEW) 新版的登入驗證系統，由築夢之地開發。這並不是意外，這是會考霸團隊更新了登入驗證系統！
      </motion.p>
      <motion.div
        className="rounded-2xl border border-black/10 bg-white px-5 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-black/50">目前登入</p>
        <p className="text-lg font-medium text-black">{username ?? '未命名使用者'}</p>
        <p className="text-black/60">{email}</p>
        <button type="button" className="mt-3 text-xs text-black underline underline-offset-4" onClick={handleLogout}>
          切換帳號
        </button>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-black/10 bg-[#fafafa] px-5 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-[11px] uppercase tracking-[0.3em] text-black/50">授權內容</p>
        <ul className="mt-3 space-y-2 text-black/80">
          {scopes.length === 0 && <li>基礎公開資料（使用者名稱、Email 驗證狀態）</li>}
          {scopes.map((item) => (
            <motion.li
              key={item}
              className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1"
              whileHover={{ borderColor: 'rgba(0,0,0,0.2)', x: 2 }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-black" />
              {scopeDescriptions[item] ?? item}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <AnimatePresence>
        {isApproving && (
          <motion.div
            className="rounded-2xl border border-emerald-200/60 bg-emerald-50/90 px-5 py-4 text-sm text-emerald-900 shadow-inner"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border border-emerald-600 border-l-transparent" />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">授權中</p>
                <p className="text-sm font-medium">
                  正在與
                  {' '}
                  {clientName}
                  {' '}
                  建立安全連線...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <motion.button
          type="button"
          className="flex-1 rounded-full border border-black/30 bg-white py-2 font-semibold text-black transition disabled:opacity-60"
          onClick={() => handleDecision('deny')}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.01 } : undefined}
          whileTap={!isLoading ? { scale: 0.97 } : undefined}
        >
          {isDenying ? '取消中...' : '拒絕'}
        </motion.button>
        <motion.button
          type="button"
          className="relative flex-1 overflow-hidden rounded-full bg-black py-2 font-semibold text-white transition disabled:opacity-60"
          onClick={() => handleDecision('approve')}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.01 } : undefined}
          whileTap={!isLoading ? { scale: 0.97 } : undefined}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isApproving ? (
              <>
                <span className="inline-flex h-3 w-3 animate-spin rounded-full border border-white/60 border-t-transparent" />
                授權中...
              </>
            ) : (
              '同意授權'
            )}
          </span>
          <AnimatePresence>
            {isApproving && (
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-500 opacity-80"
                initial={{ x: '-60%' }}
                animate={{ x: '0%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: 'mirror' }}
              />
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isApproving && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-white/85 text-center text-black backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="mb-3 inline-flex h-10 w-10 animate-spin rounded-full border-2 border-black/20 border-t-transparent" />
            <p className="text-base font-semibold">授權中...</p>
            <p className="text-xs text-black/60">正在安全地將資訊傳給 {clientName}</p>
          </motion.div>
        )}
      </AnimatePresence>
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
