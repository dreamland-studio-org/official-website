import { Prisma } from '@/generated/prisma';
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

let userProviderTableAvailable = true;
let hasWarnedMissingProviderTable = false;

export async function findUserFromProvider(profile: ProviderProfile) {
  const existingProvider = await tryUseUserProviderTable(async () => {
    return prisma.userProvider.findUnique({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: { user: true },
    });
  });

  if (existingProvider) {
    return existingProvider.user;
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

  const user =
    profile.emailVerified && !matchedUser.emailVerified
      ? await prisma.user.update({
          where: { id: matchedUser.id },
          data: { emailVerified: true },
        })
      : matchedUser;

  await tryUseUserProviderTable(async () => {
    await prisma.userProvider.create({
      data: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
        userId: user.id,
        email: normalizedEmail,
        profile: profile.profile ? JSON.stringify(profile.profile) : undefined,
      },
    });
  });

  return user;
}

async function tryUseUserProviderTable<T>(fn: () => Promise<T>) {
  if (!userProviderTableAvailable) {
    return null as T;
  }

  try {
    return await fn();
  } catch (error) {
    if (isMissingUserProviderTableError(error)) {
      userProviderTableAvailable = false;
      if (!hasWarnedMissingProviderTable) {
        hasWarnedMissingProviderTable = true;
        console.warn('[socialAuth] user_providers table is missing; continuing without provider linkage.');
      }
      return null as T;
    }
    throw error;
  }
}

function isMissingUserProviderTableError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== 'P2021') return false;
  const metaTable = typeof error.meta === 'object' && error.meta && 'table' in error.meta ? (error.meta as any).table : null;
  if (typeof metaTable === 'string') {
    return metaTable === 'user_providers';
  }
  return typeof error.message === 'string' && error.message.includes('user_providers');
}
