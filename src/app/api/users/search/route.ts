import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const prefix = req.nextUrl.searchParams.get('prefix');
  if (!prefix || prefix.length < 2) {
    return NextResponse.json({ error: 'prefix_too_short' }, { status: 400 });
  }
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          startsWith: prefix,
        },
      },
      select: {
        email: true,
      },
      take: 10, // limit results
    });
    return NextResponse.json({ emails: users.map(u => u.email) });
  } catch (error) {
    console.error('[users search] unexpected error', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
