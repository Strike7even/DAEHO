import { getSettings } from '@/lib/sheets';
import TransactionForm from '@/components/transactions/TransactionForm';
import type { TransactionInput } from '@/types/transaction';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '신규 입력 | Sales Dashboard',
};

export default async function NewTransactionPage() {
  let defaults: Partial<TransactionInput> = {};

  try {
    const settings = await getSettings();
    defaults = {
      supplyUnitPrice: settings.defaultSupplyPrice,
      invoiceRatio: settings.defaultInvoiceRatio,
    };
  } catch {
    // 설정 조회 실패 시 폼 기본값 사용
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-5">신규 거래 입력</h1>
      <TransactionForm mode="create" initial={defaults} />
    </div>
  );
}
