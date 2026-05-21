import Link from 'next/link';
import type { Transaction } from '@/types/transaction';
import { fmtKrw } from '@/lib/format';

export default function UnsettledList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">미정산 건 없음</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <th className="py-2 text-left font-medium">로트번호</th>
            <th className="py-2 text-left font-medium">수입일</th>
            <th className="py-2 text-right font-medium">총납품금액</th>
            <th className="py-2 text-right font-medium">입금액</th>
            <th className="py-2 text-right font-medium text-amber-600 dark:text-amber-400">정산잔액</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
              <td className="py-2 font-medium text-gray-900 dark:text-white">{tx.lotNumber}</td>
              <td className="py-2 text-gray-500 dark:text-gray-400">{tx.importDate}</td>
              <td className="py-2 text-right text-gray-700 dark:text-gray-300">{fmtKrw(tx.totalDeliveryAmount)}</td>
              <td className="py-2 text-right text-gray-700 dark:text-gray-300">{fmtKrw(tx.receivedAmount)}</td>
              <td className="py-2 text-right font-semibold text-amber-600 dark:text-amber-400">{fmtKrw(tx.settlementBalance)}</td>
              <td className="py-2 pl-3">
                <Link href={`/transactions/${tx.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  상세
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
