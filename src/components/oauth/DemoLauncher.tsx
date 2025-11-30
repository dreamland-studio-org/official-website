'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { oauthDemoApps } from '@/config/oauthApps';

const DEFAULT_SCOPE = 'profile.basic profile.email';
const DEFAULT_STATE = 'demo-state';

export default function DemoLauncher() {
  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('http://localhost:4000/callback');
  const [scope, setScope] = useState(DEFAULT_SCOPE);
  const [state, setState] = useState(DEFAULT_STATE);

  const authorizeUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (clientId) params.set('client_id', clientId);
    if (redirectUri) params.set('redirect_uri', redirectUri);
    if (scope) params.set('scope', scope);
    if (state) params.set('state', state);
    params.set('response_type', 'code');
    return `/oauth/authorize?${params.toString()}`;
  }, [clientId, redirectUri, scope, state]);

  return (
    <div className="space-y-6 rounded-2xl border border-white/20 bg-black/30 p-6 backdrop-blur">
      <p className="text-sm text-white/80">
        輸入 Client 的參數後點選下方按鈕，我們會以開新分頁的方式導向 `/oauth/authorize`，整個流程完全透過網址列完成，方便你在瀏覽器中測試授權。
      </p>

      {oauthDemoApps.length > 0 && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">快速套用已設定的 App</p>
          <div className="flex flex-wrap gap-3">
            {oauthDemoApps.map((app) => (
              <button
                type="button"
                key={app.key}
                className="rounded-lg border border-white/20 px-4 py-2 text-left text-sm text-white transition hover:border-emerald-300"
                onClick={() => {
                  setClientId(app.clientId);
                  setRedirectUri(app.redirectUri);
                  setScope(app.scope);
                  setState(app.state ?? DEFAULT_STATE);
                }}
              >
                <p className="font-semibold">{app.name}</p>
                {app.description && <p className="text-xs text-white/70">{app.description}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        <Field label="Client ID" value={clientId} placeholder="填入 /api/oauth/clients 回傳的 client_id" onChange={setClientId} />
        <Field label="Redirect URI" value={redirectUri} onChange={setRedirectUri} />
        <Field label="Scope" value={scope} onChange={setScope} />
        <Field label="State" value={state} onChange={setState} />
      </div>

      <div className="space-y-3">
        <Link
          href={authorizeUrl}
          className="flex w-full items-center justify-center rounded-xl bg-emerald-400/90 px-4 py-3 text-center text-base font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:opacity-60"
          target="_blank"
          rel="noreferrer"
        >
          前往授權畫面
        </Link>
        <p className="break-all text-xs text-white/60">
          產生的連結：<br />
          <code className="text-emerald-200">{authorizeUrl}</code>
        </p>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function Field({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <label className="space-y-2 text-sm text-white/80">
      <span className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</span>
      <input
        className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-white focus:border-emerald-300 focus:outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
