import { NextRequest, NextResponse } from 'next/server';
import { getTransaction, updateTransaction, deleteTransaction } from '@/lib/sheets';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const transaction = await getTransaction(Number(id));
    if (!transaction) {
      return NextResponse.json({ error: '거래내역 없음' }, { status: 404 });
    }
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('거래내역 조회 오류:', error);
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const input = await request.json();
    const transaction = await updateTransaction(Number(id), input);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('거래내역 수정 오류:', error);
    return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteTransaction(Number(id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('거래내역 삭제 오류:', error);
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  }
}
