import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { sendVerificationEmail } from '@/lib/mailer';
import { validateEmail, validateUsername } from '@/lib/validation';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!validateUsername(username)) {
      return NextResponse.json({ error: '使用者名稱必須為 3-32 個字母、數字或符號 _ . -' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: '請輸入有效的 Email' }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `密碼至少需要 ${MIN_PASSWORD_LENGTH} 個字元` }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: '帳號或 Email 已被註冊' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const verificationCode = generateVerificationCode();

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        verificationCode,
        emailVerified: false,
      },
    });

    try {
      await sendVerificationEmail(email, verificationCode, username).catch(console.error);
    } catch (emailError) {
      console.error('[register] send email failed', emailError);
      await prisma.user.delete({ where: { id: newUser.id } });
      return NextResponse.json({ error: '無法寄送驗證信，請稍後再試' }, { status: 500 });
    }

    const responseBody: Record<string, string> = {
      message: '註冊成功，請輸入驗證碼完成信箱驗證',
    };

    if (process.env.NODE_ENV !== 'production') {
      responseBody.debugVerificationCode = verificationCode;
    }

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    console.error('[register] unexpected error', error);
    return NextResponse.json({ error: '無法建立帳號' }, { status: 500 });
  }
}

function generateVerificationCode() {
  return ('' + Math.floor(100000 + Math.random() * 900000)).substring(0, 6);
}

export const runtime = 'edge';