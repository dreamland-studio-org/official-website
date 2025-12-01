// import nodemailer from 'nodemailer';

// const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
// const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 465);
// const user = process.env.SMTP_USERNAME || process.env.MAIL_USERNAME;
// const pass = process.env.SMTP_PASSWORD || process.env.MAIL_PASSWORD;
// const fromAddress = process.env.SMTP_FROM || process.env.MAIL_FROM;

// let transporter: nodemailer.Transporter | null = null;

// function ensureTransporter() {
//   if (transporter) return transporter;
//   // if (!host || !port || !user || !pass || !fromAddress) {
//   //   throw new Error('SMTP 設定不完整，請確認 .env 內是否填寫 SMTP_HOST/SMTP_PORT/SMTP_USERNAME/SMTP_PASSWORD/SMTP_FROM');
//   // }

//   transporter = nodemailer.createTransport({
//     host,
//     port: 587,
//     secure: false,
//     auth: {
//       user,
//       pass,
//     },
//   });

//   return transporter;
// }

// export async function sendVerificationEmail(to: string, code: string, username?: string | null) {
//   const mailer = ensureTransporter();
//   const safeName = username ?? 'User';
//   const html = buildVerificationTemplate(safeName, code);
//   const text = `親愛的 ${safeName} 您好，\n\n您的 Dreamland 验證碼為：${code}。`;

//   await mailer.sendMail({
//     to,
//     from: `"築夢之地工作室—第三方授權" <system@dreamland-studio.org>`,
//     subject: '築夢之地工作室—第三方授權 帳號驗證碼',
//     text,
//     html,
//     headers: { 'Content-Type': 'text/html; charset=UTF-8' }
//   });

//   console.log("code", code);
//   console.log("name", safeName);
// }
// // ${code}
// // <p style="font-size:11px;color:#8c8c8c;margin-top:24px;">© ${new Date().getFullYear()} Dreamland Studio</p>
// // <p style="font-size:14px;color:#4b4b4b;margin:0 0 32px;">親愛的 ${username}，請輸入下方驗證碼以啟用你的築夢之地帳號。</p>

// function buildVerificationTemplate(username: string, code: string) {
//   return `
// <!doctype html>
// <html lang="zh-Hant">
//   <head>
//     <meta charset="UTF-8" />
//     <title>Dreamland 驗證碼</title>
//   </head>
//   <body style="background:#fff;font-family:Arial,sans-serif;">
//     <div style="max-width:480px;margin:40px auto;padding:32px;border:1px solid #eee;border-radius:16px;">
//       <h2 style="color:#111;margin-bottom:16px;">Email 驗證碼</h2>
//       <p style="color:#333;">親愛的 ${username}，請輸入下方驗證碼以啟用你的築夢之地帳號。</p>
//       <div style="margin:24px 0;padding:12px 24px;border:1px solid #111;border-radius:999px;font-size:24px;font-weight:bold;color:#111;letter-spacing:0.3em;">
//         ${code}
//       </div>
//       <p style="color:#888;font-size:12px;">若非你本人操作請忽略此信。</p>
//       <p style="color:#bbb;font-size:11px;margin-top:24px;">© ${new Date().getFullYear()} Dreamland Studio</p>
//     </div>
//   </body>
// </html>
//   `;
// }


import nodemailer from 'nodemailer';

export async function sendVerificationEmail(to: string, code: string, username?: string | null) {
  let transporter = nodemailer.createTransport({
    host: 'mail.dreamland-studio.org',
    port: 587,
    secure: false,
    auth: {
      user: 'system@dreamland-studio.org',
      pass: '48KoCv~sy6&3aKsf',
    },
  });
  const safeName = username ?? 'User';

  // 完全純文字內容

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
                <p style="font-size:12px;color:#7a7a7a;margin:28px 0 0;">若非你本人操作請忽略此信。</p>
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

  const html = buildVerificationTemplate(safeName, code);
  const text = `親愛的 ${safeName} 您好，\n\n您的 Dreamland 验證碼為：${code}。`;


  let mailOptions = {
    from: "築夢之地工作室—第三方授權 <system@dreamland-studio.org>",
    to: to,
    subject: '築夢之地帳號驗證碼',
    text,          // 僅使用純文字
    html
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  })

  console.log("code", code);
  console.log("to", to);
  console.log("name", safeName);
}
