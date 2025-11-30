'use client';

import { FormEvent, useState } from 'react';

type RegisterCardProps = {
  returnTo: string;
};

type Step = 'form' | 'verify' | 'done';

export default function RegisterCard({ returnTo }: RegisterCardProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? '註冊失敗');
        return;
      }

      setDebugCode(payload.debugVerificationCode ?? null);
      setSuccessMessage(payload.message ?? '請輸入驗證碼完成 Email 認證');
      setStep('verify');
    } catch (err) {
      console.error(err);
      setError('無法連線伺服器，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? '驗證失敗');
        return;
      }

      setSuccessMessage(payload.message ?? 'Email 驗證完成！');
      setStep('done');
    } catch (err) {
      console.error(err);
      setError('無法連線伺服器，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="space-y-5 text-sm text-black">
        <p className="rounded-2xl border border-black/10 bg-white px-5 py-4">
          我們已寄出驗證碼至 <strong>{email}</strong>。請輸入驗證碼完成註冊。
        </p>
        {debugCode && (
          <p className="rounded-xl border border-dashed border-black/20 bg-[#fafafa] px-4 py-2 text-xs text-black/80">
            測試模式驗證碼：<span className="font-semibold">{debugCode}</span>
          </p>
        )}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.3em] text-black/50">驗證碼</label>
            <input
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              placeholder="輸入 6 位數驗證碼"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-black py-3 text-center text-base font-semibold text-white transition hover:bg-black/80 disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? '驗證中...' : '送出驗證'}
          </button>
        </form>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="space-y-5 text-sm text-black">
        <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-center">
          <p className="text-lg font-semibold text-black">Email 驗證完成！</p>
          <p className="text-black/70">你可以回到授權流程繼續登入。</p>
        </div>
        {successMessage && <p className="text-green-600">{successMessage}</p>}
        <a href={returnTo || '/oauth/demo'} className="block rounded-full border border-black/20 bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-black hover:text-white">
          返回授權頁面
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4 text-sm text-black">
      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-[0.3em] text-black/50">使用者名稱</label>
          <input
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="3-32 個字元"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-[0.3em] text-black/50">Email</label>
          <input
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-[0.3em] text-black/50">密碼</label>
          <input
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="至少 8 碼"
            type="password"
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

      <button
        type="submit"
        className="w-full rounded-full bg-black py-3 text-center text-base font-semibold text-white transition hover:bg-black/80 disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading ? '建立中...' : '建立帳號'}
      </button>
    </form>
  );
}
