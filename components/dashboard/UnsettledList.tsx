import Link from 'next/link';
import type { Transaction } from '@/types/transaction';
import { fmtKrw } from '@/lib/format';

export default function UnsettledList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">미정산 건 없음</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500">
            <th className="py-2 text-left font-medium">로트번호</th>
            <th className="py-2 text-left font-medium">수입일</th>
            <th className="py-2 text-right font-medium">총납품금액</th>
            <th className="py-2 text-right font-medium">입금액</th>
            <th className="py-2 text-right font-medium text-amber-600">정산잔액</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-gray-100 hover:bg-amber-50 transition-colors">
              <td className="py-2 font-medium text-gray-900">{tx.lotNumber}</td>
              <td className="py-2 text-gray-500">{tx.importDate}</td>
              <td className="py-2 text-right text-gray-700">{fmtKrw(tx.totalDeliveryAmount)}</td>
              <td className="py-2 text-right text-gray-700">{fmtKrw(tx.receivedAmount)}</td>
              <td className="py-2 text-right font-semibold text-amber-600">{fmtKrw(tx.settlementBalance)}</td>
              <td className="py-2 pl-3">
                <Link href={`/transactions/${tx.id}`} className="text-xs text-blue-600 hover:underline">
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
