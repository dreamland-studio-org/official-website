import { prisma } from '@/lib/prisma';
import { isRedirectUriAllowed } from '@/lib/oauth';
import { getSessionUserFromCookies } from '@/lib/session';
import ConsentCard from '@/components/oauth/ConsentCard';
import LoginCard from '@/components/oauth/LoginCard';

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

  return (
    <section className="min-h-screen bg-[#f5f5f5] px-6 py-12 text-black">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 rounded-[32px] border border-black/10 bg-white px-8 py-10 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.4em] text-black/50">Dreamland OAuth</p>
          <h1 className="text-3xl font-semibold text-black">{client.name}</h1>
          <p className="text-sm text-black/60">這個應用程式希望使用你的築夢之地帳號。</p>
        </header>

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

        <div className="h-px bg-black/5" />

        <p className="text-xs text-black/70">
          需要幫助嗎？請聯絡
          {' '}
          <a className="underline" href="mailto:official@dreamland-studio.org">
            official@dreamland-studio.org
          </a>
        </p>
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
