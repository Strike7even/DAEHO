import { NextRequest, NextResponse } from 'next/server';
import { getAllTransactions, addTransaction } from '@/lib/sheets';

export async function GET() {
  try {
    const transactions = await getAllTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('거래내역 조회 오류:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: '데이터 조회 실패', detail: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    const transaction = await addTransaction(input);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('거래내역 추가 오류:', error);
    return NextResponse.json({ error: '데이터 추가 실패' }, { status: 500 });
  }
}
