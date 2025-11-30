import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { generateRandomToken } from '@/lib/security';
import { generateAvailableUsername } from '@/lib/username';

type Provider = 'discord' | 'google';

type ProviderProfile = {
  provider: Provider;
  providerAccountId: string;
  email?: string | null;
  emailVerified?: boolean;
  displayName?: string | null;
  profile?: Record<string, unknown>;
};

export async function upsertUserFromProvider(profile: ProviderProfile) {
  const existingProvider = await prisma.userProvider.findUnique({
    where: {
      provider_providerAccountId: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (existingProvider) {
    return existingProvider.user;
  }

  const normalizedEmail = profile.email?.toLowerCase() ?? null;
  let user = normalizedEmail
    ? await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
    : null;

  if (!user) {
    if (!normalizedEmail) {
      throw new Error('使用第三方登入時必須提供 email');
    }

    const usernameSeed = profile.displayName ?? normalizedEmail.split('@')[0];
    const username = await generateAvailableUsername(usernameSeed);
    const randomPassword = generateRandomToken(16);
    const passwordHash = await hashPassword(randomPassword);

    user = await prisma.user.create({
      data: {
        username,
        email: normalizedEmail,
        passwordHash,
        emailVerified: profile.emailVerified ?? false,
      },
    });
  } else if (profile.emailVerified && !user.emailVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
  }

  await prisma.userProvider.create({
    data: {
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
      userId: user.id,
      email: normalizedEmail,
      profile: profile.profile ?? {},
    },
  });

  return user;
}
