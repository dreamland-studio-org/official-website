import { cookies } from 'next/headers';

type SocialStatePayload = {
  provider: 'discord' | 'google';
  state: string;
  returnTo: string;
};

const COOKIE_NAME = 'dl_social_state';
const MAX_AGE = 10 * 60; // 10 minutes
const isProd = process.env.NODE_ENV === 'production';

export function saveSocialState(payload: SocialStatePayload) {
  const encoded = toBase64Url(JSON.stringify(payload));
  cookies().set(COOKIE_NAME, encoded, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: MAX_AGE,
    path: '/',
  });
}

export function consumeSocialState() {
  const cookie = cookies().get(COOKIE_NAME);
  if (!cookie) return null;
  cookies().delete(COOKIE_NAME);
  try {
    const payload = JSON.parse(fromBase64Url(cookie.value)) as SocialStatePayload;
    return payload;
  } catch {
    return null;
  }
}

export function sanitizeReturnTo(value?: string | null) {
  if (!value) return '/oauth/demo';
  if (!value.startsWith('/')) return '/oauth/demo';
  return value;
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  return Buffer.from(base64, 'base64').toString('utf8');
}
