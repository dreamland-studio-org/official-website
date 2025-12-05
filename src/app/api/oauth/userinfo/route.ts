export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 401 });
    }

    const hashedToken = hashToken(token);
    const storedToken = await prisma.oAuthAccessToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }

    const user = storedToken.user;
    return NextResponse.json({
      sub: `user-${user.id}`,
      user_id: user.account_id,
      username: user.username,
      email: user.email,
      email_verified: user.emailVerified,
      avatar: user.avatar ?? ""
    });
  } catch (error) {
    console.error('[oauth userinfo] unexpected error', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

function extractBearerToken(headerValue: string | null) {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}
