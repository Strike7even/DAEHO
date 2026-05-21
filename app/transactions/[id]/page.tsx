import { notFound } from 'next/navigation';
import { getTransaction } from '@/lib/sheets';
import TransactionForm from '@/components/transactions/TransactionForm';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditTransactionPage({ params }: Props) {
  const { id } = await params;
  const rowId = parseInt(id, 10);

  if (isNaN(rowId)) notFound();

  let transaction: Awaited<ReturnType<typeof getTransaction>>;
  try {
    transaction = await getTransaction(rowId);
  } catch (err) {
    console.error('거래내역 조회 실패:', err);
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  if (!transaction) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
        거래 수정 —{' '}
        <span className="text-blue-600">{transaction.lotNumber}</span>
      </h1>
      <TransactionForm
        mode="edit"
        transactionId={rowId}
        initial={transaction}
      />
    </div>
  );
}
