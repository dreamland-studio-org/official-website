export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

import { findUserFromProvider } from '@/lib/socialAuth';
import { consumeSocialState, sanitizeReturnTo } from '@/lib/socialState';
import { saveSocialRegisterState } from '@/lib/socialRegisterState';
import { createUserSession, SESSION_COOKIE_NAME } from '@/lib/session';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = await consumeSocialState();
  const returnTo = sanitizeReturnTo(storedState?.returnTo);
  const absoluteReturn = new URL(returnTo, url.origin);

  if (!storedState || storedState.provider !== 'discord' || !state || storedState.state !== state) {
    absoluteReturn.searchParams.set('social_error', 'discord_state');
    return NextResponse.redirect(absoluteReturn.toString());
  }

  if (!CODE_READY() || !code) {
    absoluteReturn.searchParams.set('social_error', 'discord_config');
    return NextResponse.redirect(absoluteReturn.toString());
  }

  try {
    const tokenData = await exchangeDiscordCode(code);
    const userProfile = await fetchDiscordProfile(tokenData.access_token, tokenData.token_type ?? 'Bearer');

    // 判斷是否已註冊
    let user = await findUserFromProvider({
      provider: 'discord',
      providerAccountId: userProfile.id,
      email: userProfile.email,
      emailVerified: userProfile.verified,
      displayName: userProfile.global_name ?? userProfile.username,
      profile: userProfile,
    });

    if (!user) {
      if (!userProfile.email) {
        absoluteReturn.searchParams.set('social_error', 'discord_no_email');
        return NextResponse.redirect(absoluteReturn.toString());
      }

      saveSocialRegisterState({
        provider: 'discord',
        providerAccountId: userProfile.id,
        email: userProfile.email,
        displayName: userProfile.global_name ?? userProfile.username,
        profile: userProfile,
        returnTo,
      });

      return NextResponse.redirect(new URL('/oauth/register', url.origin));
    }

    // 已註冊，建立 session 並導向授權頁
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
    console.error('[discord oauth] failed', error);
    absoluteReturn.searchParams.set('social_error', 'discord_failed');
    return NextResponse.redirect(absoluteReturn.toString());
  }
}

function CODE_READY() {
  return Boolean(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET && DISCORD_REDIRECT_URI);
}

async function exchangeDiscordCode(code: string) {
  const body = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID!,
    client_secret: DISCORD_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: DISCORD_REDIRECT_URI!,
  });

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('無法與 Discord 交換授權碼');
  }

  return (await response.json()) as { access_token: string; token_type?: string };
}

async function fetchDiscordProfile(token: string, tokenType: string) {
  const response = await fetch('https://discord.com/api/v10/users/@me', {
    cache: 'no-store',
    headers: {
      Authorization: `${tokenType} ${token}`,
      Accept: 'application/json',
      'User-Agent': 'Dreamland OAuth (support@dreamland-studio.org)',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown');
    throw new Error(`無法取得 Discord 使用者資料 (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as {
    id: string;
    username: string;
    global_name?: string;
    email?: string;
    verified?: boolean;
  };
}
