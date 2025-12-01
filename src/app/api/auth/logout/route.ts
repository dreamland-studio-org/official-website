export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

import { deleteSession, SESSION_COOKIE_NAME } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    await deleteSession(sessionCookie);

    const response = NextResponse.json({ message: '已登出' });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('[logout] unexpected error', error);
    return NextResponse.json({ error: '無法登出' }, { status: 500 });
  }
}
