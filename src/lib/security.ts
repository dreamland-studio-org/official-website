import crypto from 'crypto';

export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
