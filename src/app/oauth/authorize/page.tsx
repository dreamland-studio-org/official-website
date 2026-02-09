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

  if (!user) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0e2a47] px-6 text-white">
        <SvgBackdrop />
        <div className="relative z-10 flex w-full items-center justify-center">
          <LoginCard clientId={clientId} redirectUri={redirectUri} scope={scope} state={state} />
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0e2a47] px-6 text-white">
      <SvgBackdrop />
      <div className="relative z-10 flex w-full items-center justify-center">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-black/10 bg-white text-sm text-slate-900 shadow-[0_40px_120px_rgba(6,18,32,0.18)] dark:border-white/10 dark:bg-[#0e2a47] dark:text-white dark:shadow-[0_40px_120px_rgba(6,18,32,0.55)]">
          <div className="relative grid gap-8 p-6 md:grid-cols-[1.1fr_1fr] md:gap-10 md:p-10">
            <section className="flex h-full flex-col justify-between gap-6">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1 text-xs uppercase tracking-[0.25em] text-black/70 dark:border-white/20 dark:bg-white/10 dark:text-white/80">
                  授權
                </div>
                <h1 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl dark:text-white">
                  築夢之地工作室
                  <span className="block text-slate-500 dark:text-white/70">單一登入系統</span>
                </h1>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70">請確認以下授權內容，並同意授權。</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 dark:border-white/15 dark:bg-white/10">
                <p className="text-xs uppercase tracking-[0.25em] text-black/50 dark:text-white/60">即將授權</p>
                <div className="mt-2 inline-flex items-center rounded-lg border border-black/10 bg-white px-3 py-1 text-sm font-semibold text-black dark:border-white/20 dark:bg-white/15 dark:text-white">
                  {client.name}
                </div>
              </div>
            </section>

            <section className="space-y-5 rounded-2xl border border-black/10 bg-white p-6 text-black shadow-[0_30px_80px_rgba(5,12,23,0.2)] dark:border-white/10 dark:bg-[#0b1f35] dark:text-white">
              <ConsentCard
                username={user.username}
                email={user.email}
                clientId={client.id}
                clientName={client.name}
                redirectUri={redirectUri}
                scope={scope}
                state={state}
              />
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}


function SvgBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-90">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            // xmlnsSvgjs="http://svgjs.dev/svgjs"
            width="1440"
            height="560"
            preserveAspectRatio="none"
            viewBox="0 0 1440 560"
            className="h-full w-full"
          >
            <g fill="none">
              <rect width="1440" height="560" x="0" y="0" fill="#0e2a47" />
              <path d="M-108.83 400.1L-108.83 400.1" stroke="#132e65" strokeWidth="1.5" />
              <path d="M-108.83 400.1L-104.13 557.26" stroke="#132e65" strokeWidth="1.5" />
              <path d="M-108.83 400.1L61.62 370.89" stroke="#132e65" strokeWidth="1.5" />
              <path d="M-108.83 400.1L48.47 507.48" stroke="#132e65" strokeWidth="1.5" />
              <path d="M-104.13 557.26L-104.13 557.26" stroke="#132e65" strokeWidth="1.5" />
              <path d="M-104.13 557.26L-105.97 706.21" stroke="#132e65" strokeWidth="1.5" />
              <path d="M-104.13 557.26L48.47 507.48" stroke="#132e65" strokeWidth="1.5" />
              <path d="M-105.97 706.21L-105.97 706.21" stroke="#132e65" strokeWidth="1.5" />
              <path d="M-105.97 706.21L78.67 662.7" stroke="#132e65" strokeWidth="1.5" />
              <path d="M-105.97 706.21L48.47 507.48" stroke="#132e65" strokeWidth="1.5" />
              <path d="M61.62 370.89L61.62 370.89" stroke="#132e65" strokeWidth="1.5" />
              <path d="M61.62 370.89L48.47 507.48" stroke="#132e65" strokeWidth="1.5" />
              <path d="M48.47 507.48L48.47 507.48" stroke="#132e65" strokeWidth="1.5" />
              <path d="M48.47 507.48L78.67 662.7" stroke="#132e65" strokeWidth="1.5" />
              <path d="M78.67 662.7L78.67 662.7" stroke="#132e65" strokeWidth="1.5" />
              <path d="M78.67 662.7L191.45 658.19" stroke="#132e65" strokeWidth="1.5" />
              <path d="M254.16 349.86L254.16 349.86" stroke="#132e65" strokeWidth="1.5" />
              <path d="M254.16 349.86L234.35 495.26" stroke="#132e65" strokeWidth="1.5" />
              <path d="M254.16 349.86L393.27 410.21" stroke="#132e65" strokeWidth="1.5" />
              <path d="M254.16 349.86L61.62 370.89" stroke="#132e65" strokeWidth="1.5" />
              <path d="M254.16 349.86L409.4 489.35" stroke="#132e65" strokeWidth="1.5" />
              <path d="M254.16 349.86L48.47 507.48" stroke="#132e65" strokeWidth="1.5" />
              <path d="M254.16 349.86L541.27 398.7" stroke="#132e65" strokeWidth="1.5" />
              <path d="M234.35 495.26L234.35 495.26" stroke="#132e65" strokeWidth="1.5" />
              <path d="M234.35 495.26L191.45 658.19" stroke="#132e65" strokeWidth="1.5" />
              <path d="M234.35 495.26L409.4 489.35" stroke="#132e65" strokeWidth="1.5" />
              <path d="M234.35 495.26L393.27 410.21" stroke="#132e65" strokeWidth="1.5" />
              <path d="M234.35 495.26L48.47 507.48" stroke="#132e65" strokeWidth="1.5" />
              <path d="M191.45 658.19L191.45 658.19" stroke="#132e65" strokeWidth="1.5" />
              <path d="M191.45 658.19L387.15 669.84" stroke="#132e65" strokeWidth="1.5" />
              <path d="M393.27 410.21L393.27 410.21" stroke="#132e65" strokeWidth="1.5" />
              <path d="M393.27 410.21L409.4 489.35" stroke="#132e65" strokeWidth="1.5" />
              <path d="M393.27 410.21L541.27 398.7" stroke="#132e65" strokeWidth="1.5" />
              <path d="M393.27 410.21L511.47 508.69" stroke="#132e65" strokeWidth="1.5" />
              <path d="M409.4 489.35L409.4 489.35" stroke="#132e65" strokeWidth="1.5" />
              <path d="M409.4 489.35L511.47 508.69" stroke="#132e65" strokeWidth="1.5" />
              <path d="M387.15 669.84L387.15 669.84" stroke="#132e65" strokeWidth="1.5" />
              <path d="M387.15 669.84L524.35 702.51" stroke="#132e65" strokeWidth="1.5" />
              <path d="M387.15 669.84L409.4 489.35" stroke="#132e65" strokeWidth="1.5" />
              <path d="M387.15 669.84L511.47 508.69" stroke="#132e65" strokeWidth="1.5" />
              <path d="M387.15 669.84L234.35 495.26" stroke="#132e65" strokeWidth="1.5" />
              <path d="M541.27 398.7L541.27 398.7" stroke="#132e65" strokeWidth="1.5" />
              <path d="M541.27 398.7L511.47 508.69" stroke="#132e65" strokeWidth="1.5" />
              <path d="M541.27 398.7L674.57 402.8" stroke="#132e65" strokeWidth="1.5" />
              <path d="M511.47 508.69L511.47 508.69" stroke="#132e65" strokeWidth="1.5" />
              <path d="M524.35 702.51L524.35 702.51" stroke="#132e65" strokeWidth="1.5" />
              <path d="M524.35 702.51L655.32 685.19" stroke="#132e65" strokeWidth="1.5" />
              <path d="M524.35 702.51L511.47 508.69" stroke="#132e65" strokeWidth="1.5" />
              <path d="M524.35 702.51L409.4 489.35" stroke="#132e65" strokeWidth="1.5" />
              <path d="M524.35 702.51L669.55 506.88" stroke="#132e65" strokeWidth="1.5" />
              <path d="M524.35 702.51L817.58 660.38" stroke="#132e65" strokeWidth="1.5" />
              <path d="M662.24 251.75L662.24 251.75" stroke="#132e65" strokeWidth="1.5" />
              <path d="M662.24 251.75L674.57 402.8" stroke="#132e65" strokeWidth="1.5" />
              <path d="M662.24 251.75L541.27 398.7" stroke="#132e65" strokeWidth="1.5" />
              <path d="M662.24 251.75L807.56 400.6" stroke="#132e65" strokeWidth="1.5" />
              <path d="M662.24 251.75L669.55 506.88" stroke="#132e65" strokeWidth="1.5" />
              <path d="M662.24 251.75L511.47 508.69" stroke="#132e65" strokeWidth="1.5" />
              <path d="M674.57 402.8L674.57 402.8" stroke="#132e65" strokeWidth="1.5" />
              <path d="M674.57 402.8L669.55 506.88" stroke="#132e65" strokeWidth="1.5" />
              <path d="M674.57 402.8L807.56 400.6" stroke="#132e65" strokeWidth="1.5" />
              <path d="M669.55 506.88L669.55 506.88" stroke="#132e65" strokeWidth="1.5" />
              <path d="M669.55 506.88L800.29 522.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M669.55 506.88L511.47 508.69" stroke="#132e65" strokeWidth="1.5" />
              <path d="M655.32 685.19L655.32 685.19" stroke="#132e65" strokeWidth="1.5" />
              <path d="M655.32 685.19L817.58 660.38" stroke="#132e65" strokeWidth="1.5" />
              <path d="M655.32 685.19L669.55 506.88" stroke="#132e65" strokeWidth="1.5" />
              <path d="M655.32 685.19L800.29 522.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M655.32 685.19L511.47 508.69" stroke="#132e65" strokeWidth="1.5" />
              <path d="M655.32 685.19L387.15 669.84" stroke="#132e65" strokeWidth="1.5" />
              <path d="M807.56 400.6L807.56 400.6" stroke="#132e65" strokeWidth="1.5" />
              <path d="M807.56 400.6L800.29 522.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M807.56 400.6L950.95 359.66" stroke="#132e65" strokeWidth="1.5" />
              <path d="M800.29 522.98L800.29 522.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M800.29 522.98L817.58 660.38" stroke="#132e65" strokeWidth="1.5" />
              <path d="M800.29 522.98L954.35 557.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M800.29 522.98L674.57 402.8" stroke="#132e65" strokeWidth="1.5" />
              <path d="M817.58 660.38L817.58 660.38" stroke="#132e65" strokeWidth="1.5" />
              <path d="M817.58 660.38L978.88 686.46" stroke="#132e65" strokeWidth="1.5" />
              <path d="M817.58 660.38L954.35 557.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M817.58 660.38L669.55 506.88" stroke="#132e65" strokeWidth="1.5" />
              <path d="M817.58 660.38L807.56 400.6" stroke="#132e65" strokeWidth="1.5" />
              <path d="M989.81 -98.59L989.81 -98.59" stroke="#132e65" strokeWidth="1.5" />
              <path d="M989.81 -98.59L967.53 40.12" stroke="#132e65" strokeWidth="1.5" />
              <path d="M967.53 40.12L967.53 40.12" stroke="#132e65" strokeWidth="1.5" />
              <path d="M967.53 40.12L1106.18 62.8" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1007.91 203.77L1007.91 203.77" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1007.91 203.77L1113.52 255.33" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1007.91 203.77L950.95 359.66" stroke="#132e65" strokeWidth="1.5" />
              <path d="M950.95 359.66L950.95 359.66" stroke="#132e65" strokeWidth="1.5" />
              <path d="M950.95 359.66L1134 348.37" stroke="#132e65" strokeWidth="1.5" />
              <path d="M950.95 359.66L1113.52 255.33" stroke="#132e65" strokeWidth="1.5" />
              <path d="M954.35 557.98L954.35 557.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M954.35 557.98L978.88 686.46" stroke="#132e65" strokeWidth="1.5" />
              <path d="M954.35 557.98L950.95 359.66" stroke="#132e65" strokeWidth="1.5" />
              <path d="M978.88 686.46L978.88 686.46" stroke="#132e65" strokeWidth="1.5" />
              <path d="M978.88 686.46L1107.61 699.96" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1133.09 -45.05L1133.09 -45.05" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1133.09 -45.05L1106.18 62.8" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1133.09 -45.05L1271 -50.53" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1133.09 -45.05L989.81 -98.59" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1133.09 -45.05L967.53 40.12" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1106.18 62.8L1106.18 62.8" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1113.52 255.33L1113.52 255.33" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1113.52 255.33L1134 348.37" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1113.52 255.33L1280.77 198.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1113.52 255.33L1106.18 62.8" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1134 348.37L1134 348.37" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1134 348.37L1299.15 409.89" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1134 348.37L1007.91 203.77" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1160.87 557.26L1160.87 557.26" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1160.87 557.26L1107.61 699.96" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1160.87 557.26L1305.7 503.1" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1160.87 557.26L1301.81 641.44" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1160.87 557.26L1299.15 409.89" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1160.87 557.26L954.35 557.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1160.87 557.26L1134 348.37" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1107.61 699.96L1107.61 699.96" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1271 -50.53L1271 -50.53" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1271 -50.53L1409.27 64.11" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1271 -50.53L1106.18 62.8" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1271 -50.53L1280.77 198.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1271 -50.53L989.81 -98.59" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1280.77 198.98L1280.77 198.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1280.77 198.98L1420.12 214.47" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1280.77 198.98L1409.27 64.11" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1280.77 198.98L1134 348.37" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1299.15 409.89L1299.15 409.89" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1299.15 409.89L1305.7 503.1" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1299.15 409.89L1450.43 380.75" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1305.7 503.1L1305.7 503.1" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1305.7 503.1L1440.78 515.02" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1301.81 641.44L1301.81 641.44" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1301.81 641.44L1391.33 696.92" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1301.81 641.44L1305.7 503.1" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1409.27 64.11L1409.27 64.11" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1409.27 64.11L1420.12 214.47" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1409.27 64.11L1562.12 90.31" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1420.12 214.47L1420.12 214.47" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1420.12 214.47L1563.37 219.42" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1450.43 380.75L1450.43 380.75" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1450.43 380.75L1440.78 515.02" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1450.43 380.75L1609.45 393.6" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1450.43 380.75L1420.12 214.47" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1450.43 380.75L1587.51 498.85" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1440.78 515.02L1440.78 515.02" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1391.33 696.92L1391.33 696.92" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1391.33 696.92L1542.16 706.28" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1391.33 696.92L1440.78 515.02" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1391.33 696.92L1305.7 503.1" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1391.33 696.92L1160.87 557.26" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1580.2 -41.34L1580.2 -41.34" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1580.2 -41.34L1562.12 90.31" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1580.2 -41.34L1409.27 64.11" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1580.2 -41.34L1563.37 219.42" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1580.2 -41.34L1420.12 214.47" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1580.2 -41.34L1271 -50.53" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1580.2 -41.34L1280.77 198.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1562.12 90.31L1562.12 90.31" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1562.12 90.31L1563.37 219.42" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1562.12 90.31L1420.12 214.47" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1562.12 90.31L1280.77 198.98" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1562.12 90.31L1609.45 393.6" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1563.37 219.42L1563.37 219.42" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1563.37 219.42L1609.45 393.6" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1563.37 219.42L1450.43 380.75" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1609.45 393.6L1609.45 393.6" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1609.45 393.6L1587.51 498.85" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1587.51 498.85L1587.51 498.85" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1587.51 498.85L1440.78 515.02" stroke="#132e65" strokeWidth="1.5" />
              <path d="M1542.16 706.28L1542.16 706.28" stroke="#132e65" strokeWidth="1.5" />
              <path d="M-108.42 539.45L-108.42 539.45" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M-108.42 539.45L-67.1 695.66" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M-108.42 539.45L92.89 505.58" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M-67.1 695.66L-67.1 695.66" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M-67.1 695.66L108.27 673.36" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M-67.1 695.66L92.89 505.58" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M-67.1 695.66L223.88 647.65" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M224.72 510.9L224.72 510.9" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M224.72 510.9L92.89 505.58" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M224.72 510.9L223.88 647.65" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M224.72 510.9L381.29 494.44" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M224.72 510.9L108.27 673.36" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M224.72 510.9L396.86 693.49" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M223.88 647.65L223.88 647.65" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M223.88 647.65L108.27 673.36" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M223.88 647.65L396.86 693.49" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M223.88 647.65L92.89 505.58" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M223.88 647.65L381.29 494.44" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M547.93 535.09L547.93 535.09" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M547.93 535.09L534.22 404.6" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M547.93 535.09L640.08 645.24" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M547.93 535.09L709.55 510.62" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M547.93 535.09L381.29 494.44" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M709.55 510.62L709.55 510.62" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M709.55 510.62L653.39 393.39" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M709.55 510.62L640.08 645.24" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M810.8 344.12L810.8 344.12" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M810.8 344.12L950.62 344.79" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M810.8 344.12L653.39 393.39" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M810.8 344.12L709.55 510.62" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M810.8 344.12L1011.6 521.22" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M810.8 344.12L534.22 404.6" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1142.4 73.99L1142.4 73.99" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1142.4 73.99L1269.55 46.98" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1142.4 73.99L1088.05 197.54" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1242.71 404.59L1242.71 404.59" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1242.71 404.59L1141.37 396.59" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1242.71 404.59L1280.36 526.08" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1242.71 404.59L1239.34 252.59" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1242.71 404.59L1154.22 557" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1280.36 526.08L1280.36 526.08" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1280.36 526.08L1154.22 557" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1404.36 219.8L1404.36 219.8" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1404.36 219.8L1419.61 101.37" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1404.36 219.8L1456.3 359.26" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1404.36 219.8L1553.02 245.87" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1404.36 219.8L1239.34 252.59" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1404.36 219.8L1269.55 46.98" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1404.36 219.8L1568.91 378.55" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M92.89 505.58L92.89 505.58" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M92.89 505.58L108.27 673.36" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M108.27 673.36L108.27 673.36" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M381.29 494.44L381.29 494.44" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M381.29 494.44L534.22 404.6" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M381.29 494.44L396.86 693.49" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M396.86 693.49L396.86 693.49" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M396.86 693.49L547.93 535.09" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M396.86 693.49L640.08 645.24" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M534.22 404.6L534.22 404.6" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M534.22 404.6L653.39 393.39" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M534.22 404.6L709.55 510.62" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M534.22 404.6L640.08 645.24" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M653.39 393.39L653.39 393.39" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M653.39 393.39L547.93 535.09" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M640.08 645.24L640.08 645.24" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M640.08 645.24L834.1 694.4" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M640.08 645.24L653.39 393.39" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M834.1 694.4L834.1 694.4" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M834.1 694.4L995.82 689.23" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M950.62 344.79L950.62 344.79" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M950.62 344.79L1011.6 521.22" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M950.62 344.79L1141.37 396.59" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M950.62 344.79L1088.05 197.54" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1011.6 521.22L1011.6 521.22" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1011.6 521.22L1154.22 557" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1011.6 521.22L1098.98 653.16" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1011.6 521.22L995.82 689.23" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M995.82 689.23L995.82 689.23" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M995.82 689.23L1098.98 653.16" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M995.82 689.23L1154.22 557" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1088.05 197.54L1088.05 197.54" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1088.05 197.54L1239.34 252.59" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1141.37 396.59L1141.37 396.59" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1141.37 396.59L1154.22 557" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1141.37 396.59L1239.34 252.59" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1154.22 557L1154.22 557" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1154.22 557L1098.98 653.16" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1098.98 653.16L1098.98 653.16" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1098.98 653.16L1287.01 680.34" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1098.98 653.16L1280.36 526.08" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1098.98 653.16L1141.37 396.59" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1240.27 -53.03L1240.27 -53.03" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1240.27 -53.03L1269.55 46.98" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1240.27 -53.03L1142.4 73.99" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1240.27 -53.03L1406.92 -53.53" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1269.55 46.98L1269.55 46.98" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1269.55 46.98L1419.61 101.37" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1239.34 252.59L1239.34 252.59" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1287.01 680.34L1287.01 680.34" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1287.01 680.34L1280.36 526.08" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1287.01 680.34L1154.22 557" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1406.92 -53.53L1406.92 -53.53" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1406.92 -53.53L1544.28 -60.8" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1406.92 -53.53L1419.61 101.37" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1419.61 101.37L1419.61 101.37" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1456.3 359.26L1456.3 359.26" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1456.3 359.26L1568.91 378.55" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1456.3 359.26L1553.02 245.87" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1456.3 359.26L1433.85 538.33" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1456.3 359.26L1583.57 489.43" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1433.85 538.33L1433.85 538.33" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1433.85 538.33L1280.36 526.08" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1433.85 538.33L1583.57 489.43" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1433.85 538.33L1287.01 680.34" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1544.28 -60.8L1544.28 -60.8" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1544.28 -60.8L1593.3 85.64" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1544.28 -60.8L1419.61 101.37" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1544.28 -60.8L1269.55 46.98" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1544.28 -60.8L1240.27 -53.03" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1593.3 85.64L1593.3 85.64" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1593.3 85.64L1553.02 245.87" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1593.3 85.64L1419.61 101.37" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1593.3 85.64L1404.36 219.8" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1593.3 85.64L1406.92 -53.53" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1593.3 85.64L1568.91 378.55" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1553.02 245.87L1553.02 245.87" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1553.02 245.87L1568.91 378.55" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1553.02 245.87L1419.61 101.37" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1553.02 245.87L1583.57 489.43" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1568.91 378.55L1568.91 378.55" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1568.91 378.55L1583.57 489.43" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1583.57 489.43L1583.57 489.43" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1583.57 489.43L1574.41 702.84" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1574.41 702.84L1574.41 702.84" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1574.41 702.84L1433.85 538.33" stroke="#3b4fb2" strokeWidth="1.5" />
              <path d="M1574.41 702.84L1287.01 680.34" stroke="#3b4fb2" strokeWidth="1.5" />
              <circle r="5" cx="-108.83" cy="400.1" fill="#132e65" />
              <circle r="5" cx="-104.13" cy="557.26" fill="#132e65" />
              <circle r="5" cx="-105.97" cy="706.21" fill="#132e65" />
              <circle r="5" cx="61.62" cy="370.89" fill="#132e65" />
              <circle r="5" cx="48.47" cy="507.48" fill="#132e65" />
              <circle r="5" cx="78.67" cy="662.7" fill="#132e65" />
              <circle r="5" cx="254.16" cy="349.86" fill="#132e65" />
              <circle r="5" cx="234.35" cy="495.26" fill="#132e65" />
              <circle r="5" cx="191.45" cy="658.19" fill="#132e65" />
              <circle r="5" cx="393.27" cy="410.21" fill="#132e65" />
              <circle r="5" cx="409.4" cy="489.35" fill="#132e65" />
              <circle r="5" cx="387.15" cy="669.84" fill="#132e65" />
              <circle r="5" cx="541.27" cy="398.7" fill="#132e65" />
              <circle r="5" cx="511.47" cy="508.69" fill="#132e65" />
              <circle r="5" cx="524.35" cy="702.51" fill="#132e65" />
              <circle r="5" cx="662.24" cy="251.75" fill="#132e65" />
              <circle r="5" cx="674.57" cy="402.8" fill="#132e65" />
              <circle r="5" cx="669.55" cy="506.88" fill="#132e65" />
              <circle r="5" cx="655.32" cy="685.19" fill="#132e65" />
              <circle r="5" cx="807.56" cy="400.6" fill="#132e65" />
              <circle r="5" cx="800.29" cy="522.98" fill="#132e65" />
              <circle r="5" cx="817.58" cy="660.38" fill="#132e65" />
              <circle r="5" cx="989.81" cy="-98.59" fill="#132e65" />
              <circle r="5" cx="967.53" cy="40.12" fill="#132e65" />
              <circle r="5" cx="1007.91" cy="203.77" fill="#132e65" />
              <circle r="5" cx="950.95" cy="359.66" fill="#132e65" />
              <circle r="5" cx="954.35" cy="557.98" fill="#132e65" />
              <circle r="5" cx="978.88" cy="686.46" fill="#132e65" />
              <circle r="5" cx="1133.09" cy="-45.05" fill="#132e65" />
              <circle r="5" cx="1106.18" cy="62.8" fill="#132e65" />
              <circle r="5" cx="1113.52" cy="255.33" fill="#132e65" />
              <circle r="5" cx="1134" cy="348.37" fill="#132e65" />
              <circle r="5" cx="1160.87" cy="557.26" fill="#132e65" />
              <circle r="5" cx="1107.61" cy="699.96" fill="#132e65" />
              <circle r="5" cx="1271" cy="-50.53" fill="#132e65" />
              <circle r="5" cx="1280.77" cy="198.98" fill="#132e65" />
              <circle r="5" cx="1299.15" cy="409.89" fill="#132e65" />
              <circle r="5" cx="1305.7" cy="503.1" fill="#132e65" />
              <circle r="5" cx="1301.81" cy="641.44" fill="#132e65" />
              <circle r="5" cx="1409.27" cy="64.11" fill="#132e65" />
              <circle r="5" cx="1420.12" cy="214.47" fill="#132e65" />
              <circle r="5" cx="1450.43" cy="380.75" fill="#132e65" />
              <circle r="5" cx="1440.78" cy="515.02" fill="#132e65" />
              <circle r="5" cx="1391.33" cy="696.92" fill="#132e65" />
              <circle r="5" cx="1580.2" cy="-41.34" fill="#132e65" />
              <circle r="5" cx="1562.12" cy="90.31" fill="#132e65" />
              <circle r="5" cx="1563.37" cy="219.42" fill="#132e65" />
              <circle r="5" cx="1609.45" cy="393.6" fill="#132e65" />
              <circle r="5" cx="1587.51" cy="498.85" fill="#132e65" />
              <circle r="5" cx="1542.16" cy="706.28" fill="#132e65" />
              <circle r="25" cx="-108.42" cy="539.45" fill="#2846c3" />
              <circle r="25" cx="-67.1" cy="695.66" fill="#2846c3" />
              <circle r="25" cx="224.72" cy="510.9" fill="#2846c3" />
              <circle r="25" cx="223.88" cy="647.65" fill="#2846c3" />
              <circle r="25" cx="547.93" cy="535.09" fill="#2846c3" />
              <circle r="25" cx="709.55" cy="510.62" fill="#2846c3" />
              <circle r="25" cx="810.8" cy="344.12" fill="#2846c3" />
              <circle r="25" cx="1142.4" cy="73.99" fill="#2846c3" />
              <circle r="25" cx="1242.71" cy="404.59" fill="#2846c3" />
              <circle r="25" cx="1280.36" cy="526.08" fill="#2846c3" />
              <circle r="25" cx="1404.36" cy="219.8" fill="#2846c3" />
              <circle r="5" cx="92.89" cy="505.58" fill="#8b9ad9" />
              <circle r="5" cx="108.27" cy="673.36" fill="#8b9ad9" />
              <circle r="5" cx="381.29" cy="494.44" fill="#8b9ad9" />
              <circle r="5" cx="396.86" cy="693.49" fill="#8b9ad9" />
              <circle r="5" cx="534.22" cy="404.6" fill="#8b9ad9" />
              <circle r="5" cx="653.39" cy="393.39" fill="#8b9ad9" />
              <circle r="5" cx="640.08" cy="645.24" fill="#8b9ad9" />
              <circle r="5" cx="834.1" cy="694.4" fill="#8b9ad9" />
              <circle r="5" cx="950.62" cy="344.79" fill="#8b9ad9" />
              <circle r="5" cx="1011.6" cy="521.22" fill="#8b9ad9" />
              <circle r="5" cx="995.82" cy="689.23" fill="#8b9ad9" />
              <circle r="5" cx="1088.05" cy="197.54" fill="#8b9ad9" />
              <circle r="5" cx="1141.37" cy="396.59" fill="#8b9ad9" />
              <circle r="5" cx="1154.22" cy="557" fill="#8b9ad9" />
              <circle r="5" cx="1098.98" cy="653.16" fill="#8b9ad9" />
              <circle r="5" cx="1240.27" cy="-53.03" fill="#8b9ad9" />
              <circle r="5" cx="1269.55" cy="46.98" fill="#8b9ad9" />
              <circle r="5" cx="1239.34" cy="252.59" fill="#8b9ad9" />
              <circle r="5" cx="1287.01" cy="680.34" fill="#8b9ad9" />
              <circle r="5" cx="1406.92" cy="-53.53" fill="#8b9ad9" />
              <circle r="5" cx="1419.61" cy="101.37" fill="#8b9ad9" />
              <circle r="5" cx="1456.3" cy="359.26" fill="#8b9ad9" />
              <circle r="5" cx="1433.85" cy="538.33" fill="#8b9ad9" />
              <circle r="5" cx="1544.28" cy="-60.8" fill="#8b9ad9" />
              <circle r="5" cx="1593.3" cy="85.64" fill="#8b9ad9" />
              <circle r="5" cx="1553.02" cy="245.87" fill="#8b9ad9" />
              <circle r="5" cx="1568.91" cy="378.55" fill="#8b9ad9" />
              <circle r="5" cx="1583.57" cy="489.43" fill="#8b9ad9" />
              <circle r="5" cx="1574.41" cy="702.84" fill="#8b9ad9" />
            </g>
        </svg>
    </div>
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
