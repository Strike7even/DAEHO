import Link from 'next/link';
import { getAllTransactions } from '@/lib/sheets';
import TransactionTable from '@/components/transactions/TransactionTable';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  let transactions: Awaited<ReturnType<typeof getAllTransactions>> = [];
  let fetchError = '';

  try {
    transactions = await getAllTransactions();
  } catch (err) {
    console.error('거래내역 조회 실패:', err);
    fetchError = '구글 시트에서 데이터를 불러오지 못했습니다. 환경변수 설정을 확인하세요.';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-900">거래내역</h1>
        <Link
          href="/transactions/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 신규 입력
        </Link>
      </div>

      {fetchError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {fetchError}
        </div>
      ) : (
        <TransactionTable transactions={transactions} />
      )}
    </div>
  );
}
