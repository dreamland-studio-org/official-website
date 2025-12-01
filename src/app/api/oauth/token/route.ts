import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { generateRandomToken, hashToken, safeEqual } from '@/lib/security';

const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

type OAuthClientRecord = NonNullable<Awaited<ReturnType<typeof prisma.oAuthClient.findUnique>>>;

type TokenRequestBody = Record<string, string>;

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    const grantType = body.grant_type;

    if (!grantType) {
      return NextResponse.json({ error: 'invalid_request', error_description: 'grant_type is required' }, { status: 400 });
    }

    const clientId = body.client_id;
    const clientSecret = body.client_secret;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'invalid_client', error_description: 'client credentials missing' }, { status: 401 });
    }

    const client = await prisma.oAuthClient.findUnique({ where: { id: clientId } });
    if (!client || !client.isActive) {
      return NextResponse.json({ error: 'invalid_client' }, { status: 401 });
    }

    if (!isClientSecretValid(client.clientSecret, clientSecret)) {
      return NextResponse.json({ error: 'invalid_client' }, { status: 401 });
    }

    if (grantType === 'authorization_code') {
      return handleAuthorizationCodeGrant(body, client);
    }

    if (grantType === 'refresh_token') {
      return handleRefreshTokenGrant(body, client);
    }

    return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
  } catch (error) {
    console.error('[oauth token] unexpected error', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

async function handleAuthorizationCodeGrant(body: TokenRequestBody, client: OAuthClientRecord) {
  const codeValue = body.code;
  const redirectUri = body.redirect_uri;

  if (!codeValue || !redirectUri) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const authCode = await prisma.oAuthAuthorizationCode.findUnique({
    where: { code: codeValue },
  });

  if (!authCode || authCode.clientId !== client.id) {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
  }

  if (authCode.used || authCode.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
  }

  if (authCode.redirectUri !== redirectUri) {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
  }

  const issuedTokens = await issueTokens(authCode.userId, authCode.clientId, authCode.scope);

  await prisma.oAuthAuthorizationCode.update({
    where: { code: authCode.code },
    data: { used: true },
  });

  return NextResponse.json(issuedTokens);
}

async function handleRefreshTokenGrant(body: TokenRequestBody, client: OAuthClientRecord) {
  const refreshTokenRaw = body.refresh_token;
  if (!refreshTokenRaw) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const hashedRefresh = hashToken(refreshTokenRaw);
  const existingToken = await prisma.oAuthAccessToken.findFirst({
    where: { refreshToken: hashedRefresh },
  });

  if (!existingToken || existingToken.clientId !== client.id) {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
  }

  if (!existingToken.refreshTokenExpiresAt || existingToken.refreshTokenExpiresAt.getTime() < Date.now()) {
    await prisma.oAuthAccessToken.delete({ where: { token: existingToken.token } });
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
  }

  await prisma.oAuthAccessToken.delete({ where: { token: existingToken.token } });

  const issuedTokens = await issueTokens(existingToken.userId, existingToken.clientId, existingToken.scope);

  return NextResponse.json(issuedTokens);
}

async function issueTokens(userId: number, clientId: string, scope?: string | null) {
  const accessToken = generateRandomToken(32);
  const refreshToken = generateRandomToken(32);
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await prisma.oAuthAccessToken.create({
    data: {
      token: hashToken(accessToken),
      userId,
      clientId,
      scope: scope ?? '',
      expiresAt,
      refreshToken: hashToken(refreshToken),
      refreshTokenExpiresAt: refreshExpiresAt,
    },
  });

  return {
    token_type: 'Bearer',
    access_token: accessToken,
    expires_in: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
    refresh_token: refreshToken,
    scope: scope ?? '',
  };
}

async function parseBody(request: NextRequest): Promise<TokenRequestBody> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await request.json();
  }

  const formData = await request.formData();
  const entries: TokenRequestBody = {};
  formData.forEach((value, key) => {
    entries[key] = typeof value === 'string' ? value : '';
  });
  return entries;
}

function isClientSecretValid(stored: string, provided: string) {
  const hashedProvided = hashToken(provided);
  if (stored.length !== hashedProvided.length) {
    return false;
  }

  return safeEqual(stored, hashedProvided);
}
export const runtime = 'edge';
