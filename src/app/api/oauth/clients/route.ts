export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { generateRandomToken, hashToken } from '@/lib/security';

const ADMIN_TOKEN = process.env.OAUTH_ADMIN_TOKEN;

export async function POST(request: NextRequest) {
  if (!ADMIN_TOKEN) {
    return NextResponse.json({ error: '未設定 OAUTH_ADMIN_TOKEN，無法建立 Client' }, { status: 500 });
  }

  const providedToken = extractBearerToken(request.headers.get('authorization'));
  if (!providedToken || providedToken !== ADMIN_TOKEN) {
    return NextResponse.json({ error: '無權限建立 Client' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const redirectUris = Array.isArray(body.redirectUris) ? body.redirectUris.map((uri: unknown) => (typeof uri === 'string' ? uri.trim() : '')).filter(Boolean) : [];
    const scopes = typeof body.scopes === 'string' ? body.scopes : '';
    const clientId = typeof body.clientId === 'string' && body.clientId.length >= 6 ? body.clientId : generateRandomToken(16);

    if (!name || redirectUris.length === 0) {
      return NextResponse.json({ error: 'name 與 redirectUris 為必填欄位' }, { status: 400 });
    }

    const clientSecretRaw = generateRandomToken(32);
    const newClient = await prisma.oAuthClient.create({
      data: {
        id: clientId,
        name,
        clientSecret: hashToken(clientSecretRaw),
        redirectUris,
        scopes,
      },
    });

    return NextResponse.json({
      client_id: newClient.id,
      client_secret: clientSecretRaw,
      redirect_uris: redirectUris,
      scopes,
    });
  } catch (error) {
    console.error('[oauth clients] unexpected error', error);
    return NextResponse.json({ error: '建立 Client 失敗' }, { status: 500 });
  }
}

function extractBearerToken(headerValue: string | null) {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return null;
  }
  return token.trim();
}
