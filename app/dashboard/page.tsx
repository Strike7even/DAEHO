import { getAllTransactions } from '@/lib/sheets';
import { fmtKrw, fmtRate } from '@/lib/format';
import KpiCard from '@/components/dashboard/KpiCard';
import MarginChart from '@/components/dashboard/MarginChart';
import UnsettledList from '@/components/dashboard/UnsettledList';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let transactions: Awaited<ReturnType<typeof getAllTransactions>> = [];
  let fetchError = '';

  try {
    transactions = await getAllTransactions();
  } catch (err) {
    console.error('대시보드 데이터 조회 실패:', err);
    fetchError = '구글 시트에서 데이터를 불러오지 못했습니다. 환경변수 설정을 확인하세요.';
  }

  const totalSales = transactions.reduce((s, tx) => s + tx.totalDeliveryAmount, 0);
  const totalCost = transactions.reduce((s, tx) => s + tx.totalCost, 0);
  const totalMargin = transactions.reduce((s, tx) => s + tx.totalMargin, 0);
  const avgMarginRate = totalSales === 0 ? 0 : totalMargin / totalSales;
  const avgDefectRate =
    transactions.length === 0
      ? 0
      : transactions.reduce((s, tx) => s + tx.defectRate, 0) / transactions.length;

  const unsettled = transactions.filter((tx) => tx.settlementBalance > 0);

  const chartData = transactions.map((tx) => ({
    lot: tx.lotNumber,
    marginRate:
      tx.totalDeliveryAmount === 0 ? 0 : (tx.totalMargin / tx.totalDeliveryAmount) * 100,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">대시보드</h1>

      {fetchError ? (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {fetchError}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard
              label="총 매출"
              value={fmtKrw(totalSales)}
              sub={`${transactions.length}건`}
            />
            <KpiCard label="총 원가" value={fmtKrw(totalCost)} />
            <KpiCard label="총 마진" value={fmtKrw(totalMargin)} />
            <KpiCard label="평균 마진율" value={fmtRate(avgMarginRate)} />
            <KpiCard label="평균 불량률" value={fmtRate(avgDefectRate)} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">로트별 마진율</h2>
            <MarginChart data={chartData} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">미정산 건</h2>
              {unsettled.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full font-medium">
                  {unsettled.length}건
                </span>
              )}
            </div>
            <UnsettledList transactions={unsettled} />
          </div>
        </>
      )}
    </div>
  );
}
