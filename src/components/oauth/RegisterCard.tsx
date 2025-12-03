'use client';

import { FormEvent, useState } from 'react';

type RegisterCardProps = {
  returnTo: string;
  defaultEmail?: string | null;
  socialProvider?: 'discord' | 'google';
};

export default function RegisterCard({ returnTo, defaultEmail, socialProvider }: RegisterCardProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? '註冊失敗');
        setIsLoading(false);
        return;
      }

      // Registration was successful and the API logged the user in by setting a cookie.
      // Now, we just need to redirect to the original destination.
      if (typeof window !== 'undefined') {
        window.location.assign(returnTo);
      }
    } catch (err) {
      console.error(err);
      setError('無法連線伺服器，請稍後再試');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 text-sm text-black">
      {socialProvider && (
        <p className="rounded-2xl border border-black/10 bg-white px-5 py-4">
          已透過 {getProviderLabel(socialProvider)} 驗證 Email，請設定使用者名稱與密碼完成註冊。
        </p>
      )}
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
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-black read-only:bg-black/5 focus:border-black focus:outline-none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            required
            readOnly={!!socialProvider}
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

      <button
        type="submit"
        className="w-full rounded-full bg-black py-3 text-center text-base font-semibold text-white transition hover:bg-black/80 disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading ? '建立中...' : '建立帳號並繼續'}
      </button>
    </form>
  );
}

function getProviderLabel(provider: 'discord' | 'google') {
  return provider === 'discord' ? 'Discord' : 'Google';
}
