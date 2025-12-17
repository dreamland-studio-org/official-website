import { prisma } from '@/lib/prisma';
import { isRedirectUriAllowed } from '@/lib/oauth';
import { getSessionUserFromCookies } from '@/lib/session';
import ConsentCard from '@/components/oauth/ConsentCard';
import LoginCard from '@/components/oauth/LoginCard';
import AuthorizeBackdrop from '@/components/oauth/AuthorizeBackdrop';
import AuthorizationTimeline from '@/components/oauth/AuthorizationTimeline';

type AuthorizePageProps = {
  searchParams: Promise<{
    client_id?: string | string[];
    redirect_uri?: string | string[];
    scope?: string | string[];
    state?: string | string[];
    response_type?: string | string[];
  }>;
};

export default async function AuthorizePage({ searchParams }: AuthorizePageProps) {
  const params = await searchParams;
  const clientId = toSingleValue(params.client_id);
  const redirectUri = toSingleValue(params.redirect_uri);
  const state = toSingleValue(params.state);
  const scope = toSingleValue(params.scope);
  const responseType = toSingleValue(params.response_type) || 'code';

  if (!clientId || !redirectUri) {
    return <ErrorPanel message="缺少必要參數 client_id 或 redirect_uri" />;
  }

  if (responseType !== 'code') {
    return <ErrorPanel message="目前僅支援 authorization_code 流程" />;
  }

  const client = await prisma.oAuthClient.findUnique({ where: { id: clientId } });
  if (!client || !client.isActive) {
    return <ErrorPanel message="找不到對應的 Client 或 Client 已停用" />;
  }

  if (!isRedirectUriAllowed(client, redirectUri)) {
    return <ErrorPanel message="redirect_uri 與註冊資料不符" />;
  }

  const user = await getSessionUserFromCookies();

  const stage = user ? 'consent' : 'login';

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f6f8fb] px-6 py-12 text-slate-900">
      <AuthorizeBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-5">
          <AuthorizationTimeline stage={stage} />
          {/* <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">授權應用程式</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{client.name}</p>
            <p className="text-slate-600">這個應用程式正在請求連線到你的築夢之地帳號。</p>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
              <p>redirect_uri</p>
              <p className="mt-1 break-all font-mono text-[11px] text-slate-700">{redirectUri}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              Dreamland 採用端對端加密，連線安全。
            </div>
          </div> */}
        </div>

        <div className="flex-1">
          <div className="rounded-[32px] border border-white/10 bg-white/95 px-8 py-10 text-black shadow-[0_25px_80px_rgba(0,0,0,0.15)]">
            <header className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.4em] text-black/50">Dreamland OAuth</p>
              <h1 className="text-3xl font-semibold text-black">{client.name}</h1>
              <p className="text-sm text-black/60">這個應用程式希望使用你的築夢之地帳號。</p>
            </header>

            <div className="my-8 h-px bg-black/5" />

            {user ? (
              <ConsentCard
                username={user.username}
                email={user.email}
                clientId={client.id}
                clientName={client.name}
                redirectUri={redirectUri}
                scope={scope}
                state={state}
              />
            ) : (
              <LoginCard clientId={clientId} redirectUri={redirectUri} scope={scope} state={state} />
            )}

            <div className="my-8 h-px bg-black/5" />

            <p className="text-xs text-black/70">
              需要幫助嗎？請聯絡
              {' '}
              <a className="underline" href="mailto:official@dreamland-studio.org">
                official@dreamland-studio.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md space-y-4 rounded-[28px] border border-black/10 bg-[#fafafa] p-8 text-center text-black shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <h1 className="text-xl font-semibold">Dreamland OAuth</h1>
        <p className="text-sm text-red-500">{message}</p>
      </div>
    </section>
  );
}

function toSingleValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}
