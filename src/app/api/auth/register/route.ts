export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { validateEmail, validateUsername } from '@/lib/validation';
import { consumeSocialRegisterState } from '@/lib/socialRegisterState';
import { createUserSession, SESSION_COOKIE_NAME } from '@/lib/session';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  const socialState = await consumeSocialRegisterState();

  try {
    const body = await request.json();
    const account_id = generateAccountUUID();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const email = socialState?.email ?? (typeof body.email === 'string' ? body.email.trim().toLowerCase() : '');
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

    const newUser = await prisma.user.create({
      data: {
        account_id,
        username,
        email,
        passwordHash,
        emailVerified: !!socialState, // Email is considered verified from social provider
        ...(socialState
          ? socialState.provider === 'google'
            ? { googleId: socialState.providerAccountId }
            : { discordId: socialState.providerAccountId }
          : {}),
      },
    });

    // Automatically log the user in
    const session = await createUserSession(newUser.id);
    const response = NextResponse.json({ message: '註冊成功！' }, { status: 201 });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.rawToken,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: session.expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[register] unexpected error', error);
    return NextResponse.json({ error: '無法建立帳號' }, { status: 500 });
  }
}

function generateAccountUUID(): string {
  return crypto.randomUUID();
}
