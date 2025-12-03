"use server";
import { cookies } from 'next/headers';

export type SocialRegisterPayload = {
  provider: 'discord' | 'google';
  providerAccountId: string;
  email: string;
  displayName: string;
  profile: Record<string, unknown>;
  returnTo: string;
};

const COOKIE_NAME = 'dl_social_reg_state';
const MAX_AGE = 10 * 60; // 10 minutes
const isProd = process.env.NODE_ENV === 'production';

export async function saveSocialRegisterState(payload: SocialRegisterPayload) {
  const cookieStore = await cookies();
  const encoded = toBase64Url(JSON.stringify(payload));

  cookieStore.set({
    name: COOKIE_NAME,
    value: encoded,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: MAX_AGE,
    path: '/',
  });
}

export async function consumeSocialRegisterState(): Promise<SocialRegisterPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie?.value) return null;

  cookieStore.delete({
    name: COOKIE_NAME,
    path: '/',
  });

  try {
    return JSON.parse(fromBase64Url(cookie.value));
  } catch {
    return null;
  }
}

export async function getSocialRegisterState(): Promise<SocialRegisterPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  try {
    return JSON.parse(fromBase64Url(cookie.value));
  } catch {
    return null;
  }
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
