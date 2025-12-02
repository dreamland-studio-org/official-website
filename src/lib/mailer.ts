const WEBHOOK_URL = 'https://n8n.dreamland-studio.org/webhook/237bfb5a-b738-4097-9e68-5635907d0ec1';

type VerificationPayload = {
  username: string;
  to: string;
  code: string | number;
};

export async function sendVerificationEmail(to: string, code: string, username?: string | null) {
  const safeName = username ?? 'User';
  const payload: VerificationPayload = {
    username: safeName,
    to,
    code,
  };

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`[mailer] webhook failed (${response.status}) ${errorText}`);
  }

  console.log('[mailer] webhook dispatched', { to, code, username: safeName });
}
