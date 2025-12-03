import RegisterCard from '@/components/oauth/RegisterCard';
import { getSocialRegisterState } from '@/lib/socialRegisterState';

// This is a server component, so we can read cookies directly.
export default async function RegisterPage() {
  const socialState = await getSocialRegisterState();

  const returnTo = socialState?.returnTo ?? '/oauth/demo';
  const prefillEmail = socialState?.email;
  // const prefillUsername = socialState?.email;
  const socialProvider = socialState?.provider;

  return (
    <section className="min-h-screen bg-[#f5f5f5] px-6 py-12 text-black">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 rounded-[32px] border border-black/10 bg-white px-8 py-10 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.4em] text-black/50">Dreamland OAuth</p>
          <h1 className="text-3xl font-semibold text-black">建立築夢之地帳號</h1>
          <p className="text-sm text-black/60">完成註冊後即可使用所有 Dreamland 平台，並繼續執行授權流程。</p>
        </header>

        <RegisterCard returnTo={returnTo} defaultEmail={prefillEmail} socialProvider={socialProvider} />

        <p className="text-xs text-black/60">
          已經有帳號了嗎？{' '}
          <a className="underline" href={returnTo}>
            回到登入
          </a>
        </p>
      </div>
    </section>
  );
}
