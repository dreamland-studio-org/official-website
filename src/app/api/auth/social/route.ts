export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

import { findUserFromProvider } from '@/lib/socialAuth';
import { createUserSession, SESSION_COOKIE_NAME } from '@/lib/session';

type GoogleProfile = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

type DiscordProfile = {
  id: string;
  username: string;
  global_name?: string;
  email?: string;
  verified?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const provider = body.provider === 'google' || body.provider === 'discord' ? body.provider : null;
    const includeSessionToken = body.include_session_token === true || body.includeSessionToken === true;

    if (!provider) {
      return NextResponse.json({ error: 'provider 必須為 google 或 discord' }, { status: 400 });
    }

    const profile = provider === 'google'
      ? await getGoogleProfile(body)
      : await getDiscordProfile(body);

    if (!profile) {
      return NextResponse.json({ error: '無法取得第三方登入資訊' }, { status: 401 });
    }

    const user = await findUserFromProvider(
      provider === 'google'
        ? {
          provider: 'google',
          providerAccountId: (profile as GoogleProfile).sub,
          email: (profile as GoogleProfile).email,
          emailVerified: (profile as GoogleProfile).email_verified,
          displayName: (profile as GoogleProfile).name ?? (profile as GoogleProfile).email,
          profile,
        }
        : {
          provider: 'discord',
          providerAccountId: (profile as DiscordProfile).id,
          email: (profile as DiscordProfile).email,
          emailVerified: (profile as DiscordProfile).verified,
          displayName: (profile as DiscordProfile).global_name ?? (profile as DiscordProfile).username,
          profile,
        },
    );

    if (!user) {
      return NextResponse.json({ error: '尚未註冊' }, { status: 404 });
    }

    const session = await createUserSession(user.id);
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
      responseBody.session_token = session.rawToken;
      responseBody.session_expires_at = session.expiresAt.toISOString();
    }

    const response = NextResponse.json(responseBody);
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
    console.error('[social login] unexpected error', error);
    return NextResponse.json({ error: '登入失敗' }, { status: 500 });
  }
}

async function getGoogleProfile(body: Record<string, unknown>): Promise<GoogleProfile | null> {
  const accessToken = typeof body.access_token === 'string' ? body.access_token : '';
  const idToken = typeof body.id_token === 'string' ? body.id_token : '';

  if (accessToken) {
    return fetchGoogleProfileFromAccessToken(accessToken);
  }

  if (idToken) {
    return fetchGoogleProfileFromIdToken(idToken);
  }

  return null;
}

async function fetchGoogleProfileFromAccessToken(accessToken: string): Promise<GoogleProfile | null> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as GoogleProfile;
}

async function fetchGoogleProfileFromIdToken(idToken: string): Promise<GoogleProfile | null> {
  const url = new URL('https://oauth2.googleapis.com/tokeninfo');
  url.searchParams.set('id_token', idToken);
  const response = await fetch(url.toString());

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as GoogleProfile;
}

async function getDiscordProfile(body: Record<string, unknown>): Promise<DiscordProfile | null> {
  const accessToken = typeof body.access_token === 'string' ? body.access_token : '';
  if (!accessToken) return null;

  const response = await fetch('https://discord.com/api/v10/users/@me', {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'User-Agent': 'Dreamland OAuth (support@dreamland-studio.org)',
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as DiscordProfile;
}
