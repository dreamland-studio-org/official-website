export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

import { generateRandomToken } from '@/lib/security';
import { sanitizeReturnTo, saveSocialState } from '@/lib/socialState';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    return NextResponse.json({ error: '尚未設定 Google OAuth 環境變數' }, { status: 500 });
  }

  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get('returnTo'));
  const state = generateRandomToken(16);

  await saveSocialState({
    provider: 'google',
    state,
    returnTo,
  });

  const authorizeUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
  authorizeUrl.searchParams.set('scope', 'openid email profile');
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('prompt', 'consent');
  authorizeUrl.searchParams.set('access_type', 'offline');

  return NextResponse.redirect(authorizeUrl.toString());
}
