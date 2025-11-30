import type { OAuthClient } from '@/generated/prisma';

type JsonRedirects = string[] | null;

export function getRedirectUriList(client: OAuthClient): string[] {
  const raw = client.redirectUris as JsonRedirects;
  if (!raw) return [];
  return raw.filter((uri): uri is string => typeof uri === 'string');
}

export function isRedirectUriAllowed(client: OAuthClient, redirectUri: string) {
  const allowedUris = getRedirectUriList(client);
  return allowedUris.some((allowed) => normalizeUri(allowed) === normalizeUri(redirectUri));
}

function normalizeUri(uri: string) {
  try {
    const parsed = new URL(uri);
    // Normalize by removing trailing slash differences
    const pathname = parsed.pathname.endsWith('/') && parsed.pathname !== '/' ? parsed.pathname.slice(0, -1) : parsed.pathname;
    return `${parsed.protocol}//${parsed.host}${pathname}${parsed.search}`;
  } catch {
    return uri.trim();
  }
}

export function buildRedirectResponseUri(baseUri: string, params: Record<string, string | undefined>) {
  try {
    const url = new URL(baseUri);
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  } catch {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        query.set(key, value);
      }
    });
    const joiner = baseUri.includes('?') ? '&' : '?';
    return `${baseUri}${query.toString() ? `${joiner}${query.toString()}` : ''}`;
  }
}
