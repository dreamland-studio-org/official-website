import { prisma } from '@/lib/prisma';

type Provider = 'discord' | 'google';

type ProviderProfile = {
  provider: Provider;
  providerAccountId: string;
  email?: string | null;
  emailVerified?: boolean;
  displayName?: string | null;
  profile?: Record<string, unknown>;
};

export async function findUserFromProvider(profile: ProviderProfile) {
  const existingUser = await prisma.user.findFirst({
    where: buildProviderLink(profile.provider, profile.providerAccountId),
  });

  if (existingUser) {
    if (profile.emailVerified && !existingUser.emailVerified) {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: { emailVerified: true },
      });
    }
    return existingUser;
  }

  const normalizedEmail = profile.email?.toLowerCase() ?? null;
  if (!normalizedEmail) {
    return null;
  }

  const matchedUser = await prisma.user.findFirst({
    where: { email: normalizedEmail },
  });

  if (!matchedUser) {
    return null;
  }

  return prisma.user.update({
    where: { id: matchedUser.id },
    data: {
      ...(profile.emailVerified && !matchedUser.emailVerified ? { emailVerified: true } : {}),
      ...buildProviderLink(profile.provider, profile.providerAccountId),
    },
  });
}

function buildProviderLink(provider: Provider, providerAccountId: string) {
  return provider === 'google'
    ? { googleId: providerAccountId }
    : { discordId: providerAccountId };
}
