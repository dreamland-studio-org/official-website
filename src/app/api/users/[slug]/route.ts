export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = {
  params: { slug: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const slug = context.params?.slug?.trim();

  if (!slug) {
    return NextResponse.json({ error: 'missing_slug' }, { status: 400 });
  }

  if (!UUID_V4_REGEX.test(slug)) {
    return NextResponse.json({ error: 'invalid_slug' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { account_id: slug },
      select: {
        account_id: true,
        username: true,
        email: true,
        emailVerified: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
    }

    return NextResponse.json({
      user_id: user.account_id,
      username: user.username,
      email: user.email,
      email_verified: user.emailVerified,
      avatar: user.avatar ?? null,
      created_at: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('[users slug] unexpected error', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
