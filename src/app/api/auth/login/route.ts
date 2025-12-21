export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { createUserSession, SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const includeSessionToken = body.include_session_token === true || body.includeSessionToken === true;

    if (!identifier || !password) {
      return NextResponse.json({ error: '請輸入帳號與密碼' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
    });

    if (!user) {
      return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
    }

    // if (!user.emailVerified) {
    //   return NextResponse.json({ error: 'Email 尚未驗證' }, { status: 403 });
    // }

    if (!user.passwordHash) {
      return NextResponse.json({ error: '此帳號使用第三方登入，請透過社群登入繼續' }, { status: 403 });
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
    }

    const { rawToken, expiresAt } = await createUserSession(user.id);

    const responseBody: {
      user: { id: number; username: string; email: string };
      session_token?: string;
      session_expires_at?: string;
    } = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };

    if (includeSessionToken) {
      responseBody.session_token = rawToken;
      responseBody.session_expires_at = expiresAt.toISOString();
    }

    const response = NextResponse.json(responseBody);

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: rawToken,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[login] unexpected error', error);
    return NextResponse.json({ error: '登入失敗' }, { status: 500 });
  }
}
