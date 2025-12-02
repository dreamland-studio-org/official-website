'use client';

import { FormEvent, useState } from 'react';

type RegisterCardProps = {
  returnTo: string;
};

type Step = 'form' | 'done';

export default function RegisterCard({ returnTo }: RegisterCardProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

      const destination = buildLoginRedirectPath(returnTo);
      if (typeof window !== 'undefined') {
        window.location.assign(destination);
        return;
      }

      setSuccessMessage(payload.message ?? '註冊成功，請返回登入頁面');
      setStep('done');
    } catch (err) {
      console.error(err);
      setError('無法連線伺服器，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="space-y-5 text-sm text-black">
        <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-center">
          <p className="text-lg font-semibold text-black">註冊成功！</p>
          <p className="text-black/70">請返回登入頁面並使用新帳號登入。</p>
        </div>
        {successMessage && <p className="text-green-600">{successMessage}</p>}
        <a
          href={returnTo || '/oauth/demo'}
          className="block rounded-full border border-black/20 bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-black hover:text-white"
        >
          返回登入頁面
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

const DUMMY_BASE_URL = 'https://dreamland.local';

function buildLoginRedirectPath(returnTo: string) {
  const target = returnTo || '/oauth/demo';
  try {
    const url = new URL(target, DUMMY_BASE_URL);
    url.searchParams.set('registerSuccess', '1');
    return url.pathname + url.search + url.hash;
  } catch {
    const [path, hash] = target.split('#');
    const joiner = path.includes('?') ? '&' : '?';
    return `${path}${joiner}registerSuccess=1${hash ? `#${hash}` : ''}`;
  }
}
