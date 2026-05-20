import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const AUTH_COOKIE = 'sales_auth';

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const stored = process.env.APP_PASSWORD ?? '';
  console.log('[auth] input len:', password?.length, 'stored len:', stored.length,
    'input bytes:', [...(password ?? '')].map(c => c.charCodeAt(0)),
    'stored bytes:', [...stored].map(c => c.charCodeAt(0)));

  if (password?.trim() !== stored.trim()) {
    return NextResponse.json({ error: '비밀번호가 틀렸습니다.' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, 'authenticated', {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  return NextResponse.json({ ok: true });
}
