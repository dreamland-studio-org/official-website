import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 465);
const user = process.env.SMTP_USERNAME || process.env.MAIL_USERNAME;
const pass = process.env.SMTP_PASSWORD || process.env.MAIL_PASSWORD;
const fromAddress = process.env.SMTP_FROM || process.env.MAIL_FROM || user;
const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

let transporter: nodemailer.Transporter | null = null;

function ensureTransporter() {
  if (transporter) return transporter;
  if (!host || !port || !user || !pass || !fromAddress) {
    throw new Error('SMTP 設定不完整，請確認 .env 內是否填寫 SMTP_HOST/SMTP_PORT/SMTP_USERNAME/SMTP_PASSWORD/SMTP_FROM');
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

export async function sendVerificationEmail(to: string, code: string, username?: string | null) {
  const mailer = ensureTransporter();
  const safeName = username ?? 'Dreamer';
  const html = buildVerificationTemplate(safeName, code);
  const text = `親愛的 ${safeName} 您好，\n\n您的 Dreamland 验證碼為：${code}\n\n請在 10 分鐘內完成驗證。`;

  await mailer.sendMail({
    to,
    from: fromAddress!,
    subject: 'Dreamland 帳號驗證碼',
    text,
    html,
  });
}

function buildVerificationTemplate(username: string, code: string) {
  return `
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <title>Dreamland 驗證碼</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family: 'Helvetica Neue', Arial, 'PingFang TC', 'Microsoft JhengHei', sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table style="max-width:560px;width:100%;background:#ffffff;border-radius:28px;padding:40px;border:1px solid #e9e9e9;">
            <tr>
              <td style="text-align:center;">
                <p style="letter-spacing:0.35em;text-transform:uppercase;font-size:11px;color:#6b6b6b;margin:0 0 12px;">dreamland oauth</p>
                <h1 style="font-size:26px;color:#111;margin:0 0 8px;">Email 驗證碼</h1>
                <p style="font-size:14px;color:#4b4b4b;margin:0 0 32px;">親愛的 ${username}，請輸入下方驗證碼以啟用你的築夢之地帳號。</p>
                <div style="display:inline-block;padding:16px 32px;border-radius:999px;border:1px solid #111;font-size:28px;font-weight:600;letter-spacing:0.5em;color:#111;">
                  ${code}
                </div>
                <p style="font-size:12px;color:#7a7a7a;margin:28px 0 0;">此驗證碼 10 分鐘內有效，若非你本人操作請忽略此信。</p>
              </td>
            </tr>
          </table>
          <p style="font-size:11px;color:#8c8c8c;margin-top:24px;">© ${new Date().getFullYear()} Dreamland Studio</p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}
