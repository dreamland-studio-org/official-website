export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { isRedirectUriAllowed, buildRedirectResponseUri } from '@/lib/oauth';
import { getSessionFromToken, SESSION_COOKIE_NAME } from '@/lib/session';
import { generateRandomToken } from '@/lib/security';

const AUTH_CODE_TTL_MS = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clientId = typeof body.clientId === 'string' ? body.clientId : '';
    const redirectUri = typeof body.redirectUri === 'string' ? body.redirectUri : '';
    const scope = typeof body.scope === 'string' ? body.scope : '';
    const state = typeof body.state === 'string' ? body.state : '';
    const decision = body.decision === 'deny' ? 'deny' : 'approve';

    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await getSessionFromToken(sessionToken);

    if (!session) {
      return NextResponse.json({ error: '尚未登入' }, { status: 401 });
    }

    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: 'client_id 與 redirect_uri 必填' }, { status: 400 });
    }

    const client = await prisma.oAuthClient.findUnique({
      where: { id: clientId },
    });

    if (!client || !client.isActive) {
      return NextResponse.json({ error: '無效的 client_id' }, { status: 400 });
    }

    if (!isRedirectUriAllowed(client, redirectUri)) {
      return NextResponse.json({ error: 'redirect_uri 未經註冊' }, { status: 400 });
    }

    if (decision === 'deny') {
      return NextResponse.json(
        {
          redirectUrl: buildRedirectResponseUri(redirectUri, {
            error: 'access_denied',
            state,
          }),
        },
        { status: 200 },
      );
    }

    const code = generateRandomToken(32);
    const expiresAt = new Date(Date.now() + AUTH_CODE_TTL_MS);

    await prisma.oAuthAuthorizationCode.create({
      data: {
        code,
        userId: session.userId,
        clientId: client.id,
        redirectUri,
        scope,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        redirectUrl: buildRedirectResponseUri(redirectUri, {
          code,
          state,
        }),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[oauth authorize] unexpected error', error);
    return NextResponse.json({ error: '授權流程失敗' }, { status: 500 });
  }
}
