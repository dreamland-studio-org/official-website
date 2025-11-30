import { cookies } from 'next/headers';

import { prisma } from '@/lib/prisma';
import { generateRandomToken, hashToken } from '@/lib/security';

export const SESSION_COOKIE_NAME = 'dl_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function createUserSession(userId: number) {
  const rawToken = generateRandomToken(32);
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await prisma.oAuthSession.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt,
    },
  });

  return { rawToken, expiresAt };
}

export async function deleteSession(rawToken?: string) {
  if (!rawToken) return;
  await prisma.oAuthSession.deleteMany({
    where: { token: hashToken(rawToken) },
  });
}

export async function getSessionFromToken(rawToken?: string) {
  if (!rawToken) return null;
  const hashedToken = hashToken(rawToken);
  const session = await prisma.oAuthSession.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.oAuthSession.delete({ where: { token: hashedToken } });
    return null;
  }

  return session;
}

export async function getSessionUserFromCookies() {
  const cookieStore = await cookies(); // ← 必須 await
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);
  return session?.user ?? null;
}