import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/sheets';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('설정 조회 오류:', error);
    return NextResponse.json({ error: '설정 조회 실패' }, { status: 500 });
  }
}
