import { prisma } from '@/lib/prisma';

function normalizeBase(value: string) {
  const trimmed = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (trimmed.length === 0) {
    return 'dreamer';
  }
  return trimmed.slice(0, 24);
}

export async function generateAvailableUsername(seed: string) {
  const base = normalizeBase(seed);
  const attempts = new Set<string>();

  for (let i = 0; i < 5; i += 1) {
    const candidate = i === 0 ? base : `${base}${Math.floor(100 + Math.random() * 900)}`;
    if (attempts.has(candidate)) continue;
    attempts.add(candidate);

    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) {
      return candidate;
    }
  }

  return `${base}${Date.now()}`;
}
