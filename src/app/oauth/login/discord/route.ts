import { NextRequest, NextResponse } from 'next/server';

import { generateRandomToken } from '@/lib/security';
import { sanitizeReturnTo, saveSocialState } from '@/lib/socialState';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

export async function GET(request: NextRequest) {
  if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
    return NextResponse.json({ error: '尚未設定 Discord OAuth 環境變數' }, { status: 500 });
  }

  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get('returnTo'));
  const state = generateRandomToken(16);

  saveSocialState({
    provider: 'discord',
    state,
    returnTo,
  });

  const authorizeUrl = new URL('https://discord.com/oauth2/authorize');
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', DISCORD_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', DISCORD_REDIRECT_URI);
  authorizeUrl.searchParams.set('scope', 'identify email');
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(authorizeUrl.toString());
}
