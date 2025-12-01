export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';

    if (!email || !code) {
      return NextResponse.json({ error: 'Email 與驗證碼皆為必填' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.verificationCode) {
      return NextResponse.json({ error: '驗證碼無效或帳號不存在' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: '信箱已完成驗證' });
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: '驗證碼錯誤' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
      },
    });

    return NextResponse.json({ message: 'Email 驗證完成' });
  } catch (error) {
    console.error('[verify email] unexpected error', error);
    return NextResponse.json({ error: '驗證失敗' }, { status: 500 });
  }
}
