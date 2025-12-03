export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

import { findUserFromProvider } from '@/lib/socialAuth';
import { consumeSocialState, sanitizeReturnTo } from '@/lib/socialState';
import { saveSocialRegisterState } from '@/lib/socialRegisterState';
import { createUserSession, SESSION_COOKIE_NAME } from '@/lib/session';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = await consumeSocialState();
  const returnTo = sanitizeReturnTo(storedState?.returnTo);
  const absoluteReturn = new URL(returnTo, url.origin);

  if (!storedState || storedState.provider !== 'google' || !state || storedState.state !== state) {
    absoluteReturn.searchParams.set('social_error', 'google_state');
    return NextResponse.redirect(absoluteReturn.toString());
  }

  if (!GOOGLE_READY() || !code) {
    absoluteReturn.searchParams.set('social_error', 'google_config');
    return NextResponse.redirect(absoluteReturn.toString());
  }

  try {
    const tokenData = await exchangeGoogleCode(code);
    const userProfile = await fetchGoogleProfile(tokenData.access_token);

    const user = await findUserFromProvider({
      provider: 'google',
      providerAccountId: userProfile.sub,
      email: userProfile.email,
      emailVerified: userProfile.email_verified,
      displayName: userProfile.name ?? userProfile.email,
      profile: userProfile,
    });
    if (!user) {
      saveSocialRegisterState({
        provider: 'google',
        providerAccountId: userProfile.sub,
        email: userProfile.email,
        displayName: userProfile.name ?? userProfile.email,
        profile: userProfile,
        returnTo,
      });
      return NextResponse.redirect(new URL('/oauth/register', url.origin));
    }

    const session = await createUserSession(user.id);
    const response = NextResponse.redirect(absoluteReturn.toString());

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
    console.error('[google oauth] failed', error);
    absoluteReturn.searchParams.set('social_error', 'google_failed');
    return NextResponse.redirect(absoluteReturn.toString());
  }
}

function GOOGLE_READY() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI);
}

async function exchangeGoogleCode(code: string) {
  const body = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    client_secret: GOOGLE_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: GOOGLE_REDIRECT_URI!,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('無法與 Google 交換授權碼');
  }

  return (await response.json()) as { access_token: string };
}

async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('無法取得 Google 使用者資料');
  }

  return (await response.json()) as {
    sub: string;
    email: string;
    email_verified?: boolean;
    name?: string;
  };
}
